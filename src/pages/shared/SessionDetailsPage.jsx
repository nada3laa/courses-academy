import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AdminLayout from "../../components/admin/layout/AdminLayout";
import ParentLayout from "../../components/parent/layout/ParentLayout";
import LessonFiles from "../../components/teacher/groups/lessons/LessonFiles";
import LessonAssignments from "../../components/teacher/groups/lessons/LessonAssignments";
import LessonRecordings from "../../components/teacher/groups/lessons/LessonRecordings";
import LessonStats from "../../components/teacher/groups/lessons/LessonStats";
import {
  getAssignmentsByClassroom,
  getClassroom,
  getClassroomSessions,
  getClassroomStudents,
  getSessionAttendance,
  getSessionRecording,
} from "../../services/APIService";
import Breadcrumbs from "./Breadcrumbs";

const nameOf = (value) => typeof value === "string" ? value : value?.ar || value?.en || "المجموعة";

const resolveName = (val) =>
  typeof val === "string" ? val : val?.ar || val?.en || "--";

const idOf = (value) =>
  typeof value === "string"
    ? value
    : value?.id || value?._id || value?.user?.id || value?.user?._id;

const teacherNameOf = (teacher) =>
  typeof teacher === "object" && teacher
    ? teacher.user?.fullName || teacher.fullName || teacher.name || ""
    : "";

// بعض الـ APIs بترجع student كـ object كامل، وبعضها بيرجعه id نص بس — بنغطي الحالتين
const resolveStudentId = (student) =>
  typeof student === "string" ? student : student?.id || student?._id;

// شكل عنصر getClassroomStudents المؤكد: { user: { fullName, ..., id }, curriculum, stage, grade, id }
const resolveStudentNameFromObject = (student) => {
  if (typeof student !== "object" || !student) return null;
  return student.user?.fullName || student.fullName || student.name || resolveName(student.name) || null;
};

const SessionDetailsPage = ({ role }) => {
  const { classroomId, sessionId } = useParams();
  const Layout = role === "admin" ? AdminLayout : ParentLayout;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.allSettled([
      getClassroom(classroomId),
      getClassroomSessions(classroomId),
      getClassroomStudents(classroomId),
      getSessionAttendance(sessionId),
      getAssignmentsByClassroom(classroomId),
      getSessionRecording(sessionId),
    ]).then(([classroomResult, sessionsResult, studentsResult, attendanceResult, assignmentsResult, recordingResult]) => {
      if (!active) return;
      if (sessionsResult.status === "rejected") throw sessionsResult.reason;
      const classroom = classroomResult.status === "fulfilled" ? classroomResult.value.data?.data || {} : {};
      const sessions = sessionsResult.value.data?.data || [];
      const session = sessions.find((item) => (item.id || item._id) === sessionId);
      if (!session) throw new Error("لم يتم العثور على الحصة");

      // خريطة id → اسم طالب، مصدر موثوق لو getSessionAttendance رجّع student كـ id نص بس
      const studentNameMap = new Map();
      let classroomStudentsCount = 0;
      if (studentsResult.status === "fulfilled") {
        const classroomStudents = studentsResult.value.data?.data || [];
        classroomStudentsCount = classroomStudents.length;
        classroomStudents.forEach((s) => {
          const name = resolveStudentNameFromObject(s);
          if (s.id) studentNameMap.set(s.id, name);
          if (s.user?.id) studentNameMap.set(s.user.id, name);
        });
      } else {
        console.error("getClassroomStudents failed:", studentsResult.reason);
      }

      const attendanceRecords = attendanceResult.status === "fulfilled" ? attendanceResult.value.data?.data || [] : [];

      const namedRecords = attendanceRecords.map((record) => {
        const studentId = resolveStudentId(record.student);
        const name = resolveStudentNameFromObject(record.student) || studentNameMap.get(studentId) || "طالب";
        return { id: studentId ?? record.id, name, status: record.status };
      });

      const attendanceList = namedRecords.filter((r) => r.status === "present" || r.status === "late");
      const absenceList = namedRecords.filter((r) => r.status === "absent" || r.status === "excused");

      const attendanceStats = {
        totalStudents: classroomStudentsCount || attendanceRecords.length || 0,
        attendance: attendanceList.length,
        absence: absenceList.length,
        attendanceList,
        absenceList,
      };
      const assignments = assignmentsResult.status === "fulfilled" ? (assignmentsResult.value.data?.data || []).filter((assignment) => {
        const linkedSession = assignment.session?.id || assignment.session?._id || assignment.session;
        return linkedSession === sessionId;
      }) : [];
      setData({ classroom, session, attendanceStats, assignments, recording: recordingResult.status === "fulfilled" ? recordingResult.value.data?.data || null : null });
    }).catch((err) => active && setError(err.response?.data?.message || err.message || "تعذر تحميل تفاصيل الحصة"))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [classroomId, sessionId]);

  return <Layout>
      {role === "admin" && (
        <Breadcrumbs
          homeTo="/admin-dashboard"
          dynamicLabels={{ sessionId: data?.session?.title }}
          currentPageLabel={data?.session?.title || ""}
          linkState={data ? {
            groupName: nameOf(data.classroom?.name),
            groupTeacher: teacherNameOf(data.classroom?.teacher),
            groupTeacherId:
              idOf(data.classroom?.teacher) || data.classroom?.teacherId,
            groupSubjectName: resolveName(data.classroom?.subject?.name || data.classroom?.subject),
            groupSubjectId: idOf(data.classroom?.subject),
            classroomType: data.classroom?.type,
          } : undefined}
        />
      )}
      <div className="mx-auto max-w-7xl space-y-5 p-2" dir="rtl">
    {loading ? <p className="py-16 text-center text-[#575F69]">جاري تحميل تفاصيل الحصة...</p> : error || !data ? <p className="py-16 text-center text-red-500">{error}</p> : <>
      <div className="rounded-2xl border bg-white p-5"><div className="flex items-center justify-between gap-3"><div><h1 className="text-2xl font-semibold text-[#123C91]">{data.session.title}</h1><p className="mt-2 text-base font-bold text-[#575F69]">{nameOf(data.classroom.name)} • {new Date(data.session.scheduledDate).toLocaleString("ar-EG", { hour12: true })}</p></div><span className="rounded-lg bg-blue-100 px-3 py-1 text-sm text-[#123C91]">مكتملة</span></div>{data.session.description && <p className="mt-4 text-sm text-[#575F69]">{data.session.description}</p>}</div>
      {role === "admin" && <LessonStats {...data.attendanceStats} />}
      <LessonFiles files={data.session.attachments || []} />
      <LessonAssignments assignments={data.assignments} />
      <LessonRecordings recording={data.recording} />
    </>}
  </div></Layout>;
};

export default SessionDetailsPage;
