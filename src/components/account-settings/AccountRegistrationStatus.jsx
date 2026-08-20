import { useContext } from "react";
import { ArrowLeft, CircleAlert, Clock3 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { isActivated } from "../../utils/roles";

const normalizeStatus = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replaceAll("_", "-");

const getAccountRegistrationStatus = (user) =>
  normalizeStatus(
    user?.registrationStatus ||
      user?.registration_status ||
      user?.profileStatus ||
      user?.status,
  );

const profilePendingStatuses = new Set([
  "pending-profile",
  "profile-incomplete",
  "incomplete",
  "verified",
]);

const reviewPendingStatuses = new Set([
  "pending",
  "pending-review",
  "pending-approval",
  "under-review",
]);

const settingsPathByRole = {
  teacher: "/teacher/settings",
  student: "/student/settings",
  parent: "/parent/settings",
};

const statusDetails = (user) => {
  const status = getAccountRegistrationStatus(user);

  if (isActivated(user)) {
    return {
      type: "active",
      label: "الحساب مفعّل",
      description: "تمت الموافقة على حسابك ويمكنك استخدام جميع الخدمات المتاحة.",
    };
  }

  if (profilePendingStatuses.has(status) || user?.profileCompleted === false) {
    return {
      type: "profile",
      label: "الملف الشخصي غير مكتمل",
      description: "أكمل بيانات حسابك من إعدادات الحساب لإرسال طلبك للمراجعة.",
      action: "إكمال بيانات الحساب",
      to: settingsPathByRole[user?.role] || "/",
    };
  }

  if (reviewPendingStatuses.has(status)) {
    return {
      type: "review",
      label: "الحساب قيد المراجعة",
      description: "تم استلام بياناتك. انتظر موافقة الإدارة لتفعيل حسابك.",
      action: "متابعة حالة الحساب",
      to: "/pending",
    };
  }

  return {
    type: "unknown",
    label: "حالة الحساب غير متاحة",
    description: "ستظهر حالة الحساب هنا بمجرد تحديثها.",
  };
};

export const AccountStatusNotice = () => {
  const { user } = useContext(AuthContext) || {};
  const location = useLocation();
  const details = statusDetails(user);

  if (!user || !["profile", "review"].includes(details.type)) return null;

  const alreadyOnTarget = location.pathname === details.to;

  return (
    <div
      className="sticky top-0 z-40 mb-4 flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between"
      dir="rtl"
      role="status"
    >
      <div className="flex items-start gap-3">
        {details.type === "profile" ? (
          <CircleAlert className="mt-0.5 shrink-0 text-amber-600" size={21} />
        ) : (
          <Clock3 className="mt-0.5 shrink-0 text-amber-600" size={21} />
        )}
        <div>
          <p className="font-bold text-amber-900">{details.label}</p>
          <p className="text-sm text-amber-800">{details.description}</p>
        </div>
      </div>

      {!alreadyOnTarget && (
        <Link
          to={details.to}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#123C91] px-4 py-2 text-sm font-semibold !text-white"
        >
          {details.action}
          <ArrowLeft size={16} />
        </Link>
      )}
    </div>
  );
};

export const AccountStatusBadge = () => {
  const { user } = useContext(AuthContext) || {};
  if (!user) return null;

  const details = statusDetails(user);
  const colors = {
    active: "bg-emerald-100 text-emerald-700",
    profile: "bg-amber-100 text-amber-800",
    review: "bg-blue-100 text-blue-700",
    unknown: "bg-gray-100 text-gray-600",
  };

  return (
    <span
      className={`mr-auto inline-flex shrink-0 items-center rounded-full px-3 py-1.5 text-xs font-bold ${colors[details.type]}`}
      title={details.description}
    >
      {details.label}
    </span>
  );
};
