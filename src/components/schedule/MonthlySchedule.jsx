import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Clock,
  Info,
  Video,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  getMonthlySchedule,
  getMySubscriptions,
} from "../../services/APIService";
import LoadingState from "../shared/LoadingState";

// نفس ترتيب DAY_NAMES بالظبط، بيتماشى مع weekdayIndex تحت (السبت = أول عمود)
const WEEKDAY_HEADERS = [
  "السبت",
  "الأحد",
  "الاثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
];

const STATUS_LABELS = {
  scheduled: "لم تبدأ",
  completed: "مكتملة",
  cancelled: "ملغاة",
  live: "تُعقد الآن",
  active: "نشطة",
  missed: "بدأت متأخرة",
  not_started: "لم تبدأ",
  expired_schedule: "لم تبدأ",
  postponed: "مؤجلة",
};

const isPostponedLesson = (lesson) =>
  lesson.isPostponed === true ||
  lesson.postponed === true ||
  lesson.isRescheduled === true ||
  ["manual", "postponed"].includes(
    String(lesson.scheduleSource || "").toLowerCase(),
  ) ||
  String(lesson.status || "").toLowerCase() === "postponed" ||
  String(lesson.title || "").includes("مؤجلة");

const badgeClass = (lesson) => {
  if (isPostponedLesson(lesson)) return "bg-orange-100 text-orange-700";
  if (lesson.status === "completed") return "bg-blue-100 text-[#123C91]";
  if (lesson.status === "missed") return "bg-orange-100 text-orange-700";
  if (["not_started", "expired_schedule"].includes(lesson.status))
    return "bg-blue-50 text-[#123C91]";
  if (lesson.isVirtual || lesson.status === "scheduled")
    return "bg-blue-50 text-[#123C91]";
  if (["live", "active"].includes(lesson.status))
    return "bg-green-100 text-green-700";
  return "bg-gray-100 text-gray-600";
};

const formatTime12 = (time) => {
  if (!time) return "—";
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date(2000, 0, 1, hours, minutes);
  return date.toLocaleTimeString("ar-EG", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const getDurationMinutes = (lesson) => {
  if (lesson.duration) return lesson.duration;
  if (lesson.startTime && lesson.endTime) {
    const [sh, sm] = lesson.startTime.split(":").map(Number);
    const [eh, em] = lesson.endTime.split(":").map(Number);
    const diff = eh * 60 + em - (sh * 60 + sm);
    return diff > 0 ? diff : null;
  }
  return null;
};

const getStudentLabel = (lesson) => {
  if (typeof lesson.student === "string") return lesson.student;
  return (
    lesson.student?.fullName ||
    lesson.student?.name ||
    lesson.classroomName ||
    "—"
  );
};

// شكل عنصر الحصة القادم من getMonthlySchedule مش مؤكد 100% إن فيه حقل "id" دايمًا،
// فبنجرب كل الاحتمالات الشائعة بدل ما نعتمد على lesson.id لوحده (وده كان بيرجع
// undefined ويودي على /sessions/null)
const resolveLessonId = (lesson) =>
  lesson.id ||
  lesson._id ||
  lesson.sessionId ||
  lesson.session?.id ||
  lesson.session?._id ||
  lesson.session;

const resolveClassroomId = (value) =>
  typeof value === "string" ? value : value?.id || value?._id || "";

const buildEnrollmentStarts = (subscriptions) => {
  const starts = new Map();

  subscriptions.forEach((subscription) => {
    (subscription.items || []).forEach((item) => {
      const classroomId = resolveClassroomId(item.classroom);
      const joinedAt = new Date(item.createdAt || subscription.createdAt);
      if (!classroomId || Number.isNaN(joinedAt.getTime())) return;

      const current = starts.get(classroomId);
      if (!current || joinedAt < current) starts.set(classroomId, joinedAt);
    });
  });

  return starts;
};

const filterBeforeEnrollment = (days, enrollmentStarts) =>
  days.map((day) => ({
    ...day,
    lessons: (day.lessons || []).filter((lesson) => {
      const joinedAt = enrollmentStarts.get(
        resolveClassroomId(lesson.classroom),
      );
      if (!joinedAt) return true;
      const scheduledAt = new Date(
        lesson.scheduledDate || `${day.date}T${lesson.startTime || "00:00"}`,
      );
      return Number.isNaN(scheduledAt.getTime()) || scheduledAt >= joinedAt;
    }),
  }));

const withDisplayStatus = (lesson, date) => {
  if (isPostponedLesson(lesson)) {
    return { ...lesson, status: "postponed", isPostponed: true };
  }
  if (lesson.status !== "scheduled") return lesson;
  const scheduledAt = lesson.scheduledDate
    ? new Date(lesson.scheduledDate)
    : new Date(`${date}T${lesson.startTime || "00:00"}`);
  return scheduledAt < new Date()
    ? {
        ...lesson,
        status: "expired_schedule",
      }
    : lesson;
};

const monthLabel = (date) =>
  new Intl.DateTimeFormat("ar-EG", { month: "long", year: "numeric" }).format(
    date,
  );

const pad2 = (n) => String(n).padStart(2, "0");
const toISODate = (d) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

// JS getDay(): 0=Sunday..6=Saturday → نحولها لترتيب يبدأ بالسبت (index 0)
const weekdayIndex = (date) => (date.getDay() - 6 + 7) % 7;

const buildMonthGrid = (viewDate) => {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstOfMonth = new Date(year, month, 1);
  const lastOfMonth = new Date(year, month + 1, 0);
  const leadingCount = weekdayIndex(firstOfMonth);
  const totalCells = Math.ceil((leadingCount + lastOfMonth.getDate()) / 7) * 7;

  const gridStart = new Date(year, month, 1 - leadingCount);

  return Array.from({ length: totalCells }, (_, i) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + i);
    return { date, isCurrentMonth: date.getMonth() === month };
  });
};

const MonthlySchedule = ({ title, subtitle, role, hideHeader = false }) => {
  const navigate = useNavigate();
  const today = useMemo(() => new Date(), []);
  const [monthDate, setMonthDate] = useState(() => new Date());
  const [days, setDays] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const year = monthDate.getFullYear();
  const month = monthDate.getMonth() + 1;

  useEffect(() => {
    let active = true;

    const scheduleRequest = getMonthlySchedule({ year, month });
    const subscriptionsRequest = ["student", "parent"].includes(role)
      ? getMySubscriptions().catch(() => null)
      : Promise.resolve(null);

    Promise.all([scheduleRequest, subscriptionsRequest])
      .then(([response, subscriptionsResponse]) => {
        if (!active) return;
        const list = response.data?.data;
        const rawDays = Array.isArray(list) ? list : [];
        const subscriptions = subscriptionsResponse?.data?.data;
        const nextDays = Array.isArray(subscriptions)
          ? filterBeforeEnrollment(
              rawDays,
              buildEnrollmentStarts(subscriptions),
            )
          : rawDays;
        setDays(nextDays);

        const todayISO = new Date().toLocaleDateString("en-CA");
        const preferred =
          nextDays.find((day) => day.date === todayISO) ||
          nextDays.find((day) => day.lessons?.length) ||
          nextDays[0];
        setSelectedDate(preferred?.date || "");
      })
      .catch((err) => {
        if (active)
          setError(err.response?.data?.message || "تعذر تحميل جدول الحصص");
      })
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [year, month, role]);

  const daysByDate = useMemo(() => {
    const map = new Map();
    days.forEach((d) => map.set(d.date, d));
    return map;
  }, [days]);

  const grid = useMemo(() => buildMonthGrid(monthDate), [monthDate]);

  const selectedDay = useMemo(
    () => daysByDate.get(selectedDate),
    [daysByDate, selectedDate],
  );

  const selectedDayName = useMemo(() => {
    if (!selectedDate) return "";
    const [y, m, d] = selectedDate.split("-").map(Number);
    return WEEKDAY_HEADERS[weekdayIndex(new Date(y, m - 1, d))];
  }, [selectedDate]);

  const changeMonth = (amount) => {
    setLoading(true);
    setError("");
    setMonthDate(
      (current) =>
        new Date(current.getFullYear(), current.getMonth() + amount, 1),
    );
  };

  const openDetails = (lesson) => {
    const classroomId =
      lesson.classroom?.id || lesson.classroom?._id || lesson.classroom;
    const lessonId = resolveLessonId(lesson);
    if (!lessonId) {
      console.error("resolveLessonId failed for lesson:", lesson);
      return;
    }
    if (role === "teacher")
      navigate(`/teacher/groups/${classroomId}/lessons/${lessonId}`);
    if (role === "student")
      navigate(`/student/groups/${classroomId}/lessons/${lessonId}`);
    if (role === "admin")
      navigate(`/admin/classrooms/${classroomId}/sessions/${lessonId}`);
    if (role === "parent")
      navigate(`/parent/classrooms/${classroomId}/sessions/${lessonId}`);
  };

  // الأدمن والمعلم يفتحوا صفحة تفاصيل الحصة في أي وقت. أما الطالب/ولي الأمر
  // فالحصة المباشرة تفتح رابط الاجتماع، والحصة القادمة تعرض تنبيه الموعد.
  const openLessonLink = (lesson) => {
    if (["admin", "teacher"].includes(role)) {
      openDetails(lesson);
      return;
    }

    const isLive = ["live", "active"].includes(lesson.status);
    if (isLive && lesson.meetingLink) {
      window.open(lesson.meetingLink, "_blank", "noopener,noreferrer");
      return;
    }
    if (["scheduled", "postponed"].includes(lesson.status)) {
      toast("لم تبدأ الحصة بعد، يرجى الدخول في الموعد المحدد لها.", {
        icon: "⏰",
      });
      return;
    }
    openDetails(lesson);
  };

  return (
    <div
      className="mx-auto w-full min-w-0 text-right font-['IBM_Plex_Sans_Arabic']"
      dir="rtl"
    >
      {!hideHeader && (
        <>
          <h1 className="mb-2 text-2xl font-semibold text-[#123C91]">
            {title}
          </h1>
          <p className="mb-6 text-[#575F69]">{subtitle}</p>
        </>
      )}

      <section className="w-full min-w-0 rounded-2xl border border-[#E5E5E5] bg-white p-4 shadow-sm sm:p-6 md:p-8">
        {loading ? (
          <LoadingState
            label="جاري تحميل الجدول..."
            className="rounded-xl bg-[#F9FAFA]"
          />
        ) : error ? (
          <p className="py-12 text-center text-red-500">{error}</p>
        ) : (
          <div className="flex flex-col gap-6 xl:flex-row-reverse xl:items-start xl:gap-8">
            <div className="space-y-4 xl:w-[40%]">
              <div className="mb-5 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => changeMonth(-1)}
                  className="rounded-lg border p-2 text-[#123C91] hover:bg-[#F0F4FF] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#123C91] shrink-0"
                  aria-label="الشهر السابق"
                >
                  <ChevronRight size={18} />
                </button>
                <h2 className="text-[15px] sm:text-[16px] font-semibold text-[#1F2937]">
                  {monthLabel(monthDate)}
                </h2>
                <button
                  type="button"
                  onClick={() => changeMonth(1)}
                  className="rounded-lg border p-2 text-[#123C91] hover:bg-[#F0F4FF] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#123C91] shrink-0"
                  aria-label="الشهر التالي"
                >
                  <ChevronLeft size={18} />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-1 sm:px-2">
                {WEEKDAY_HEADERS.map((name) => (
                  <span
                    key={name}
                    className="text-center text-[10px] sm:text-[13px] font-medium text-[#8C9198] py-1 sm:py-2 truncate"
                  >
                    {name}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-6 sm:px-0">
                {grid.map(({ date, isCurrentMonth }) => {
                  const iso = toISODate(date);
                  const dayData = daysByDate.get(iso);
                  const hasEvent = !!dayData?.lessons?.length;
                  const isSelected = iso === selectedDate;
                  const isToday = isSameDay(date, today);

                  return (
                    <button
                      key={iso}
                      type="button"
                      disabled={!isCurrentMonth}
                      onClick={() => isCurrentMonth && setSelectedDate(iso)}
                      className="relative flex items-center justify-center py-1 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#123C91] focus-visible:ring-offset-1 disabled:cursor-default"
                    >
                      <span
                        className={`
                          flex items-center justify-center
                          w-7 h-7 sm:w-10 sm:h-10 md:w-11 md:h-11
                          rounded-full text-[12px] sm:text-[14px] md:text-[15px]
                          transition-colors duration-150
                          ${
                            isSelected
                              ? "bg-[#123C91] text-white [&_svg]:text-white font-semibold shadow-[0_4px_10px_rgba(18,60,145,0.35)]"
                              : isCurrentMonth
                                ? isToday
                                  ? "text-[#123C91] font-semibold border border-[#123C91]/40"
                                  : "text-[#1F2937] hover:bg-[#F0F4FF]"
                                : "text-[#C7CBD1]"
                          }
                        `}
                      >
                        {date.getDate()}
                      </span>
                      {hasEvent && (
                        <span
                          aria-hidden="true"
                          className={`absolute bottom-0 w-1 h-1 rounded-full ${isSelected ? "bg-white" : "bg-[#123C91]"}`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4 xl:w-[55%]">
              <div className="flex items-center justify-between mb-3 px-6">
                <h3 className="text-[15px] font-semibold text-[#1F2937]">
                  {selectedDayName ? `حصص ${selectedDayName}` : "الحصص"}
                </h3>
                <span className="text-[13px] text-[#8C9198]">
                  {selectedDay?.lessons?.length || 0} حصة
                </span>
              </div>

              {!selectedDay?.lessons?.length ? (
                <p className="py-10 text-center text-[#8C9198]">
                  لا توجد حصص في هذا اليوم
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {selectedDay.lessons.map((rawLesson, index) => {
                    const lesson = withDisplayStatus(
                      rawLesson,
                      selectedDay.date,
                    );
                    const duration = getDurationMinutes(lesson);
                    const isLive = ["live", "active"].includes(lesson.status);

                    return (
                      <article
                        key={
                          resolveLessonId(lesson) ||
                          `${lesson.classroom}-${lesson.startTime}-${index}`
                        }
                        role="button"
                        tabIndex={0}
                        onClick={() => openLessonLink(lesson)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            openLessonLink(lesson);
                          }
                        }}
                        className="bg-white border border-[#E5E5E5] rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border-r-4 border-r-[#123C91] p-6 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#123C91]"
                      >
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <h4 className="text-[#1F2937] font-semibold text-[15px] leading-6 flex-1">
                            {lesson.title || lesson.classroomName}
                          </h4>
                          <span
                            className={`px-3 py-1 rounded-lg text-[12px] font-medium whitespace-nowrap ${badgeClass(lesson)}`}
                          >
                            {STATUS_LABELS[lesson.status] || lesson.status}
                          </span>
                        </div>

                        <div className="flex items-center text-[#6B7280] text-[13px] mb-4">
                          <BookOpen size={16} className="ml-2 shrink-0" />
                          <span>
                            {lesson.teacher?.name ||
                              lesson.subject?.name?.ar ||
                              lesson.subject?.name?.en ||
                              "—"}
                          </span>
                        </div>

                        <div className="border-t border-[#F1F1F1] mb-4" />

                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2 text-[#8C9198] text-[13px] sm:text-[14px]">
                            <Clock size={16} className="text-[#12C6B0]" />
                            <span>{formatTime12(lesson.startTime)}</span>
                            {duration && (
                              <>
                                <span>•</span>
                                <span>{duration} د</span>
                              </>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="bg-[#F3F4F6] text-[#1F2937] text-[12px] px-3 py-1 rounded-lg font-medium whitespace-nowrap">
                              {getStudentLabel(lesson)}
                            </span>

                            {isLive && lesson.meetingLink ? (
                              <span
                                aria-hidden="true"
                                className="w-7 h-7 flex items-center justify-center rounded-full bg-[#123C91] text-white [&_svg]:text-white"
                              >
                                <Video size={14} />
                              </span>
                            ) : (
                              <span
                                aria-hidden="true"
                                className="w-7 h-7 flex items-center justify-center rounded-full text-[#8C9198]"
                              >
                                <Info size={15} />
                              </span>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default MonthlySchedule;
