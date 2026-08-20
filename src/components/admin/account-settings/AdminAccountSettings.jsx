import React, { useState, useRef, useEffect, useContext } from "react";
import {
  Pencil,
  Eye,
  EyeOff,
  ChevronDown,
  Loader2,
  Mail,
  MessageCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  getContactSettings,
  getCountries,
  getMyProfile,
  updateContactSettings,
  updateMyProfile,
  updatePassword,
} from "../../../services/APIService";
import { AuthContext } from "../../../context/AuthContext"; // عدّل المسار حسب مشروعك
import {
  countryOption,
  getCountryId,
  resolveCountryLabel,
} from "../../../utils/countryName";
import TimezoneSettingsCard from "../../account-settings/TimezoneSettingsCard";
import PhoneDisplay from "../../account-settings/PhoneDisplay";
import Breadcrumbs from "../../../pages/shared/Breadcrumbs";
import LandingStatsSettings from "../dashboard/LandingStatsSettings";
import ExchangeRatesSettings from "./ExchangeRatesSettings";

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

// شكل الـ response عندنا: { success: true, data: { fullName, username, ... } }
// الدالة دي بتدوّر على الـ user جوه أي شكل شائع برضه احتياطًا
const extractUser = (resData) => {
  if (!resData) return null;
  const root = resData?.data?.data ?? resData?.data ?? resData;
  const user = root?.user || root;
  if (!user || typeof user !== "object") return null;
  if (user === root) return user;
  const profile = { ...root };
  delete profile.user;
  return {
    ...profile,
    ...user,
    country: user.country ?? profile.country,
    countryCode: user.countryCode ?? profile.countryCode,
    birthDate: user.birthDate ?? profile.birthDate,
  };
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

/* ------------------------------------------------------------------ */
/* Shared Components (زي ما هي بالظبط)                                  */
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

const ContactSettingsCard = () => {
  const [form, setForm] = useState({ email: "", whatsappNumber: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getContactSettings()
      .then((res) => {
        const data = res.data?.data;
        if (data) {
          setForm({
            email: data.email || "",
            whatsappNumber: data.phone || data.whatsappNumber || "",
          });
        }
      })
      .catch(() => setError("تعذر تحميل إعدادات التواصل"))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      setError("يرجى إدخال بريد إلكتروني صحيح");
      return;
    }
    if (!/^\+[1-9]\d{7,14}$/.test(form.whatsappNumber.trim())) {
      setError("رقم واتساب يجب أن يبدأ بـ + وكود الدولة، مثال: +201001234567");
      return;
    }

    setSaving(true);
    try {
      const res = await updateContactSettings({
        email: form.email.trim(),
        phone: form.whatsappNumber.trim(),
      });
      const data = res.data?.data;
      if (data) {
        setForm({
          email: data.email || "",
          whatsappNumber: data.phone || data.whatsappNumber || "",
        });
      }
      toast.success(res.data?.message || "تم تحديث وسائل التواصل بنجاح");
    } catch (err) {
      const validationError = Object.values(
        err.response?.data?.errors || {},
      )[0];
      setError(
        validationError ||
          err.response?.data?.message ||
          "تعذر حفظ إعدادات التواصل",
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
        title="إعدادات التواصل"
        subtitle="تظهر هذه البيانات في الصفحة الرئيسية وصفحات متابعة الطلب."
      />
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="animate-spin text-(--primary)" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="mb-1.5 flex items-center gap-2 text-sm text-(--text-light)">
              <Mail size={16} />
              البريد الإلكتروني
            </label>
            <input
              type="email"
              dir="ltr"
              value={form.email}
              onChange={(e) =>
                setForm((old) => ({ ...old, email: e.target.value }))
              }
              placeholder="support@example.com"
              className="w-full h-11 px-3.5 rounded-lg border border-(--border-light) bg-(--bg-section) outline-none focus:border-(--primary)"
            />
          </div>
          <div>
            <label className="mb-1.5 flex items-center gap-2 text-sm text-(--text-light)">
              <MessageCircle size={16} />
              رقم واتساب
            </label>
            <input
              type="tel"
              dir="ltr"
              value={form.whatsappNumber}
              onChange={(e) =>
                setForm((old) => ({ ...old, whatsappNumber: e.target.value }))
              }
              placeholder="+201001234567"
              className="w-full h-11 px-3.5 rounded-lg border border-(--border-light) bg-(--bg-section) outline-none focus:border-(--primary)"
            />
          </div>
        </div>
      )}
      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
      {!loading && (
        <button
          type="submit"
          disabled={saving}
          className="mt-5 flex items-center gap-2 rounded-lg bg-(--primary) px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
        >
          {saving && <Loader2 size={14} className="animate-spin" />}
          حفظ إعدادات التواصل
        </button>
      )}
    </form>
  );
};

const Dropdown = ({
  label,
  value,
  options,
  onChange,
  placeholder = "اختر",
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

  return (
    <div ref={ref} className="relative">
      <label className="block text-xs text-(--text-light) mb-1.5">
        {label}
      </label>
      <button
        type="button"
        onClick={() => !disabled && setOpen((o) => !o)}
        disabled={disabled}
        className={`w-full h-11 px-3.5 rounded-lg border border-(--border-light) bg-(--bg-section) text-sm text-right flex items-center justify-between transition-colors ${
          disabled
            ? "opacity-60 cursor-not-allowed"
            : "cursor-pointer hover:border-(--primary)"
        }`}
      >
        <span
          className={selected ? "text-(--text-dark)" : "text-(--text-light)"}
        >
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`text-(--text-light) transition-transform shrink-0 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && !disabled && (
        <ul className="absolute z-20 top-full right-0 left-0 mt-1 max-h-56 overflow-y-auto bg-(--white) border border-(--border-light) rounded-lg shadow-lg">
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

const AdminPersonalCard = ({
  admin,
  countryOptions,
  onUpdated,
  onEmailChanged,
}) => {
  const buildForm = () => ({
    fullName: admin.fullName || "",
    username: admin.username || "",
    email: admin.email || "",
    phone: admin.phone || "",
    countryId: getCountryId(admin.country),
  });

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(buildForm);

  useEffect(() => {
    setForm(buildForm());
  }, [admin]);

  const handleChange = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  const handleCancel = () => {
    setForm(buildForm());
    setError("");
    setEditing(false);
  };

  const countryLabel =
    resolveCountryLabel({
      country: admin.country,
      countryCode: admin.countryCode,
      options: countryOptions,
    }) || "—";

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

      const emailChanged = form.email.trim() !== (admin.email || "").trim();

      const res = await updateMyProfile(payload);

      if (emailChanged) {
        // الإيميل اتغيّر -> الـ token القديم بيبقى غير صالح منطقيًا، لازم يسجل دخول تاني
        toast.success("تم تغيير البريد الإلكتروني، يرجى تسجيل الدخول مرة أخرى");
        onEmailChanged();
        return;
      }

      const updatedUser = extractUser(res.data) || payload;
      toast.success("تم تعديل البيانات بنجاح");
      onUpdated(updatedUser);
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
          <ViewField label="الاسم الكامل" value={admin.fullName} />
          <ViewField label="اسم المستخدم" value={admin.username} />
          <ViewField label="البريد الإلكتروني" value={admin.email} />
          <ViewField
            label="رقم الهاتف"
            value={
              <PhoneDisplay
                phone={admin.phone}
                country={admin.country}
                countryCode={admin.countryCode}
                options={countryOptions}
              />
            }
          />
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
            confirmLabel="حفظ التعديلات "
          />
        </>
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

const AdminAccountSettings = () => {
  const { user: ctxUser, updateUser, logout } = useContext(AuthContext) || {};
  const navigate = useNavigate();

  const [admin, setAdmin] = useState(ctxUser || null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [countryOptions, setCountryOptions] = useState([]);

  const fetchProfile = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const res = await getMyProfile();
      const userData = extractUser(res.data);
      if (userData) {
        setAdmin(userData);
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
    getCountries()
      .then((res) => {
        const list = res.data?.data || res.data || [];
        setCountryOptions(Array.isArray(list) ? list.map(countryOption) : []);
      })
      .catch(() => setCountryOptions([]));
  }, []);

  const handleProfileUpdated = (updatedUser) => {
    setAdmin((prev) => {
      const next = { ...prev, ...updatedUser };
      updateUser?.(next);
      return next;
    });
  };

  // بيتنده لما الإيميل أو الباسورد يتغيروا: يعمل تسجيل خروج فعلي ويوديه لصفحة اللوجين
  const handleForceReLogin = () => {
    logout?.();
    navigate("/login", { replace: true });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20" dir="rtl">
        <Loader2 size={28} className="animate-spin text-(--primary)" />
      </div>
    );
  }

  if (loadError || !admin) {
    return (
      <div className="text-center py-20 text-red-500" dir="rtl">
        {loadError || "تعذر تحميل البيانات"}
      </div>
    );
  }

  const firstLetter =
    (admin.fullName || "").trim().charAt(0).toUpperCase() || "؟";

  return (
    <div className="space-y-5" dir="rtl">
      <Breadcrumbs homeTo="/admin-dashboard" />
      {/* Page title */}
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

      {/* Header card — avatar letter + name */}
      <div className="bg-(--white) border border-(--border-light) rounded-2xl shadow-(--shadow) overflow-hidden">
        <div className="p-6 flex items-center gap-4">
          <div className="w-16 h-16 shrink-0 rounded-full overflow-hidden bg-(--primary) flex items-center justify-center">
            <span className="text-white text-2xl font-bold">{firstLetter}</span>
          </div>

          <div className="min-w-0">
            <h2 className="text-lg font-bold text-(--text-dark) truncate">
              {admin.fullName}
            </h2>
            <p className="text-sm text-(--text-light) truncate">
              {admin.email}
            </p>
          </div>
        </div>
      </div>

      {/* Cards */}
      <AdminPersonalCard
        admin={admin}
        countryOptions={countryOptions}
        onUpdated={handleProfileUpdated}
        onEmailChanged={handleForceReLogin}
      />
      <TimezoneSettingsCard
        timezone={admin.timezone}
        onUpdated={handleProfileUpdated}
      />
      <SecurityCard lastPasswordChange={admin.passwordChangedAt} />
      <ContactSettingsCard />
      <ExchangeRatesSettings />
      <LandingStatsSettings />
    </div>
  );
};

export default AdminAccountSettings;
