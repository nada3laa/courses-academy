import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, BellRing, GraduationCap, Settings } from "lucide-react";
import NotificationCard from "./NotificationCard";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from "../../../services/APIService";
import {
  getNotificationChatState,
  getNotificationTarget,
} from "../../../utils/notificationTarget";

const tabs = [
  { key: "all", label: "الكل", icon: Bell },
  { key: "unread", label: "غير مقروءة", icon: BellRing },
  { key: "academic", label: "الأكاديمية", icon: GraduationCap },
  { key: "system", label: "النظام والإدارة", icon: Settings },
];

const NotificationsSection = ({ onStatsUpdate }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await getNotifications();
      setNotifications(res.data.data || []);
      onStatsUpdate?.(res.data.data || []);
    } catch (err) {
      setError("فشل في تحميل الإشعارات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleToggleRead = async (notification) => {
    try {
      if (!notification.isRead) {
        await markNotificationRead(notification._id);
      }
      const updated = notifications.map((n) =>
        n._id === notification._id ? { ...n, isRead: !n.isRead } : n,
      );
      setNotifications(updated);
      onStatsUpdate?.(updated);
    } catch {
      setError("فشل في تحديث حالة الإشعار");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      const updated = notifications.map((n) => ({ ...n, isRead: true }));
      setNotifications(updated);
      onStatsUpdate?.(updated);
    } catch {
      setError("فشل في تعليم الكل كمقروء");
    }
  };

  const handleOpen = async (notification) => {
    if (!notification.isRead) await handleToggleRead(notification);
    const target = getNotificationTarget(notification, "parent");
    if (target) {
      navigate(target, { state: getNotificationChatState(notification) });
    }
  };

  const handleDelete = async (notification) => {
    try {
      await deleteNotification(notification._id ?? notification.id);
      const id = notification._id ?? notification.id;
      const updated = notifications.filter(
        (n) => (n._id ?? n.id) !== id,
      );
      setNotifications(updated);
      onStatsUpdate?.(updated);
    } catch {
      setError("فشل في حذف الإشعار");
    }
  };

  const filtered = notifications.filter((n) => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !n.isRead;
    if (activeTab === "academic") return n.type === "academic";
    if (activeTab === "system") return n.type !== "academic";
    return true;
  });

  return (
    <div
      dir="rtl"
      className="w-full bg-white p-4 sm:p-6 rounded-2xl border border-[#E5E5E5]"
    >
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-[16px] font-medium text-[#1F2937]">
          جميع الإشعارات
        </h2>
        {notifications.some((n) => !n.isRead) && (
          <button
            onClick={handleMarkAllRead}
            className="text-[13px] text-[#123C91] hover:underline"
          >
            تعليم الكل كمقروء
          </button>
        )}
      </div>

      <p className="text-[14px] sm:text-[16px] text-[#6B7280] mb-5">
        تصفية وإدارة الإشعارات حسب النوع
      </p>

      <div className="w-full bg-[#EAF4FF] rounded-full p-1 mb-5 grid grid-cols-2 sm:grid-cols-4 gap-1">
        {tabs.map(({ icon: Icon, key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center justify-center gap-1 py-2 px-2 rounded-full text-[12px] sm:text-[14px] font-medium transition-all ${
              activeTab === key
                ? "bg-white text-[#123C91] shadow-sm"
                : "text-[#1F2937]"
            }`}
          >
            <Icon size={15} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-10 text-[#6B7280]">جاري التحميل...</div>
      ) : error ? (
        <div className="text-center py-10 text-red-500">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10 text-[#6B7280]">لا توجد إشعارات</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((n) => (
            <NotificationCard
              key={n._id}
              title={n.title?.ar || n.title}
              description={n.body?.ar || n.body}
              time={new Date(n.createdAt).toLocaleDateString("ar-EG", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
              type={
                n.type === "chat" || n.type === "subscription"
                  ? "system"
                  : "academic"
              }
              isRead={n.isRead}
              onToggleRead={() => handleToggleRead(n)}
              onOpen={getNotificationTarget(n, "parent") ? () => handleOpen(n) : undefined}
              onDelete={() => handleDelete(n)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsSection;
