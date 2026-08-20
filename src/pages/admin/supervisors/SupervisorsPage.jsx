import { useState, useEffect, useMemo, useCallback } from "react";
import { Plus } from "lucide-react";
import AdminLayout from "../../../components/admin/layout/AdminLayout";
import SupervisorsStatsBar from "../../../components/admin/supervisors/SupervisorsStatsBar";
import SupervisorsFilters from "../../../components/admin/supervisors/SupervisorsFilters";
import SupervisorsTable from "../../../components/admin/supervisors/SupervisorsTable";
import AddSupervisorModal from "../../../components/admin/supervisors/AddSupervisorModal";
import Paginationn from "../../../components/teacher/groups/students/Paginationn";
import { getUsers, updateUser, deleteUser } from "../../../services/APIService";
import ConfirmDialog from "../../../components/admin/supervisors/Confirmdialog";
import Breadcrumbs from "../../shared/Breadcrumbs";
import LoadingState from "../../../components/shared/LoadingState";

const PAGE_SIZE = 6;
const SUPERVISOR_ROLES = ["admin", "super-admin"];

// حوّل شكل اليوزر الراجع من الـ API لشكل الجدول
const mapUserToSupervisor = (u) => ({
  id: u.id || u._id,
  name: u.fullName || u.username,
  email: u.email,
  phone: u.phone,
  countryId: u.country?.id || u.country, // ⚠️ عدّل حسب شكل الحقل الراجع من الباك اند (object ولا id مباشرة)
  role: u.role || "admin", // ⚠️ عدّل حسب اسم الحقل الفعلي لو مختلف ("admin" | "super-admin")
  isActive: Boolean(u.isActive ?? u.isVerified), // ⚠️ عدّل حسب اسم الحقل الفعلي
  status: (u.isActive ?? u.isVerified) ? "نشط" : "متوقف",
});

const extractUsersList = (res) => {
  const list = res.data?.data || res.data?.users || res.data || [];
  return Array.isArray(list) ? list : [];
};

const SupervisorsPage = () => {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("جميع الحالات");
  const [filterRole, setFilterRole] = useState("جميع الصلاحيات");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [modalOpen, setModalOpen] = useState(false);

  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit modal state
  const [editingSupervisor, setEditingSupervisor] = useState(null);

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Suspend/activate state (tracks which row is mid-request so we can disable it)
  const [togglingId, setTogglingId] = useState(null);
  const [actionError, setActionError] = useState(null);

  const fetchSupervisors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const responses = await Promise.all(
        SUPERVISOR_ROLES.map((role) => getUsers({ role })),
      );
      const list = responses.flatMap(extractUsersList);
      const uniqueUsers = Array.from(
        new Map(
          list.map((user) => [user.id || user._id || user.email, user]),
        ).values(),
      );
      setSupervisors(
        uniqueUsers
          .filter((u) => SUPERVISOR_ROLES.includes(u.role))
          .map(mapUserToSupervisor),
      );
    } catch (err) {
      console.error(err);
      setError("حدث خطأ أثناء تحميل بيانات المشرفين");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(fetchSupervisors, 0);
    return () => clearTimeout(timer);
  }, [fetchSupervisors]);

  const filtered = useMemo(
    () =>
      supervisors.filter(
        (s) =>
          (s.name?.includes(search) || s.email?.includes(search)) &&
          (filterStatus === "جميع الحالات" || s.status === filterStatus) &&
          (filterRole === "جميع الصلاحيات" || s.role === filterRole),
      ),
    [supervisors, search, filterStatus, filterRole],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const stats = {
    paused: supervisors.filter((s) => s.status === "متوقف").length,
    active: supervisors.filter((s) => s.status === "نشط").length,
    total: supervisors.length,
  };

  // ─── Edit ───────────────────────────────────────────────────────────────
  const handleEdit = (supervisor) => {
    setEditingSupervisor(supervisor);
  };

  // ─── Suspend / Activate ─────────────────────────────────────────────────
  const handleToggleSuspend = async (supervisor) => {
    setActionError(null);
    setTogglingId(supervisor.id);
    try {
      await updateUser(supervisor.id, { isActive: !supervisor.isActive }); // ⚠️ عدّل اسم الحقل لو مختلف في الباك اند
      await fetchSupervisors();
    } catch (err) {
      console.error(err);
      setActionError("حدث خطأ أثناء تحديث حالة المشرف");
    } finally {
      setTogglingId(null);
    }
  };

  // ─── Delete ─────────────────────────────────────────────────────────────
  const handleDeleteRequest = (supervisor) => {
    setActionError(null);
    setDeleteTarget(supervisor);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteUser(deleteTarget.id);
      setDeleteTarget(null);
      await fetchSupervisors();
    } catch (err) {
      console.error(err);
      setActionError("حدث خطأ أثناء حذف المشرف");
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
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
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
          <div className="order-2 sm:order-1">
            <h3 className="text-xl sm:text-[24px] font-semibold leading-8 text-[#123C91] mb-2 sm:mb-3">
              إدارة المشرفين
            </h3>
            <p className="text-sm sm:text-[16px] font-normal leading-6 text-[#575F69]">
              إدارة حسابات وصلاحيات المشرفين على المنصة.
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="order-1 sm:order-2 w-full sm:w-auto px-5 h-12 rounded-lg bg-[#123C91] text-white [&_svg]:text-white flex items-center justify-center gap-2 font-['Tajawal'] font-medium text-[16px] shrink-0"
          >
            <Plus size={18} />
            إضافة مشرف
          </button>
        </div>

        {/* Stats */}
        <div className="mb-6">
          <SupervisorsStatsBar {...stats} />
        </div>

        {/* Filters */}
        <div className="bg-white mt-6 border border-[#E5E5E5] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.12)] rounded-2xl p-5 w-full">
          <SupervisorsFilters
            search={search}
            onSearchChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            filterStatus={filterStatus}
            onFilterStatusChange={(v) => {
              setFilterStatus(v);
              setPage(1);
            }}
            filterRole={filterRole}
            onFilterRoleChange={(v) => {
              setFilterRole(v);
              setPage(1);
            }}
          />
        </div>

        {actionError && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 text-red-600 text-[13px] text-right">
            {actionError}
          </div>
        )}

        {/* Table */}
        {/* Pagination */}
        <Paginationn
          page={page}
          totalPages={totalPages}
          onChange={setPage}
          totalItems={filtered.length}
          displayedCount={paginated.length}
          unitLabel="مشرف"
          pageSize={pageSize}
          onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        />

        <div className="mt-4">
          {loading ? (
            <LoadingState
              label="جاري تحميل المشرفين..."
              className="rounded-2xl border border-gray-200 bg-white"
            />
          ) : error ? (
            <div className="text-center py-12 text-red-500 text-[14px]">
              {error}
            </div>
          ) : (
            <SupervisorsTable
              supervisors={paginated}
              onEdit={handleEdit}
              onToggleSuspend={handleToggleSuspend}
              onDelete={handleDeleteRequest}
              togglingId={togglingId}
            />
          )}
        </div>

        {/* Add Supervisor Modal */}
        <AddSupervisorModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSuccess={fetchSupervisors} // يحدّث الجدول بعد الإضافة
        />

        {/* Edit Supervisor Modal (same component, edit mode) */}
        <AddSupervisorModal
          open={Boolean(editingSupervisor)}
          supervisor={editingSupervisor}
          onClose={() => setEditingSupervisor(null)}
          onSuccess={fetchSupervisors}
        />

        {/* Delete confirmation */}
        <ConfirmDialog
          open={Boolean(deleteTarget)}
          title="حذف المشرف"
          message={`هل أنت متأكد من حذف "${deleteTarget?.name}"؟ لا يمكن التراجع عن هذا الإجراء.`}
          confirmLabel="حذف"
          danger
          loading={deleting}
          onConfirm={handleDeleteConfirm}
          onClose={() => setDeleteTarget(null)}
        />
      </div>
    </AdminLayout>
  );
};

export default SupervisorsPage;
