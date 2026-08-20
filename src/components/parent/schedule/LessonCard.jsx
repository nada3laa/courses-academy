import React from "react";
import { Clock, BookOpen, Video } from "lucide-react";

const STATUS_STYLES = {
  completed: { label: "مكتمل", className: "bg-blue-100 text-[#123C91]" },
  live: { label: "جارٍ الآن", className: "bg-[#00A63E26] text-[#00A63E]" },
  upcoming: { label: "قادم", className: "bg-[#EAF4FF] text-[#123C91]" },
};

const LessonCard = ({
  title,
  teacherName,
  duration,
  time,
  status,
  studentName,
  meetingLink,
}) => {
  const statusInfo = STATUS_STYLES[status] || STATUS_STYLES.upcoming;

  return (
    <div
      dir="rtl"
      className="
        bg-white
        border
        border-[#E5E5E5]
        rounded-2xl
        shadow-sm
        hover:shadow-md
        transition-all
        duration-300
        border-r-4
        border-r-[#123C91]
        p-4
        w-full
        min-h-40
      "
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <h3
          className="
            text-[#1F2937]
            font-semibold
            text-[15px]
            sm:text-[16px]
            leading-6
            flex-1
          "
          style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
        >
          {title}
        </h3>

        <span
          className={`
            px-3 py-1
            rounded-lg
            text-[12px]
            font-medium
            whitespace-nowrap
            ${statusInfo.className}
          `}
        >
          {statusInfo.label}
        </span>
      </div>

      {/* Teacher */}
      <div
        className="
          flex
          items-center
          text-[#6B7280]
          text-[13px]
          mb-4
        "
        style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
      >
        <BookOpen size={16} className="ml-2 shrink-0" />
        <span>{teacherName}</span>
      </div>

      <div className="border-t border-[#F1F1F1] mb-4" />

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 text-[#8C9198] text-[13px] sm:text-[14px]">
          <Clock size={16} className="text-[#12C6B0]" />
          <span>{time}</span>
          <span>•</span>
          <span>{duration} د</span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className="
              bg-[#F3F4F6]
              text-[#1F2937]
              text-[12px]
              px-3
              py-1
              rounded-lg
              font-medium
              whitespace-nowrap
            "
          >
            {studentName}
          </span>

          {meetingLink && status !== "completed" && (
            <a
              href={meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[12px] px-3 py-1 rounded-lg bg-[#123C91] text-white [&_svg]:text-white font-medium whitespace-nowrap hover:bg-[#0f2f73] transition-colors"
            >
              <Video size={14} />
              انضم
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * LessonsList
 * `lessons` is the already-filtered, already-real array built by the
 * parent (FamilySchedule.jsx) from getMyClassrooms() + getMyStudents().
 * Each item: { id, title, teacherName, duration, time, status,
 * studentName, meetingLink }.
 */
const LessonsList = ({ lessons = [], loading = false, emptyMessage = 'لا توجد حصص في هذا اليوم.' }) => {
  if (loading) {
    return (
      <div className="w-full py-10 text-center text-[#8C9198] text-sm" dir="rtl">
        جاري تحميل الجدول...
      </div>
    );
  }

  if (lessons.length === 0) {
    return (
      <div className="w-full py-10 text-center text-[#8C9198] text-sm" dir="rtl">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="w-full" dir="rtl">
      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-2
          xl:grid-cols-2
          gap-4
        "
      >
        {lessons.map((lesson) => (
          <LessonCard key={lesson.id} {...lesson} />
        ))}
      </div>
    </div>
  );
};

export default LessonsList;
