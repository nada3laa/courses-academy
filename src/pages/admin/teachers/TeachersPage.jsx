import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Clock3,
  GraduationCap,
  Loader2,
  MessageCircle,
  MessagesSquare,
  Search,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Users,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import AdminLayout from "../../../components/admin/layout/AdminLayout";
import Pagination from "../../../components/teacher/groups/students/Paginationn";
import { getSavedPageSize } from "../../../utils/tablePagination";
import Breadcrumbs from "../../shared/Breadcrumbs";
import {
  getTeachers,
  getTeacher,
  getTeacherMonthlyReport,
  updateTeacherProfile,
  updateUser,
} from "../../../services/APIService";
import { hasIncompleteRegistration } from "../../../utils/incompleteRegistration";
import { getTeacherFileUrls } from "../../../utils/teacherCv";
import { getTeacherMissedSessions } from "../../../utils/teacherMissedSessions";
import { resolveTeacherTeachingSelections } from "../../../utils/teacherTeachingSelections";
import { normalizePhoneSearch } from "../../../utils/phone";

const PAGE_SIZE = 8;

const currentMonth = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

const formatHours = (minutes = 0) =>
  `${new Intl.NumberFormat("ar-EG", {
    maximumFractionDigits: 1,
  }).format(Number(minutes || 0) / 60)} ساعة`;

const teacherName = (teacher) =>
  teacher.user?.fullName || teacher.fullName || teacher.name || "—";

const teacherEmail = (teacher) => teacher.user?.email || teacher.email || "—";

const teacherPhone = (teacher) => teacher.user?.phone || teacher.phone || "—";

const whatsappUrl = (phone) => {
  const number = String(phone || "")
    .replace(/[^\d]/g, "")
    .replace(/^00/, "");
  return number ? `https://wa.me/${number}` : "";
};

const localizedName = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value.name?.ar || value.name?.en || value.ar || value.en || "";
};

const listLabel = (value) => {
  const list = Array.isArray(value) ? value : value ? [value] : [];
  const names = list.map(localizedName).filter(Boolean);
  return [...new Set(names)].join("، ") || "—";
};

const DetailItem = ({ label, value }) => (
  <div className="rounded-xl bg-[#F9FAFA] px-4 py-3">
    <p className="text-xs text-[#8C9198]">{label}</p>
    <p className="mt-1 break-words text-sm font-medium text-[#1F2937]">
      {value ?? "—"}
    </p>
  </div>
);

const TeacherCurriculumBoxes = ({ teacher }) => {
  const selections = teacher.raw?.teachingSelections || [];
  if (!selections.length) return null;
  return <div className="mt-4 space-y-3">
    <p className="text-sm font-semibold text-[#1F2937]">المناهج والصفوف والمواد</p>
    {selections.map((selection, index) => <div key={selection.curriculum?.id || selection.curriculum?._id || index} className="rounded-2xl border border-[#D7E2F3] bg-[#F8FAFD] p-4">
      <p className="text-[11px] text-[#8C9198]">المنهج الدراسي</p>
      <p className="text-sm font-bold text-[#123C91]">{localizedName(selection.curriculum) || "منهج غير محدد"}</p>
      <div className="mt-3 space-y-2">
        {selection.stages?.flatMap((stage) => stage.grades || []).map((grade, gradeIndex) => <div key={grade.grade?.id || grade.grade?._id || gradeIndex} className="flex flex-col gap-2 rounded-xl border bg-white p-3 sm:flex-row sm:items-start">
          <p className="min-w-32 text-xs font-bold text-[#1F2937]">{localizedName(grade.grade) || "صف غير محدد"}</p>
          <div className="flex flex-1 flex-wrap gap-1.5">
            {(grade.subjects || []).map((subject, subjectIndex) => <span key={subject?.id || subject?._id || subjectIndex} className="rounded-lg bg-[#EAF0FB] px-2.5 py-1 text-xs text-[#123C91]">
              {localizedName(subject) || "مادة غير محددة"}
            </span>)}
            {!grade.subjects?.length && <span className="text-xs text-[#8C9198]">لا توجد مواد</span>}
          </div>
        </div>)}
      </div>
    </div>)}
  </div>;
};

const TeachersPage = () => {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(() => getSavedPageSize(PAGE_SIZE));
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [approvingTeacher, setApprovingTeacher] = useState(false);
  const [rejectingTeacher, setRejectingTeacher] = useState(false);
  const month = useMemo(() => currentMonth(), []);

  const loadTeachers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getTeachers({ limit: 100 });
      const body = response.data?.data ?? response.data ?? [];
      const list = Array.isArray(body) ? body : body.teachers || [];

      const completedTeachers = list.filter(
        (teacher) => !hasIncompleteRegistration(teacher),
      );
      const rows = await Promise.all(
        completedTeachers.map(async (teacher) => {
          const id = teacher.id || teacher._id;
          let summary = {};
          let absences = [];
          const [reportResult, absencesResult] = await Promise.allSettled([
            getTeacherMonthlyReport(id, month),
            getTeacherMissedSessions(teacher),
          ]);
          if (reportResult.status === "fulfilled") {
            summary = reportResult.value.data?.data?.summary || {};
          }
          if (absencesResult.status === "fulfilled") {
            absences = absencesResult.value;
          }

          return {
            id,
            userId:
              teacher.user?.id ||
              teacher.user?._id ||
              (typeof teacher.user === "string" ? teacher.user : null) ||
              teacher.userId,
            name: teacherName(teacher),
            email: teacherEmail(teacher),
            phone: teacherPhone(teacher),
            monthlyMinutes: summary.totalTeachingMinutes ?? 0,
            completedSessions: summary.completedSessions ?? 0,
            experience: teacher.experienceYears ?? teacher.experience ?? "—",
            subjects: listLabel(teacher.subjects ?? teacher.subject),
            grades: listLabel(teacher.grades ?? teacher.grade),
            curricula: listLabel(teacher.curriculums ?? teacher.curriculum),
            status:
              teacher.status === "approved"
                ? "مقبول"
                : teacher.status === "rejected"
                  ? "مرفوض"
                  : "في انتظار المراجعة",
            isApproved: teacher.status === "approved",
            isRejected: teacher.status === "rejected",
            fileUrls: getTeacherFileUrls(teacher),
            createdAt: teacher.createdAt || teacher.user?.createdAt,
            raw: teacher,
            absences,
          };
        }),
      );

      setTeachers(
        rows.sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime(),
        ),
      );
    } catch (error) {
      console.error("Failed to load teachers:", error);
      toast.error(error.response?.data?.message || "تعذر تحميل المعلمين");
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadTeachers();
  }, [loadTeachers]);

  const normalizedSearch = search.trim().toLowerCase();
  const normalizedPhoneSearch = normalizePhoneSearch(search);
  const filtered = teachers.filter((teacher) =>
    String(teacher.name || "").toLowerCase().includes(normalizedSearch) ||
    String(teacher.email || "").toLowerCase().includes(normalizedSearch) ||
    (normalizedPhoneSearch &&
      normalizePhoneSearch(teacher.phone).includes(normalizedPhoneSearch)),
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalMinutes = teachers.reduce(
    (sum, teacher) => sum + Number(teacher.monthlyMinutes || 0),
    0,
  );

  const openTeacherDetails = async (teacher) => {
    setSelectedTeacher({ ...teacher, academicLoading: true });
    try {
      const response = await getTeacher(teacher.id);
      const details = response?.data?.data?.teacher ?? response?.data?.data ?? response?.data;
      if (details && typeof details === "object") {
        const mergedDetails = { ...teacher.raw, ...details };
        const teachingSelections = await resolveTeacherTeachingSelections(mergedDetails);
        setSelectedTeacher((current) => current?.id === teacher.id
          ? { ...current, academicLoading: false, raw: { ...mergedDetails, teachingSelections } }
          : current);
      }
    } catch {
      // Keep the summary response visible if detailed data is unavailable.
    } finally {
      setSelectedTeacher((current) => current?.id === teacher.id
        ? { ...current, academicLoading: false }
        : current);
    }
  };

  const handleApproveTeacher = async () => {
    if (!selectedTeacher || selectedTeacher.isApproved) return;
    setApprovingTeacher(true);
    try {
      await updateTeacherProfile(selectedTeacher.id, { status: "approved" });
      if (selectedTeacher.userId) {
        await updateUser(selectedTeacher.userId, {
          status: "active",
          registrationStatus: "active",
          isActive: true,
        });
      }
      const approvedTeacher = {
        ...selectedTeacher,
        status: "معتمد",
        isApproved: true,
        isRejected: false,
      };
      setSelectedTeacher(approvedTeacher);
      setTeachers((current) =>
        current.map((teacher) =>
          teacher.id === approvedTeacher.id ? approvedTeacher : teacher,
        ),
      );
      toast.success("تم اعتماد المعلم وتفعيل حسابه");
    } catch (error) {
      toast.error(error.response?.data?.message || "تعذر اعتماد المعلم");
    } finally {
      setApprovingTeacher(false);
    }
  };

  const handleRejectTeacher = async () => {
    if (!selectedTeacher || selectedTeacher.isApproved) return;
    if (!window.confirm("هل تريد رفض طلب هذا المعلم؟")) return;
    setRejectingTeacher(true);
    try {
      await updateTeacherProfile(selectedTeacher.id, { status: "rejected" });
      if (selectedTeacher.userId) {
        await updateUser(selectedTeacher.userId, {
          registrationStatus: "rejected",
          isActive: false,
        });
      }
      const rejectedTeacher = {
        ...selectedTeacher,
        status: "مرفوض",
        isApproved: false,
        isRejected: true,
      };
      setSelectedTeacher(rejectedTeacher);
      setTeachers((current) =>
        current.map((teacher) =>
          teacher.id === rejectedTeacher.id ? rejectedTeacher : teacher,
        ),
      );
      toast.success("تم رفض طلب المعلم");
    } catch (error) {
      toast.error(error.response?.data?.message || "تعذر رفض طلب المعلم");
    } finally {
      setRejectingTeacher(false);
    }
  };

  return (
    <AdminLayout>
      <Breadcrumbs homeTo="/admin-dashboard" />
      <div
        className="w-full p-2 font-['IBM_Plex_Sans_Arabic'] text-right"
        dir="rtl"
      >
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-[#123C91] sm:text-[24px]">
            المعلمين
          </h1>
          <p className="mt-2 text-sm text-[#575F69] sm:text-[16px]">
            متابعة المعلمين وساعات التدريس خلال الشهر الحالي.
          </p>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
              <Users size={24} />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-800">
                {teachers.length}
              </p>
              <p className="mt-1 text-sm text-gray-500">إجمالي المعلمين</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="rounded-lg bg-teal-50 p-3 text-teal-600">
              <Clock3 size={24} />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-800">
                {formatHours(totalMinutes)}
              </p>
              <p className="mt-1 text-sm text-gray-500">إجمالي ساعات الشهر</p>
            </div>
          </div>
        </div>

        <div className="mb-4 rounded-2xl border border-[#E5E5E5] bg-white p-5 shadow-sm">
          <div className="relative max-w-md">
            <Search
              size={17}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="ابحث باسم المعلم أو البريد الإلكتروني أو رقم الهاتف..."
              className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 pr-10 pl-3 text-sm outline-none focus:border-[#123C91]"
            />
          </div>
        </div>

        {!loading && filtered.length > 0 && (
          <div className="mb-4">
            <Pagination
              page={page}
              totalPages={totalPages}
              onChange={setPage}
              totalItems={filtered.length}
              displayedCount={visible.length}
              unitLabel="معلم"
              pageSize={pageSize}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
            />
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white py-16 text-[#575F69]">
            <Loader2 size={18} className="animate-spin" />
            جاري تحميل المعلمين والساعات الشهرية...
          </div>
        ) : visible.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white py-14 text-center text-[#575F69]">
            لا يوجد معلمون
          </div>
        ) : (
          <>
            <div className="hidden overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm md:block">
              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead className="bg-[#F9FAFA]">
                    <tr>
                      {[
                        "اسم المعلم",
                        "البريد الإلكتروني",
                        "رقم الهاتف",
                        "الساعات الشهرية",
                        "الحصص المكتملة",
                        "الغياب",
                        "الإجراءات",
                      ].map((header) => (
                        <th
                          key={header}
                          className="whitespace-nowrap px-6 py-4 text-[13px] font-medium text-[#575F69]"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {visible.map((teacher) => (
                      <tr key={teacher.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium">
                          <button
                            type="button"
                            onClick={() => openTeacherDetails(teacher)}
                            className="text-right text-[#123C91] hover:underline"
                          >
                            {teacher.name}
                          </button>
                        </td>
                        <td
                          className="px-6 py-4 text-sm text-[#575F69]"
                          dir="ltr"
                        >
                          {teacher.email}
                        </td>
                        <td
                          className="px-6 py-4 text-sm text-[#575F69]"
                          dir="ltr"
                        >
                          {teacher.phone}
                        </td>
                        <td className="px-6 py-4 font-semibold text-[#123C91]">
                          {formatHours(teacher.monthlyMinutes)}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/admin/teachers/${teacher.id}/sessions/completed`,
                                {
                                  state: { teacherName: teacher.name },
                                },
                              )
                            }
                            className="font-semibold text-[#123C91] hover:underline"
                          >
                            {teacher.completedSessions}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/admin/teachers/${teacher.id}/sessions/missed`,
                                { state: { teacherName: teacher.name } },
                              )
                            }
                            className="font-semibold text-amber-700 hover:underline"
                          >
                            {teacher.absences.length}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${teacher.isApproved ? "bg-emerald-50 text-emerald-700" : teacher.isRejected ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}
                          >
                            {teacher.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-3 md:hidden">
              {visible.map((teacher) => (
                <div
                  key={teacher.id}
                  className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => openTeacherDetails(teacher)}
                    className="font-semibold text-[#123C91] hover:underline"
                  >
                    {teacher.name}
                  </button>
                  <p
                    className="mt-1 break-all text-xs text-[#8C9198]"
                    dir="ltr"
                  >
                    {teacher.email}
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-blue-50 p-3">
                      <p className="text-xs text-[#575F69]">الساعات الشهرية</p>
                      <p className="mt-1 font-semibold text-[#123C91]">
                        {formatHours(teacher.monthlyMinutes)}
                      </p>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-3">
                      <p className="text-xs text-[#575F69]">الحصص المكتملة</p>
                      <p className="mt-1 font-semibold text-[#1F2937]">
                        {teacher.completedSessions}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/admin/teachers/${teacher.id}/sessions/missed`,
                          { state: { teacherName: teacher.name } },
                        )
                      }
                      className="rounded-lg bg-amber-50 p-3 text-right"
                    >
                      <p className="text-xs text-[#575F69]">الغياب</p>
                      <p className="mt-1 font-semibold text-amber-700">
                        {teacher.absences.length}
                      </p>
                    </button>
                    <div className="rounded-lg bg-white p-3 text-sm text-[#575F69]">
                      <p className="text-xs text-[#575F69]">الحالة</p>
                      <p className="mt-1 font-semibold text-[#1F2937]">
                        {teacher.status}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {selectedTeacher && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                setSelectedTeacher(null);
              }
            }}
          >
            <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white p-5 shadow-xl sm:p-7 lg:p-8">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[#1F2937]">
                  تفاصيل المعلم
                </h2>
                <button
                  type="button"
                  onClick={() => setSelectedTeacher(null)}
                  aria-label="إغلاق"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200"
                >
                  <X size={17} />
                </button>
              </div>

              <div className="mb-5 flex flex-col items-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-[#123C91]">
                  <GraduationCap size={30} />
                </div>
                <h3 className="mt-3 text-lg font-semibold text-[#1F2937]">
                  {selectedTeacher.name}
                </h3>
                <p className="mt-1 text-sm text-[#8C9198]" dir="ltr">
                  {selectedTeacher.email}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <DetailItem label="رقم الهاتف" value={selectedTeacher.phone} />
                <DetailItem
                  label="حالة المعلم"
                  value={selectedTeacher.status}
                />
                <DetailItem
                  label="سنوات الخبرة"
                  value={selectedTeacher.experience}
                />
                <DetailItem
                  label="الساعات الشهرية"
                  value={formatHours(selectedTeacher.monthlyMinutes)}
                />
                <DetailItem
                  label="الحصص المكتملة هذا الشهر"
                  value={selectedTeacher.completedSessions}
                />
              </div>

              {selectedTeacher.academicLoading ? (
                <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl border border-[#D7E2F3] bg-[#F8FAFD] p-6 text-sm font-medium text-[#123C91]">
                  <Loader2 size={20} className="animate-spin" />
                  جاري تحميل البيانات الأكاديمية للمعلم...
                </div>
              ) : (
                <TeacherCurriculumBoxes teacher={selectedTeacher} />
              )}

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {selectedTeacher.fileUrls?.length ? (
                  selectedTeacher.fileUrls.map((url, index) => (
                    <a
                      key={url}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#123C91] px-4 py-2.5 text-sm font-semibold text-[#123C91] hover:bg-blue-50"
                    >
                      ملف {index + 1}
                      <ExternalLink size={15} />
                    </a>
                  ))
                ) : (
                  <span className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-400">
                    لا توجد ملفات متاحة
                  </span>
                )}
              </div>

              <div
                className={`mt-5 grid grid-cols-1 gap-3 ${
                  selectedTeacher.isApproved
                    ? "sm:grid-cols-2"
                    : selectedTeacher.isRejected
                      ? "sm:grid-cols-2"
                      : "sm:grid-cols-4"
                }`}
              >
                {!selectedTeacher.isApproved && !selectedTeacher.isRejected && (
                  <>
                    <button
                      type="button"
                      disabled={approvingTeacher}
                      onClick={handleApproveTeacher}
                      className="flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {approvingTeacher ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <CheckCircle2 size={18} />
                      )}
                      اعتماد المعلم
                    </button>
                    <button
                      type="button"
                      disabled={rejectingTeacher || approvingTeacher}
                      onClick={handleRejectTeacher}
                      className="flex h-12 items-center justify-center gap-2 rounded-xl bg-red-600 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
                    >
                      {rejectingTeacher ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <XCircle size={18} />
                      )}
                      رفض الطلب
                    </button>
                  </>
                )}
                <a
                  href={whatsappUrl(selectedTeacher.phone) || undefined}
                  target={
                    whatsappUrl(selectedTeacher.phone) ? "_blank" : undefined
                  }
                  rel="noopener noreferrer"
                  aria-disabled={!whatsappUrl(selectedTeacher.phone)}
                  onClick={(event) => {
                    if (!whatsappUrl(selectedTeacher.phone)) {
                      event.preventDefault();
                    }
                  }}
                  className={`flex h-12 items-center justify-center gap-2 rounded-xl text-sm font-semibold !text-white transition-colors ${
                    whatsappUrl(selectedTeacher.phone)
                      ? "bg-[#25D366] hover:bg-[#20bd5a]"
                      : "cursor-not-allowed bg-gray-300"
                  }`}
                >
                  <MessageCircle size={18} />
                  تواصل عبر واتساب
                </a>
                <button
                  type="button"
                  disabled={!selectedTeacher.userId}
                  onClick={() =>
                    navigate("/admin/messages", {
                      state: { openUserId: selectedTeacher.userId },
                    })
                  }
                  className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#123C91] text-sm font-semibold text-white transition-colors hover:bg-[#0f327a] disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  <MessagesSquare size={18} />
                  محادثة على الموقع
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default TeachersPage;
