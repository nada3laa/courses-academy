import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getNotifications } from "../../../services/APIService";

const notificationText = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value.ar || value.en || "";
};

const NotificationsSection = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [renderedAt] = useState(() => Date.now());

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await getNotifications();
        const data = res.data.data || [];

        setNotifications(data.slice(0, 4));
      } catch (err) {
        console.error("فشل في تحميل الإشعارات:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const formatTime = (dateStr) => {
    const diff = renderedAt - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);

    if (mins < 60) return `منذ ${mins} دقيقة`;
    if (hours < 24) return `منذ ${hours} ساعة`;
    return `منذ ${days} يوم`;
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
          onClick={() => navigate("/parent/notifications")}
          className="text-sm sm:text-[16px] text-[#123C91] font-medium hover:underline shrink-0"
        >
          عرض الكل
        </button>
      </div>

      <div className="flex-1 space-y-3 sm:space-y-4">
        {loading ? (
          <div className="flex-1 flex items-center justify-center py-8 text-[#8C9198] text-sm">
            جاري التحميل...
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-8 text-center gap-2">
            <div className="p-4 bg-[#EAF4FF] rounded-full">
              <Bell size={28} className="text-[#123C91] opacity-40" />
            </div>
            <p className="text-[#1F2937] font-medium text-[15px]">
              لا توجد إشعارات حالياً
            </p>
            <p className="text-[#8C9198] text-[13px]">
              ستظهر هنا الإشعارات الخاصة بأبنائك
            </p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif._id}
              className="w-full min-h-18 flex items-center gap-3 p-3 sm:p-4 border border-[#1F29371A] rounded-lg relative overflow-hidden"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#12C6B0]" />

              <div className="p-2 bg-[#EAF4FF] rounded-lg text-[#12C6B0] shrink-0">
                <Bell size={20} />
              </div>

              <div className="text-right min-w-0 flex-1">
                <p className="font-['IBM_Plex_Sans_Arabic'] font-normal mb-1.5 sm:mb-2 text-[13px] sm:text-[14px] leading-4 text-[#1F2937]">
                  {notificationText(notif.title) || "إشعار جديد"}
                </p>
                <p className="font-['IBM_Plex_Sans_Arabic'] text-[12px] sm:text-[13px] leading-5 text-[#575F69] line-clamp-2">
                  {notificationText(
                    notif.body ||
                      notif.message ||
                      notif.content ||
                      notif.description,
                  ) || "لا توجد تفاصيل إضافية"}
                </p>
                <p className="font-['IBM_Plex_Sans_Arabic'] font-normal text-[11px] sm:text-[12px] leading-4 text-[#8C9198] mt-1">
                  {formatTime(notif.createdAt)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsSection;
