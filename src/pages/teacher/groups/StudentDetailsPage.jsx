import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import TeacherLayout from "../../../components/teacher/layout/TeacherLayout";
import StudentStatsCards from "../../../components/teacher/groups/students/StudentStatsCards";
import StudentLessonFilters from "../../../components/teacher/groups/students/StudentLessonFilters";
import StudentLessonsTable from "../../../components/teacher/groups/students/StudentLessonsTable";
import Paginationn from "../../../components/teacher/groups/students/Paginationn";
import {
  getClassroomStudents,
  getClassroomSessions,
  getSessionAttendance,
} from "../../../services/APIService";

const PAGE_SIZE = 5;

const resolveName = (val) =>
  typeof val === "string" ? val : val?.ar || val?.en || "--";

// حالة حضور الطالب في الحصة → التسمية المعروضة في الجدول
const ATTENDANCE_STATUS_LABELS = {
  present: "حاضر",
  absent: "غائب",
  late: "متأخر",
  excused: "بعذر",
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const StudentDetailsPage = () => {
  const { groupId, studentId } = useParams();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("جميع الحالات");
  const [sortBy, setSortBy] = useState("تاريخ الإنضمام");
  const [page, setPage] = useState(1);

  const [student, setStudent] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // GET /classrooms/:groupId/students/ -> data: [Student entity]
      const studentsRes = await getClassroomStudents(groupId);
      const rawStudents = studentsRes.data?.data || [];
      const entry = rawStudents.find(
        (s) => s.id === studentId || s.user?.id === studentId,
      );

      if (!entry) {
        setError("لم يتم العثور على بيانات الطالب");
        setStudent(null);
        setLessons([]);
        return;
      }

      setStudent({
        id: entry.id,
        name: entry.user?.fullName || "—",
        level:
          resolveName(entry.grade?.name) ||
          resolveName(entry.stage?.name) ||
          "--",
        joinDate: entry.createdAt
          ? new Date(entry.createdAt).toLocaleDateString("ar-EG", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : "--",
        averageScore: entry.averageScore ?? "--",
        totalStudySessions: entry.totalStudySessions ?? 0,
      });

      // الحصص: من GET /classrooms/:groupId/sessions/
      const sessionsRes = await getClassroomSessions(groupId);
      const rawSessions = sessionsRes.data?.data || [];

      // ─── حضور الطالب ده تحديدًا في كل حصة — من GET /sessions/:id/attendance ───
      // بنجيب سجل الحضور لكل حصة، وبندور جوّاه على سجل الطالب الحالي بالـ id بتاعه
      const attendanceResults = await Promise.allSettled(
        rawSessions.map((session) => getSessionAttendance(session.id)),
      );

      const mappedLessons = rawSessions.map((session, idx) => {
        let attendanceLabel = "--";

        const attResult = attendanceResults[idx];
        if (attResult.status === "fulfilled") {
          const records = attResult.value.data?.data || [];
          // sub-document الطالب فيه id مختلف عن studentId (اللي هو غالبًا user id)
          // فبنقارن على المستويين: student.id و student.user.id
          const myRecord = records.find(
            (r) =>
              r.student?.id === entry.id || r.student?.user?.id === studentId,
          );
          if (myRecord) {
            attendanceLabel =
              ATTENDANCE_STATUS_LABELS[myRecord.status] ||
              myRecord.status ||
              "--";
          }
        } else {
          console.error(
            `getSessionAttendance failed for session ${session.id}:`,
            attResult.reason,
          );
        }

        return {
          id: session.id || session._id || idx,
          title: session.title || resolveName(session.name) || "--",
          date: session.scheduledDate
            ? new Date(session.scheduledDate).toLocaleDateString("ar-EG", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : "--",
          attendance: attendanceLabel,
          // الواجب والدرجة غير متاحين في استجابة الحصة الحالية.
          homeworkStatus: "--",
          grade: "--",
        };
      });

      setLessons(mappedLessons);
    } catch (err) {
      console.error(err);
      setError("حدث خطأ أثناء تحميل بيانات الطالب");
    } finally {
      setLoading(false);
    }
  }, [groupId, studentId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = lessons.filter(
    (l) =>
      l.title.includes(search) &&
      (filterStatus === "جميع الحالات" || l.attendance === filterStatus),
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginatedLessons = filtered.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  // إحصائيات الحضور/الغياب الحقيقية — محسوبة من نتيجة كل الحصص بعد الربط بالـ attendance
  const attendanceCount = lessons.filter((l) => l.attendance === "حاضر" || l.attendance === "متأخر").length;
  const absenceCount = lessons.filter((l) => l.attendance === "غائب" || l.attendance === "بعذر").length;

  if (loading) {
    return (
      <TeacherLayout>
        <div
          className="w-full p-2 font-['IBM_Plex_Sans_Arabic'] text-right"
          dir="rtl"
        >
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm py-12 text-center text-sm text-[#575F69]">
            جاري التحميل...
          </div>
        </div>
      </TeacherLayout>
    );
  }

  if (error || !student) {
    return (
      <TeacherLayout>
        <div
          className="w-full p-2 font-['IBM_Plex_Sans_Arabic'] text-right"
          dir="rtl"
        >
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm py-12 text-center text-sm text-red-500">
            {error || "حدث خطأ أثناء تحميل بيانات الطالب"}
          </div>
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout>
      <div
        className="w-full p-2 font-['IBM_Plex_Sans_Arabic'] text-right"
        dir="rtl"
      >
        {/* Student header */}
        <div className="mb-6">
          <h3 className="text-[24px] font-semibold leading-8 text-[#123C91] mb-1">
            {student.name}
          </h3>
          <p className="text-[16px] font-normal leading-6 text-[#575F69]">
            {student.level}
          </p>
        </div>

        {/* Stats */}
        {/* ⚠️ TODO: homeworkDone/homeworkTotal لسه مش متوفرين في أي endpoint.
            totalLessons و attendanceCount و absenceCount بقوا حقيقيين دلوقتي. */}
        <div className="mb-6">
          <StudentStatsCards
            student={{
              totalLessons: lessons.length,
              attendanceCount,
              absenceCount,
              homeworkDone: "--",
              homeworkTotal: "--",
            }}
          />
        </div>

        {/* Filters */}
        <div className="bg-white mt-6 border border-[#E5E5E5] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.12)] rounded-2xl p-5 w-full items-center">
          <StudentLessonFilters
            search={search}
            onSearchChange={setSearch}
            filterStatus={filterStatus}
            onFilterStatusChange={setFilterStatus}
            sortBy={sortBy}
            onSortByChange={setSortBy}
          />
        </div>

        {/* Pagination */}
        <Paginationn
          page={page}
          totalPages={totalPages}
          onChange={setPage}
          totalItems={filtered.length}
          displayedCount={paginatedLessons.length}
          unitLabel="حصة"
        />

        {/* Table */}
        <div className="mt-4">
          <StudentLessonsTable lessons={paginatedLessons} />
        </div>

      </div>
    </TeacherLayout>
  );
};

export default StudentDetailsPage;
