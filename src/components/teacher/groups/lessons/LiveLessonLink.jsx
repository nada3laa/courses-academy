import { Share2 } from "lucide-react";
import toast from "react-hot-toast";

const LiveLessonLink = ({ lessonUrl, status }) => {
  const isLive = status === "live";
  const stateText =
    status === "completed"
      ? "الحصة منتهية"
      : status === "missed"
        ? "بدأت الحصة متأخرة"
        : status === "not_started"
          ? "الحصة لم تُعقد"
          : "الحصة مجدولة ولم تبدأ بعد";

  const copyLink = async () => {
    if (!lessonUrl) return;
    await navigator.clipboard.writeText(lessonUrl);
    toast.success("تم نسخ رابط الحصة");
  };

  return (
    <div
      className="w-full rounded-2xl bg-[#1F2937] text-white px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      dir="rtl"
    >
      <div className="flex-1">
        <h3
          className="text-[16px] font-semibold mb-2"
          style={{ fontFamily: "Tajawal, sans-serif" }}
        >
          رابط الحصة المباشرة
        </h3>
        <p
          className="text-[14px] text-gray-400"
          style={{ fontFamily: "IBM Plex Sans Arabic, sans-serif" }}
        >
          {isLive
            ? lessonUrl
              ? "الحصة مباشرة الآن، انضم وتفاعل مع طلابك."
              : "لا يوجد رابط لقاء محفوظ لهذه المجموعة"
            : stateText}
        </p>
      </div>

      {isLive && lessonUrl && (
        <div className="flex items-center gap-2 shrink-0">
          <a
            href={lessonUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-7 py-2.5 rounded-xl !bg-white !text-[#1F2937] text-[16px] font-semibold hover:!bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            style={{ fontFamily: "IBM Plex Sans Arabic, sans-serif" }}
          >
            الانضمام للحصة
          </a>
          <button
            type="button"
            onClick={copyLink}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-all"
            aria-label="مشاركة الرابط"
          >
            <Share2 size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default LiveLessonLink;
