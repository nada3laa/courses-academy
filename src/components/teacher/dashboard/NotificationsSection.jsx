import { useEffect, useState, useCallback } from "react";
import { Bell, Loader2, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getNotificationChatState,
  getNotificationTarget,
} from "../../../utils/notificationTarget";
import {
  getNotifications,
  markNotificationRead,
  deleteNotification,
} from "../../../services/APIService"; // ⚠️ عدّل المسار حسب مكان الملف عندك

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

// بيستخرج array الإشعارات من أشكال الريسبونس المختلفة اللي ممكن يرجعها الباك إند
const extractList = (resData) => {
  if (!resData) return [];
  const raw =
    resData?.data?.data || resData?.data || resData?.results || resData || [];
  return Array.isArray(raw) ? raw : [];
};

// الوقت النسبي بالعربي ("منذ 5 دقائق"، "منذ 3 ساعات"، ...)
const timeAgo = (dateValue) => {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";

  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) return "الآن";

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `منذ ${diffMin} دقيقة`;

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `منذ ${diffHour} ساعة`;

  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 30) return `منذ ${diffDay} يوم`;

  const diffMonth = Math.floor(diffDay / 30);
  return `منذ ${diffMonth} شهر`;
};

// بيوحّد شكل الإشعار مهما كان اسم الحقل جاي من الباك إند (title/message/body)
const normalizeNotification = (n) => {
  // Extract the raw title field
  const rawTitle = n.title ?? n.message ?? n.body ?? n.content ?? "إشعار جديد";

  // Check if it's an object and has translation keys
  let displayTitle = rawTitle;
  if (typeof rawTitle === "object" && rawTitle !== null) {
    // Priority: 'ar' (since your UI is RTL), then 'en'
    displayTitle = rawTitle.ar || rawTitle.en || "إشعار جديد";
  }

  return {
    id: n.id ?? n._id,
    title: displayTitle, // Now this is guaranteed to be a string
    time: timeAgo(n.createdAt ?? n.date ?? n.timestamp),
    read: n.read ?? n.isRead ?? false,
    raw: n,
  };
};

/* ------------------------------------------------------------------ */
/* Component                                                            */
/* ------------------------------------------------------------------ */

const NotificationsSection = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getNotifications();
      const list = extractList(res.data).map(normalizeNotification);
      // أحدث 4 إشعارات بس في الكارت (زي التصميم الأصلي)
      setNotifications(list.slice(0, 4));
    } catch (err) {
      setError(err.response?.data?.message || "تعذر تحميل الإشعارات");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleNotificationClick = async (notif) => {
    if (!notif.read) {
      // تحديث فوري في الواجهة (optimistic) ثم تأكيد من السيرفر
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n)),
      );
      try {
        await markNotificationRead(notif.id);
      } catch (err) {
        console.error("فشل تحديث حالة الإشعار:", err);
      }
    }
    const target = getNotificationTarget(notif.raw, "teacher");
    if (target) {
      navigate(target, { state: getNotificationChatState(notif.raw) });
    }
  };

  const handleViewAll = () => {
    // ⚠️ عدّل المسار لصفحة الإشعارات الكاملة الخاصة بالمعلم لو مختلف
    navigate("/teacher/notifications");
  };

  const handleDelete = async (event, notif) => {
    event.stopPropagation();
    try {
      await deleteNotification(notif.id);
      setNotifications((prev) => prev.filter((item) => item.id !== notif.id));
    } catch (err) {
      console.error("فشل حذف الإشعار:", err);
      setError("تعذر حذف الإشعار");
    }
  };

  return (
    <div
      className="bg-white border border-[#1F293726] rounded-2xl p-4 sm:p-6 w-full h-full font-['Tajawal'] flex flex-col"
      dir="rtl"
    >
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <h3 className="text-base sm:text-[18px] font-medium text-[#1F2937]">
          الإشعارات الأخيرة
        </h3>
        <button
          type="button"
          onClick={handleViewAll}
          className="text-sm sm:text-[16px] text-[#123C91] font-medium hover:underline shrink-0"
        >
          عرض الكل
        </button>
      </div>

      <div className="flex-1 space-y-3 sm:space-y-4">
        {loading ? (
          <div className="flex flex-1 items-center justify-center py-10">
            <Loader2 size={22} className="animate-spin text-[#123C91]" />
          </div>
        ) : error ? (
          <p className="text-center text-sm text-red-500 py-10">{error}</p>
        ) : notifications.length === 0 ? (
          <p className="text-center text-sm text-[#8C9198] py-10">
            لا توجد إشعارات حالياً
          </p>
        ) : (
          notifications.map((notif) => (
            <button
              key={notif.id}
              type="button"
              onClick={() => handleNotificationClick(notif)}
              className="w-full min-h-18 flex items-center gap-3 p-3 sm:p-4 border border-[#1F29371A] rounded-lg relative overflow-hidden text-right hover:bg-[#F8FAFC] transition-colors"
            >
              <div
                className={`absolute left-0 top-0 bottom-0 w-1 ${
                  notif.read ? "bg-[#E5E7EB]" : "bg-[#12C6B0]"
                }`}
              />

              <div className="p-2 bg-[#EAF4FF] rounded-lg text-[#12C6B0] shrink-0">
                <Bell size={20} />
              </div>

              <div className="text-right min-w-0 flex-1">
                <p
                  className={`font-['IBM_Plex_Sans_Arabic'] mb-1.5 sm:mb-2 text-[13px] sm:text-[14px] leading-4 ${
                    notif.read
                      ? "font-normal text-[#575F69]"
                      : "font-semibold text-[#1F2937]"
                  }`}
                >
                  {notif.title}
                </p>
                <p className="font-['IBM_Plex_Sans_Arabic'] font-normal text-[11px] sm:text-[12px] leading-4 text-[#8C9198] mt-1">
                  {notif.time}
                </p>
              </div>

              {!notif.read && (
                <span className="h-2 w-2 rounded-full bg-[#12C6B0] shrink-0" />
              )}
              <span
                role="button"
                tabIndex={0}
                aria-label="حذف الإشعار"
                title="حذف الإشعار"
                onClick={(event) => handleDelete(event, notif)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    handleDelete(event, notif);
                  }
                }}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#8C9198] transition-colors hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 size={16} />
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsSection;
