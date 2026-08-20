import React, { useState, useRef, useEffect, useContext } from "react";
import { Pencil, Eye, EyeOff, ChevronDown, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import {
  getMyProfile,
  updateMyProfile,
  saveStudentInterests,
  getCountries,
  getCurriculums,
  getCurriculumStages,
  getStageGrades,
  updatePassword,
} from "../../../services/APIService";
import { AuthContext } from "../../../context/AuthContext";
import TimezoneSettingsCard from "../../account-settings/TimezoneSettingsCard";
import { AccountStatusBadge } from "../../account-settings/AccountRegistrationStatus";
import PhoneDisplay from "../../account-settings/PhoneDisplay";
import {
  getCountryId,
  resolveCountryLabel,
} from "../../../utils/countryName";

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

// شكل الريسبونس الحقيقي لـ /users/me (طالب):
// {
//   success: true,
//   data: {
//     user: { fullName, username, email, phone, role, country (id), ... },
//     curriculum: { name: { ar, en }, id },
//     stage: { name: { ar, en }, id },
//     grade: { name: { ar, en }, id },
//     studyLanguage: 'ar',
//     birthDate: ISOString,
//     ...
//   }
// }
// بندمج user + باقي حقول data في object واحد عشان الكروت تستخدمه بسهولة
const extractStudent = (resData) => {
  if (!resData) return null;
  const data = resData?.data?.data ?? resData.data ?? resData;
  const user = data.user || data;
  // أي حاجة تانية على مستوى data (غير user) بنحطها جنب بيانات اليوزر
  const { user: _omit, ...rest } = data;
  return {
    ...rest,
    ...user,
    country: user.country ?? rest.country,
    countryCode: user.countryCode ?? rest.countryCode,
    birthDate: user.birthDate ?? rest.birthDate,
  };
};

// بيستخرج array الأوبشنز من أشكال الريسبونس المختلفة اللي ممكن يرجعها الباك إند
const extractList = (resData) => {
  if (!resData) return [];
  const raw =
    resData?.data?.data ||
    resData?.data ||
    resData?.data?.items ||
    resData ||
    [];
  return Array.isArray(raw) ? raw : [];
};

// الاسم بييجي كـ string عادي أو object { ar, en } — بنفضّل العربي
const pickName = (name) => {
  if (!name) return "";
  if (typeof name === "string") return name;
  return name.ar || name.en || "";
};

// بيوحد شكل العنصر (id / label) مهما كان شكل الحقول جاي من الباك إند
const normalizeOption = (item) => ({
  id: item.id || item._id || item.value || item.code,
  code: item.code || item.countryCode,
  phoneCode: item.phoneCode || item.dialCode || item.callingCode,
  flagUrl: item.flagUrl || item.flag,
  label:
    item.nameAr ||
    item.arabicName ||
    pickName(item.name) ||
    item.title ||
    item.label ||
    "",
});

// أول حرف من الاسم عشان نعرضه بدل صورة البروفايل
const getInitial = (fullName) => (fullName || "").trim().charAt(0) || "؟";

const LANGUAGE_OPTIONS = [
  { id: "ar", label: "العربية" },
  { id: "en", label: "الإنجليزية" },
  { id: "fr", label: "الفرنسية" },
];

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

// بيحوّل أي تاريخ (ISO كامل أو yyyy-mm-dd) لشكل input[type=date]
const toDateInputValue = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
};

const formatDateDisplay = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${d.getFullYear()}`;
};

/* ------------------------------------------------------------------ */
/* Shared Components                                                    */
/* ------------------------------------------------------------------ */

const SectionHeader = ({ title, subtitle, editing, onEditClick }) => (
  <div className="mb-4">
    <div className="flex items-center justify-between gap-3 mb-2">
      <h3 className="text-[16px] font-bold text-(--text-dark)">{title}</h3>
      {!editing && onEditClick && (
        <button
          type="button"
          onClick={onEditClick}
          className="flex items-center gap-1.5 text-[14px] font-medium text-(--primary) hover:text-(--primary-dark) transition-colors shrink-0"
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
  confirmLabel = "حفظ التعديلات",
  error,
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

const ViewField = ({ label, value }) => (
  <div className="flex flex-col gap-1.5 min-w-0">
    <span className="text-[14px] mb-1 text-(--text-light)">{label}</span>
    <span className="text-sm font-semibold text-(--text-dark) wrap-break-word">
      {value || "—"}
    </span>
  </div>
);

const ViewGrid = ({ children }) => (
  <div className="border border-x-4 border-[#123C9180] rounded-xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
    {children}
  </div>
);

const EditBox = ({ children }) => (
  <div className="border border-x-4 border-[#123C9180] rounded-xl p-5 grid grid-cols-1 gap-5">
    {children}
  </div>
);

const TextInput = ({ label, value, onChange, type = "text" }) => (
  <div>
    <label className="block text-xs text-(--text-light) mb-1.5">{label}</label>
    <input
      type={type}
      value={value ?? ""}
      onChange={onChange}
      className="w-full h-11 px-3.5 rounded-lg border border-(--border-light) bg-(--bg-section) text-[14px] text-(--text-dark) outline-none focus:border-(--primary) focus:ring-2 focus:ring-(--primary) focus:ring-opacity-20 transition-all"
    />
  </div>
);

const LockedPhoneField = ({ label, value }) => (
  <div>
    <label className="block text-xs text-(--text-light) mb-1.5">{label}</label>
    <div
      dir="ltr"
      className="w-full h-11 rounded-lg border border-(--border-light) bg-(--bg-section) flex items-stretch overflow-hidden opacity-80 cursor-not-allowed"
    >
      <span className="flex-1 px-3 flex items-center text-sm text-(--text-light) truncate">
        {value || "—"}
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

const Dropdown = ({
  label,
  value,
  options,
  onChange,
  placeholder = "اختر",
  disabled,
  loading,
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
        className={`w-full h-11 px-3.5 rounded-lg border border-(--border-light) bg-(--bg-section) text-sm text-right flex items-center justify-between transition-colors ${isDisabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:border-(--primary)"}`}
      >
        <span
          className={selected ? "text-(--text-dark)" : "text-(--text-light)"}
        >
          {loading
            ? "جاري التحميل..."
            : selected
              ? selected.label
              : placeholder}
        </span>
        {loading ? (
          <Loader2 size={14} className="animate-spin text-(--text-light)" />
        ) : (
          <ChevronDown
            size={16}
            className={`text-(--text-light) transition-transform shrink-0 ${open ? "rotate-180" : ""}`}
          />
        )}
      </button>
      {open && !isDisabled && (
        <ul className="absolute z-20 top-full right-0 left-0 mt-1 max-h-56 overflow-y-auto bg-(--white) border border-(--border-light) rounded-lg shadow-lg">
          {options.length === 0 && (
            <li className="px-3.5 py-2.5 text-sm text-(--text-light)">
              لا توجد بيانات
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

/* ------------------------------------------------------------------ */
/* Cards                                                               */
/* ------------------------------------------------------------------ */

const StudentPersonalCard = ({
  student,
  countryOptions,
  loadingCountries,
  onUpdated,
}) => {
  const buildForm = () => ({
    fullName: student.fullName || "",
    username: student.username || "",
    email: student.email || "",
    phone: student.phone || "",
    countryId: getCountryId(student.country),
    birthDate: toDateInputValue(student.birthDate),
  });
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(buildForm);

  useEffect(() => {
    setForm(buildForm());
  }, [student]);

  const handleChange = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  const handleCancel = () => {
    setForm(buildForm());
    setError("");
    setEditing(false);
  };

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
      const res = await updateMyProfile(payload);
      const updatedStudent = extractStudent(res.data) || payload;
      toast.success("تم تعديل البيانات بنجاح");
      onUpdated(updatedStudent);
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || "حدث خطأ أثناء تعديل البيانات");
    } finally {
      setSaving(false);
    }
  };

  // اسم الدولة للعرض: بندوّر عليه في الليستة المحمّلة (لو متوفرة)، وإلا بنعرض الـ id كاحتياطي
  const countryLabel =
    resolveCountryLabel({
      country: student.country,
      countryCode: student.countryCode,
      options: countryOptions,
    }) || "—";

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-(--white) border border-(--border-light) rounded-2xl shadow-(--shadow) p-6"
    >
      <SectionHeader
        title="البيانات الشخصية"
        subtitle="هذا القسم يحتوي على بياناتك الشخصية الأساسية التي تُستخدم في جميع الخدمات الرسمية داخل المنصة."
        editing={editing}
        onEditClick={() => setEditing(true)}
      />
      {!editing ? (
        <ViewGrid>
          <ViewField label="الاسم الكامل" value={student.fullName} />
          <ViewField label="اسم المستخدم" value={student.username} />
          <ViewField
            label="تاريخ الميلاد"
            value={formatDateDisplay(student.birthDate)}
          />
          <ViewField label="الدولة" value={countryLabel} />
          <ViewField label="رقم الهاتف" value={
            <PhoneDisplay
              phone={student.phone}
              country={student.country}
              countryCode={student.countryCode}
              options={countryOptions}
            />
          } />
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
        <ActionRow
          saving={saving}
          onCancel={handleCancel}
          error={error}
          confirmLabel="حفظ البيانات"
        />
      )}
    </form>
  );
};

const StudentAcademicCard = ({ student, onUpdated }) => {
  const buildForm = () => ({
    stageId: student.stage?.id || student.stage?._id || student.stage || "",
    gradeId: student.grade?.id || student.grade?._id || student.grade || "",
    curriculumId:
      student.curriculum?.id ||
      student.curriculum?._id ||
      student.curriculum ||
      "",
    studyLanguage: student.studyLanguage || "ar",
  });
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(buildForm);

  const [curriculumOptions, setCurriculumOptions] = useState([]);
  const [stageOptions, setStageOptions] = useState([]);
  const [gradeOptions, setGradeOptions] = useState([]);
  const [loadingCurriculums, setLoadingCurriculums] = useState(false);
  const [loadingStages, setLoadingStages] = useState(false);
  const [loadingGrades, setLoadingGrades] = useState(false);

  useEffect(() => {
    setForm(buildForm());
  }, [student]);

  // تحميل المناهج أول ما المستخدم يفتح وضع التعديل
  useEffect(() => {
    if (!editing || curriculumOptions.length > 0) return;
    setLoadingCurriculums(true);
    getCurriculums()
      .then((res) =>
        setCurriculumOptions(extractList(res.data).map(normalizeOption)),
      )
      .catch(() => toast.error("تعذر تحميل قائمة المناهج"))
      .finally(() => setLoadingCurriculums(false));
  }, [editing]);

  // تحميل المراحل المرتبطة بالمنهج المختار
  useEffect(() => {
    if (!editing || !form.curriculumId) {
      setStageOptions([]);
      return;
    }
    setLoadingStages(true);
    getCurriculumStages(form.curriculumId)
      .then((res) =>
        setStageOptions(extractList(res.data).map(normalizeOption)),
      )
      .catch(() => toast.error("تعذر تحميل المراحل الدراسية"))
      .finally(() => setLoadingStages(false));
  }, [editing, form.curriculumId]);

  // تحميل الصفوف المرتبطة بالمرحلة المختارة
  useEffect(() => {
    if (!editing || !form.stageId) {
      setGradeOptions([]);
      return;
    }
    setLoadingGrades(true);
    getStageGrades(form.stageId)
      .then((res) =>
        setGradeOptions(extractList(res.data).map(normalizeOption)),
      )
      .catch(() => toast.error("تعذر تحميل الصفوف الدراسية"))
      .finally(() => setLoadingGrades(false));
  }, [editing, form.stageId]);

  const handleCancel = () => {
    setForm(buildForm());
    setError("");
    setEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = {
        stage: form.stageId,
        grade: form.gradeId,
        curriculum: form.curriculumId,
        studyLanguage: form.studyLanguage,
      };
      // لو عندك endpoint مخصص للبيانات الأكاديمية استخدم بدل updateMyProfile:
      // const res = await saveStudentInterests(payload);
      const res = await updateMyProfile(payload);
      const updatedStudent = extractStudent(res.data) || payload;
      toast.success("تم تعديل البيانات بنجاح");
      onUpdated(updatedStudent);
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || "حدث خطأ أثناء تعديل البيانات");
    } finally {
      setSaving(false);
    }
  };

  const langLabel = (id) =>
    LANGUAGE_OPTIONS.find((l) => l.id === id)?.label || "—";

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-(--white) border border-(--border-light) rounded-2xl shadow-(--shadow) p-6"
    >
      <SectionHeader
        title="البيانات الأكاديمية"
        subtitle="هذه البيانات تحت إدارة ولي الأمر ولا يمكن تعديلها من حساب الطالب."
        editing={editing}
      />
      {!editing ? (
        <ViewGrid>
          <ViewField
            label="المرحلة الدراسية"
            value={pickName(student.stage?.name)}
          />
          <ViewField
            label="الصف الدراسي"
            value={pickName(student.grade?.name)}
          />
          <ViewField
            label="المنهج الدراسي"
            value={pickName(student.curriculum?.name)}
          />
          <ViewField
            label="لغة الدراسة"
            value={langLabel(student.studyLanguage)}
          />
        </ViewGrid>
      ) : (
        <EditBox>
          <Dropdown
            label="المنهج الدراسي"
            value={form.curriculumId}
            options={curriculumOptions}
            loading={loadingCurriculums}
            onChange={(id) =>
              setForm((prev) => ({
                ...prev,
                curriculumId: id,
                stageId: "",
                gradeId: "",
              }))
            }
            placeholder="اختر المنهج الدراسي"
          />
          <Dropdown
            label="المرحلة الدراسية"
            value={form.stageId}
            options={stageOptions}
            loading={loadingStages}
            disabled={!form.curriculumId}
            onChange={(id) =>
              setForm((prev) => ({ ...prev, stageId: id, gradeId: "" }))
            }
            placeholder={
              form.curriculumId ? "اختر المرحلة الدراسية" : "اختر المنهج أولاً"
            }
          />
          <Dropdown
            label="الصف الدراسي"
            value={form.gradeId}
            options={gradeOptions}
            loading={loadingGrades}
            disabled={!form.stageId}
            onChange={(id) => setForm((prev) => ({ ...prev, gradeId: id }))}
            placeholder={
              form.stageId ? "اختر الصف الدراسي" : "اختر المرحلة أولاً"
            }
          />
          <Dropdown
            label="لغة الدراسة"
            value={form.studyLanguage}
            options={LANGUAGE_OPTIONS}
            onChange={(id) =>
              setForm((prev) => ({ ...prev, studyLanguage: id }))
            }
            placeholder="اختر اللغة"
          />
        </EditBox>
      )}
      {editing && (
        <ActionRow
          saving={saving}
          onCancel={handleCancel}
          error={error}
          confirmLabel="حفظ البيانات"
        />
      )}
    </form>
  );
};

const SecurityCard = ({ lastPasswordChange }) => {
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
      await updatePassword({
        currentPassword: form.currentPassword,
        updatedPassword: form.password,
      });
      toast.success("تم تغيير كلمة المرور بنجاح");
      handleCancel();
    } catch (err) {
      setError(
        err.response?.data?.message || "حدث خطأ أثناء تغيير كلمة المرور",
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
        <div className="border border-x-4 border-[#123C9180] rounded-xl p-5">
          <p className="text-xs text-(--text-light) mb-1.5">كلمة المرور</p>
          <p className="text-sm font-semibold text-(--text-dark) mb-1 tracking-widest">
            ••••••••
          </p>
          <p className="text-xs text-(--text-light)">{lastPasswordChange}</p>
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

/* ------------------------------------------------------------------ */
/* Main Page                                                           */
/* ------------------------------------------------------------------ */

const StudentAccountSettings = () => {
  const { user: ctxUser, updateUser } = useContext(AuthContext) || {};

  const [student, setStudent] = useState(ctxUser || null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // قائمة الدول محمّلة على مستوى الصفحة عشان نعرض اسم الدولة في وضع العرض برضه (مش وضع التعديل بس)
  const [countryOptions, setCountryOptions] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const res = await getMyProfile();
      const studentData = extractStudent(res.data);
      if (studentData) {
        setStudent(studentData);
        updateUser?.(studentData);
      }
    } catch (err) {
      setLoadError(err.response?.data?.message || "تعذر تحميل بيانات الحساب");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    setLoadingCountries(true);
    getCountries()
      .then((res) =>
        setCountryOptions(extractList(res.data).map(normalizeOption)),
      )
      .catch(() => {})
      .finally(() => setLoadingCountries(false));
  }, []);

  const handleProfileUpdated = (updatedStudent) => {
    setStudent((prev) => {
      const next = { ...prev, ...updatedStudent };
      updateUser?.(next);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20" dir="rtl">
        <Loader2 size={28} className="animate-spin text-(--primary)" />
      </div>
    );
  }
  if (loadError || !student) {
    return (
      <div className="text-center py-20 text-red-500" dir="rtl">
        {loadError || "تعذر تحميل البيانات"}
      </div>
    );
  }

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

      <div className="bg-(--white) border border-(--border-light) rounded-2xl shadow-(--shadow) overflow-hidden">
        <div className="p-6 flex items-center gap-4">
          {/* أفاتار بأول حرف من الاسم بدل صورة قابلة للرفع */}
          <div className="w-16 h-16 shrink-0 rounded-full bg-(--primary) text-white flex items-center justify-center text-xl font-bold">
            {getInitial(student.fullName)}
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-(--text-dark) truncate">
              {student.fullName}
            </h2>
            <p className="text-sm text-(--text-light) truncate">
              {student.email}
            </p>
          </div>
          <AccountStatusBadge />
        </div>
      </div>

      <StudentPersonalCard
        student={student}
        countryOptions={countryOptions}
        loadingCountries={loadingCountries}
        onUpdated={handleProfileUpdated}
      />
      <TimezoneSettingsCard
        timezone={student.timezone}
        onUpdated={handleProfileUpdated}
      />
      <StudentAcademicCard student={student} onUpdated={handleProfileUpdated} />
      <SecurityCard lastPasswordChange={student.passwordChangedAt} />
    </div>
  );
};

export default StudentAccountSettings;
