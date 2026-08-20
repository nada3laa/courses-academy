const DASHBOARD_BY_ROLE = {
  student: "/student-dashboard",
  teacher: "/teacher-dashboard",
  parent: "/parent-dashboard",
  admin: "/admin-dashboard",
  "super-admin": "/admin-dashboard",
};

export const getAccountStateData = (response) =>
  response?.data?.data || response?.data || {};

export const getDatabaseUserFromAccountState = (response) => {
  const data = getAccountStateData(response);
  const nestedUser =
    data?.user && typeof data.user === "object" ? data.user : {};

  return {
    ...data,
    ...nestedUser,
    user: nestedUser,
    role: nestedUser.role || data.role,
    registrationStatus:
      nestedUser.registrationStatus ||
      nestedUser.registration_status ||
      data.registrationStatus ||
      data.registration_status,
    isActive: nestedUser.isActive ?? data.isActive,
    // For teachers this is the profile approval status returned beside `user`.
    status: data.status || nestedUser.status,
  };
};

export const isDatabaseAccountActivated = (response) => {
  const profile = getAccountStateData(response);
  const user =
    profile?.user && typeof profile.user === "object" ? profile.user : profile;
  const normalize = (value) =>
    String(value || "")
      .trim()
      .toLowerCase();
  const activeStatuses = ["active", "approved", "accepted"];
  const registrationStatus = normalize(
    user.registrationStatus || user.registration_status,
  );
  const userIsActive =
    user.isActive === true && activeStatuses.includes(registrationStatus);

  if (!userIsActive) return false;
  if ((user.role || profile.role) !== "teacher") return true;

  const teacherStatus = normalize(profile.status || profile.profileStatus);
  return activeStatuses.includes(teacherStatus);
};

export const getDatabaseAccountDashboard = (response) => {
  const user = getDatabaseUserFromAccountState(response);
  return DASHBOARD_BY_ROLE[user.role] || null;
};
