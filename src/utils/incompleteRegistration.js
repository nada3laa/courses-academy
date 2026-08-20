const normalizedStatus = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replaceAll("-", "_");

export const hasIncompleteRegistration = (entity) => {
  if (!entity) return false;
  const user = entity.user && typeof entity.user === "object" ? entity.user : {};
  const statuses = [
    entity.registrationStatus,
    entity.registration_status,
    user.registrationStatus,
    user.registration_status,
    entity.profileStatus,
    user.profileStatus,
    entity.status,
    user.status,
  ].map(normalizedStatus);

  return (
    entity.profileCompleted === false ||
    entity.isProfileComplete === false ||
    user.profileCompleted === false ||
    user.isProfileComplete === false ||
    statuses.some((status) =>
      ["incomplete", "profile_incomplete"].includes(status),
    )
  );
};

const idOf = (value) =>
  value?.id || value?._id || (typeof value === "string" ? value : null);

const isJoinNotification = (notification) => {
  const text = [
    notification?.key,
    notification?.type,
    notification?.title?.ar,
    notification?.title,
  ]
    .filter((value) => typeof value === "string")
    .join(" ")
    .toLowerCase();
  return (
    text.includes("new_user") ||
    text.includes("user_registered") ||
    text.includes("مستخدم جديد انضم")
  );
};

export const filterIncompleteJoinNotifications = (notifications, users = []) => {
  const incompleteIds = new Set();
  const incompleteEmails = new Set();
  users.filter(hasIncompleteRegistration).forEach((user) => {
    const id = idOf(user);
    if (id) incompleteIds.add(String(id));
    if (user.email) incompleteEmails.add(String(user.email).toLowerCase());
  });

  return notifications.filter((notification) => {
    if (!isJoinNotification(notification)) return true;
    const sources = [notification, notification.data, notification.metadata];
    if (sources.some(hasIncompleteRegistration)) return false;

    for (const source of sources) {
      if (!source) continue;
      const userId =
        idOf(source.userId) ||
        idOf(source.user) ||
        idOf(source.actorId) ||
        idOf(source.actor);
      const email = source.email || source.user?.email || source.actor?.email;
      if (userId && incompleteIds.has(String(userId))) return false;
      if (email && incompleteEmails.has(String(email).toLowerCase())) return false;
    }
    return true;
  });
};
