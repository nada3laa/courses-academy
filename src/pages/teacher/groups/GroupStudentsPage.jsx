import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import TeacherLayout from "../../../components/teacher/layout/TeacherLayout";
import StudentStatsBar from "../../../components/teacher/groups/students/StudentStatsBar";
import StudentFilters from "../../../components/teacher/groups/students/StudentFilters";
import StudentsTable from "../../../components/teacher/groups/students/StudentsTable";
import Paginationn from "../../../components/teacher/groups/students/Paginationn";
import {
  getClassroom,
  getClassroomStudents,
  getAllStudents,
} from "../../../services/APIService";
import LoadingState from "../../../components/shared/LoadingState";

const PAGE_SIZE = 6;

const resolveName = (val) =>
  typeof val === "string" ? val : val?.ar || val?.en || "--";

// الحقل الصح لحالة الطالب هو "status" مش "registrationStatus"
// القيم المؤكدة من الـ API: "active" | "removed" | "pending-contact" | "pending-approval"
const mapStatus = (entryStatus) => {
  switch (entryStatus) {
    case "active":
      return "نشط";
    case "removed":
      return "مستبعد";
    case "pending-contact":
    case "pending-approval":
      return "معلق";
    default:
      return entryStatus || "نشط";
  }
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const GroupStudentsPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("جميع الحالات");
  const [page, setPage] = useState(1);

  const location = useLocation();
  const [groupName, setGroupName] = useState(location.state?.groupName || "مجموعة");
  const [groupSubject, setGroupSubject] = useState(location.state?.groupSubjectName || "—");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError(null);

    // ⚠️ GET /classrooms/:id/students/ بيرجع بيانات ناقصة (مفيش createdAt دايمًا، مفيش phone دايمًا).
    // بنجيب GET /students كمان ونعمل merge بالـ user.id لتعويض اللي ينقص.
    // ملحوظة: GET /users/ اتجرب وطلع مش متاح/مش بيترّد لحساب المعلم، فاتشال من هنا.
    const [classroomResult, studentsResult, allStudentsResult] =
      await Promise.allSettled([
        getClassroom(groupId),
        getClassroomStudents(groupId),
        getAllStudents(),
      ]);

    if (classroomResult.status === "fulfilled") {
      const classroom = classroomResult.value.data?.data || {};
      const resolvedName = resolveName(classroom.name);
      setGroupName((prev) => (resolvedName && resolvedName !== "--" ? resolvedName : prev || "مجموعة"));
      const subjectName = resolveName(classroom.subject?.name || classroom.subject);
      if (subjectName && subjectName !== "--") {
        setGroupSubject(subjectName);
      }
    } else {
      // ⚠️ TODO: GET /classrooms/:id بيرجع 404 — تأكد من الراوت الصح في الباك إند
      // مبنمسحش الاسم اللي جاي من location.state (صفحة المجموعات) هنا —
      // بنسيبه زي ما هو، ونرجع لـ "مجموعة" بس لو مفيش اسم حقيقي أصلاً من الأول
      console.warn("Failed to load classroom name:", classroomResult.reason);
      setGroupName((prev) => prev || "مجموعة");
    }

    if (studentsResult.status === "fulfilled") {
      const rawStudents = studentsResult.value.data?.data || [];

      const extraByUserId = new Map();
      if (allStudentsResult.status === "fulfilled") {
        const rawAllStudents = allStudentsResult.value.data?.data || [];
        rawAllStudents.forEach((s) => {
          if (s.user?.id) extraByUserId.set(s.user.id, s);
        });
      } else {
        console.warn(
          "Failed to load full students list:",
          allStudentsResult.reason,
        );
      }

      const mapped = rawStudents.map((entry) => {
        const user = entry.user; // ممكن تكون null لو الطالب لسه معندوش حساب
        const extra = user?.id ? extraByUserId.get(user.id) : null;

        const createdAt = entry.createdAt || extra?.createdAt;
        return {
          id: entry.id,
          name: user?.fullName || "—",
          joinDate: createdAt
            ? new Date(createdAt).toLocaleDateString("ar-EG", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : "--",
          // ⚠️ TODO (Backend): "parent" بييجي كـ ID مجرد (مثال: "6a36c83d95b2505b7eb1deac").
          // مفيش endpoint متاح لحساب المعلم بيرجع اسم ولي الأمر من الـ ID ده.
          // الأفضل إن الباك إند يعمل populate لحقل parent ويرجّع fullName مباشرة
          // في GET /classrooms/:id/students/ بدل ما الفرونت يلف على endpoint تاني.
          parent: "--",
          status: mapStatus(entry.status ?? extra?.status),
          stageName: resolveName(entry.stage?.name),
          gradeName: resolveName(entry.grade?.name),
          username: user?.username || "--",
          averageScore: entry.averageScore ?? extra?.averageScore ?? "--",
          totalStudySessions:
            entry.totalStudySessions ?? extra?.totalStudySessions ?? 0,
        };
      });

      setStudents(mapped);
    } else {
      console.error("Failed to load students:", studentsResult.reason);
      setError("حدث خطأ أثناء تحميل الطلاب");
    }

    setLoading(false);
  }, [groupId]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const filtered = students.filter(
    (s) =>
      s.name.includes(search) &&
      (filterStatus === "جميع الحالات" || s.status === filterStatus),
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginatedStudents = filtered.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  const stats = {
    total: students.length,
    active: students.filter((s) => s.status === "نشط").length,
    excluded: students.filter((s) => s.status === "مستبعد").length,
  };

  return (
    <TeacherLayout>
      <div
        className="w-full p-2 font-['IBM_Plex_Sans_Arabic'] text-right"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
          <div>
            <h3 className="text-[24px] font-semibold leading-8 text-[#123C91] mb-2">
              {groupName}
            </h3>
            {/* <p className="text-sm font-medium leading-6 text-[#123C91] mb-3">
              المادة: {groupSubject || "—"}
            </p> */}
            <p className="text-[16px] font-normal leading-6 text-[#575F69]">
              إدارة طلاب هذه المجموعة: متابعة الحضور، الدرجات، والبيانات
              الشخصية.
            </p>
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-[#E5E5E5] bg-white p-3 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(`/teacher/groups/${groupId}/lessons`, { state: { groupName, groupSubjectName: groupSubject } })}
              className="rounded-2xl px-4 py-2 text-sm font-medium bg-white text-[#123C91] border border-[#E5E5E5] hover:bg-[#F8FAFF]"
            >
              الحصص
            </button>
            <button
              type="button"
              className="rounded-2xl px-4 py-2 text-sm font-medium bg-[#123C91] text-white"
            >
              الطلاب
            </button>
            <button
              type="button"
              onClick={() =>
                navigate(
                  `/teacher/tasks?groupName=${encodeURIComponent(groupName)}&groupId=${encodeURIComponent(groupId)}&groupSubjectName=${encodeURIComponent(groupSubject)}`,
                )
              }
              className="rounded-2xl px-4 py-2 text-sm font-medium bg-white text-[#123C91] border border-[#E5E5E5] hover:bg-[#F8FAFF]"
            >
              الواجبات
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6">
          <StudentStatsBar
            total={stats.total}
            active={stats.active}
            excluded={stats.excluded}
          />
        </div>

        {/* Filters */}
        <div className="bg-white mt-6 border border-[#E5E5E5] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.12)] rounded-2xl p-5 w-full items-center">
          <StudentFilters
            search={search}
            onSearchChange={setSearch}
            filterStatus={filterStatus}
            onFilterStatusChange={setFilterStatus}
          />
        </div>

        {/* Table */}
        {/* Pagination */}
        <Paginationn
          page={page}
          totalPages={totalPages}
          onChange={setPage}
          totalItems={filtered.length}
          displayedCount={paginatedStudents.length}
          unitLabel="طالب"
        />

        <div className="mt-4">
          {loading ? (
            <LoadingState
              label="جاري تحميل الطلاب..."
              className="rounded-2xl border border-gray-200 bg-white shadow-sm"
            />
          ) : error ? (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm py-12 text-center text-sm text-red-500">
              {error}
            </div>
          ) : (
            <StudentsTable
              students={paginatedStudents}
              onView={(id) =>
                navigate(`/teacher/groups/${groupId}/students/${id}`)
              }
            />
          )}
        </div>

      </div>
    </TeacherLayout>
  );
};

export default GroupStudentsPage;