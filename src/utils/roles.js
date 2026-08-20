export const ADMIN_ROLES = ["admin", "super-admin"];

export const isAdminRole = (role) => ADMIN_ROLES.includes(role);

export const APPROVED_STATUSES = ["active", "approved", "accepted"];

const normalizedStatuses = (user) =>
  [
    user?.registrationStatus,
    user?.registration_status,
    user?.profileStatus,
    user?.status,
  ]
    .filter(Boolean)
    .map((status) =>
      String(status).trim().toLowerCase().replaceAll("_", "-"),
    );

export const isActivated = (user) => {
  const registrationStatus = String(
    user?.registrationStatus || user?.registration_status || "",
  )
    .trim()
    .toLowerCase();
  const registrationIsActive =
    APPROVED_STATUSES.includes(registrationStatus) && user?.isActive !== false;

  if (!registrationIsActive) return false;
  if (user?.role !== "teacher") return true;

  const teacherStatus = String(user?.status || user?.profileStatus || "")
    .trim()
    .toLowerCase();
  return APPROVED_STATUSES.includes(teacherStatus);
};

export const isRegistrationIncomplete = (user) => {
  if (isActivated(user)) return false;
  const statuses = normalizedStatuses(user);
  return (
    user?.profileCompleted === false ||
    user?.isProfileComplete === false ||
    statuses.some((status) =>
      ["incomplete", "profile-incomplete", "pending-profile", "verified"].includes(status),
    )
  );
};

export const isAwaitingApproval = (user) =>
  !isActivated(user) &&
  normalizedStatuses(user).some((status) =>
    ["pending", "pending-review", "pending-approval", "under-review"].includes(status),
  );

export const getRegistrationContinuation = (user, registrationData = {}) => {
  if (!isRegistrationIncomplete(user)) return null;

  const role = user?.role || registrationData.role;
  const state = {
    email: user?.email || registrationData.email,
    role,
    academicLevel: user?.academicLevel || registrationData.academicLevel,
    studentType: user?.studentType || registrationData.studentType,
    countryId:
      user?.country?.id ||
      user?.country?._id ||
      user?.country ||
      registrationData.countryId ||
      registrationData.country,
  };

  if (role === "teacher") return { path: "/teacher/settings", state };
  if (role === "student") return { path: "/student/settings", state };
  if (role === "parent") return { path: "/parent/settings", state };
  return null;
};

export const getDashboardPathByRole = (user, fallback = "/") => {
  const continuation = getRegistrationContinuation(user);
  if (continuation) return continuation.path;
  const role = user?.role;
  const isApproved = isActivated(user);
  const isPendingReview = isAwaitingApproval(user);

  if (user?.accountType === "instructor") {
    return user?.instructorStatus === "suspended" ? "/pending" : "/teacher-dashboard";
  }

  if (role === "teacher") {
    return isApproved || isPendingReview
      ? "/teacher-dashboard"
      : "/pending";
  }

  if (role === "student") {
    return isApproved || isPendingReview
      ? "/student-dashboard"
      : "/register/success";
  }

  if (role === "parent") {
    return "/parent-dashboard";
  }

  if (isAdminRole(role)) {
    return "/admin-dashboard";
  }

  return fallback;
};

// ⚠️ alias عشان Navbar.jsx بيعمل import للاسم ده — لو حابة توحدي الاسم في كل الملفات
// بدل الـ alias، الاختيار التاني هو تعدّلي الـ import في Navbar.jsx لـ getDashboardPathByRole
export const getDashboardPath = getDashboardPathByRole;
