import { useContext, useEffect, useState } from "react";
import { CheckCircle, Loader2, Mail, MessageCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/icons/logo.svg";
import AuthLayout from "../../components/auth/AuthLayout";
import useContactSettings, { whatsappLink } from "../../hooks/useContactSettings";
import { AuthContext } from "../../context/AuthContext";
import { getMyProfile } from "../../services/APIService";
import {
  getDatabaseAccountDashboard,
  getDatabaseUserFromAccountState,
  isDatabaseAccountActivated,
} from "../../utils/accountState";
import { isActivated } from "../../utils/roles";

const MESSAGES = {
  student: {
    title: "تم إنشاء حسابك!",
    desc: "حسابك قيد المراجعة، سيتم إعلامك بالموافقة عبر البريد الإلكتروني.",
    steps: [
      { label: "تم إنشاء الحساب", done: true },
      { label: "مراجعة البيانات", done: false },
      { label: "تفعيل الحساب", done: false },
    ],
  },
  teacher: {
    title: "تم إرسال طلبك!",
    desc: "طلبك قيد المراجعة من قِبل الإدارة، سيتم التواصل معك خلال 24-48 ساعة.",
    steps: [
      { label: "تم إنشاء الحساب", done: true },
      { label: "مراجعة الإدارة", done: false },
      { label: "تفعيل الحساب", done: false },
    ],
  },
};

const accountStatusLabel = (user) => {
  const status = String(user?.registrationStatus || user?.status || "")
    .trim()
    .toLowerCase()
    .replaceAll("_", "-");
  if (["pending-profile", "profile-incomplete", "incomplete"].includes(status)) {
    return "الملف الشخصي غير مكتمل";
  }
  if (isActivated(user)) {
    return "الحساب مفعّل";
  }
  return "قيد المراجعة";
};

const PendingPage = () => {
  const navigate = useNavigate();
  const { updateUser } = useContext(AuthContext) || {};
  const [checkingAccount, setCheckingAccount] = useState(true);
  const [databaseUser, setDatabaseUser] = useState(null);
  const role =
    databaseUser?.role ||
    new URLSearchParams(window.location.search).get("role") ||
    "student";
  const content = MESSAGES[role] || MESSAGES.student;
  const { contactSettings } = useContactSettings();
  const whatsappUrl = whatsappLink(contactSettings?.whatsappNumber);

  useEffect(() => {
    let active = true;

    getMyProfile()
      .then((response) => {
        if (!active) return;

        const freshUser = getDatabaseUserFromAccountState(response);
        setDatabaseUser(freshUser);
        updateUser?.(freshUser);

        if (!isDatabaseAccountActivated(response)) return;

        const dashboard = getDatabaseAccountDashboard({ data: freshUser });
        if (!dashboard) return;

        navigate(dashboard, { replace: true });
      })
      .catch(() => {
        // Keep the pending page visible when the live status cannot be loaded.
      })
      .finally(() => {
        if (active) setCheckingAccount(false);
      });

    return () => {
      active = false;
    };
  }, [navigate, updateUser]);

  if (checkingAccount) {
    return (
      <AuthLayout>
        <div className="flex min-h-80 items-center justify-center" dir="rtl">
          <Loader2 className="animate-spin text-[#123C91]" size={28} />
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div
        className="w-full max-w-md mx-auto p-8 flex flex-col items-center"
        dir="rtl"
      >
        <Link to="/">
          <img src={logo} alt="logo" className="w-44 h-8 mb-8 cursor-pointer" />
        </Link>

        <div className="w-16 h-16 rounded-full bg-[#ECFDF5] flex items-center justify-center mb-5">
          <CheckCircle size={32} className="text-[#059669]" />
        </div>

        <h2
          className="text-[22px] font-bold text-[#1F2937] mb-2 text-center"
          style={{ fontFamily: "Tajawal, sans-serif" }}
        >
          {content.title}
        </h2>
        <p className="text-[14px] text-[#6B7280] text-center mb-8">
          {content.desc}
        </p>

        <div className="mb-5 inline-flex rounded-full bg-amber-100 px-4 py-2 text-sm font-bold text-amber-800">
          حالة الحساب: {accountStatusLabel(databaseUser)}
        </div>

        {/* Steps */}
        <div className="w-full bg-[#F9FAFA] rounded-xl border border-[#1F293733] p-5 mb-8">
          {content.steps.map((step, i) => (
            <div key={i} className="flex items-center gap-3 py-2">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                  step.done
                    ? "bg-[#059669]"
                    : "border-2 border-[#D1D5DB] bg-white"
                }`}
              >
                {step.done && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path
                      d="M1 4L3.5 6.5L9 1"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              <span
                className={`text-[14px] ${
                  step.done ? "text-[#059669] font-medium" : "text-[#9CA3AF]"
                }`}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>

        {(whatsappUrl || contactSettings?.email) && (
          <div className="mb-4 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
            {whatsappUrl && (
              <a href={whatsappUrl} target="_blank" rel="noreferrer" className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#25D366] text-sm font-semibold text-white">
                <MessageCircle size={18} /> تواصل عبر واتساب
              </a>
            )}
            {contactSettings?.email && (
              <a href={`mailto:${contactSettings.email}`} className="flex h-12 items-center justify-center gap-2 rounded-xl border border-[#123C91] text-sm font-semibold text-[#123C91]">
                <Mail size={18} /> راسلنا بالبريد
              </a>
            )}
          </div>
        )}

        <button
          onClick={() => {
            const dashboard = databaseUser
              ? getDatabaseAccountDashboard({ data: databaseUser })
              : null;
            navigate(dashboard || "/");
          }}
          className="w-full h-14 rounded-xl bg-[#123C91] !text-white [&_svg]:!text-white font-medium text-[16px]"
        >
          الرئيسية
        </button>
      </div>
    </AuthLayout>
  );
};

export default PendingPage;
