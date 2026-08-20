import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import Paginationn from "../../../components/teacher/groups/students/Paginationn";
import { getSavedPageSize } from "../../../utils/tablePagination";
import AdminLayout from "../../../components/admin/layout/AdminLayout";
import UsersStatsBar from "../../../components/admin/users/Usersstatsbar";
import UsersFilters from "../../../components/admin/users/Usersfilters";
import UsersTable from "../../../components/admin/users/Userstable";
import {
  getUsers,
  deleteUser as deleteUserApi,
  getAllStudents,
  getTeachers,
  updateUser,
} from "../../../services/APIService";
import Breadcrumbs from "../../shared/Breadcrumbs";
import { normalizePhoneSearch } from "../../../utils/phone";
import LoadingState from "../../../components/shared/LoadingState";
import { hasIncompleteRegistration } from "../../../utils/incompleteRegistration";
import { approveRegistrationRequest } from "../../../utils/approveRegistrationRequest";

const PAGE_SIZE = 6;
const FETCH_LIMIT = 100; // حجم كل صفحة وإحنا بنجيب البيانات من السيرفر

// ─── Mapping helpers ──────────────────────────────────────────────────────────
// ⚠️ "مشرف" = admin (صلاحيات محدودة)، "مشرف عام" = super-admin (صلاحيات كاملة)
const ROLE_MAP = {
  student: "طالب",
  teacher: "معلم",
  parent: "ولي أمر",
  admin: "مشرف",
  "super-admin": "مشرف عام",
};

const statusOf = (u) => {
  if (u.isDeleted) return "محذوف";
  if (!u.isActive) return "موقوف";
  if (u.registrationStatus?.startsWith("pending")) return "معلق";
  return "نشط";
};

const localizedProfileName = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value.name?.ar || value.name?.en || value.ar || value.en || "";
};

const profileNames = (values) =>
  (Array.isArray(values) ? values : values ? [values] : [])
    .map(localizedProfileName)
    .filter(Boolean);

const hasValues = (value) =>
  Array.isArray(value) ? value.length > 0 : Boolean(value);

const isTeacherProfileIncomplete = (user, teacher) =>
  !teacher ||
  hasIncompleteRegistration(user) ||
  hasIncompleteRegistration(teacher) ||
  !hasValues(teacher.curriculums ?? teacher.curriculum) ||
  !hasValues(teacher.grades ?? teacher.grade) ||
  !hasValues(teacher.subjects ?? teacher.subject);

const isStudentProfileIncomplete = (user, student) => {
  if (!student || hasIncompleteRegistration(user) || hasIncompleteRegistration(student)) {
    return true;
  }

  const studentType = student.studentType || user.studentType || "school";
  if (studentType !== "school") return false;

  return (
    !student.curriculum ||
    !student.stage ||
    !student.grade ||
    !student.birthDate ||
    !hasValues(student.preferredSubjects)
  );
};

const mapUser = (u) => ({
  id: u.id || u._id,
  name: u.fullName || u.name || "—",
  username: u.username,
  email: u.email,
  phone: u.phone,
  role: ROLE_MAP[u.role] || u.role,
  rawRole: u.role,
  country: u.country,
  isVerified: u.isVerified,
  isDeleted: !!u.isDeleted,
  isActive: !!u.isActive,
  registrationStatus: u.registrationStatus,
  createdAt: u.createdAt,
  lastLoginAt:
    u.lastLoginAt ||
    u.lastLogin ||
    u.lastLoggedInAt ||
    u.lastSeenAt ||
    u.lastActiveAt ||
    u.loginAt ||
    null,
  status: statusOf(u),
  joinDate: u.createdAt
    ? new Date(u.createdAt).toLocaleDateString("en-CA")
    : "—",
});

// ─── يجيب كل اليوزرز من كل الصفحات (بيتعامل مع أي شكل pagination من السيرفر) ──
const fetchAllUsers = async () => {
  let all = [];
  let page = 1;

  while (true) {
    const res = await getUsers({ page, limit: FETCH_LIMIT });
    const body = res.data || {};
    const list = body.data || body.users || (Array.isArray(body) ? body : []);

    all = all.concat(list);

    // نحاول نلاقي معلومات الـ pagination بأي شكل شائع
    const total =
      body.total ?? body.count ?? body.pagination?.total ?? body.meta?.total;
    const totalPages =
      body.totalPages ??
      body.pagination?.totalPages ??
      (total ? Math.ceil(total / FETCH_LIMIT) : null);

    if (totalPages) {
      if (page >= totalPages) break;
    } else {
      // مفيش معلومات pagination واضحة → لو الصفحة رجعت أقل من الـ limit يبقى خلصنا
      if (list.length < FETCH_LIMIT) break;
    }

    page += 1;
    if (page > 100) break; // حماية من infinite loop
  }

  return all;
};

const UsersPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("جميع المستخدمين");
  const [filterStatus, setFilterStatus] = useState("جميع الحالات");
  const [filterGrade, setFilterGrade] = useState("جميع الصفوف");
  const [filterSubject, setFilterSubject] = useState("جميع المواد");
  const [filterCurriculum, setFilterCurriculum] = useState("جميع المناهج");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(() => getSavedPageSize(PAGE_SIZE));
  const [sort, setSort] = useState({
    key: "lastLogin",
    direction: "desc",
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const [list, studentsResponse, teachersResponse] = await Promise.all([
        fetchAllUsers(),
        getAllStudents({ page: 1, limit: FETCH_LIMIT }).catch(() => null),
        getTeachers({ page: 1, limit: FETCH_LIMIT }).catch(() => null),
      ]);
      const studentProfilesData = studentsResponse?.data?.data;
      const studentProfiles = Array.isArray(studentProfilesData)
        ? studentProfilesData
        : [];
      const studentsByUserId = new Map(
        studentProfiles.map((student) => [
          String(
            typeof student.user === "string"
              ? student.user
              : student.user?.id || student.user?._id,
          ),
          student,
        ]),
      );
      const teacherProfilesData = teachersResponse?.data?.data;
      const teacherProfiles = Array.isArray(teacherProfilesData)
        ? teacherProfilesData
        : teacherProfilesData?.teachers || [];
      const teachersByUserId = new Map(
        teacherProfiles.map((teacher) => [
          String(
            typeof teacher.user === "string"
              ? teacher.user
              : teacher.user?.id || teacher.user?._id,
          ),
          teacher,
        ]),
      );
      setUsers(
        Array.isArray(list)
          ? list.map((rawUser) => {
              const mapped = mapUser(rawUser);
              const student = studentsByUserId.get(String(mapped.id));
              const teacher = teachersByUserId.get(String(mapped.id));
              if (teacher) {
                const grades = profileNames(teacher.grades ?? teacher.grade);
                const subjects = profileNames(
                  teacher.subjects ?? teacher.subject,
                );
                const curriculums = profileNames(
                  teacher.curriculums ?? teacher.curriculum,
                );
                return {
                  ...mapped,
                  status: isTeacherProfileIncomplete(rawUser, teacher)
                    ? "ملف غير مكتمل"
                    : mapped.status,
                  profileStatus: teacher.status,
                  teacherGrades: grades,
                  teacherSubjects: subjects,
                  teacherCurriculums: curriculums,
                  gradesLabel: grades.join("، ") || "—",
                  subjectsLabel: subjects.join("، ") || "—",
                  curriculaLabel: curriculums.join("، ") || "—",
                };
              }
              if (mapped.rawRole === "teacher") {
                return {
                  ...mapped,
                  status: "ملف غير مكتمل",
                  teacherGrades: [],
                  teacherSubjects: [],
                  teacherCurriculums: [],
                  gradesLabel: "—",
                  subjectsLabel: "—",
                  curriculaLabel: "—",
                };
              }
              if (mapped.rawRole === "student" && !student) {
                return {
                  ...mapped,
                  status: "ملف غير مكتمل",
                  grade: "—",
                  stage: "—",
                };
              }
              return student
                ? {
                    ...mapped,
                    status: isStudentProfileIncomplete(rawUser, student)
                      ? "ملف غير مكتمل"
                      : mapped.status,
                    studentId: student.id || student._id,
                    profileStatus: student.status,
                    grade:
                      student.grade?.name?.ar ||
                      student.grade?.name?.en ||
                      student.grade?.name ||
                      student.gradeName ||
                      "—",
                    stage:
                      student.stage?.name?.ar ||
                      student.stage?.name?.en ||
                      student.stage?.name ||
                      student.stageName ||
                      "—",
                  }
                : mapped;
            })
          : [],
      );
    } catch (err) {
      console.error(err);
      toast.error("تعذر تحميل المستخدمين");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // استبعد أي مستخدم متعمله soft-delete من الجدول والإحصائيات
  const visibleUsers = users.filter((user) => !user.isDeleted);
  const gradeOptions = [
    ...new Set(
      visibleUsers
        .filter(
          (user) => user.role === "طالب" && user.grade && user.grade !== "—",
        )
        .map((user) => user.grade),
    ),
  ].sort((a, b) => a.localeCompare(b, "ar"));
  const teacherGradeOptions = [
    ...new Set(
      visibleUsers
        .filter((user) => user.role === "معلم")
        .flatMap((user) => user.teacherGrades || []),
    ),
  ].sort((a, b) => a.localeCompare(b, "ar"));
  const teacherSubjectOptions = [
    ...new Set(
      visibleUsers
        .filter((user) => user.role === "معلم")
        .flatMap((user) => user.teacherSubjects || []),
    ),
  ].sort((a, b) => a.localeCompare(b, "ar"));
  const teacherCurriculumOptions = [
    ...new Set(
      visibleUsers
        .filter((user) => user.role === "معلم")
        .flatMap((user) => user.teacherCurriculums || []),
    ),
  ].sort((a, b) => a.localeCompare(b, "ar"));

  const normalizedSearch = search.trim().toLowerCase();
  const normalizedPhoneSearch = normalizePhoneSearch(search);
  const filtered = visibleUsers.filter(
    (u) =>
      (String(u.name || "").toLowerCase().includes(normalizedSearch) ||
        String(u.email || "").toLowerCase().includes(normalizedSearch) ||
        (normalizedPhoneSearch &&
          normalizePhoneSearch(u.phone).includes(normalizedPhoneSearch))) &&
      (filterRole === "جميع المستخدمين" || u.role === filterRole) &&
      (filterStatus === "جميع الحالات" || u.status === filterStatus) &&
      (filterRole !== "طالب" ||
        filterGrade === "جميع الصفوف" ||
        u.grade === filterGrade) &&
      (filterRole !== "معلم" ||
        ((filterGrade === "جميع الصفوف" ||
          u.teacherGrades?.includes(filterGrade)) &&
          (filterSubject === "جميع المواد" ||
            u.teacherSubjects?.includes(filterSubject)) &&
          (filterCurriculum === "جميع المناهج" ||
            u.teacherCurriculums?.includes(filterCurriculum)))),
  );

  const sortedUsers = [...filtered].sort((a, b) => {
    let comparison;

    if (["name", "role", "status"].includes(sort.key)) {
      comparison = String(a[sort.key] || "").localeCompare(
        String(b[sort.key] || ""),
        "ar",
        { sensitivity: "base" },
      );
    } else {
      const field = sort.key === "joinDate" ? "createdAt" : "lastLoginAt";
      const aValue = a[field] ? new Date(a[field]).getTime() : 0;
      const bValue = b[field] ? new Date(b[field]).getTime() : 0;
      comparison = aValue - bValue;

      // لو الـ API لا يعيد آخر دخول، يظهر الأحدث تسجيلًا أولًا بدل ترتيب عشوائي.
      if (sort.key === "lastLogin" && comparison === 0) {
        comparison =
          new Date(a.createdAt || 0).getTime() -
          new Date(b.createdAt || 0).getTime();
      }
    }

    return sort.direction === "asc" ? comparison : -comparison;
  });

  const handleSort = (key) => {
    setSort((current) => ({
      key,
      direction:
        current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(sortedUsers.length / pageSize));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const paginatedUsers = sortedUsers.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  // ⚠️ الأرقام دي بتحسب من كل اليوزرز اللي جم من السيرفر (visibleUsers) مش
  // من الصفحة المعروضة بس، وكل رول بياخد عدّاده الصح
  const stats = {
    parents: visibleUsers.filter((u) => u.role === "ولي أمر").length,
    admins: visibleUsers.filter((u) => u.role === "مشرف عام").length,
    supervisors: visibleUsers.filter((u) => u.role === "مشرف").length,
    teachers: visibleUsers.filter((u) => u.role === "معلم").length,
    students: visibleUsers.filter((u) => u.role === "طالب").length,
    total: visibleUsers.length,
  };

  const handleView = (id) => navigate(`/admin/users/${id}`);
  const handleEdit = (id) => navigate(`/admin/users/${id}/edit`);

  const handleToggleStatus = async (user) => {
    const willActivate = user.status === "موقوف" || user.status === "معلق";
    try {
      await updateUser(user.id, { isActive: willActivate });
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id
            ? {
                ...u,
                isActive: willActivate,
                status: statusOf({ ...u, isActive: willActivate }),
              }
            : u,
        ),
      );
      toast.success(willActivate ? "تم تفعيل الحساب" : "تم إيقاف الحساب");
    } catch (err) {
      toast.error(err.response?.data?.message || "تعذر تحديث حالة المستخدم");
    }
  };

  const handleApprove = async (user) => {
    try {
      await approveRegistrationRequest({
        userId: user.id,
        role: user.rawRole,
      });
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id
            ? {
                ...u,
                registrationStatus: "active",
                isActive: true,
                status: statusOf({
                  ...u,
                  registrationStatus: "active",
                  isActive: true,
                }),
              }
            : u,
        ),
      );
      toast.success("تم قبول الطلب وتفعيل الحساب");
    } catch (err) {
      if (err.response?.status === 404) {
        toast.error("هذا المستخدم لم يعد موجودًا، جاري تحديث القائمة");
        fetchUsers(); // إعادة تحميل كامل بدل الحذف المحلي فقط
      } else {
        toast.error(
          err.response?.data?.message || err.message || "تعذر قبول الطلب",
        );
      }
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteUserApi(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast.success("تم حذف المستخدم");
    } catch (err) {
      toast.error(err.response?.data?.message || "تعذر حذف المستخدم");
    }
  };

  return (
    <AdminLayout>
      <Breadcrumbs homeTo="/admin-dashboard" />
      <div
        className="w-full p-2 font-['IBM_Plex_Sans_Arabic'] text-right"
        dir="rtl"
      >
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-xl sm:text-[24px] font-semibold leading-8 text-[#123C91] mb-2 sm:mb-3">
            إدارة المستخدمين
          </h3>
          <p className="text-sm sm:text-[16px] font-normal leading-6 text-[#575F69]">
            إدارة جميع حسابات المنصة.
          </p>
        </div>

        <div className="mb-6">
          <UsersStatsBar {...stats} />
        </div>

        <div className="bg-white mt-6 border border-[#E5E5E5] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.12)] rounded-2xl p-5 w-full items-center">
          <UsersFilters
            search={search}
            onSearchChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            filterRole={filterRole}
            onFilterRoleChange={(v) => {
              setFilterRole(v);
              setFilterGrade("جميع الصفوف");
              setFilterSubject("جميع المواد");
              setFilterCurriculum("جميع المناهج");
              setPage(1);
            }}
            filterStatus={filterStatus}
            onFilterStatusChange={(v) => {
              setFilterStatus(v);
              setPage(1);
            }}
            filterGrade={filterGrade}
            gradeOptions={
              filterRole === "معلم" ? teacherGradeOptions : gradeOptions
            }
            onFilterGradeChange={(v) => {
              setFilterGrade(v);
              setPage(1);
            }}
            filterSubject={filterSubject}
            subjectOptions={teacherSubjectOptions}
            onFilterSubjectChange={(v) => {
              setFilterSubject(v);
              setPage(1);
            }}
            filterCurriculum={filterCurriculum}
            curriculumOptions={teacherCurriculumOptions}
            onFilterCurriculumChange={(v) => {
              setFilterCurriculum(v);
              setPage(1);
            }}
          />
        </div>

        <div className="mt-4">
          {!loading && filtered.length > 0 && (
            <div className="mb-4">
              <Paginationn
                page={page}
                totalPages={totalPages}
                onChange={setPage}
                totalItems={filtered.length}
                displayedCount={paginatedUsers.length}
                unitLabel="مستخدم"
                pageSize={pageSize}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setPage(1);
                }}
              />
            </div>
          )}
          {loading ? (
            <LoadingState
              label="جاري تحميل المستخدمين..."
              className="rounded-2xl border border-gray-200 bg-white shadow-sm"
            />
          ) : (
            <UsersTable
              users={paginatedUsers}
              onView={handleView}
              onEdit={handleEdit}
              onApprove={handleApprove}
              onToggleStatus={handleToggleStatus}
              onDelete={handleDelete}
              sort={sort}
              onSort={handleSort}
              typeFilter={filterRole}
              onTypeFilter={(role) => {
                setFilterRole(role);
                setFilterGrade("جميع الصفوف");
                setFilterSubject("جميع المواد");
                setFilterCurriculum("جميع المناهج");
                setPage(1);
              }}
            />
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default UsersPage;
