import React, { useState, useRef, useEffect, useContext } from "react";
import { Pencil, Eye, EyeOff, ChevronDown, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import {
  getMyProfile,
  updateMyProfile,
  completeTeacherProfile,
  getCountries,
  getCurriculums,
  getCurriculum,
  getCurriculumStages,
  getStage,
  getStageGrades,
  getGrade,
  getSubjects,
  getSubject,
  getMyTeachingSelections,
  updateMyTeachingSelections,
  updatePassword,
} from "../../../services/APIService";
import { AuthContext } from "../../../context/AuthContext";
import { isRegistrationIncomplete } from "../../../utils/roles";
import TimezoneSettingsCard from "../../account-settings/TimezoneSettingsCard";
import { AccountStatusBadge } from "../../account-settings/AccountRegistrationStatus";
import PhoneDisplay from "../../account-settings/PhoneDisplay";
import TeachingSelectionsEditor, { sanitizeTeachingSelections, validTeachingSelections } from "../TeachingSelectionsEditor";
import {
  getCountryId,
  resolveCountryLabel,
} from "../../../utils/countryName";

const LANG = "ar"; // change to dynamic locale if you support i18n switching

// بيرجع نص الاسم سواء جاي كـ string عادي أو كـ object {ar, en}
const pickName = (val) => {
  if (!val) return "";
  if (typeof val === "string") return val;
  return val[LANG] || val.ar || val.en || "";
};

// بيدمج شكل الريسبونس الفعلي:
// { success, data: { user: {...}, curriculums: [...], grades: [...], subjects: [...], language, status, ... } }
// في object واحد مسطّح اسمه "teacher" نقدر نستخدمه بسهولة في الكومبوننت
const extractUser = (resData) => {
  if (!resData) return null;
  const root = resData?.data?.data ?? resData?.data ?? resData;
  const user = root?.user || root;
  if (!user) return null;

  // ملحوظة: root.id هو ID بتاع الـ Teacher/Parent profile document، مختلف عن user.id
  // (ID بتاع الـ User document). بنحتفظ بيهم منفصلين عشان محدش يتكتب فوق التاني بالغلط.
  const { user: _omit, id: profileId, ...restWithoutId } = root || {};

  return {
    ...user,
    ...restWithoutId, // language, status, certificates, rating, profileSlug, etc.
    profileId,
    curriculums: root?.curriculums || user.curriculums || [],
    grades: root?.grades || user.grades || [],
    subjects: root?.subjects || user.subjects || [],
  };
};

// بيستخرج array الأوبشنز من أشكال الريسبونس المختلفة اللي ممكن يرجعها الباك إند
const extractList = (resData) => {
  if (!resData) return [];
  const root = resData?.data || resData;
  const raw = root?.data || root?.items || root || [];
  return Array.isArray(raw) ? raw : [];
};

// بيوحد شكل العنصر (id / label) مهما كان اسم الحقول جاي من الباك إند، وبيدعم الاسم البايلينجوال
const normalizeOption = (item) => ({
  id: item._id || item.id || item.value || item.code,
  code: item.code || item.countryCode,
  phoneCode: item.phoneCode || item.dialCode || item.callingCode,
  flagUrl: item.flagUrl || item.flag,
  label:
    item.nameAr ||
    item.arabicName ||
    pickName(item.name) ||
    item.title ||
    item.label ||
    item.nameAr ||
    item.name_ar ||
    "",
});

const groupOptionsByLabel = (options) => {
  const groups = new Map();
  options.forEach((option) => {
    const key = option.label.trim().toLocaleLowerCase("ar");
    if (!key || !option.id) return;
    const existing = groups.get(key);
    if (existing) existing.ids.push(option.id);
    else groups.set(key, { ...option, ids: [option.id] });
  });
  return [...groups.values()];
};

const LANGUAGE_OPTIONS = [
  { id: "ar", label: "العربية" },
  { id: "en", label: "الإنجليزية" },
  { id: "fr", label: "الفرنسية" },
];

const normalizeTeachingLanguages = (value) => [
  ...new Set(
    (Array.isArray(value) ? value : value ? [value] : [])
      .map((item) => item === "ar" ? "arabic" : item === "en" ? "languages" : item)
      .filter((item) => item === "arabic" || item === "languages"),
  ),
];

const TeachingSelectionsSummary = ({ selections }) => {
  const [names, setNames] = useState({});

  useEffect(() => {
    let active = true;
    const requests = [];
    const addRequest = (id, request) => {
      if (!id || requests.some((item) => item.id === id)) return;
      requests.push({ id, request });
    };

    selections.forEach((curriculum) => {
      addRequest(curriculum.curriculum, () => getCurriculum(curriculum.curriculum));
      curriculum.stages?.forEach((stage) => {
        addRequest(stage.stage, () => getStage(stage.stage));
        stage.grades?.forEach((grade) => {
          addRequest(grade.grade, () => getGrade(grade.grade));
          grade.subjects?.forEach((subject) => addRequest(subject, () => getSubject(subject)));
        });
      });
    });

    Promise.all(requests.map(async ({ id, request }) => {
      try {
        const response = await request();
        const entity = response?.data?.data ?? response?.data ?? {};
        const arabic = entity?.name?.ar ?? entity?.nameAr ?? entity?.arabicName ?? "";
        const english = entity?.name?.en ?? entity?.nameEn ?? entity?.englishName ?? "";
        return [id, { label: arabic || english || id, subjectLabel: [arabic, english].filter(Boolean).join(" - ") || id }];
      } catch {
        return [id, { label: id, subjectLabel: id }];
      }
    })).then((entries) => {
      if (active) setNames(Object.fromEntries(entries));
    });

    return () => { active = false; };
  }, [selections]);

  if (!selections.length) return <p className="text-sm text-gray-500">لا توجد اختيارات تدريس مسجلة.</p>;

  return <div className="space-y-4">
    {selections.map((curriculum, curriculumIndex) => <div key={curriculum.curriculum} className="rounded-2xl border border-[#D7E2F3] bg-[#F8FAFD] p-4">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex size-7 items-center justify-center rounded-full bg-[#123C91] text-sm font-bold text-white">{curriculumIndex + 1}</span>
        <div>
          <p className="text-xs text-gray-500">المنهج الدراسي</p>
          <h4 className="font-bold text-[#123C91]">{names[curriculum.curriculum]?.label || "جاري تحميل الاسم..."}</h4>
        </div>
      </div>
      <div className="space-y-3 border-r-2 border-[#C9D7EE] pr-4">
        {curriculum.stages?.map((stage) => <div key={stage.stage}>
          <p className="mb-2 text-sm font-semibold text-gray-800">المرحلة: {names[stage.stage]?.label || "جاري التحميل..."}</p>
          <div className="grid gap-2 md:grid-cols-2">
            {stage.grades?.map((grade) => <div key={grade.grade} className="rounded-xl border bg-white p-3 shadow-sm">
              <p className="mb-2 text-sm font-bold text-gray-800">{names[grade.grade]?.label || "جاري تحميل الصف..."}</p>
              <div className="flex flex-wrap gap-1.5">
                {grade.subjects?.map((subject) => <span key={subject} className="rounded-lg bg-[#EAF0FB] px-2.5 py-1 text-xs font-medium text-[#123C91]">
                  {names[subject]?.subjectLabel || "جاري تحميل المادة..."}
                </span>)}
              </div>
            </div>)}
          </div>
        </div>)}
      </div>
    </div>)}
  </div>;
};
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

const InlineMultiSelect = ({
  label,
  value = [],
  options = [],
  loading,
  disabled,
  onChange,
  placeholder,
}) => {
  const toggle = (option) => {
    const ids = option.ids ?? [option.id];
    const hasSelectedId = ids.some((id) => value.includes(id));
    onChange(
      hasSelectedId
        ? value.filter((id) => !ids.includes(id))
        : [...new Set([...value, ...ids])],
    );
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs text-(--text-light)">{label}</label>
      <div
        className={`flex min-h-12 flex-wrap items-center gap-2 rounded-lg border border-(--border-light) bg-(--bg-section) px-3 py-2 ${
          disabled ? "pointer-events-none opacity-50" : ""
        }`}
      >
        {loading ? (
          <span className="inline-flex items-center gap-2 text-sm text-(--text-light)">
            <Loader2 size={14} className="animate-spin" />
            جاري تحميل المواد...
          </span>
        ) : options.length === 0 ? (
          <span className="text-sm text-(--text-light)">{placeholder}</span>
        ) : (
          options.map((option) => {
            const ids = option.ids ?? [option.id];
            const selected = ids.some((id) => value.includes(id));
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => toggle(option)}
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                  selected
                    ? "border-(--primary) bg-(--primary) text-white"
                    : "border-(--border-light) bg-white text-(--text-light) hover:border-(--primary)"
                }`}
              >
                {option.label}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

const TeacherPersonalCard = ({
  teacher,
  countryOptions,
  loadingCountries,
  onSaved,
}) => {
  const buildForm = () => ({
    fullName: teacher.fullName || "",
    username: teacher.username || "",
    email: teacher.email || "",
    phone: teacher.phone || "",
    countryId: getCountryId(teacher.country),
  });
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(buildForm);

  useEffect(() => {
    setForm(buildForm());
  }, [teacher]);

  const handleChange = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  const handleCancel = () => {
    setForm(buildForm());
    setError("");
    setEditing(false);
  };

  // بيدور على اسم الدولة من القائمة عشان نعرضها في وضع العرض (لإن الريسبونس بيرجع ID بس)
  const countryLabel = resolveCountryLabel({
    country: teacher.country,
    countryCode: teacher.countryCode,
    options: countryOptions,
  });

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
      await updateMyProfile(payload);
      toast.success("تم تعديل البيانات بنجاح");
      await onSaved(); // بيعمل fetch كامل من السيرفر بدل ما نخمن شكل الريسبونس
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || "حدث خطأ أثناء تعديل البيانات");
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
          <ViewField label="الاسم الكامل" value={teacher.fullName} />
          <ViewField label="اسم المستخدم" value={teacher.username} />
          <ViewField label="البريد الإلكتروني" value={teacher.email} />
          <ViewField label="رقم الهاتف" value={
            <PhoneDisplay
              phone={teacher.phone}
              country={teacher.country}
              countryCode={teacher.countryCode}
              options={countryOptions}
            />
          } />
          <ViewField label="الدولة" value={countryLabel} />
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

const TeacherProfessionalCard = ({ teacher, onSaved }) => {
  const incomplete = isRegistrationIncomplete(teacher);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [language, setLanguage] = useState([]);
  const [experienceYears, setExperienceYears] = useState("");
  const [selections, setSelections] = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      const response = await getMyTeachingSelections();
      const data = response?.data?.data ?? response?.data ?? {};
      setLanguage(normalizeTeachingLanguages(data.language));
      setSelections(Array.isArray(data.teachingSelections) ? data.teachingSelections : []);
      setExperienceYears(teacher.experienceYears ?? teacher.experience ?? "");
    } catch (err) {
      if (!incomplete) setError(err.response?.data?.message || "تعذر تحميل اختيارات التدريس");
      setLanguage(normalizeTeachingLanguages(teacher.language).length
        ? normalizeTeachingLanguages(teacher.language)
        : ["arabic"]);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [teacher]);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    const normalizedLanguages = normalizeTeachingLanguages(language);
    const sanitizedSelections = sanitizeTeachingSelections(selections);
    if (!normalizedLanguages.length || !validTeachingSelections(sanitizedSelections)) {
      setError("اختر لغة ومنهجًا، مع مرحلة وصف ومادة واحدة على الأقل");
      return;
    }
    setSaving(true);
    try {
      if (incomplete) {
        const formData = new FormData();
        formData.append("language", JSON.stringify(normalizedLanguages));
        formData.append("experienceYears", String(Number(experienceYears || 0)));
        formData.append("teachingSelections", JSON.stringify(sanitizedSelections));
        await completeTeacherProfile(formData);
        toast.success("تم استكمال البيانات وإرسال الملف للمراجعة");
      } else {
        // Each endpoint has a separate responsibility. The selections request
        // deliberately sends the complete edited state, including old curricula.
        await Promise.all([
          updateMyTeachingSelections({ teachingSelections: sanitizedSelections }),
          updateMyProfile({ language: normalizedLanguages, experienceYears: experienceYears === "" ? undefined : Number(experienceYears) }),
        ]);
        toast.success("تم تعديل البيانات بنجاح");
      }
      await onSaved();
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || "حدث خطأ أثناء تعديل البيانات");
    } finally { setSaving(false); }
  };

  const languageLabel = language.map((item) => item === "arabic" ? "العربية" : "اللغات").join("، ") || "—";
  return <form onSubmit={submit} className="bg-(--white) border border-(--border-light) rounded-2xl shadow-(--shadow) p-6">
    <SectionHeader title="البيانات الأكاديمية" subtitle="مناهجك ومراحلها وصفوفها وموادها ولغات التدريس." editing={editing} onEditClick={() => setEditing(true)} />
    {loading ? <div className="py-8 text-center text-gray-500">جاري تحميل اختيارات التدريس...</div> : !editing ? <div className="space-y-5">
      <ViewGrid>
        <ViewField label="لغات التدريس" value={languageLabel} />
        <ViewField label="سنوات الخبرة" value={experienceYears || "—"} />
      </ViewGrid>
      <TeachingSelectionsSummary selections={selections} />
    </div> : <EditBox>
      <InlineMultiSelect label="لغات التدريس" value={language} options={[{ id: "arabic", label: "العربية" }, { id: "languages", label: "اللغات" }]} onChange={setLanguage} placeholder="اختر لغة تدريس" />
      <TextInput label="سنوات الخبرة" type="number" value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)} />
      <div className="md:col-span-2"><TeachingSelectionsEditor value={selections} onChange={setSelections} /></div>
    </EditBox>}
    {error && !editing && <p className="mt-3 text-sm text-red-600">{error}</p>}
    {editing && <ActionRow saving={saving} onCancel={() => { setEditing(false); setError(""); load(); }} error={error} confirmLabel="تعديل البيانات" />}
  </form>;
};

const LegacyTeacherProfessionalCard = ({ teacher, onSaved }) => {
  const entityId = (value) =>
    typeof value === "string" ? value : value?._id || value?.id || "";
  const currentCurriculum =
    entityId(teacher.curriculum) || entityId(teacher.curriculums?.[0]);
  const currentStage =
    entityId(teacher.stage) ||
    entityId(teacher.grades?.[0]?.stage) ||
    entityId(teacher.grades?.[0]?.stageId);
  const buildForm = () => ({
    studyLanguage: teacher.language || "ar",
    curriculumId: currentCurriculum,
    stageId: currentStage,
    gradeIds: (teacher.grades || []).map(entityId).filter(Boolean),
    experienceYears: teacher.experienceYears ?? teacher.experience ?? "",
    subjects: (teacher.subjects || []).map(entityId).filter(Boolean),
  });
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(buildForm);

  const [curriculumOptions, setCurriculumOptions] = useState([]);
  const [stageOptions, setStageOptions] = useState([]);
  const [gradeOptions, setGradeOptions] = useState([]);
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [loadingCurriculums, setLoadingCurriculums] = useState(false);
  const [loadingStages, setLoadingStages] = useState(false);
  const [loadingGrades, setLoadingGrades] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  useEffect(() => {
    setForm(buildForm());
  }, [teacher]);

  useEffect(() => {
    if (!editing) return;
    if (curriculumOptions.length === 0) {
      setLoadingCurriculums(true);
      getCurriculums()
        .then((res) =>
          setCurriculumOptions(extractList(res.data).map(normalizeOption)),
        )
        .catch(() => toast.error("تعذر تحميل قائمة المناهج"))
        .finally(() => setLoadingCurriculums(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing]);

  useEffect(() => {
    if (!editing || form.stageId || !form.gradeIds.length) return;
    let active = true;

    getGrade(form.gradeIds[0])
      .then((res) => {
        if (!active) return;
        const grade = res?.data?.data ?? res?.data ?? {};
        const stageId = entityId(grade.stage) || entityId(grade.stageId);
        if (stageId) {
          setForm((previous) => ({ ...previous, stageId }));
        }
      })
      .catch(() => {
        // The saved grades and subjects remain selected even if stage lookup fails.
      });

    return () => {
      active = false;
    };
  }, [editing, form.gradeIds, form.stageId]);

  useEffect(() => {
    if (!editing || !form.curriculumId) {
      setStageOptions([]);
      return;
    }
    let active = true;
    setLoadingStages(true);
    getCurriculumStages(form.curriculumId)
      .then((res) => {
        if (active) setStageOptions(extractList(res.data).map(normalizeOption));
      })
      .catch(() => toast.error("تعذر تحميل المراحل الدراسية"))
      .finally(() => active && setLoadingStages(false));
    return () => { active = false; };
  }, [editing, form.curriculumId]);

  useEffect(() => {
    if (!editing || !form.stageId) {
      setGradeOptions([]);
      return;
    }
    let active = true;
    setLoadingGrades(true);
    getStageGrades(form.stageId)
      .then((res) => {
        if (active) setGradeOptions(extractList(res.data).map(normalizeOption));
      })
      .catch(() => toast.error("تعذر تحميل الصفوف الدراسية"))
      .finally(() => active && setLoadingGrades(false));
    return () => { active = false; };
  }, [editing, form.stageId]);

  useEffect(() => {
    if (!editing) return;
    if (!form.gradeIds.length) {
      setSubjectOptions([]);
      return;
    }

    let active = true;
    setLoadingSubjects(true);
    Promise.all(
      form.gradeIds.map((grade) =>
        getSubjects({ grade })
          .then((res) => extractList(res.data))
          .catch(() => []),
      ),
    )
      .then((results) => {
        if (active) {
          const groupedSubjects = groupOptionsByLabel(
            results.flat().map(normalizeOption),
          );
          setSubjectOptions(groupedSubjects);

          const currentSubjectNames = new Set(
            (teacher.subjects || [])
              .map((subject) => pickName(subject?.name).trim().toLocaleLowerCase("ar"))
              .filter(Boolean),
          );
          const currentSubjectIds = new Set(
            (teacher.subjects || []).map(entityId).filter(Boolean),
          );
          const resolvedIds = groupedSubjects
            .filter(
              (option) =>
                currentSubjectNames.has(option.label.trim().toLocaleLowerCase("ar")) ||
                (option.ids ?? [option.id]).some((id) => currentSubjectIds.has(id)),
            )
            .flatMap((option) => option.ids ?? [option.id]);

          if (resolvedIds.length) {
            setForm((previous) => ({
              ...previous,
              subjects: [...new Set([...previous.subjects, ...resolvedIds])],
            }));
          }
        }
      })
      .catch(() => toast.error("تعذر تحميل المواد الدراسية"))
      .finally(() => active && setLoadingSubjects(false));

    return () => {
      active = false;
    };
  }, [editing, form.gradeIds]);

  const handleCancel = () => {
    setForm(buildForm());
    setError("");
    setEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (
      !form.curriculumId ||
      !form.stageId ||
      !form.gradeIds.length ||
      !form.subjects.length
    ) {
      setError("يرجى إكمال المنهج والمرحلة والصفوف والمواد الدراسية");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        language: form.studyLanguage,
        curriculums: [form.curriculumId],
        grades: form.gradeIds,
        experienceYears:
          form.experienceYears === "" ? undefined : Number(form.experienceYears),
        subjects: form.subjects,
      };

      if (isRegistrationIncomplete(teacher)) {
        // Updating /users/me saves the academic fields, but it does not submit
        // an incomplete teacher profile for review. Use the completion endpoint
        // here so the backend can move the registration status to `pending`.
        const completionPayload = new FormData();
        completionPayload.append("language", payload.language);
        completionPayload.append("curriculum", form.curriculumId);
        if (payload.experienceYears !== undefined) {
          completionPayload.append(
            "experienceYears",
            String(payload.experienceYears),
          );
        }
        payload.grades.forEach((gradeId) =>
          completionPayload.append("grades", gradeId),
        );
        payload.subjects.forEach((subjectId) =>
          completionPayload.append("subjects", subjectId),
        );
        await completeTeacherProfile(completionPayload);
        toast.success("تم استكمال البيانات وإرسال الملف للمراجعة");
      } else {
        await updateMyProfile(payload);
        toast.success("تم تعديل البيانات بنجاح");
      }
      await onSaved();
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || "حدث خطأ أثناء تعديل البيانات");
    } finally {
      setSaving(false);
    }
  };

  const langLabel = (id) =>
    LANGUAGE_OPTIONS.find((l) => l.id === id)?.label || "—";
  const joinedNames = (arr) => {
    if (!arr?.length) return "—";
    const names = new Map();
    arr.forEach((item) => {
      const name = pickName(item.name).trim();
      if (name) names.set(name.toLocaleLowerCase("ar"), name);
    });
    return [...names.values()].join("، ") || "—";
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-(--white) border border-(--border-light) rounded-2xl shadow-(--shadow) p-6"
    >
      <SectionHeader
        title="البيانات الأكاديمية"
        subtitle="يتضمن هذا القسم بياناتك التعليمية والمهنية الأساسية، والتي تُستخدم لإدارة الحصص والمجموعات الدراسية والتواصل مع الطلاب داخل المنصة."
        editing={editing}
        onEditClick={() => setEditing(true)}
      />
      {!editing ? (
        <ViewGrid>
          <ViewField label="لغة التدريس" value={langLabel(teacher.language)} />
          <ViewField
            label="المنهج الدراسي"
            value={joinedNames(teacher.curriculums)}
          />
          <ViewField
            label="الصفوف الدراسية"
            value={joinedNames(teacher.grades)}
          />
          <ViewField
            label="سنوات الخبرة"
            value={
              teacher.experienceYears ?? teacher.experience ?? "—"
            }
          />
          <ViewField label="المواد" value={joinedNames(teacher.subjects)} />
        </ViewGrid>
      ) : (
        <EditBox>
          <Dropdown
            label="لغة التدريس"
            value={form.studyLanguage}
            options={LANGUAGE_OPTIONS}
            onChange={(id) =>
              setForm((prev) => ({ ...prev, studyLanguage: id }))
            }
            placeholder="اختر اللغة"
          />
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
                gradeIds: [],
                subjects: [],
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
              setForm((prev) => ({
                ...prev,
                stageId: id,
                gradeIds: [],
                subjects: [],
              }))
            }
            placeholder={form.curriculumId ? "اختر المرحلة الدراسية" : "اختر المنهج أولاً"}
          />
          <InlineMultiSelect
            label="الصفوف الدراسية"
            value={form.gradeIds}
            options={gradeOptions}
            loading={loadingGrades}
            disabled={!form.stageId}
            onChange={(ids) =>
              setForm((prev) => ({ ...prev, gradeIds: ids, subjects: [] }))
            }
            placeholder={form.stageId ? "اختر الصفوف الدراسية" : "اختر المرحلة أولاً"}
          />
          <TextInput
            label="سنوات الخبرة"
            type="number"
            value={form.experienceYears}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, experienceYears: e.target.value }))
            }
          />
          <InlineMultiSelect
            label="المواد الدراسية"
            value={form.subjects}
            options={subjectOptions}
            loading={loadingSubjects}
            disabled={!form.gradeIds.length}
            onChange={(ids) => setForm((prev) => ({ ...prev, subjects: ids }))}
            placeholder={form.gradeIds.length ? "لا توجد مواد" : "اختر الصفوف أولاً"}
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

// Kept temporarily as a compatibility reference while the new nested editor
// replaces the former single-curriculum implementation.
void LegacyTeacherProfessionalCard;

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

// دايرة فيها أول حرف من اسم المعلم بدل رفع صورة
const AvatarInitial = ({ name }) => {
  const initial = (name || "").trim().charAt(0).toUpperCase() || "؟";
  return (
    <div className="w-16 h-16 rounded-full shrink-0 bg-(--primary) text-white flex items-center justify-center text-2xl font-bold select-none">
      {initial}
    </div>
  );
};

const TeacherAccountSettings = () => {
  const { user: ctxUser, updateUser } = useContext(AuthContext) || {};
  const [teacher, setTeacher] = useState(ctxUser || null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // قائمة الدول بنحملها مرة واحدة هنا عشان نستخدمها في العرض والتعديل مع
  const [countryOptions, setCountryOptions] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const res = await getMyProfile();
      const userData = extractUser(res.data);
      if (userData) {
        setTeacher(userData);
        updateUser?.(userData);
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
      .catch(() => toast.error("تعذر تحميل قائمة الدول"))
      .finally(() => setLoadingCountries(false));
  }, []);

  const handleTimezoneUpdated = (updatedTimezone) => {
    setTeacher((prev) => {
      const next = { ...prev, ...updatedTimezone };
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
  if (loadError || !teacher) {
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
          <AvatarInitial name={teacher.fullName} />
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-(--text-dark) truncate">
              {teacher.fullName}
            </h2>
            <p className="text-sm text-(--text-light) truncate">
              {teacher.email}
            </p>
          </div>
          <AccountStatusBadge />
        </div>
      </div>

      <TeacherPersonalCard
        teacher={teacher}
        countryOptions={countryOptions}
        loadingCountries={loadingCountries}
        onSaved={fetchProfile}
      />
      <TimezoneSettingsCard
        timezone={teacher.timezone}
        onUpdated={handleTimezoneUpdated}
      />
      <TeacherProfessionalCard teacher={teacher} onSaved={fetchProfile} />
      <SecurityCard lastPasswordChange={teacher.passwordChangedAt} />
    </div>
  );
};

export default TeacherAccountSettings;
