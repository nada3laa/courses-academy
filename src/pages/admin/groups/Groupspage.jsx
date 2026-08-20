import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

import Paginationn from "../../../components/teacher/groups/students/Paginationn";
import AdminLayout from "../../../components/admin/layout/AdminLayout";
import GroupsFilters from "../../../components/admin/groups/Groupsfilters";
import GroupTable from "../../../components/admin/groups/Groupstable";
import GroupsStatsBar from "../../../components/admin/groups/Groupsstatsbar";
import {
  getClassrooms,
  getAllSubjects,
  getAllGrades,
  getStage,
  getUser,
} from "../../../services/APIService"; // عدّل المسار حسب مكان ملفك
import Breadcrumbs from "../../shared/Breadcrumbs";
import LoadingState from "../../../components/shared/LoadingState";

const PAGE_SIZE = 6;

// ⚠️ عدّل القيم دي لو الباك إند بيرجع أسماء status مختلفة
const STATUS_LABELS = {
  active: "نشطة",
  inactive: "متوقفة",
  full: "مكتملة العدد",
  pending: "قيد التسجيل",
  "pending-registration": "قيد التسجيل",
  paused: "متوقفة",
  suspended: "متوقفة",
  completed: "منتهية",
  ended: "منتهية",
};

const idOf = (value) =>
  typeof value === "string" ? value : value?.id || value?._id || null;

const localizedName = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value.name?.ar || value.name?.en || value.ar || value.en || "";
};

const statusLabel = (value) => {
  const normalized = String(value || "").trim().toLowerCase();
  return STATUS_LABELS[normalized] || value || "—";
};

const GroupsPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filterSubject, setFilterSubject] = useState("جميع المواد");
  const [filterStatus, setFilterStatus] = useState("جميع الحالات");
  const [filterStage, setFilterStage] = useState("جميع المراحل");
  const [filterGrade, setFilterGrade] = useState("جميع الصفوف");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // نجيب الـ lookups والـ classrooms مع بعض
      const [classroomsRes, subjectsRes, gradesRes] = await Promise.all([
        getClassrooms({ type: "group" }),
        getAllSubjects(),
        getAllGrades(),
      ]);

      const subjects = subjectsRes.data?.data || [];
      const grades = gradesRes.data?.data || [];
      const rawClassrooms = classroomsRes.data?.data || [];

      const subjectMap = Object.fromEntries(
        subjects.map((subject) => [
          idOf(subject),
          localizedName(subject) || "—",
        ]),
      );
      const gradeMap = Object.fromEntries(
        grades.map((grade) => [
          idOf(grade),
          localizedName(grade) || "—",
        ]),
      );

      // مفيش endpoint بيرجع كل المراحل مرة واحدة (getCurriculumStages بياخد curriculum id)
      // فبنجيب اسم كل مرحلة فريدة (unique) موجودة في المجموعات عن طريق /stages/{id}
      const uniqueStageIds = [
        ...new Set(rawClassrooms.map((classroom) => idOf(classroom.stage)).filter(Boolean)),
      ];

      const stageEntries = await Promise.all(
        uniqueStageIds.map(
          (id) =>
            getStage(id)
              .then((res) => [
                id,
                res.data?.data?.name?.ar || res.data?.data?.name || id,
              ])
              .catch(() => [id, id]), // لو فشل الريكوست، نرجع نعرض الـ id كـ fallback بدل ما نكسر الصفحة
        ),
      );
      const stageMap = Object.fromEntries(stageEntries);

      // نفس الفكرة بالظبط للمعلم: classrooms ممكن ترجع teacher كـ id خام
      // بدل object فيه fullName، فبنجيب اسم كل معلم فريد عن طريق /users/{id}
      const uniqueTeacherIds = [
        ...new Set(
          rawClassrooms.flatMap((c) => {
            const teacherId =
              typeof c.teacher === "string"
                ? c.teacher
                : c.teacher?.id || c.teacher?._id || c.teacher?.user?.id;
            const substituteTeacherId =
              typeof c.substituteTeacher === "string"
                ? c.substituteTeacher
                : c.substituteTeacher?.id ||
                  c.substituteTeacher?._id ||
                  c.substituteTeacher?.user?.id;
            return [teacherId, substituteTeacherId];
          })
            .filter(Boolean),
        ),
      ];

      const teacherEntries = await Promise.all(
        uniqueTeacherIds.map((id) =>
          getUser(id)
            .then((res) => [
              id,
              res.data?.data?.fullName ||
                res.data?.data?.user?.fullName ||
                null,
            ])
            .catch(() => [id, null]),
        ),
      );
      const teacherMap = Object.fromEntries(teacherEntries);

      // اسم المجموعة نفسه ممكن يكون نص عادي أو object {ar, en} زي باقي الحقول
      const resolveName = (val) => {
        if (!val) return "--";
        if (typeof val === "string") return val;
        return val.ar || val.en || "--";
      };

      const mapped = rawClassrooms.map((c) => {
        const subjectId = idOf(c.subject);
        const gradeId = idOf(c.grade);
        const stageId = idOf(c.stage);
        const teacherId =
          typeof c.teacher === "string"
            ? c.teacher
            : c.teacher?.id || c.teacher?._id || c.teacher?.user?.id;
        const substituteTeacherId =
          typeof c.substituteTeacher === "string"
            ? c.substituteTeacher
            : c.substituteTeacher?.id ||
              c.substituteTeacher?._id ||
              c.substituteTeacher?.user?.id;
        return {
          id: c.id,
          name: resolveName(c.name),
          teacherId,
          teacher:
            c.teacher?.user?.fullName ||
            c.teacher?.fullName ||
            teacherMap[teacherId] ||
            null,
          substituteTeacherId,
          substituteTeacher:
            c.substituteTeacher?.user?.fullName ||
            c.substituteTeacher?.fullName ||
            teacherMap[substituteTeacherId] ||
            null,
          // subjectId خام لازم نبعته لما نضيف طالب/اشتراك للمجموعة دي (items array)
          subjectId,
          classroomType: ["private", "group"].includes(c.type) ? c.type : "group",
          // fallback: لو الماده/الصف مش لاقيينها في الـ map، نجرب نجيبها من بيانات المعلم نفسه
          subject:
            subjectMap[subjectId] ||
            (typeof c.subject === "object" ? localizedName(c.subject) : "") ||
            c.teacher?.subjects?.find((s) => idOf(s) === subjectId)?.name?.ar ||
            "--",
          grade:
            gradeMap[gradeId] ||
            (typeof c.grade === "object" ? localizedName(c.grade) : "") ||
            c.teacher?.grades?.find((g) => idOf(g) === gradeId)?.name?.ar ||
            "--",
          stage:
            stageMap[stageId] ||
            (typeof c.stage === "object" ? localizedName(c.stage) : "") ||
            stageId ||
            "--",
          enrolled: c.students?.length || 0,
          capacity: c.capacity,
          status: statusLabel(c.status),
        };
      });

      setGroups(mapped);
    } catch (err) {
      console.error(err);
      setError("حدث خطأ أثناء تحميل المجموعات");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const subjectOptions = [
    "جميع المواد",
    ...new Set(groups.map((group) => group.subject).filter((name) => name && name !== "--")),
  ];
  const statusOptions = [
    "جميع الحالات",
    ...new Set(groups.map((group) => group.status).filter((status) => status && status !== "—")),
  ];
  const stageOptions = [
    "جميع المراحل",
    ...new Set(groups.map((group) => group.stage).filter((stage) => stage && stage !== "--")),
  ];
  const gradeOptions = [
    "جميع الصفوف",
    ...new Set(
      groups
        .filter(
          (group) =>
            filterStage === "جميع المراحل" || group.stage === filterStage,
        )
        .map((group) => group.grade)
        .filter((grade) => grade && grade !== "--"),
    ),
  ];
  const normalizedSearch = search.trim().toLocaleLowerCase("ar");
  const filtered = groups.filter((group) => {
    const matchesSearch =
      !normalizedSearch ||
      [group.name, group.teacher, group.subject].some((value) =>
        String(value || "").toLocaleLowerCase("ar").includes(normalizedSearch),
      );
    const matchesSubject =
      filterSubject === "جميع المواد" || group.subject === filterSubject;
    const matchesStatus =
      filterStatus === "جميع الحالات" || group.status === filterStatus;
    const matchesStage =
      filterStage === "جميع المراحل" || group.stage === filterStage;
    const matchesGrade =
      filterGrade === "جميع الصفوف" || group.grade === filterGrade;

    return (
      matchesSearch &&
      matchesSubject &&
      matchesStatus &&
      matchesStage &&
      matchesGrade
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginatedGroups = filtered.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  const stats = {
    paused: groups.filter((g) => g.status === "متوقفة").length,
    active: groups.filter((g) => g.status === "نشطة").length,
    full: groups.filter((g) => g.status === "مكتملة العدد").length,
    total: groups.length,
  };

  return (
    <AdminLayout>
      <Breadcrumbs homeTo="/admin-dashboard" />
      <div
        className="w-full p-2 font-['IBM_Plex_Sans_Arabic'] text-right"
        dir="rtl"
      >
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
          <div className="order-2 sm:order-1">
            <h3 className="text-xl sm:text-[24px] font-semibold leading-8 text-[#123C91] mb-2 sm:mb-3">
              إدارة المجموعات
            </h3>
            <p className="text-sm sm:text-[16px] font-normal leading-6 text-[#575F69]">
              مراقبة وإدارة المجموعات الدراسية على المنصة.
            </p>
          </div>
          <button
            onClick={() => navigate("/admin/groups/new")}
            className="order-1 sm:order-2 w-full sm:w-auto px-5 h-12 rounded-lg bg-[#123C91] text-white [&_svg]:text-white flex items-center justify-center gap-2 font-['Tajawal'] font-medium text-[16px] shrink-0"
          >
            <Plus size={18} />
            إنشاء مجموعة
          </button>
        </div>

        <div className="mb-6">
          <GroupsStatsBar {...stats} />
        </div>

        <div className="bg-white mt-6 border border-[#E5E5E5] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.12)] rounded-2xl p-5 w-full items-center">
          <GroupsFilters
            search={search}
            onSearchChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            filterSubject={filterSubject}
            subjectOptions={subjectOptions}
            onFilterSubjectChange={(v) => {
              setFilterSubject(v);
              setPage(1);
            }}
            filterStatus={filterStatus}
            statusOptions={statusOptions}
            onFilterStatusChange={(v) => {
              setFilterStatus(v);
              setPage(1);
            }}
            filterStage={filterStage}
            stageOptions={stageOptions}
            onFilterStageChange={(value) => {
              setFilterStage(value);
              setFilterGrade("جميع الصفوف");
              setPage(1);
            }}
            filterGrade={filterGrade}
            gradeOptions={gradeOptions}
            onFilterGradeChange={(value) => {
              setFilterGrade(value);
              setPage(1);
            }}
          />
        </div>
      

        {!loading && !error && filtered.length > 0 && (
          <Paginationn
            page={page}
            totalPages={totalPages}
            onChange={setPage}
            totalItems={filtered.length}
            displayedCount={paginatedGroups.length}
            unitLabel="مجموعة"
            pageSize={pageSize}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
          />
        )}

        <div className="mt-4">
          {loading ? (
            <LoadingState
              label="جاري تحميل المجموعات..."
              className="rounded-2xl border border-gray-200 bg-white"
            />
          ) : error ? (
            <div className="text-center py-10 text-red-500">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white py-14 text-center text-[#575F69]">
              لا توجد مجموعات مطابقة.
            </div>
          ) : (
            <GroupTable groups={paginatedGroups} onChanged={fetchGroups} />
          )}
        </div>

      </div>
    </AdminLayout>
  );
};

export default GroupsPage;
