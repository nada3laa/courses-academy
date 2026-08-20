import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import StudentLayout from "../../../components/student/layout/StudentLayout";
import LiveLessonLink from "../../../components/student/groupLesson/Livelessonlink";
import LessonAssignments from "../../../components/teacher/groups/lessons/LessonAssignments";
import LessonRecordings from "../../../components/teacher/groups/lessons/LessonRecordings";
import LessonFiles from "../../../components/teacher/groups/lessons/LessonFiles";
import { MessageCircle } from "lucide-react";
import {
  getMyClassrooms,
  getClassroomSessions,
  getSessionAttendance,
  getAssignmentsByClassroom,
  getSessionRecording,
} from "../../../services/APIService";

const resolveName = (val) =>
  typeof val === "string" ? val : val?.ar || val?.en || "--";

const STATUS_LABELS = {
  upcoming: "مجدولة — لم تبدأ بعد",
  live: "مباشر الآن",
  ended: "منتهية",
  cancelled: "ملغاة",
  missed: "بدأت متأخرة",
  not_started: "لم تُعقد",
  expired_schedule: "لم تُعقد",
};

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

const StatusBadge = ({ status }) => {
  const styles = {
    "مجدولة — لم تبدأ بعد": "bg-[#EAF4FF] text-[#123C91]",
    "مباشر الآن": "bg-[#00A63E26] text-[#00A63E]",
    منتهية: "bg-blue-100 text-[#123C91]",
    ملغاة: "bg-gray-100 text-gray-500",
    "بدأت متأخرة": "bg-orange-100 text-orange-700",
    "لم تُعقد": "bg-red-50 text-red-500",
  };
  return (
    <span
      className={`inline-flex items-center justify-center px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
        styles[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
};

const PageHeader = ({ lesson, onOpenChat }) => (
  <div dir="rtl" className="flex items-center justify-between gap-3 flex-wrap">
    <div className="flex items-center gap-3 min-w-0">
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-[24px] font-semibold leading-8 text-[#123C91] mb-3">
            {lesson.title}
          </h1>
          <StatusBadge status={lesson.status} />
        </div>
        <p className="text-[16px] font-normal leading-6 text-[#575F69]">
          {lesson.groupName} • {lesson.date} • {lesson.time} • {lesson.duration}
        </p>
      </div>
    </div>
    <button
      type="button"
      onClick={onOpenChat}
      className="h-10 px-4 rounded-lg border border-[#E5E5E5] bg-white text-[#123C91] text-[14px] font-medium flex items-center gap-2 hover:bg-[#EAF4FF] transition-colors"
    >
      <MessageCircle size={18} />
      محادثة المجموعة
    </button>
  </div>
);

const StudentLessonDetailsPage = () => {
  const { groupId, lessonId } = useParams();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [recording, setRecording] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      const [classroomsResult, sessionsResult] = await Promise.allSettled([
        getMyClassrooms(),
        getClassroomSessions(groupId),
      ]);

      if (cancelled) return;

      if (sessionsResult.status === "rejected") {
        console.error("getClassroomSessions failed:", sessionsResult.reason);
        setError("حدث خطأ أثناء تحميل بيانات الحصة");
        setLoading(false);
        return;
      }

      let classroomData = {};
      if (classroomsResult.status === "fulfilled") {
        const classrooms = classroomsResult.value.data?.data ?? [];
        classroomData =
          classrooms.find((c) => (c.id ?? c._id) === groupId) ?? {};
      } else {
        console.error("getMyClassrooms failed:", classroomsResult.reason);
      }

      const sessions = sessionsResult.value.data?.data ?? [];
      const session = sessions.find((s) => (s.id ?? s._id) === lessonId);

      if (!session) {
        setError("لم يتم العثور على هذه الحصة");
        setLoading(false);
        return;
      }

      // دلوقتي الـ id حقيقي جاي من الباك إند، فمحاولة جلب الحضور هتشتغل فعليًا
      let presentCount = 0;
      let absentCount = 0;
      let totalRecords = 0;
      try {
        const attendanceRes = await getSessionAttendance(lessonId);
        const records = attendanceRes.data?.data || [];
        totalRecords = records.length;
        presentCount = records.filter((r) => r.status === "present" || r.status === "late").length;
        absentCount = records.filter((r) => r.status === "absent" || r.status === "excused").length;
      } catch (err) {
        console.error("getSessionAttendance failed:", err);
      }

      const [assignmentsResult, recordingResult] = await Promise.allSettled([
        getAssignmentsByClassroom(groupId),
        getSessionRecording(lessonId),
      ]);
      if (assignmentsResult.status === "fulfilled") {
        const list = assignmentsResult.value.data?.data || [];
        setAssignments(list.filter((assignment) => {
          const sessionId = assignment.session?.id || assignment.session?._id || assignment.session;
          return sessionId === lessonId;
        }));
      }
      setRecording(recordingResult.status === "fulfilled" ? recordingResult.value.data?.data || null : null);

      if (cancelled) return;

      const status = computeDisplayStatus(session);
      const startDate = new Date(session.scheduledDate || session.startAt);

      setLesson({
        id: session.id ?? session._id,
        title: session.title || "حصة",
        description: session.description || "",
        groupName: resolveName(classroomData.name) || "مجموعة",
        date: startDate.toLocaleDateString("ar-EG", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        time: startDate.toLocaleTimeString("ar-EG", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
        duration: `${session.duration || 45} دقيقة`,
        status: STATUS_LABELS[status] || status,
        statusKey: status === "ended" ? "completed" : status,
        totalStudents: totalRecords || classroomData.students?.length || 0,
        attendance: presentCount,
        absence: absentCount,
        lessonUrl: session.recording || classroomData.meetingLink || "",
        attachments: session.attachments || [],
      });
      setLoading(false);
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [groupId, lessonId]);

  if (loading) {
    return (
      <StudentLayout>
        <div className="text-center py-16 text-[#575F69]">جاري التحميل...</div>
      </StudentLayout>
    );
  }

  if (error || !lesson) {
    return (
      <StudentLayout>
        <div className="text-center py-16 text-red-500">
          {error || "لم يتم العثور على الحصة"}
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout
      breadcrumbLabels={{ lessonId: lesson.title }}
      breadcrumbCurrentLabel={lesson.title}
    >
      <div
        className="w-full p-1 font-['IBM_Plex_Sans_Arabic'] text-right"
        dir="rtl"
      >
        <div className="mx-auto space-y-5">
          <PageHeader
            lesson={lesson}
            onOpenChat={() =>
              navigate("/student/messages", {
                state: {
                  openClassroomId: groupId,
                  openClassroomName: lesson.groupName,
                },
              })
            }
          />

          <LiveLessonLink
            lessonUrl={lesson.lessonUrl}
            status={lesson.statusKey}
            onJoin={(url) => window.open(url, "_blank")}
          />

          <LessonFiles files={lesson.attachments} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <LessonAssignments assignments={assignments} />
          </div>

          <LessonRecordings recording={recording} />
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentLessonDetailsPage;
