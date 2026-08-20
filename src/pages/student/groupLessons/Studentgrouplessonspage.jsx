import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import StudentLayout from "../../../components/student/layout/StudentLayout";
import LessonStatsBar from "../../../components/student/groupLesson/Lessonstatsbar";
import LessonFilters from "../../../components/teacher/groups/lessons/LessonFilter";
import LessonsTable from "../../../components/student/groupLesson/Lessonstable";
import Paginationn from "../../../components/teacher/groups/students/Paginationn";
import { getSavedPageSize } from "../../../utils/tablePagination";
import LoadingState from "../../../components/shared/LoadingState";
import {
  getMyClassrooms,
  getClassroomSessions,
  getMySubscriptions,
} from "../../../services/APIService";

const ITEMS_PER_PAGE = 5;

const STATUS_LABELS = {
  upcoming: "مجدولة — لم تبدأ بعد",
  live: "مباشر الآن",
  ended: "منتهية",
  cancelled: "ملغاة",
  missed: "بدأت متأخرة",
  not_started: "لم تُعقد",
  expired_schedule: "لم تُعقد",
};

const resolveName = (val) =>
  typeof val === "string" ? val : val?.ar || val?.en || "--";

const getId = (value) =>
  typeof value === "string" ? value : value?.id || value?._id;

const getSubscriptionJoinDate = (response, classroomId) => {
  const body = response?.data?.data ?? response?.data ?? [];
  const subscriptions = Array.isArray(body)
    ? body
    : Array.isArray(body?.subscriptions)
      ? body.subscriptions
      : body
        ? [body]
        : [];

  const enrollmentDates = subscriptions.flatMap((subscription) => {
    const items =
      subscription.items ?? subscription.subjectSubscriptions ?? [];

    return items
      .filter((item) => getId(item.classroom) === classroomId)
      .map((item) => new Date(item.createdAt || subscription.createdAt))
      .filter((date) => !Number.isNaN(date.getTime()));
  });

  if (!enrollmentDates.length) return null;

  return new Date(
    Math.min(...enrollmentDates.map((date) => date.getTime())),
  );
};

// بيحسب حالة العرض اعتمادًا على status الحقيقي من الباك إند، وعلى التوقيت لو لسه "scheduled"
const computeDisplayStatus = (session) => {
  if (session.status === "completed") return "ended";
  if (session.status === "cancelled") return "cancelled";
  if (["live", "active"].includes(session.status)) return "live";
  if (session.status === "missed") return "missed";

  const start = new Date(session.scheduledDate || session.startAt);
  const now = new Date();

  if (now < start) return "upcoming";
  return "expired_schedule";
};

const StudentGroupLessonsPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("جميع الحالات");
  const [filterTime, setFilterTime] = useState("جميع الاوقات");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(() =>
    getSavedPageSize(ITEMS_PER_PAGE),
  );

  const [groupName, setGroupName] = useState("");
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [classroomsResult, sessionsResult, subscriptionsResult] =
      await Promise.allSettled([
        getMyClassrooms(),
        getClassroomSessions(groupId),
        getMySubscriptions(),
      ]);

    if (classroomsResult.status === "fulfilled") {
      const classrooms = classroomsResult.value.data?.data ?? [];
      const classroomData = classrooms.find((c) => (c.id ?? c._id) === groupId);
      setGroupName(resolveName(classroomData?.name) || "مجموعة");
    } else {
      console.error("getMyClassrooms failed:", classroomsResult.reason);
      setGroupName("مجموعة");
    }

    if (sessionsResult.status === "rejected") {
      console.error("getClassroomSessions failed:", sessionsResult.reason);
      setError("حدث خطأ أثناء تحميل جدول الحصص");
      setLoading(false);
      return;
    }

    try {
      const sessions = sessionsResult.value.data?.data ?? [];
      const joinedAt =
        subscriptionsResult.status === "fulfilled"
          ? getSubscriptionJoinDate(subscriptionsResult.value, groupId)
          : null;

      const mapped = sessions
        .filter((session) => {
          if (!joinedAt) return true;
          const sessionDate = new Date(
            session.scheduledDate || session.startAt,
          );
          return (
            !Number.isNaN(sessionDate.getTime()) && sessionDate >= joinedAt
          );
        })
        .map((s) => {
          const date = new Date(s.scheduledDate || s.startAt);
          const status = computeDisplayStatus(s);
          const isPostponed =
            s.isPostponed === true ||
            s.postponed === true ||
            s.isRescheduled === true ||
            ["manual", "postponed"].includes(
              String(s.scheduleSource || "").toLowerCase(),
            ) ||
            String(s.status || "").toLowerCase() === "postponed" ||
            String(s.title || "").includes("مؤجلة");
          return {
            id:
              s.id ??
              s._id ??
              s.sessionId ??
              s.session?.id ??
              s.session?._id,
            title: s.title || "حصة",
            date: date.toLocaleDateString("ar-EG", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
            time: date.toLocaleTimeString("ar-EG", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }),
            duration: s.duration || 45,
            status: isPostponed ? "مؤجلة" : STATUS_LABELS[status] || status,
            _sortDate: date,
          };
        })
        .sort((a, b) => b._sortDate - a._sortDate);

      setLessons(mapped);
    } catch (err) {
      console.error(err);
      setError("حدث خطأ أثناء تحميل الحصص");
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    const timer = window.setTimeout(fetchData, 0);
    return () => window.clearTimeout(timer);
  }, [fetchData]);

  const filtered = lessons.filter(
    (l) =>
      l.title.includes(search) &&
      (filterStatus === "جميع الحالات" || l.status === filterStatus),
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginatedLessons = filtered.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  const stats = {
    total: lessons.length,
    upcoming: lessons.filter((l) => l.status === "مجدولة — لم تبدأ بعد").length,
    completed: lessons.filter((l) => l.status === "منتهية").length,
    cancelled: lessons.filter((l) => l.status === "ملغاة").length,
  };

  return (
    <StudentLayout>
      <div
        className="w-full p-2 font-['IBM_Plex_Sans_Arabic'] text-right"
        dir="rtl"
      >
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="mb-2 text-xl font-semibold leading-8 text-[#123C91] sm:mb-3 sm:text-[24px]">
              {groupName || "مجموعة"}
            </h3>
            <p className="text-sm font-normal leading-6 text-[#575F69] sm:text-[16px]">
              تابع كل حصصك: الجدول، الواجبات، والتسجيلات في مكان واحد.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              navigate(
                `/student/messages?classroom=${encodeURIComponent(groupId)}&name=${encodeURIComponent(groupName)}`,
                {
                  state: {
                    openClassroomId: groupId,
                    openClassroomName: groupName,
                  },
                }
              )
            }
            className="flex h-12 w-full shrink-0 items-center justify-center gap-2 rounded-lg border border-[#E5E5E5] bg-white px-4 font-['Tajawal'] text-sm font-medium text-[#123C91] transition-colors hover:bg-[#EAF4FF] sm:w-auto"
          >
            <MessageCircle size={20} />
            محادثة المجموعة
          </button>
        </div>

        <div className="mb-6">
          <LessonStatsBar
            total={stats.total}
            upcoming={stats.upcoming}
            completed={stats.completed}
            cancelled={stats.cancelled}
          />
        </div>

        <div className="bg-white mt-6 border border-[#E5E5E5] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.12)] rounded-2xl p-5 w-full items-center">
          <LessonFilters
            search={search}
            onSearchChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            filterStatus={filterStatus}
            onFilterStatusChange={(v) => {
              setFilterStatus(v);
              setPage(1);
            }}
            filterTime={filterTime}
            onFilterTimeChange={setFilterTime}
          />
        </div>

        <Paginationn
          page={page}
          totalPages={totalPages}
          totalItems={filtered.length}
          displayedCount={paginatedLessons.length}
          onChange={(p) => setPage(p)}
          unitLabel="حصة"
          pageSize={pageSize}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />

        <div className="mt-4">
          {loading ? (
            <LoadingState
              label="جاري تحميل الحصص..."
              className="rounded-2xl border border-gray-200 bg-white shadow-sm"
            />
          ) : error ? (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm py-12 text-center text-sm text-red-500">
              {error}
            </div>
          ) : (
            <LessonsTable
              lessons={paginatedLessons}
              onView={(id) =>
                navigate(`/student/groups/${groupId}/lessons/${id}`)
              }
            />
          )}
        </div>

      </div>
    </StudentLayout>
  );
};

export default StudentGroupLessonsPage;
