import React, { useState, useRef, useEffect } from "react";
import { Pencil, Loader2, Eye, EyeOff, ChevronDown } from "lucide-react";
import {
  getCurriculumStages,
  getStageGrades,
} from "../../../services/APIService";
import PhoneDisplay from "../../account-settings/PhoneDisplay";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

// Pulls a displayable name off an API record, whatever shape it comes in
// ({ name: { ar, en } } or { name: "string" }).
function nameOf(obj) {
  if (!obj) return "";
  const n = obj.name;
  if (!n) return "";
  if (typeof n === "string") return n;
  return n.ar || n.en || "";
}

// id of a field that might be a populated object ({ id, name }) or a bare id string.
function idOf(value) {
  if (!value) return "";
  if (typeof value === "object") return value?.id ?? "";
  return value;
}

// Display label for a field that might already be a populated object
// (like `grade`), a bare id string that needs matching against `list`
// (like `curriculum` / `stage`), or already a plain label string.
function resolveDisplay(value, list) {
  if (!value) return "—";
  if (typeof value === "object") return nameOf(value) || value.id || "—";
  const match = list?.find((item) => item.id === value);
  if (match) return nameOf(match) || value;
  return "—";
}

function formatDate(d) {
  if (!d) return "";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return String(d);
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${date.getFullYear()}`;
}

function toInputDate(d) {
  if (!d) return "";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "";
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  return `${date.getFullYear()}-${mm}-${dd}`;
}

// Splits a stored phone number ("+201000123456") into the dial-code chip
// and the rest of the number, so the locked field can render them apart.
function splitPhone(phone, knownCode) {
  if (!phone) return { code: "", rest: "" };
  const clean = String(phone).trim();
  if (knownCode && clean.startsWith(knownCode)) {
    return { code: knownCode, rest: clean.slice(knownCode.length).trim() };
  }
  const m = clean.match(/^(\+\d{1,4})\s*(.*)$/);
  if (m) return { code: m[1], rest: m[2] };
  return { code: "", rest: clean };
}

const LANGUAGE_OPTIONS = [
  { id: "ar", label: "العربية" },
  { id: "en", label: "الإنجليزية" },
  { id: "fr", label: "الفرنسية" },
];
function langLabel(code) {
  return LANGUAGE_OPTIONS.find((l) => l.id === code)?.label || code || "—";
}

const PASSWORD_RULES = [
  { id: "len", label: "الحد الأدنى 8 أحرف", test: (p) => p.length >= 8 },
  {
    id: "upper",
    label: "حرف كبير واحد على الأقل",
    test: (p) => /[A-Z]/.test(p),
  },
  {
    id: "lower",
    label: "حرف صغير واحد على الأقل",
    test: (p) => /[a-z]/.test(p),
  },
  { id: "digit", label: "رقم واحد على الأقل", test: (p) => /[0-9]/.test(p) },
  {
    id: "special",
    label: "رمز خاص واحد على الأقل",
    test: (p) => /[^A-Za-z0-9\s]/.test(p),
  },
  {
    id: "nospace",
    label: "لا يحتوي على مسافات",
    test: (p) => p.length > 0 && !/\s/.test(p),
  },
];

/* ------------------------------------------------------------------ */
/* Shared bits                                                         */
/* ------------------------------------------------------------------ */

const SectionHeader = ({ title, subtitle, editing, onEditClick }) => (
  <div className="mb-4">
    <div className="flex items-center justify-between gap-3 mb-2">
      <h3 className="text-[16px] font-bold text-(--text-dark)">{title}</h3>
      {!editing && onEditClick && (
        <button
          type="button"
          onClick={onEditClick}
          className="flex items-center gap-1.5 text-[14px]  font-medium text-(--primary) hover:text-(--primary-dark) transition-colors shrink-0"
        >
          <Pencil size={14} />
          تعديل البيانات
        </button>
      )}
    </div>
    {subtitle && (
      <p className="text-xs sm:text-sm text-(--text-light)">{subtitle}</p>
    )}
  </div>
);

const ActionRow = ({
  saving,
  onCancel,
  error,
  confirmLabel = "حفظ التعديلات",
}) => (
  <>
    {error && <p className="text-sm text-red-500 mt-3">{error}</p>}
    <div className="flex items-center gap-3 mt-5">
      <button
        type="submit"
        disabled={saving}
        className="px-5 py-2.5 rounded-lg bg-(--primary) text-white text-sm font-medium hover:bg-(--primary-dark) transition-colors flex items-center gap-2 disabled:opacity-60"
      >
        {saving && <Loader2 size={14} className="animate-spin" />}
        {confirmLabel}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="px-5 py-2.5 rounded-lg border border-(--border-light) text-(--text-dark) text-sm font-medium hover:bg-(--bg-section) transition-colors"
      >
        إلغاء
      </button>
    </div>
  </>
);

/* ---- view mode: plain label/value, 2-col grid inside one bordered box ---- */
const ViewField = ({ label, value }) => (
  <div className="flex flex-col gap-1.5 min-w-0">
    <span className="text-[14px] mb-1 text-(--text-light)">{label}</span>
    <span className="text-sm font-semibold text-(--text-dark) wrap-break-word">
      {value || "—"}
    </span>
  </div>
);

const ViewGrid = ({ children }) => (
  <div className="border  border-x-4  border-[#123C9180] rounded-xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
    {children}
  </div>
);

const EditBox = ({ children }) => (
  <div className="border  border-x-4  border-[#123C9180] rounded-xl p-5 grid grid-cols-1 gap-5">
    {children}
  </div>
);

const TextInput = ({ label, value, onChange, type = "text" }) => (
  <div>
    <label className="block text-2xs text-(--text-light) mb-1.5">{label}</label>
    <input
      type={type}
      value={value ?? ""}
      onChange={onChange}
      className="w-full h-11 px-3.5 rounded-lg border border-(--border-light) bg-(--bg-section) text-[14px] text-(--text-dark) outline-none focus:border-(--primary) focus:ring-2 focus:ring-(--primary) focus:ring-opacity-20 transition-all"
    />
  </div>
);

// Phone is never editable from here (changing it requires re-verification),
// so it always renders as a locked field with the dial-code chip.
const LockedPhoneField = ({ label, code, number }) => (
  <div>
    <label className="block text-2xs text-(--text-light) mb-1.5">{label}</label>
    <div
      dir="ltr"
      className="w-full h-11 rounded-lg border border-(--border-light) bg-(--bg-section) flex items-stretch overflow-hidden opacity-80 cursor-not-allowed"
    >
      {code && (
        <span className="px-3 flex items-center bg-(--border-light) text-(--text-light) text-sm shrink-0">
          {code}
        </span>
      )}
      <span className="flex-1 px-3 flex items-center text-sm text-(--text-light) truncate">
        {number || "—"}
      </span>
    </div>
  </div>
);

const PasswordField = ({ label, value, onChange }) => {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="block text-[16px] text-(--text-light) mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          dir="ltr"
          className="w-full h-11 pl-10 pr-3.5 rounded-lg border border-(--border-light) bg-(--bg-section) text-[14px] text-(--text-dark) outline-none focus:border-(--primary) focus:ring-2 focus:ring-(--primary) focus:ring-opacity-20 transition-all"
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShow((s) => !s)}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-light)"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
};

const PasswordRulesList = ({ password }) => (
  <div>
    <p className="text-xs text-(--text-light) mb-2">
      يجب أن تتضمن كلمة المرور:
    </p>
    <ul className="text-xs space-y-1 list-disc pr-4">
      {PASSWORD_RULES.map((rule) => {
        const met = rule.test(password || "");
        return (
          <li
            key={rule.id}
            className={
              met ? "text-(--primary) font-medium" : "text-(--text-light)"
            }
          >
            {rule.label}
          </li>
        );
      })}
    </ul>
  </div>
);

/* ---- custom select dropdown (country / curriculum / stage / grade / language) ---- */
const Dropdown = ({
  label,
  value,
  options,
  onChange,
  placeholder = "اختر",
  loading,
  disabled,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = options.find((o) => o.id === value);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isDisabled = disabled || loading;

  return (
    <div ref={ref} className="relative">
      <label className="block text-xs text-(--text-light) mb-1.5">
        {label}
      </label>
      <button
        type="button"
        onClick={() => !isDisabled && setOpen((o) => !o)}
        disabled={isDisabled}
        className={`w-full h-11 px-3.5 rounded-lg border border-(--border-light) bg-(--bg-section) text-sm text-right flex items-center justify-between transition-colors ${
          isDisabled
            ? "opacity-60 cursor-not-allowed"
            : "cursor-pointer hover:border-(--primary)"
        }`}
      >
        <span
          className={selected ? "text-(--text-dark)" : "text-(--text-light)"}
        >
          {loading
            ? "جارٍ التحميل..."
            : selected
              ? selected.label
              : placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`text-(--text-light) transition-transform shrink-0 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && !isDisabled && (
        <ul className="absolute z-20 top-full right-0 left-0 mt-1 max-h-56 overflow-y-auto bg-(--white) border border-(--border-light) rounded-lg shadow-lg">
          {options.length === 0 && (
            <li className="px-3.5 py-2.5 text-sm text-(--text-light)">
              لا توجد عناصر
            </li>
          )}
          {options.map((opt) => (
            <li
              key={opt.id}
              onClick={() => {
                onChange(opt.id);
                setOpen(false);
              }}
              className="px-3.5 py-2.5 text-sm cursor-pointer hover:bg-(--bg-section) text-(--text-dark)"
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

/* ================================================================== */
/* ParentProfileCard                                                   */
/* `parent` here is the merged object built in AccountSettings.jsx —   */
/* fullName always from the API, username/email/phone/countryCode     */
/* falling back to the localStorage copy saved at registration since   */
/* GET /users/me never returns them (confirmed: PATCH /users/me echoes */
/* back the exact same minimal shape, so the response can't be used to */
/* tell what changed either — the comparison has to happen client-side */
/* against the previous `parent` values before the request is sent).   */
/*                                                                      */
/* Logout-after-save rule: only an email or password change forces a    */
/* re-login. Changing fullName or username alone must NOT log the      */
/* parent out — the API still needs a fresh token issued for a new     */
/* email, but a username on its own doesn't invalidate the session.     */
/* ================================================================== */
export const ParentProfileCard = ({
  parent,
  countries = [],
  loadingCountries,
  onSave,
}) => {
  const resolveCountryId = () => {
    if (!countries.length) return "";
    const byId = countries.find(
      (c) =>
        parent?.countryId &&
        String(c.id) === String(parent.countryId),
    );
    if (byId) return byId.id;
    const byCode = countries.find(
      (c) =>
        parent?.countryCode &&
        String(c.code || "").toUpperCase() ===
          String(parent.countryCode).toUpperCase(),
    );
    return byCode?.id || "";
  };

  const buildForm = () => ({
    fullName: parent?.fullName || "",
    username: parent?.username || "",
    email: parent?.email || "",
    phone: parent?.phone || "",
    countryId: resolveCountryId(),
  });

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(buildForm);

  useEffect(() => {
    setForm(buildForm());
  }, [parent, countries]);

  const handleChange = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  const handleCancel = () => {
    setForm(buildForm());
    setError("");
    setEditing(false);
  };

  const countryDisplay = (() => {
    const current = countries.find((c) => c.id === resolveCountryId());
    return current?.name || parent?.countryName || "—";
  })();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = {
        fullName: form.fullName,
        username: form.username,
        email: form.email,
        phone: form.phone,
      };
      // Only an email change requires a fresh login — username/fullName/country
      // changing on their own must not log the parent out.
      const changedSensitive = payload.email !== (parent?.email || "");
      await onSave(payload, changedSensitive);
      setEditing(false);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "حدث خطأ أثناء حفظ البيانات، حاول مرة أخرى.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-(--white) border border-(--border-light) rounded-2xl shadow-(--shadow) p-6"
    >
      <SectionHeader
        title="البيانات الشخصية"
        subtitle="هذا القسم يحتوي على بياناتك الأساسية التي تُستخدم في جميع الخدمات الرسمية داخل المنصة."
        editing={editing}
        onEditClick={() => setEditing(true)}
      />

      {!editing ? (
        <ViewGrid>
          <ViewField label="الاسم الكامل" value={parent?.fullName} />
          <ViewField label="اسم المستخدم" value={parent?.username} />
          <ViewField label="البريد الإلكتروني" value={parent?.email} />
          <ViewField label="رقم الهاتف" value={
            <PhoneDisplay
              phone={parent?.phone}
              country={parent?.countryId}
              countryCode={parent?.countryCode}
              options={countries}
            />
          } />
          <ViewField label="الدولة" value={countryDisplay} />
        </ViewGrid>
      ) : (
        <EditBox>
          <TextInput
            label="الاسم بالكامل"
            value={form.fullName}
            onChange={handleChange("fullName")}
          />
          <TextInput
            label="اسم المستخدم"
            value={form.username}
            onChange={handleChange("username")}
          />
          <TextInput
            label="البريد الإلكتروني"
            value={form.email}
            onChange={handleChange("email")}
            type="email"
          />
          <TextInput
            label="رقم الهاتف"
            value={form.phone}
            onChange={handleChange("phone")}
            type="tel"
          />
        </EditBox>
      )}

      {editing && (
        <>
          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mt-4">
            تغيير البريد الإلكتروني سيتطلب تسجيل الدخول مرة أخرى.
          </p>
          <ActionRow
            saving={saving}
            onCancel={handleCancel}
            error={error}
            confirmLabel="حفظ البيانات"
          />
        </>
      )}
    </form>
  );
};

/* ================================================================== */
/* StudentPersonalCard                                                 */
/* Confirmed against the real GET /parents/students payload: EVERY     */
/* per-account field (username, email, country as a bare id) lives      */
/* under `student.user`, never on the student record itself. Only      */
/* `birthDate` sits at the top level of the student record. There is   */
/* no `phone` field anywhere in the payload yet (falls back to '—'      */
/* until the API adds one). `user.country` is a bare id that has to be  */
/* matched against the fetched `countries` list to get a display name.  */
/* ================================================================== */
export const StudentPersonalCard = ({
  student,
  countries = [],
  loadingCountries,
  onSave,
}) => {
  const u = student?.user || {};

  const resolveCountryId = () => {
    if (!countries.length) return "";
    // country lives on user.country as a bare id in the real API —
    // student.country / student.countryCode never actually exist.
    const countryId = idOf(u.country) || idOf(student?.country);
    const byId = countries.find(
      (c) => countryId && String(c.id) === String(countryId),
    );
    if (byId) return byId.id;
    const byCode = countries.find(
      (c) =>
        (u.countryCode || student?.countryCode) &&
        String(c.code || "").toUpperCase() ===
          String(u.countryCode || student?.countryCode).toUpperCase(),
    );
    return byCode?.id || "";
  };

  const buildForm = () => ({
    fullName: u.fullName || student?.fullName || "",
    username: u.username || student?.username || "",
    birthDate: toInputDate(student?.birthDate),
    countryId: resolveCountryId(),
  });

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(buildForm);

  useEffect(() => {
    setForm(buildForm());
  }, [student, countries]);

  const handleChange = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  const handleCancel = () => {
    setForm(buildForm());
    setError("");
    setEditing(false);
  };

  const selectedCountry = countries.find((c) => c.id === form.countryId);
  const countryDisplay = (() => {
    const current = countries.find((c) => c.id === resolveCountryId());
    return current?.name || "—";
  })();

  const { code: phoneCode, rest: phoneRest } = splitPhone(
    u.phone || student?.phone,
    selectedCountry?.phoneCode,
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = { fullName: form.fullName, username: form.username };
      if (form.birthDate) payload.birthDate = form.birthDate;
      if (form.countryId && selectedCountry) {
        payload.country = selectedCountry.id;
        payload.countryCode = selectedCountry.code;
      }
      const changedSensitive =
        form.username !== (u.username || student?.username || "");
      await onSave(payload, changedSensitive);
      setEditing(false);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "حدث خطأ أثناء حفظ البيانات، حاول مرة أخرى.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-(--white) border border-(--border-light) rounded-2xl shadow-(--shadow) p-6"
    >
      <SectionHeader
        title="البيانات الشخصية"
        subtitle="هذا القسم يحتوي على بيانات ابنك الأساسية التي تُستخدم في جميع الخدمات الرسمية داخل المنصة."
        editing={editing}
        onEditClick={() => setEditing(true)}
      />

      {!editing ? (
        <ViewGrid>
          <ViewField
            label="الاسم الكامل"
            value={u.fullName || student?.fullName}
          />
          <ViewField
            label="اسم المستخدم"
            value={u.username || student?.username}
          />
          <ViewField
            label="تاريخ الميلاد"
            value={formatDate(student?.birthDate)}
          />
          <ViewField label="الدولة" value={countryDisplay} />
          <ViewField label="رقم الهاتف" value={u.phone || student?.phone} />
        </ViewGrid>
      ) : (
        <EditBox>
          <TextInput
            label="الاسم بالكامل"
            value={form.fullName}
            onChange={handleChange("fullName")}
          />
          <TextInput
            label="اسم المستخدم"
            value={form.username}
            onChange={handleChange("username")}
          />
          <TextInput
            label="تاريخ الميلاد"
            value={form.birthDate}
            onChange={handleChange("birthDate")}
            type="date"
          />
          <Dropdown
            label="الدولة"
            value={form.countryId}
            options={countries.map((c) => ({ id: c.id, label: c.name }))}
            onChange={(id) => setForm((prev) => ({ ...prev, countryId: id }))}
            loading={loadingCountries}
            placeholder="اختر الدولة"
          />
          <LockedPhoneField
            label="رقم الهاتف"
            code={phoneCode}
            number={phoneRest}
          />
        </EditBox>
      )}

      {editing && (
        <>
          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mt-4">
            تغيير اسم المستخدم سيتطلب تسجيل الدخول مرة أخرى.
          </p>
          <ActionRow
            saving={saving}
            onCancel={handleCancel}
            error={error}
            confirmLabel="تعديل البيانات"
          />
        </>
      )}
    </form>
  );
};

/* ================================================================== */
/* StudentAcademicCard                                                 */
/* In the real API: `student.curriculum` is a bare ID string (or null   */
/* when never set), `student.stage` and `student.grade` already arrive  */
/* as populated { id, name: { ar, en } } objects. This card fetches the */
/* stage list for the student's *current* curriculum and the grade list */
/* for the student's *current* stage on mount — independent of whatever */
/* the user later picks while editing — so the read-only view can       */
/* always resolve a real label instead of a dash, even before edit mode */
/* is opened. When curriculum is null (not yet assigned), the field     */
/* correctly shows "—" rather than being a bug to chase.                */
/* ================================================================== */
export const StudentAcademicCard = ({
  student,
  curriculums = [],
  loadingCurriculums,
  onSave,
}) => {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Lists used by the *view* (read-only) labels — keyed to the student's
  // saved curriculum/stage, fetched once per student regardless of editing.
  const [viewStages, setViewStages] = useState([]);
  const [viewGrades, setViewGrades] = useState([]);

  // Lists used by the *edit* dropdowns — keyed to whatever the form
  // currently has selected, which changes as the user picks things.
  const [stages, setStages] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loadingStages, setLoadingStages] = useState(false);
  const [loadingGrades, setLoadingGrades] = useState(false);

  const buildForm = () => ({
    curriculumId: idOf(student?.curriculum),
    stageId: idOf(student?.stage),
    gradeId: idOf(student?.grade),
    studyLanguage: student?.studyLanguage || "",
  });

  const [form, setForm] = useState(buildForm);

  // student (tab) changed — reset the form and re-resolve the view labels.
  useEffect(() => {
    setForm(buildForm());
    setStages([]);
    setGrades([]);

    const curriculumId = idOf(student?.curriculum);
    const stageId = idOf(student?.stage);

    if (curriculumId) {
      getCurriculumStages(curriculumId)
        .then((res) => {
          const raw = res?.data?.data ?? res?.data ?? [];
          setViewStages(Array.isArray(raw) ? raw : []);
        })
        .catch(() => setViewStages([]));
    } else {
      setViewStages([]);
    }

    if (stageId) {
      getStageGrades(stageId)
        .then((res) => {
          const raw = res?.data?.data ?? res?.data ?? [];
          setViewGrades(Array.isArray(raw) ? raw : []);
        })
        .catch(() => setViewGrades([]));
    } else {
      setViewGrades([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student]);

  // Edit-mode cascade: curriculum -> stages, stage -> grades.
  useEffect(() => {
    if (!editing) return;
    if (!form.curriculumId) {
      setStages([]);
      return;
    }
    let active = true;
    setLoadingStages(true);
    getCurriculumStages(form.curriculumId)
      .then((res) => {
        if (!active) return;
        const raw = res?.data?.data ?? res?.data ?? [];
        setStages(Array.isArray(raw) ? raw : []);
      })
      .catch(() => {
        if (active) setStages([]);
      })
      .finally(() => {
        if (active) setLoadingStages(false);
      });
    return () => {
      active = false;
    };
  }, [editing, form.curriculumId]);

  useEffect(() => {
    if (!editing) return;
    if (!form.stageId) {
      setGrades([]);
      return;
    }
    let active = true;
    setLoadingGrades(true);
    getStageGrades(form.stageId)
      .then((res) => {
        if (!active) return;
        const raw = res?.data?.data ?? res?.data ?? [];
        setGrades(Array.isArray(raw) ? raw : []);
      })
      .catch(() => {
        if (active) setGrades([]);
      })
      .finally(() => {
        if (active) setLoadingGrades(false);
      });
    return () => {
      active = false;
    };
  }, [editing, form.stageId]);

  const curriculumOptions = curriculums.map((c) => ({
    id: c.id,
    label: nameOf(c) || c.id,
  }));
  const stageOptions = stages.map((s) => ({
    id: s.id,
    label: nameOf(s) || s.id,
  }));
  const gradeOptions = grades.map((g) => ({
    id: g.id,
    label: nameOf(g) || g.id,
  }));

  const handleCancel = () => {
    setForm(buildForm());
    setError("");
    setEditing(false);
  };
  const handleCurriculumChange = (id) =>
    setForm((prev) => ({
      ...prev,
      curriculumId: id,
      stageId: "",
      gradeId: "",
    }));
  const handleStageChange = (id) =>
    setForm((prev) => ({ ...prev, stageId: id, gradeId: "" }));
  const handleGradeChange = (id) =>
    setForm((prev) => ({ ...prev, gradeId: id }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = {};
      if (form.curriculumId) payload.curriculum = form.curriculumId;
      if (form.stageId) payload.stage = form.stageId;
      if (form.gradeId) payload.grade = form.gradeId;
      if (form.studyLanguage) payload.studyLanguage = form.studyLanguage;
      await onSave(payload, false);
      setEditing(false);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "حدث خطأ أثناء حفظ البيانات، حاول مرة أخرى.",
      );
    } finally {
      setSaving(false);
    }
  };

  // `stage` and `grade` already come populated from the API, so they
  // resolve on their own. `curriculum` is a bare id (or null) — resolve
  // against the curriculums prop passed down from the page.
  const curriculumDisplay = resolveDisplay(student?.curriculum, curriculums);
  const stageDisplay = resolveDisplay(student?.stage, viewStages);
  const gradeDisplay = resolveDisplay(student?.grade, viewGrades);

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-(--white) border border-(--border-light) rounded-2xl shadow-(--shadow) p-6"
    >
      <SectionHeader
        title="البيانات الأكاديمية"
        subtitle="هذا القسم يحتوي على بيانات ابنك التعليمية الأساسية، والتي تُستخدم لإدارة رحلته التعليمية داخل المنصة."
        editing={editing}
        onEditClick={() => setEditing(true)}
      />

      {!editing ? (
        <ViewGrid>
          <ViewField label="المرحلة الدراسية" value={stageDisplay} />
          <ViewField label="الصف الدراسي" value={gradeDisplay} />
          <ViewField label="المنهج الدراسي" value={curriculumDisplay} />
          <ViewField
            label="لغة التعلم المفضلة"
            value={langLabel(student?.studyLanguage)}
          />
        </ViewGrid>
      ) : (
        <EditBox>
          <Dropdown
            label="المنهج الدراسي"
            value={form.curriculumId}
            options={curriculumOptions}
            onChange={handleCurriculumChange}
            loading={loadingCurriculums}
            placeholder="اختر المنهج الدراسي"
          />
          <Dropdown
            label="المرحلة الدراسية"
            value={form.stageId}
            options={stageOptions}
            onChange={handleStageChange}
            loading={loadingStages}
            disabled={!form.curriculumId}
            placeholder={
              form.curriculumId
                ? "اختر المرحلة الدراسية"
                : "اختر المنهج الدراسي أولاً"
            }
          />
          <Dropdown
            label="الصف الدراسي"
            value={form.gradeId}
            options={gradeOptions}
            onChange={handleGradeChange}
            loading={loadingGrades}
            disabled={!form.stageId}
            placeholder={
              form.stageId ? "اختر الصف الدراسي" : "اختر المرحلة الدراسية أولاً"
            }
          />
          <Dropdown
            label="لغة التعلم المفضلة"
            value={form.studyLanguage}
            options={LANGUAGE_OPTIONS}
            onChange={(id) =>
              setForm((prev) => ({ ...prev, studyLanguage: id }))
            }
            placeholder="اختر لغة التعلم المفضلة"
          />
        </EditBox>
      )}

      {editing && (
        <ActionRow
          saving={saving}
          onCancel={handleCancel}
          error={error}
          confirmLabel="تعديل البيانات"
        />
      )}
    </form>
  );
};

/* ================================================================== */
/* SecurityCard                                                        */
/* ================================================================== */
export const SecurityCard = ({
  onSave,
  lastChangedLabel = "آخر تغيير منذ 3 أشهر",
}) => {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    currentPassword: "",
    password: "",
    passwordConfirm: "",
  });

  const handleChange = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  const handleCancel = () => {
    setForm({ currentPassword: "", password: "", passwordConfirm: "" });
    setError("");
    setEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.currentPassword) {
      setError("أدخل كلمة المرور الحالية");
      return;
    }
    if (!form.password) {
      setError("أدخل كلمة المرور الجديدة");
      return;
    }
    if (form.password !== form.passwordConfirm) {
      setError("كلمة المرور وتأكيدها غير متطابقين");
      return;
    }
    if (!PASSWORD_RULES.every((r) => r.test(form.password))) {
      setError("كلمة المرور الجديدة لا تستوفي جميع الشروط المطلوبة");
      return;
    }
    setSaving(true);
    try {
      await onSave({
        currentPassword: form.currentPassword,
        updatedPassword: form.password,
      });
      handleCancel();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "حدث خطأ أثناء حفظ البيانات، حاول مرة أخرى.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-(--white) border border-(--border-light) rounded-2xl shadow-(--shadow) p-6"
    >
      <SectionHeader
        title="الأمان وكلمة المرور"
        subtitle="تغيير كلمة المرور وإعدادات الأمان"
        editing={editing}
        onEditClick={() => setEditing(true)}
      />

      {!editing ? (
        <div className="border  border-x-4  border-[#123C9180] rounded-xl p-5">
          <p className="text-xs text-(--text-light) mb-1.5">كلمة المرور</p>
          <p className="text-sm font-semibold text-(--text-dark) mb-1 tracking-widest">
            ••••••••
          </p>
          <p className="text-xs text-(--text-light)">{lastChangedLabel}</p>
        </div>
      ) : (
        <EditBox>
          <PasswordField
            label="كلمة المرور الحالية"
            value={form.currentPassword}
            onChange={handleChange("currentPassword")}
          />
          <PasswordField
            label="كلمة المرور الجديدة"
            value={form.password}
            onChange={handleChange("password")}
          />
          <PasswordRulesList password={form.password} />
          <PasswordField
            label="تأكيد كلمة المرور الجديدة"
            value={form.passwordConfirm}
            onChange={handleChange("passwordConfirm")}
          />
        </EditBox>
      )}

      {editing && (
        <ActionRow
          saving={saving}
          onCancel={handleCancel}
          error={error}
          confirmLabel="تغيير كلمة المرور"
        />
      )}
    </form>
  );
};
