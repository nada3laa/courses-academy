import { useEffect, useState, useCallback } from "react";
import { User, Loader2 } from "lucide-react";
import {
  getMyProfile,
  getMyStudents,
  getCountries,
  getCurriculums,
  getCurriculumStages,
  getStageGrades,
} from "../../../services/APIService";
import { getArabicCountryName } from "../../../utils/countryName";
import { useNavigate } from "react-router-dom";

/* ─── helpers ─── */
function orDash(v) {
  return v !== null && v !== undefined && v !== "" ? v : "—";
}
function langLabel(code) {
  if (code === "ar") return "العربية";
  if (code === "en") return "الإنجليزية";
  if (code === "fr") return "الفرنسية";
  return orDash(code);
}
function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("ar-EG");
  } catch {
    return iso;
  }
}
// Letter-avatar helper — used instead of a profile photo. The API doesn't
// return an avatar field at all, so this is the only avatar this page shows.
function getInitial(name) {
  if (!name || typeof name !== "string") return "؟";
  const trimmed = name.trim();
  return trimmed ? trimmed[0].toUpperCase() : "؟";
}

/* ─── DataRow ─── */
const DataRow = ({ label, value }) => (
  <div className="flex flex-col gap-1.5 min-w-0">
    <span className="text-[14px] text-(--text-light)">{label}</span>
    <span className="text-[17px] font-semibold text-(--text-dark) wrap-break-word">
      {value || "—"}
    </span>
  </div>
);

/* ─── SectionCard ─── */
const SectionCard = ({ title, subtitle, children, editLabel, onEditClick }) => (
  <div className="bg-(--white) border border-(--border-light) rounded-2xl shadow-(--shadow) p-6">
    <div className="flex items-start justify-between gap-3 mb-4">
      <div>
        <h3 className="text-base mb-2 font-bold text-(--text-dark)">{title}</h3>
        {subtitle && (
          <p className="text-2xs text-(--text-light) mt-0.5 leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
      {onEditClick && (
        <button
          type="button"
          onClick={onEditClick}
          className="flex items-center gap-1.5 text-sm font-medium text-(--primary) hover:text-(--primary-dark) transition-colors shrink-0 whitespace-nowrap"
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          {editLabel || "تعديل البيانات"}
        </button>
      )}
    </div>
    <div className="border border-(--border-light) rounded-xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
      {children}
    </div>
  </div>
);

/* ─── TabButton ─── */
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

/* ══════════════════════════════════════════════════════════════════ */
const AccountView = () => {
  const navigate = useNavigate();

  const handleNavigateToEdit = (id, section) => {
    navigate(`/parent/settings/edit?id=${id}&section=${section}`);
  };

  const [parent, setParent] = useState(null);
  const [students, setStudents] = useState([]);
  const [activeTab, setActiveTab] = useState("parent");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // maps: id → arabic name
  const [curriculumMap, setCurriculumMap] = useState({});
  const [stageMap, setStageMap] = useState({});
  const [gradeMap, setGradeMap] = useState({});
  const [lookupLoading, setLookupLoading] = useState(false);

  // Countries — needed to turn a student's `user.country` id into a
  // display name (students carry no countryName/countryCode of their own).
  const [countries, setCountries] = useState([]);
  useEffect(() => {
    getCountries()
      .then((res) => {
        const raw = res?.data?.data ?? res?.data ?? [];
        const list = (Array.isArray(raw) ? raw : []).map((c) => ({
          id: c.id,
          name: getArabicCountryName(c) || "Unknown",
        }));
        setCountries(list);
      })
      .catch(() => setCountries([]));
  }, []);

  /* ── load ── */
  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [profileRes, studentsRes] = await Promise.all([
        getMyProfile(),
        getMyStudents(),
      ]);

      /*
        /users/me → { data: { user: { fullName, id }, id, ... } }
        الـ backend مش بيرجع email/username/phone/countryCode
        فبنكملهم من localStorage اللي اتحفظ وقت التسجيل
      */
      const profileData = profileRes?.data?.data ?? {};
      const userNode = profileData.user ?? {};

      // البيانات المحفوظة وقت التسجيل من RegisterForm
      let savedProfile = {};
      try {
        const raw = localStorage.getItem("parentProfile");
        if (raw) savedProfile = JSON.parse(raw);
      } catch {}

      setParent({
        // الاسم بييجي من الـ API دايماً (أحدث نسخة)
        fullName:
          userNode.fullName ||
          profileData.fullName ||
          savedProfile.fullName ||
          null,
        // الباقي من localStorage لأن الـ API مش بيرجعهم
        username:
          userNode.username ||
          profileData.username ||
          savedProfile.username ||
          null,
        email:
          userNode.email || profileData.email || savedProfile.email || null,
        phone:
          userNode.phone || profileData.phone || savedProfile.phone || null,
        countryCode:
          userNode.countryCode ||
          profileData.countryCode ||
          savedProfile.countryCode ||
          null,
        countryName:
          userNode.countryName ||
          profileData.countryName ||
          savedProfile.countryName ||
          null,
        id: profileData.id || userNode.id,
      });

      // Students — status: removed متفلترين
      const rawStudents = studentsRes?.data?.data;
      const activeStudents = Array.isArray(rawStudents)
        ? rawStudents.filter((s) => s.status !== "removed")
        : [];
      setStudents(activeStudents);

      if (activeStudents.length > 0) {
        buildLookupMaps(activeStudents);
      }
    } catch (err) {
      console.error("AccountView loadData error:", err);
      setError("حدث خطأ أثناء تحميل البيانات، حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  }, []);

  /* ── build id→name maps ── */
  const buildLookupMaps = async (studentList) => {
    setLookupLoading(true);
    try {
      const curriculumIds = [
        ...new Set(studentList.map((s) => s.curriculum).filter(Boolean)),
      ];
      const stageIds = [
        ...new Set(studentList.map((s) => s.stage).filter(Boolean)),
      ];

      const currMap = {};
      const stgMap = {};
      const grdMap = {};

      // Curriculums
      try {
        const res = await getCurriculums();
        const list = res?.data?.data ?? res?.data ?? [];
        (Array.isArray(list) ? list : []).forEach((c) => {
          currMap[c.id] = c.name?.ar || c.name?.en || c.name || c.id;
        });
      } catch {}

      // Stages per curriculum
      for (const currId of curriculumIds) {
        try {
          const res = await getCurriculumStages(currId);
          const list = res?.data?.data ?? res?.data ?? [];
          (Array.isArray(list) ? list : []).forEach((s) => {
            stgMap[s.id] = s.name?.ar || s.name?.en || s.name || s.id;
          });
        } catch {}
      }

      // Grades per stage
      for (const stageId of stageIds) {
        try {
          const res = await getStageGrades(stageId);
          const list = res?.data?.data ?? res?.data ?? [];
          (Array.isArray(list) ? list : []).forEach((g) => {
            grdMap[g.id] = g.name?.ar || g.name?.en || g.name || g.id;
          });
        } catch {}
      }

      // الـ grade بييجي كـ object كامل من students response — نضيفه مباشرة
      studentList.forEach((s) => {
        if (s.grade && typeof s.grade === "object" && s.grade.id) {
          grdMap[s.grade.id] =
            s.grade.name?.ar || s.grade.name?.en || s.grade.id;
        }
      });

      setCurriculumMap(currMap);
      setStageMap(stgMap);
      setGradeMap(grdMap);
    } catch (err) {
      console.error("buildLookupMaps error:", err);
    } finally {
      setLookupLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  const resolveName = (val, map) => {
    if (!val) return "—";
    if (typeof val === "object") return val.name?.ar || val.name?.en || "—";
    return map[val] || "—";
  };

  const activeStudent =
    activeTab !== "parent" ? students.find((s) => s.id === activeTab) : null;

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
        <div className="p-6 flex items-center gap-4 border-b border-(--border-light)">
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
          <Loader2 size={24} className="animate-spin ml-2" />
          جاري تحميل البيانات...
        </div>
      )}

      {/* ── Error ── */}
      {!loading && error && (
        <div className="text-center text-red-500 bg-red-50 border border-red-100 rounded-xl py-6 px-4">
          {error}
        </div>
      )}

      {/* ══ Parent tab ══ */}
      {!loading && !error && activeTab === "parent" && parent && (
        <>
          <SectionCard
            title="البيانات الشخصية"
            subtitle="بياناتك الأساسية التي تُستخدم في جميع الخدمات الرسمية داخل المنصة."
            onEditClick={() => handleNavigateToEdit("parent", "personal")}
          >
            <DataRow label="الاسم الكامل" value={orDash(parent.fullName)} />
            <DataRow label="اسم المستخدم" value={orDash(parent.username)} />
            <DataRow label="البريد الإلكتروني" value={orDash(parent.email)} />
            <DataRow label="رقم الهاتف" value={orDash(parent.phone)} />
            <DataRow
              label="الدولة"
              value={orDash(parent.countryName)}
            />
          </SectionCard>

        </>
      )}

      {/* ══ Child tab ══ */}
      {!loading &&
        !error &&
        activeStudent &&
        (() => {
          const s = activeStudent;
          const u = s.user ?? {};

          return (
            <>
              {/* Personal */}
              <SectionCard
                title="البيانات الشخصية"
                subtitle="بيانات الطالب الأساسية التي تُستخدم في جميع الخدمات الرسمية داخل المنصة."
                onEditClick={() => handleNavigateToEdit(s.id, "personal")}
              >
                <DataRow label="الاسم الكامل" value={orDash(u.fullName)} />
                <DataRow
                  label="اسم المستخدم"
                  value={orDash(u.username || s.username)}
                />
                <DataRow
                  label="البريد الإلكتروني"
                  value={orDash(u.email || s.email)}
                />
                <DataRow
                  label="رقم الهاتف"
                  value={orDash(u.phone || s.phone)}
                />
                <DataRow
                  label="تاريخ الميلاد"
                  value={formatDate(s.birthDate)}
                />
                <DataRow
                  label="الدولة"
                  value={orDash(
                    countries.find((c) => c.id === (u.country || s.country))
                      ?.name ||
                      u.countryCode ||
                      s.countryCode,
                  )}
                />
              </SectionCard>

              {/* Academic */}
              <SectionCard
                title="البيانات الأكاديمية"
                subtitle="البيانات التعليمية الأساسية التي تُستخدم لإدارة الرحلة التعليمية داخل المنصة."
                onEditClick={() => handleNavigateToEdit(s.id, "academic")}
              >
                {lookupLoading ? (
                  <div className="sm:col-span-2 flex items-center gap-2 text-(--text-light) text-sm">
                    <Loader2 size={16} className="animate-spin" />
                    جاري تحميل البيانات الأكاديمية...
                  </div>
                ) : (
                  <>
                    <DataRow
                      label="المرحلة الدراسية"
                      value={resolveName(s.stage, stageMap)}
                    />
                    <DataRow
                      label="الصف الدراسي"
                      value={resolveName(s.grade, gradeMap)}
                    />
                    <DataRow
                      label="المنهج الدراسي"
                      value={resolveName(s.curriculum, curriculumMap)}
                    />
                    <DataRow
                      label="لغة التعلم المفضلة"
                      value={langLabel(s.studyLanguage)}
                    />
                  </>
                )}
              </SectionCard>

            </>
          );
        })()}
    </div>
  );
};

export default AccountView;
