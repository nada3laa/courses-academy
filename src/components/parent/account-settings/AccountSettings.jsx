import { useEffect, useState, useCallback, useContext } from "react";
import toast from "react-hot-toast";

import { User, Loader2 } from "lucide-react";
import {
  getMyProfile,
  getMyStudents,
  updateMyProfile,
  updateStudent,
  getCountries,
  getCurriculums,
  updatePassword,
} from "../../../services/APIService";
import { AuthContext } from "../../../context/AuthContext";
import {
  ParentProfileCard,
  StudentPersonalCard,
  StudentAcademicCard,
  SecurityCard,
} from "./ProfileCards";
import { getArabicCountryName } from "../../../utils/countryName";
import TimezoneSettingsCard from "../../account-settings/TimezoneSettingsCard";
import { AccountStatusBadge } from "../../account-settings/AccountRegistrationStatus";

const getFlagUrl = (code) =>
  code ? `https://flagcdn.com/w40/${code.toLowerCase()}.png` : null;

// Same normalization shape used during registration, so the country list
// behaves identically here (id / code / name / phoneCode / flagUrl).
function normalizeCountries(raw) {
  const list = Array.isArray(raw) ? raw : raw?.data || [];
  return list.map((c) => ({
    id: c.id,
    code: c.code,
    name: getArabicCountryName(c) || "Unknown",
    flagUrl: getFlagUrl(c.code),
    phoneCode: c.phoneCode || "",
  }));
}

function normalizeCurriculums(raw) {
  const list = Array.isArray(raw) ? raw : raw?.data || [];
  return list.map((c) => ({
    id: c.id,
    name: typeof c.name === "string" ? c.name : c.name?.ar || c.name?.en || "",
  }));
}

// Letter-avatar helper — used instead of a profile photo everywhere in
// this page. Falls back to "؟" when there's no usable name yet.
function getInitial(name) {
  if (!name || typeof name !== "string") return "؟";
  const trimmed = name.trim();
  return trimmed ? trimmed[0].toUpperCase() : "؟";
}

/* ── Tab button ── */
const TabButton = ({ label, isActive, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`relative px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
      isActive
        ? "text-(--primary)"
        : "text-(--text-light) hover:text-(--text-dark)"
    }`}
  >
    {label}
    {isActive && (
      <span className="absolute bottom-0 right-0 left-0 h-0.5 bg-(--primary) rounded-full" />
    )}
  </button>
);

/**
 * AccountSettings
 *
 * Single page: view your data, click the pencil on any card to edit it
 * in place, save, done. No separate "view" page and no separate "edit"
 * page — ProfileCards already implements the view/edit toggle per card,
 * so that's the only place this logic should live.
 *
 * Data notes (confirmed against the real API responses):
 *   - GET /users/me only ever returns { user: { fullName, id }, id,
 *     freeTrialUsed, createdAt, updatedAt }. username / email / phone /
 *     countryCode are NOT in that response. They were captured once at
 *     registration time and stashed in localStorage('parentProfile'), so
 *     we merge that in as a fallback — same trick AccountView used to do,
 *     now also applied here so the edit page isn't missing fields that
 *     the view page had.
 *   - GET /parents/students returns each student's `user` as only
 *     { fullName, id } too (no username/phone there), `curriculum` and
 *     `stage` as bare ID strings, and `grade` as an already-populated
 *     { id, name: { ar, en } } object. There is no country/countryCode
 *     field on a student at all — the API simply doesn't send one, so we
 *     don't fabricate a display value for it.
 *   - There is no avatar endpoint/field returned by the API at all, so
 *     this page never tries to render or upload a photo — every header
 *     uses a letter avatar derived from fullName instead.
 */
const AccountSettings = () => {
  const { user: ctxUser, logout } = useContext(AuthContext);

  const [parent, setParent] = useState(null);
  const [students, setStudents] = useState([]);
  const [activeTab, setActiveTab] = useState("parent");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [countries, setCountries] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [curriculums, setCurriculums] = useState([]);
  const [loadingCurriculums, setLoadingCurriculums] = useState(true);

  /* ── load ── */
  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [profileRes, studentsRes] = await Promise.all([
        getMyProfile(),
        getMyStudents(),
      ]);

      // GET /users/me → { data: { user: { fullName, id }, id, ... } }
      const outerData = profileRes?.data?.data ?? {};
      const userNode = outerData.user ?? {};

      // username / email / phone / countryCode never come back from this
      // endpoint — they were saved to localStorage once, at registration.
      let savedProfile = {};
      try {
        const raw = localStorage.getItem("parentProfile");
        if (raw) savedProfile = JSON.parse(raw);
      } catch {
        savedProfile = {};
      }

      setParent({
        // fullName always comes from the API — it's the freshest copy.
        fullName:
          userNode.fullName ||
          outerData.fullName ||
          ctxUser?.fullName ||
          savedProfile.fullName ||
          null,
        // everything else falls back to what was saved at registration.
        username:
          userNode.username ||
          outerData.username ||
          ctxUser?.username ||
          savedProfile.username ||
          null,
        email:
          userNode.email ||
          outerData.email ||
          ctxUser?.email ||
          savedProfile.email ||
          null,
        phone:
          userNode.phone ||
          outerData.phone ||
          ctxUser?.phone ||
          savedProfile.phone ||
          null,
        countryId:
          userNode.country?.id ||
          userNode.country?._id ||
          userNode.country ||
          outerData.country?.id ||
          outerData.country?._id ||
          outerData.country ||
          ctxUser?.country?.id ||
          ctxUser?.country?._id ||
          ctxUser?.country ||
          savedProfile.countryId ||
          null,
        countryCode:
          userNode.countryCode ||
          outerData.countryCode ||
          ctxUser?.countryCode ||
          savedProfile.countryCode ||
          null,
        countryName:
          userNode.countryName ||
          outerData.countryName ||
          (typeof userNode.country === "object"
            ? getArabicCountryName(userNode.country)
            : null) ||
          (typeof outerData.country === "object"
            ? getArabicCountryName(outerData.country)
            : null) ||
          ctxUser?.countryName ||
          savedProfile.countryName ||
          null,
        timezone:
          userNode.timezone ||
          outerData.timezone ||
          savedProfile.timezone ||
          null,
        id: outerData.id || userNode.id,
      });

      // GET /parents/students → data is a direct array. Drop removed students.
      const raw = studentsRes?.data?.data;
      const activeStudents = Array.isArray(raw)
        ? raw.filter((s) => s.status !== "removed")
        : [];
      setStudents(activeStudents);
    } catch {
      setError("حدث خطأ أثناء تحميل بيانات الحساب، حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  }, [ctxUser]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Country + curriculum lookups, fetched once — same endpoints as the
  // registration flow — and shared across every child tab.
  useEffect(() => {
    getCountries()
      .then((res) => setCountries(normalizeCountries(res.data)))
      .catch(() => setCountries([]))
      .finally(() => setLoadingCountries(false));

    getCurriculums()
      .then((res) => setCurriculums(normalizeCurriculums(res.data)))
      .catch(() => setCurriculums([]))
      .finally(() => setLoadingCurriculums(false));
  }, []);

  /* ── after-save logic ── */
  const afterSave = async (changedSensitive) => {
    if (changedSensitive) {
      toast.success("تم تحديث بياناتك بنجاح، يرجى تسجيل الدخول مرة أخرى.");
      setTimeout(() => {
        logout();
      }, 2000);
      return;
    }
    toast.success("تم حفظ التعديلات بنجاح");
    await loadData();
  };

  /* ── save handlers ── */
  const handleSaveParentInfo = async (payload, sens) => {
    await updateMyProfile(payload);
    // Keep localStorage in sync since /users/me never echoes these back.
    try {
      const raw = localStorage.getItem("parentProfile");
      const prev = raw ? JSON.parse(raw) : {};
      localStorage.setItem(
        "parentProfile",
        JSON.stringify({ ...prev, ...payload }),
      );
    } catch {}
    await afterSave(sens);
  };
  const handleSaveStudentInfo = async (payload, sens) => {
    await updateStudent(activeStudent.id, payload);
    await afterSave(sens);
  };
  const handleSaveStudentAcademic = async (payload) => {
    await updateStudent(activeStudent.id, payload);
    await afterSave(false);
  };
  const handleTimezoneUpdated = (updatedTimezone) => {
    setParent((prev) => {
      const next = { ...prev, ...updatedTimezone };
      try {
        const raw = localStorage.getItem("parentProfile");
        const saved = raw ? JSON.parse(raw) : {};
        localStorage.setItem(
          "parentProfile",
          JSON.stringify({ ...saved, ...updatedTimezone }),
        );
      } catch {}
      return next;
    });
  };

  const activeStudent =
    activeTab !== "parent" ? students.find((s) => s.id === activeTab) : null;

  /* ═══════════════════════════════════════════════════════════════ */
  return (
    <div className="space-y-5" dir="rtl">
      <div
        className="max-w-7xl mx-auto p-2 font-['IBM_Plex_Sans_Arabic'] text-right"
        dir="rtl"
      >
        <h1 className="text-[24px] font-semibold leading-8 text-[#123C91] mb-2">
          إعدادات الحساب
        </h1>
        <p className="text-[16px] font-normal leading-6 text-[#575F69]">
          إدارة معلومات حسابك وتفضيلاتك
        </p>
      </div>

      {/* ── Header card ── */}
      <div className="bg-(--white) border border-(--border-light) rounded-2xl shadow-(--shadow) overflow-hidden">
        {/* Letter avatar + name */}
        <div className="p-6 flex items-center gap-4 ">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-(--primary) flex items-center justify-center shrink-0">
            {loading ? (
              <User size={24} className="text-white" />
            ) : (
              <span className="text-white text-xl font-bold select-none">
                {getInitial(parent?.fullName)}
              </span>
            )}
          </div>

          <div className="min-w-0">
            {loading ? (
              <div className="h-5 w-32 bg-(--bg-section) rounded animate-pulse mb-1" />
            ) : (
              <h2 className="text-lg font-bold text-(--text-dark) truncate">
                {parent?.fullName || "—"}
              </h2>
            )}
            {parent?.email && (
              <p className="text-sm text-(--text-light) truncate">
                {parent.email}
              </p>
            )}
          </div>
          <AccountStatusBadge />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-6 overflow-x-auto">
          <TabButton
            label="حسابي"
            isActive={activeTab === "parent"}
            onClick={() => setActiveTab("parent")}
          />
          {students.map((s) => (
            <TabButton
              key={s.id}
              label={s.user?.fullName || "بدون اسم"}
              isActive={activeTab === s.id}
              onClick={() => setActiveTab(s.id)}
            />
          ))}
        </div>
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div className="flex items-center justify-center py-16 text-(--text-light)">
          <Loader2 size={22} className="animate-spin ml-2" />
          جاري تحميل البيانات...
        </div>
      )}

      {/* ── Error ── */}
      {!loading && error && (
        <div className="text-center text-red-500 bg-red-50 border border-red-100 rounded-xl py-6 px-4">
          {error}
        </div>
      )}

      {/* ── Parent tab ── */}
      {!loading && !error && activeTab === "parent" && parent && (
        <>
          <ParentProfileCard
            parent={parent}
            countries={countries}
            loadingCountries={loadingCountries}
            onSave={handleSaveParentInfo}
          />
          <TimezoneSettingsCard
            timezone={parent.timezone}
            onUpdated={handleTimezoneUpdated}
          />
          <SecurityCard onSave={updatePassword} />
        </>
      )}

      {/* ── Child tab ── */}
      {!loading && !error && activeStudent && (
        <>
          <StudentPersonalCard
            student={activeStudent}
            countries={countries}
            loadingCountries={loadingCountries}
            onSave={handleSaveStudentInfo}
          />
          <StudentAcademicCard
            student={activeStudent}
            curriculums={curriculums}
            loadingCurriculums={loadingCurriculums}
            onSave={handleSaveStudentAcademic}
          />
        </>
      )}
    </div>
  );
};

export default AccountSettings;
