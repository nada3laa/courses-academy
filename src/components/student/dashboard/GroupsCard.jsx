import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, GraduationCap, Loader2, MessageCircle } from "lucide-react";
import {
  getMyClassrooms,
  getClassroomSessions,
} from "../../../services/APIService";

const GroupCard = ({
  name,
  teacher,
  status,
  statusType,
  nextLesson,
  done,
  total,
  onClick,
  onOpenChat,
}) => {
  const isGroup = statusType === "group";

  return (
    <div
      dir="rtl"
      onClick={onClick}
      className="
        bg-white border border-[#E5E7EB] rounded-xl
        p-3.5 sm:p-4
        min-w-0
        flex flex-col
        cursor-pointer hover:border-[#123C91] hover:shadow-md transition-all
      "
    >
      <div className="mb-3">
        <span
          className={`
            inline-block px-2.5 sm:px-3 py-1 rounded-md text-[11px] sm:text-[12px] font-medium
            ${isGroup ? "bg-[#12C6B01A] text-[#12C6B0]" : "bg-[#EAF4FF] text-[#123C91]"}
          `}
        >
          {status}
        </span>
      </div>

      <h4
        className="text-[#1F2937] font-semibold text-[14px] sm:text-[15px] mb-1 truncate"
        style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
        title={name}
      >
        {name}
      </h4>

      <p
        className="text-[#123C91] text-[12.5px] sm:text-[13px] mb-3 truncate"
        style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
      >
        أ/ {teacher}
      </p>

      <div className="border-t border-[#F1F1F1] mb-3" />

      <div className="flex items-center justify-start gap-1.5 text-[#9CA3AF] text-[11.5px] sm:text-[12px] mb-3">
        <Clock size={13} className="shrink-0" />
        <span className="truncate">{nextLesson}</span>
      </div>

      <div className="flex items-center justify-between gap-2 mt-auto">
        <span className="flex items-center gap-1 text-[#6B7280] text-[11.5px] sm:text-[12px] shrink-0">
          <GraduationCap size={14} className="text-[#9CA3AF]" />
          {done}/{total} حصص
        </span>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onOpenChat();
          }}
          aria-label={`فتح محادثة مجموعة ${name}`}
          title="فتح محادثة المجموعة"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5E7EB] text-[#123C91] hover:bg-[#EAF4FF]"
        >
          <MessageCircle size={17} />
        </button>
      </div>
    </div>
  );
};

const getLocalizedName = (val) => {
  if (!val) return "";
  if (typeof val === "string") return val;
  return val.ar ?? val.en ?? "";
};

const getTeacherName = (classroom) =>
  classroom.teacher?.user?.fullName ?? classroom.teacher?.fullName ?? "";

const formatNextLesson = (sessions = []) => {
  const now = new Date();
  const upcoming = sessions
    .filter((s) => s.status !== "completed" && s.status !== "cancelled")
    .filter((s) => new Date(s.scheduledDate || s.startAt) >= now)
    .sort(
      (a, b) =>
        new Date(a.scheduledDate || a.startAt) -
        new Date(b.scheduledDate || b.startAt),
    );

  if (upcoming.length === 0) return "لا توجد حصص قادمة";

  const nextDate = new Date(upcoming[0].scheduledDate || upcoming[0].startAt);
  const diffDays = Math.round(
    (new Date(nextDate).setHours(0, 0, 0, 0) -
      new Date().setHours(0, 0, 0, 0)) /
      86400000,
  );
  const time = nextDate.toLocaleTimeString("ar-EG", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  if (diffDays === 0) return `الحصة القادمة اليوم ${time}`;
  if (diffDays === 1) return `الحصة القادمة غداً ${time}`;
  return `الحصة القادمة بعد ${diffDays} أيام`;
};

const buildGroupCardData = (classroom, sessions = []) => {
  const done = sessions.filter((s) => s.status === "completed").length;
  const total = sessions.filter((s) => s.status !== "cancelled").length;
  const type = classroom.type ?? "group";

  return {
    groupId: classroom.id ?? classroom._id,
    name:
      getLocalizedName(classroom.name) ||
      classroom.subject?.name?.ar ||
      "بدون اسم",
    teacher: getTeacherName(classroom),
    status: type === "group" ? "مجموعة" : "خاصة",
    statusType: type,
    nextLesson: formatNextLesson(sessions),
    done,
    total,
  };
};

const GroupsCard = ({
  title = "مجموعاتك",
  subtitle = "المواد والمجموعات المشترك بها",
  showViewAll = false,
  className = "",
}) => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchGroups = async () => {
      try {
        setLoading(true);
        const { data } = await getMyClassrooms();
        const classrooms = data?.data ?? [];

        const withSessions = await Promise.all(
          classrooms.map(async (classroom) => {
            const id = classroom.id ?? classroom._id;
            try {
              const res = await getClassroomSessions(id);
              const sessions = res.data?.data ?? [];
              return buildGroupCardData(classroom, sessions);
            } catch {
              return buildGroupCardData(classroom, []);
            }
          }),
        );

        if (isMounted) setGroups(withSessions);
      } catch (err) {
        if (isMounted) setError(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchGroups();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div
      dir="rtl"
      className={`bg-white border border-[#E5E7EB] rounded-xl shadow-sm p-4 sm:p-5 h-full ${className}`}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3
            className="text-[#1F2937] font-semibold text-[15px] sm:text-[16px]"
            style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
          >
            {title}
          </h3>
          <p
            className="text-[#9CA3AF] text-[11.5px] sm:text-[12px] mt-1"
            style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
          >
            {subtitle}
          </p>
        </div>

        {showViewAll && (
          <button
            type="button"
            onClick={() => navigate("/student/groups")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] px-3 py-2 text-[12px] font-medium text-[#123C91] hover:border-[#123C91] hover:bg-[#F8FAFF] transition-colors shrink-0"
          >
            عرض الكل
            <ArrowLeft size={14} />
          </button>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 text-[#9CA3AF] gap-2">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-[13px]">جاري التحميل...</span>
        </div>
      )}

      {!loading && error && (
        <div className="text-center py-8 text-[#E54848] text-[13px]">
          حدث خطأ أثناء تحميل المجموعات
        </div>
      )}

      {!loading && !error && groups.length === 0 && (
        <div className="text-center py-8 text-[#9CA3AF] text-[13px]">
          لا توجد مجموعات مشترك بها حالياً
        </div>
      )}

      {!loading && !error && groups.length > 0 && (
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 gap-3">
          {groups.map((g) => (
            <GroupCard
              key={g.groupId}
              {...g}
              onClick={() => navigate(`/student/groups/${g.groupId}/lessons`)}
              onOpenChat={() =>
                navigate("/student/messages", {
                  state: {
                    openClassroomId: g.groupId,
                    openClassroomName: g.name,
                  },
                })
              }
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default GroupsCard;
