import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Play, Square, Loader2, MessageCircle } from "lucide-react";
import TeacherLayout from "../../../components/teacher/layout/TeacherLayout";
import LessonRecordings from "../../../components/teacher/groups/lessons/LessonRecordings";
import LessonAssignments from "../../../components/teacher/groups/lessons/LessonAssignments";
import LessonFiles from "../../../components/teacher/groups/lessons/LessonFiles";
import LiveLessonLink from "../../../components/teacher/groups/lessons/LiveLessonLink";
import LessonStats from "../../../components/teacher/groups/lessons/LessonStats";
import EndSessionDetailsModal from "../../../components/teacher/groups/lessons/EndSessionDetailsModal";
import {
  getClassroom,
  getMyClassrooms,
  getClassroomSessions,
  getClassroomStudents,
  getSessionAttendance,
  getAssignmentsByClassroom,
  getSessionRecording,
  startSession,
  endSession,
  updateClassroomSession,
} from "../../../services/APIService"; // عدّل المسار حسب مكان ملفك
// import Breadcrumbs from "../../shared/Breadcrumbs";

const resolveName = (val) =>
  typeof val === "string" ? val : val?.ar || val?.en || "--";

// بعض الـ APIs بترجع student كـ object كامل، وبعضها بيرجعه id نص بس — بنغطي الحالتين
const resolveStudentId = (student) =>
  typeof student === "string" ? student : student?.id || student?._id;

// شكل عنصر getClassroomStudents: { user: { fullName, ..., id }, curriculum, stage, grade, id }
const resolveStudentNameFromObject = (student) => {
  if (typeof student !== "object" || !student) return null;
  return student.user?.fullName || student.fullName || student.name || resolveName(student.name) || null;
};

const STATUS_LABELS = {
  scheduled: "مجدولة — لم تبدأ بعد",
  upcoming: "مجدولة — لم تبدأ بعد",
  live: "مباشر الآن",
  completed: "منتهية",
  cancelled: "ملغية",
  missed: "بدأت متأخرة",
};

// حالة الحضور بتاعة كل طالب (مش حالة الحصة)
const ATTENDANCE_STATUS_LABELS = {
  present: "حاضر",
  absent: "غائب",
  late: "متأخر",
  excused: "بعذر",
};

// ─── Status Badge (حالة الحصة) ─────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const styles = {
    "مجدولة — لم تبدأ بعد": "bg-[#EAF4FF] text-[#123C91]",
    "مباشر الآن": "bg-[#00A63E26] text-[#00A63E]",
    منتهية: "bg-blue-100 text-[#123C91]",
    ملغية: "bg-[#1F293726] text-[#1F2937]",
    "بدأت متأخرة": "bg-[#FF8A0026] text-[#B45309]",
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

// ─── Attendance Badge (حالة كل طالب) ───────────────────────────────────────────
const AttendanceBadge = ({ status }) => {
  const styles = {
    حاضر: "bg-[#E6F9EE] text-[#00A63E]",
    غائب: "bg-[#FDECEA] text-[#D32F2F]",
    متأخر: "bg-[#FFF6E5] text-[#B45309]",
    بعذر: "bg-[#EAF4FF] text-[#123C91]",
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

// ─── Header الصفحة + زرار تسجيل الحضور ─────────────────────────────────────────
const PageHeader = ({ lesson, onOpenAttendance, onLifecycle, onOpenChat, lifecycleLoading, elapsed }) => (
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

    <div className="flex items-center gap-2 flex-wrap">
      {lesson.rawStatus !== "completed" && (
        <button onClick={onLifecycle} disabled={lifecycleLoading} className={`h-10 px-4 rounded-lg text-white text-sm font-medium flex items-center gap-2 ${lesson.rawStatus === "live" ? "bg-red-600" : "bg-green-600"}`}>
          {lifecycleLoading ? <Loader2 size={16} className="animate-spin" /> : lesson.rawStatus === "live" ? <Square size={15} /> : <Play size={16} />}
          {lesson.rawStatus === "live" ? "إنهاء الحصة" : "بدء الحصة"}
        </button>
      )}
      {lesson.rawStatus === "live" && <span dir="ltr" className="rounded-lg bg-red-50 px-3 py-2 font-mono text-sm text-red-600">{elapsed}</span>}
      {lesson.rawStatus !== "completed" && (
        <button
          onClick={onOpenAttendance}
          className="h-10 px-4 rounded-lg bg-[#123C91] text-white [&_svg]:text-white text-[14px] font-medium hover:bg-[#0f3280] transition-colors"
        >
          تسجيل الحضور
        </button>
      )}
      <button
        type="button"
        onClick={onOpenChat}
        className="h-10 px-4 rounded-lg border border-[#E5E5E5] bg-white text-[#123C91] text-[14px] font-medium flex items-center gap-2 hover:bg-[#EAF4FF] transition-colors"
      >
        <MessageCircle size={18} />
        محادثة المجموعة
      </button>
    </div>
  </div>
);

// ─── جدول تفاصيل الحضور والغياب ────────────────────────────────────────────────
const AttendanceDetailsTable = ({ records = [] }) => {
  if (records.length === 0) {
    return (
      <div
        dir="rtl"
        className="w-full bg-white rounded-2xl border border-gray-200 shadow-sm py-10 text-center text-sm text-[#575F69]"
      >
        لا توجد بيانات حضور مسجلة لهذه الحصة
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className="w-full bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
    >
      <div className="px-5 py-4 border-b border-gray-100">
        <h3
          className="text-[18px] font-semibold text-[#1F2937]"
          style={{ fontFamily: "IBM Plex Sans Arabic, sans-serif" }}
        >
          تفاصيل الحضور والغياب
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-150 text-right">
          <thead>
            <tr style={{ backgroundColor: "#F9FAFA" }}>
              {["الطالب", "الصف", "الحالة", "ملاحظات"].map((h) => (
                <th
                  key={h}
                  className="px-5 py-3 text-[#575F69] text-[13px] font-medium text-right whitespace-nowrap"
                  style={{ fontFamily: "IBM Plex Sans Arabic, sans-serif" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {records.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50/80 transition-colors">
                <td
                  className="px-5 py-3 text-[#1F2937] font-medium"
                  style={{ fontFamily: "Tajawal, sans-serif" }}
                >
                  {r.studentName}
                </td>
                <td
                  className="px-5 py-3 text-[#575F69] whitespace-nowrap"
                  style={{
                    fontFamily: "IBM Plex Sans Arabic, sans-serif",
                    fontSize: "14px",
                  }}
                >
                  {r.gradeName}
                </td>
                <td className="px-5 py-3">
                  <AttendanceBadge status={r.statusLabel} />
                </td>
                <td
                  className="px-5 py-3 text-[#575F69]"
                  style={{
                    fontFamily: "IBM Plex Sans Arabic, sans-serif",
                    fontSize: "14px",
                  }}
                >
                  {r.notes || "--"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const LessonDetailsPage = () => {
  const { groupId, lessonId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [recording, setRecording] = useState(null);
  const [lifecycleLoading, setLifecycleLoading] = useState(false);
  const [endDetailsOpen, setEndDetailsOpen] = useState(false);
  const [endDetailsError, setEndDetailsError] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const loadData = async ({ silent } = {}) => {
    let cancelled = false;
    if (!silent) {
      setLoading(true);
      setError(null);
    }

    // بنجيب الـ classroom والـ sessions الأول عشان نعرف الحصة المطلوبة موجودة
    const [classroomResult, myClassroomsResult, sessionsResult] = await Promise.allSettled([
      getClassroom(groupId),
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

    let classroom =
      classroomResult.status === "fulfilled"
        ? classroomResult.value.data?.data || {}
        : {};
    if (classroomResult.status === "rejected") {
      console.error("getClassroom failed:", classroomResult.reason);
    }
    if (myClassroomsResult.status === "fulfilled") {
      const classrooms = myClassroomsResult.value.data?.data ?? [];
      classroom =
        classrooms.find((c) => (c.id ?? c._id) === groupId) ??
        classroom;
    } else {
      console.error("getMyClassrooms failed:", myClassroomsResult.reason);
    }

    const sessions = sessionsResult.value.data?.data || [];
    // ⚠️ مفيش endpoint مخصص لجلب حصة واحدة بالـ id (زي /sessions/{id})
    // فبنجيب القائمة كاملة ونلاقي فيها الحصة المطلوبة محليًا
    const s = sessions.find((x) => x.id === lessonId);

    if (!s) {
      setError("لم يتم العثور على هذه الحصة");
      setLoading(false);
      return;
    }

    // ─── خريطة أسماء طلاب المجموعة (مصدر موثوق للاسم) ───────────────────────
    // بنستخدمها عشان لو getSessionAttendance رجّع student كـ id نص بس (بدون اسم)
    const studentNameMap = new Map();
    const studentGradeMap = new Map();
    try {
      const studentsRes = await getClassroomStudents(groupId);
      const classroomStudents = studentsRes.data?.data || [];
      classroomStudents.forEach((s) => {
        const name = resolveStudentNameFromObject(s);
        const grade = resolveName(s.grade?.name ?? s.grade);
        if (s.id) { studentNameMap.set(s.id, name); studentGradeMap.set(s.id, grade); }
        if (s.user?.id) { studentNameMap.set(s.user.id, name); studentGradeMap.set(s.user.id, grade); }
      });
    } catch (err) {
      console.error("getClassroomStudents failed:", err);
    }

    // ─── حضور وغياب الحصة دي — من GET /sessions/:id/attendance ─────────────
    let records = [];
    try {
      const attendanceRes = await getSessionAttendance(lessonId);
      const rawAttendance = attendanceRes.data?.data || [];

      records = rawAttendance.map((a) => {
        const studentId = resolveStudentId(a.student);
        const nameFromObject = resolveStudentNameFromObject(a.student);
        const studentName = nameFromObject || studentNameMap.get(studentId) || "طالب";
        const gradeName = resolveName(a.student?.grade?.name) || studentGradeMap.get(studentId) || "--";
        return {
          id: a.id,
          studentId,
          studentName,
          gradeName,
          status: a.status,
          statusLabel: ATTENDANCE_STATUS_LABELS[a.status] || a.status || "--",
          notes: a.notes,
        };
      });
    } catch (err) {
      // مش هنوقف الصفحة كلها لو الحضور فشل، بس هنسيب القوائم فاضية
      console.error("getSessionAttendance failed:", err);
    }

    const presentRecords = records.filter((r) => r.status === "present" || r.status === "late");
    const absentRecords = records.filter((r) => r.status === "absent" || r.status === "excused");
    const presentCount = presentRecords.length;
    const absentCount = absentRecords.length;

    // قوايم الأسماء اللي هتتبعت للـ LessonStats عشان الموديال يعرضها
    const attendanceList = presentRecords.map((r) => ({ id: r.studentId ?? r.id, name: r.studentName }));
    const absenceList = absentRecords.map((r) => ({ id: r.studentId ?? r.id, name: r.studentName }));

    const [assignmentsResult, recordingResult] = await Promise.allSettled([
      getAssignmentsByClassroom(groupId),
      getSessionRecording(lessonId),
    ]);
    if (assignmentsResult.status === "fulfilled") {
      const allAssignments = assignmentsResult.value.data?.data || [];
      setAssignments(allAssignments.filter((assignment) => {
        const sessionId = assignment.session?.id || assignment.session?._id || assignment.session;
        return sessionId === lessonId;
      }));
    } else setAssignments([]);
    setRecording(recordingResult.status === "fulfilled" ? recordingResult.value.data?.data || null : null);

    setAttendanceRecords(records);
    const displayStatus =
      s.status === "scheduled" &&
      s.scheduledDate &&
      new Date(s.scheduledDate) < new Date()
        ? "not_started"
        : s.status;
    setLesson({
      id: s.id,
      title: s.title || "حصة",
      groupName: resolveName(classroom.name) || "مجموعة",
      date: s.scheduledDate
        ? new Date(s.scheduledDate).toLocaleDateString("ar-EG", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "--",
      time: s.scheduledDate
          ? new Date(s.scheduledDate).toLocaleTimeString("ar-EG", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
        : "--",
      duration:
        typeof s.duration === "number"
          ? `${s.duration} دقيقة`
          : (s.duration ?? "--"),
      status:
        s.status === "missed"
          ? "بدأت متأخرة"
          : displayStatus === "not_started"
            ? "لم تُعقد"
            : ["scheduled", "upcoming"].includes(s.status)
              ? "مجدولة — لم تبدأ بعد"
              : STATUS_LABELS[s.status] || s.status || "--",
      displayStatus,
      // إجمالي الطلاب = عدد سجلات الحضور (كل طالب مسجل في الحصة)، أو عدد طلاب المجموعة لو مفيش سجلات
      totalStudents: records.length || classroom.students?.length || 0,
      attendance: presentCount,
      absence: absentCount,
      attendanceList,
      absenceList,
      lessonUrl: classroom.meetingLink || "",
      rawStatus: s.status,
      startedAt: s.startedAt || s.startAt,
      description: s.description || "",
      attachments: s.attachments || [],
    });
    setLoading(false);

    return () => {
      cancelled = true;
    };
  };

  useEffect(() => {
    let cleanup;
    (async () => {
      cleanup = await loadData();
    })();
    return () => {
      if (cleanup) cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId, lessonId]);

  useEffect(() => {
    if (lesson?.rawStatus !== "live") return undefined;
    const startedAt = lesson.startedAt ? new Date(lesson.startedAt).getTime() : Date.now();
    const tick = () => setElapsedSeconds(Math.max(0, Math.floor((Date.now() - startedAt) / 1000)));
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [lesson?.rawStatus, lesson?.startedAt]);

  const elapsed = [Math.floor(elapsedSeconds / 3600), Math.floor((elapsedSeconds % 3600) / 60), elapsedSeconds % 60]
    .map((part) => String(part).padStart(2, "0")).join(":");

  const handleLifecycle = async () => {
    if (lesson.rawStatus === "live") {
      setEndDetailsError(null);
      setEndDetailsOpen(true);
      return;
    }

    setLifecycleLoading(true);
    try {
      const response = await startSession(lessonId);
      const updated = response.data?.data || {};
      setLesson((current) => ({
        ...current,
        rawStatus: updated.status || "live",
        displayStatus: updated.status || "live",
        status: STATUS_LABELS[updated.status || "live"],
        startedAt: updated.startedAt || updated.startAt || current.startedAt || new Date().toISOString(),
      }));
    } catch (err) {
      setError(err.response?.data?.message || "تعذر تحديث حالة الحصة");
    } finally {
      setLifecycleLoading(false);
    }
  };

  const closeEndDetails = () => {
    if (lifecycleLoading) return;
    setEndDetailsOpen(false);
    setEndDetailsError(null);
  };

  const handleConfirmEnd = async ({ title, description, files }) => {
    setLifecycleLoading(true);
    setEndDetailsError(null);
    try {
      const payload = new FormData();
      payload.append("title", title);
      payload.append("description", description || "");
      files.forEach((file) => payload.append("attachments", file));

      const updateResponse = await updateClassroomSession(lessonId, payload);
      const endResponse = await endSession(lessonId);
      const updatedDetails = updateResponse.data?.data || {};
      const ended = endResponse.data?.data || {};
      const nextStatus = ended.status || "completed";

      setLesson((current) => ({
        ...current,
        title: updatedDetails.title || title,
        description: updatedDetails.description ?? description,
        attachments: updatedDetails.attachments || current.attachments,
        rawStatus: nextStatus,
        displayStatus: nextStatus,
        status: STATUS_LABELS[nextStatus] || nextStatus,
      }));
      setEndDetailsOpen(false);
    } catch (err) {
      console.error("endSession details failed:", err.response?.data || err);
      setEndDetailsError(err.response?.data?.message || "تعذر حفظ تفاصيل الحصة وإنهاؤها");
    } finally {
      setLifecycleLoading(false);
    }
  };

  if (loading) {
    return (
      <TeacherLayout>
        {/* <Breadcrumbs homeTo="/teacher-dashboard" /> */}
        <div className="text-center py-16 text-[#575F69]">جاري التحميل...</div>
      </TeacherLayout>
    );
  }

  if (error || !lesson) {
    return (
      <TeacherLayout>
        {/* <Breadcrumbs homeTo="/teacher-dashboard" /> */}
        <div className="text-center py-16 text-red-500">
          {error || "لم يتم العثور على الحصة"}
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout
      breadcrumbLabels={{ lessonId: lesson.title }}
      breadcrumbCurrentLabel={lesson.title}
    >
      {/* <Breadcrumbs homeTo="/teacher-dashboard" /> */}
      <div
        className="w-full p-1 font-['IBM_Plex_Sans_Arabic'] text-right"
        dir="rtl"
      >
        <div className="mx-auto space-y-5">
          <PageHeader
            lesson={lesson}
            onOpenAttendance={() =>
              navigate(`/teacher/groups/${groupId}/lessons/${lessonId}/attendance`)
            }
            onOpenChat={() =>
              navigate("/teacher/messages", {
                state: {
                  openClassroomId: groupId,
                  openClassroomName: lesson.groupName,
                },
              })
            }
            onLifecycle={handleLifecycle}
            lifecycleLoading={lifecycleLoading}
            elapsed={elapsed}
          />

          <LessonStats
            totalStudents={lesson.totalStudents}
            attendance={lesson.attendance}
            absence={lesson.absence}
            attendanceList={lesson.attendanceList}
            absenceList={lesson.absenceList}
          />

          <LiveLessonLink
            lessonUrl={lesson.lessonUrl}
            status={lesson.displayStatus}
          />

          <AttendanceDetailsTable records={attendanceRecords} />

          <LessonFiles files={lesson.attachments} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <LessonAssignments assignments={assignments} onAdd={() => navigate(`/assignments/new?classroom=${groupId}&session=${lessonId}`)} />
          </div>
          <LessonRecordings recording={recording} />
        </div>
      </div>
      {endDetailsOpen && (
        <EndSessionDetailsModal
          open
          lesson={lesson}
          loading={lifecycleLoading}
          error={endDetailsError}
          onConfirm={handleConfirmEnd}
          onClose={closeEndDetails}
        />
      )}
    </TeacherLayout>
  );
};

export default LessonDetailsPage;
