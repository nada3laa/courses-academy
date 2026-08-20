const STORAGE_KEY = "alacademeya_admin_local_notifications";
export const ADMIN_NOTIFICATION_EVENT = "admin-local-notifications-changed";

export const getAdminLocalNotifications = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
};

const save = (notifications) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  window.dispatchEvent(new CustomEvent(ADMIN_NOTIFICATION_EVENT));
};

export const addBlogCreatedNotification = (blog) => {
  const notification = {
    _id: `local-blog-${blog?._id || blog?.id || Date.now()}`,
    key: "BLOG_CREATED",
    type: "system",
    title: "تم إضافة مقال جديد",
    description: blog?.title ? `تم إضافة مقال: ${blog.title}` : "تم إضافة مقال جديد بنجاح",
    body: blog?.title ? `تم إضافة مقال: ${blog.title}` : "تم إضافة مقال جديد بنجاح",
    createdAt: new Date().toISOString(),
    isRead: false,
    _local: true,
  };

  save([notification, ...getAdminLocalNotifications()]);
  return notification;
};

export const markAdminLocalNotificationRead = (id) => {
  save(
    getAdminLocalNotifications().map((notification) =>
      notification._id === id ? { ...notification, isRead: true } : notification
    )
  );
};

export const markAllAdminLocalNotificationsRead = () => {
  save(getAdminLocalNotifications().map((notification) => ({ ...notification, isRead: true })));
};

export const deleteAdminLocalNotification = (id) => {
  save(
    getAdminLocalNotifications().filter(
      (notification) => notification._id !== id,
    ),
  );
};

export const mergeAdminNotifications = (remote = []) =>
  [...getAdminLocalNotifications(), ...remote].sort(
    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  );
