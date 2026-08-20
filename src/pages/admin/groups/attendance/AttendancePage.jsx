import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Search } from "lucide-react";

import AttendanceStatsBar from "../../../../components/admin/groups/attendance/AttendanceStatsBar";
import AttendanceTable from "../../../../components/admin/groups/attendance/AttendanceTable";
import Paginationn from "../../../../components/teacher/groups/students/Paginationn";
import AdminLayout from "../../../../components/admin/layout/AdminLayout";
import {
  getClassroom,
  getClassroomStudents,
  getClassroomSessions,
  getSessionAttendance,
} from "../../../../services/APIService";
import Breadcrumbs from "../../../shared/Breadcrumbs";
import LoadingState from "../../../../components/shared/LoadingState";

const resolveName = (val) =>
  typeof val === "string" ? val : val?.ar || val?.en || "--";

// بعض الـ APIs بترجع student كـ object وبعضها كـ id نص بس — بنغطي الحالتين
const resolveStudentId = (student) =>
  typeof student === "string" ? student : student?.id || student?._id;

// ✅ شكل عنصر getClassroomStudents الحقيقي (مؤكد من الـ Network):
// { user: { fullName, ..., id }, curriculum, stage, grade, id }
// الاسم جوه user.fullName، ومعانا معرّفين مختلفين (student record id + user id)
const resolveStudentName = (student) => {
  if (typeof student !== "object" || !student) return null;
  return (
    student.user?.fullName ||
    student.fullName ||
    student.name ||
    resolveName(student.name) ||
    "طالب"
  );
};

const PAGE_SIZE = 6;

const AttendancePage = () => {
  const { groupId } = useParams();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);

  const [groupName, setGroupName] = useState("");
  const [records, setRecords] = useState([]);
  const [sessionsSummary, setSessionsSummary] = useState({
    total: 0,
    completed: 0,
    scheduled: 0,
    notHeld: 0,
    other: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [classroomResult, studentsResult, sessionsResult] = await Promise.allSettled([
      getClassroom(groupId),
      getClassroomStudents(groupId),
      getClassroomSessions(groupId),
    ]);

    // اسم المجموعة (لو فشل، منعرضش حاجة بدل ما نبين الـ ID)
    if (classroomResult.status === "fulfilled") {
      setGroupName(resolveName(classroomResult.value.data?.data?.name) || "");
    } else {
      console.error("getClassroom failed:", classroomResult.reason);
      setGroupName("");
    }

    if (sessionsResult.status === "rejected") {
      console.error("getClassroomSessions failed:", sessionsResult.reason);
      setError("حدث خطأ أثناء تحميل بيانات الحضور");
      setLoading(false);
      return;
    }

    try {
      const sessions = sessionsResult.value.data?.data || [];
      const now = Date.now();
      const actualSessions = sessions.filter(
        (session) =>
          session.id ||
          session._id ||
          session.sessionId ||
          session.session?.id ||
          session.session?._id,
      );
      const isWaitingToStart = (session) =>
        ["scheduled", "upcoming", "not_started"].includes(session.status);
      const isPast = (session) => {
        const scheduledAt = new Date(session.scheduledDate || session.startAt);
        return !Number.isNaN(scheduledAt.getTime()) && scheduledAt.getTime() < now;
      };
      const completed = sessions.filter(
        (session) => session.status === "completed",
      ).length;
      const notHeld = sessions.filter(
        (session) => isWaitingToStart(session) && isPast(session),
      ).length;
      const scheduled = sessions.filter(
        (session) => isWaitingToStart(session) && !isPast(session),
      ).length;

      setSessionsSummary({
        total: sessions.length,
        completed,
        scheduled,
        notHeld,
        other: Math.max(0, sessions.length - completed - scheduled - notHeld),
      });

      // خريطة أولية بكل طلاب المجموعة (عشان لو طالب معندوش أي سجل حضور يظهر بـ 0/0 مش يتشال)
      const studentMap = new Map();
      if (studentsResult.status === "fulfilled") {
        const students = studentsResult.value.data?.data || [];
        students.forEach((s) => {
          const name = resolveStudentName(s) || "طالب";
          const entry = {
            id: s.id,
            studentName: name,
            attendanceCount: 0,
            absenceCount: 0,
            lateCount: 0,
            excusedCount: 0,
          };
          // بنسجل نفس الطالب تحت المعرفين الاتنين (id بتاع سجل الطالب، وid بتاع المستخدم)
          // عشان أيًا كان اللي هيرجع في سجل الحضور، الربط يظبط
          if (s.id) studentMap.set(s.id, entry);
          if (s.user?.id) studentMap.set(s.user.id, entry);
        });
      } else {
        console.error("getClassroomStudents failed:", studentsResult.reason);
      }

      // نجيب سجل حضور كل حصة على حدة، ونجمّعه لكل طالب
      const attendanceResults = await Promise.allSettled(
        actualSessions.map((s) =>
          getSessionAttendance(
            s.id ||
              s._id ||
              s.sessionId ||
              s.session?.id ||
              s.session?._id,
          ),
        ),
      );

      attendanceResults.forEach((res, index) => {
        if (res.status !== "fulfilled") {
          console.error(
            `getSessionAttendance failed for session ${actualSessions[index]?.id}:`,
            res.reason,
          );
          return;
        }

        const sessionRecords = res.value.data?.data || [];
        sessionRecords.forEach((rec) => {
          const studentId = resolveStudentId(rec.student) || rec.studentId;
          if (!studentId) return;

          if (!studentMap.has(studentId)) {
            studentMap.set(studentId, {
              id: studentId,
              studentName: resolveStudentName(rec.student) || "طالب",
              attendanceCount: 0,
              absenceCount: 0,
              lateCount: 0,
              excusedCount: 0,
            });
          }

          const entry = studentMap.get(studentId);
          if (rec.status === "present") entry.attendanceCount += 1;
          else if (rec.status === "absent") entry.absenceCount += 1;
          else if (rec.status === "late") {
            entry.attendanceCount += 1;
            entry.lateCount += 1;
          }
          else if (rec.status === "excused") {
            entry.absenceCount += 1;
            entry.excusedCount += 1;
          }
        });
      });

      // studentMap ممكن يبقى فيه نفس الـ object متكرر تحت معرفين مختلفين
      // (student id + user id)، فبنشيل التكرار بالاعتماد على مرجع الـ object نفسه
      setRecords(Array.from(new Set(studentMap.values())));
    } catch (err) {
      console.error(err);
      setError("حدث خطأ أثناء تحميل بيانات الحضور");
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    const timer = window.setTimeout(fetchData, 0);
    return () => window.clearTimeout(timer);
  }, [fetchData]);

  const filtered = records.filter((r) => r.studentName.includes(search));

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginatedRecords = filtered.slice((page - 1) * pageSize, page * pageSize);

  const stats = {
    absences: records.reduce((sum, r) => sum + r.absenceCount, 0),
    attendances: records.reduce((sum, r) => sum + r.attendanceCount, 0),
    late: records.reduce((sum, r) => sum + r.lateCount, 0),
    excused: records.reduce((sum, r) => sum + r.excusedCount, 0),
    students: records.length,
    sessions: sessionsSummary.total,
    completedSessions: sessionsSummary.completed,
    scheduledSessions: sessionsSummary.scheduled,
    notHeldSessions: sessionsSummary.notHeld,
    otherSessions: sessionsSummary.other,
  };

  return (
    <AdminLayout>
      <Breadcrumbs homeTo="/admin-dashboard" />
      <div className="w-full p-2 font-['IBM_Plex_Sans_Arabic'] text-right" dir="rtl">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-xl sm:text-[24px] font-semibold leading-8 text-[#123C91] mb-2 sm:mb-3">سجل الحضور</h3>
          <p className="text-sm sm:text-[16px] font-normal leading-6 text-[#575F69]">
            تابع حضور وغياب الطلاب{groupName ? ` لمجموعة "${groupName}"` : ""}.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-6">
          <AttendanceStatsBar {...stats} />
        </div>

        {/* Search */}
        <div className="relative w-full mb-4" style={{ height: "48px" }}>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="بحث باسم الطالب..."
            className="w-full h-full pr-10 pl-4 py-3 bg-[#F9FAFA] border border-[#E5E5E5] rounded-lg text-sm outline-none focus:border-[#123C91] transition-colors"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={18} />
        </div>

        {/* Table */}
        {/* Pagination */}
        <Paginationn
          page={page}
          totalPages={totalPages}
          onChange={setPage}
          totalItems={filtered.length}
          displayedCount={paginatedRecords.length}
          unitLabel="طالب"
          pageSize={pageSize}
          onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        />

        {loading ? (
          <LoadingState
            label="جاري تحميل الحضور..."
            className="rounded-2xl border border-gray-200 bg-white shadow-sm"
          />
        ) : error ? (
          <div className="w-full bg-white rounded-2xl border border-gray-200 shadow-sm py-12 text-center text-sm text-red-500">
            {error}
          </div>
        ) : (
          <AttendanceTable records={paginatedRecords} />
        )}

      </div>
    </AdminLayout>
  );
};

export default AttendancePage;
