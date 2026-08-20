import { useCallback, useEffect, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import AdminLayout from "../../../components/admin/layout/AdminLayout";
import RecordingsFilters from "../../../components/admin/recordings/RecordingsFilters";
import RecordingsTable from "../../../components/admin/recordings/RecordingsTable";
import AddRecordingModal from "../../../components/admin/recordings/AddRecordingModal";
import Paginationn from "../../../components/teacher/groups/students/Paginationn";
import { getClassrooms, getClassroomSessions, getSessionRecording } from "../../../services/APIService";
import Breadcrumbs from "../../shared/Breadcrumbs";

const PAGE_SIZE = 6;

const formatSessionDuration = (duration) => {
  if (duration === null || duration === undefined || duration === "") return "—";
  return typeof duration === "number" ? `${duration} دقيقة` : duration;
};

// ⚠️ زي resolveName/nameOf المستخدمة في باقي الصفحات — بعض الحقول (زي name) بترجع
// كـ object { ar, en } مش string مباشر
const resolveName = (val) =>
  typeof val === "string" ? val : val?.ar || val?.en || "—";

const RecordingsPages = () => {
  const [search, setSearch] = useState("");
  const [filterGroup, setFilterGroup] = useState("جميع المجموعات");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [modalOpen, setModalOpen] = useState(false);
  const [recordings, setRecordings] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadRecordings = useCallback(async () => {
    setLoading(true);
    try {
      const groupsRes = await getClassrooms({ limit: 100 });
      const classroomList = groupsRes.data?.data || [];
      setGroups(classroomList);
      const sessionsByClassroom = await Promise.all(classroomList.map(async (classroom) => ({
        classroom,
        sessions: (await getClassroomSessions(classroom.id || classroom._id)).data?.data || [],
      })));
      const rows = await Promise.all(sessionsByClassroom.flatMap(({ classroom, sessions }) => sessions.map(async (session) => {
        try {
          const response = await getSessionRecording(session.id || session._id);
          const recording = response.data?.data;
          return recording ? {
            id: recording.id || recording._id,
            title: recording.title,
            // ⚠️ groupId و lessonId ضروريين عشان لينكات "المجموعة"/"الحصة" في RecordingsTable تشتغل صح
            groupId: classroom.id || classroom._id,
            lessonId: session.id || session._id,
            group: resolveName(classroom.name),
            lesson: session.title,
            teacher: classroom.teacher?.user?.fullName || classroom.teacher?.name || "—",
            duration: formatSessionDuration(session.duration),
            uploadDate: recording.createdAt ? new Date(recording.createdAt).toLocaleDateString("en-CA") : "—",
          } : null;
        } catch { return null; }
      })));
      setRecordings(rows.filter(Boolean));
    } catch {
      setRecordings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(loadRecordings, 0);
    return () => window.clearTimeout(timer);
  }, [loadRecordings]);

  const filtered = recordings.filter(
    (r) =>
      (r.title.includes(search) || r.teacher.includes(search)) &&
      (filterGroup === "جميع المجموعات" || r.group === filterGroup)
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <AdminLayout>
      <Breadcrumbs homeTo="/admin-dashboard" />
      <div className="w-full p-2 font-['IBM_Plex_Sans_Arabic'] text-right" dir="rtl">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div className="order-2 sm:order-1">
            <h3 className="text-xl sm:text-[24px] font-semibold leading-8 text-[#123C91] mb-2 sm:mb-3">
              تسجيلات الحصص
            </h3>
            <p className="text-sm sm:text-[16px] font-normal leading-6 text-[#575F69]">
              رفع وإدارة تسجيلات حصص Zoom
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="order-1 sm:order-2 w-full sm:w-auto px-5 h-12 rounded-lg bg-[#123C91] text-white [&_svg]:text-white flex items-center justify-center gap-2 font-['Tajawal'] font-medium text-[16px] shrink-0"
          >
            <Upload size={18} />
            رفع تسجيل
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white border border-[#E5E5E5] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.12)] rounded-2xl p-5 w-full mb-4">
          <RecordingsFilters
            search={search}
            onSearchChange={(v) => { setSearch(v); setPage(1); }}
            filterGroup={filterGroup}
            onFilterGroupChange={(v) => { setFilterGroup(v); setPage(1); }}
            groupOptions={["جميع المجموعات", ...groups.map((g) => resolveName(g.name))]}
          />
        </div>

        {loading ? (
          <div className="flex min-h-52 w-full flex-col items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white text-[#123C91] shadow-sm">
            <Loader2 size={34} className="animate-spin" />
            <p className="text-sm font-medium">جاري تحميل التسجيلات...</p>
          </div>
        ) : (
          <>
            {/* Pagination */}
            {filtered.length > 0 && (
              <Paginationn
                page={page}
                totalPages={totalPages}
                onChange={setPage}
                totalItems={filtered.length}
                displayedCount={paginated.length}
                unitLabel="تسجيل"
                pageSize={pageSize}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setPage(1);
                }}
              />
            )}

            {/* Table */}
            <RecordingsTable recordings={paginated} />
          </>
        )}

        {/* Modal */}
        <AddRecordingModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          groups={groups}
          onSuccess={loadRecordings}
        />
      </div>
    </AdminLayout>
  );
};

export default RecordingsPages;
