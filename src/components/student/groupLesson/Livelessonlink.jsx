import { Share2 } from "lucide-react";

const LiveLessonLink = ({ lessonUrl, status, onJoin, onShare }) => {
  const isLive = status === "live";
  const stateText =
    status === "completed"
      ? "الحصة منتهية"
      : status === "missed"
        ? "بدأت الحصة متأخرة"
        : status === "not_started"
          ? "الحصة فائتة ولم تبدأ بعد"
          : status === "expired_schedule"
            ? "انتهى موعد الحصة ولم يتم إنشاؤها"
          : "سيتم تفعيل الرابط عند بدء المعلم للحصة.";
  return (
    <div
      className="w-full rounded-2xl bg-[#1F2937] text-white px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      dir="rtl"
    >
      <div className="flex-1">
        <h3 className="text-[16px] font-semibold mb-2" style={{ fontFamily: "Tajawal, sans-serif" }}>
          رابط الحصة المباشرة
        </h3>
        <p className="text-[14px] text-gray-400" style={{ fontFamily: "IBM Plex Sans Arabic, sans-serif" }}>
          {isLive ? "الحصة مباشرة الآن، انضم وتفاعل مع معلمك وزملائك." : stateText}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => onJoin?.(lessonUrl)}
          disabled={!isLive}
          className="flex items-center gap-2 px-7 py-2.5 rounded-xl bg-white text-[#1F2937] text-[16px] font-semibold hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          style={{ fontFamily: "IBM Plex Sans Arabic, sans-serif" }}
        >
          {isLive
            ? "الانضمام للحصة"
            : status === "completed"
              ? "منتهية"
              : status === "missed"
                ? "بدأت متأخرة"
                : status === "not_started"
                  ? "لم تُعقد"
                  : status === "expired_schedule"
                    ? "لم تُعقد"
                  : "مجدولة — لم تبدأ بعد"}
        </button>

        <button
          onClick={onShare}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-all"
          aria-label="مشاركة الرابط"
        >
          <Share2 size={18} />
        </button>
      </div>
    </div>
  );
};

export default LiveLessonLink;
