import { useState } from "react";
import { Eye, Trash2, AlertTriangle, X } from "lucide-react";
import toast from "react-hot-toast";
import { removeStudent } from "../../../services/APIService";

const getInitial = (name) => name?.trim()?.[0] || "؟";

const STATUS_LABELS = {
  active: { text: "نشط", className: "bg-[#00A63E1A] text-[#00A63E]" },
  "pending-contact": {
    text: "قيد المراجعة",
    className: "bg-[#FEF3C7] text-[#B45309]",
  },
  removed: { text: "محذوف", className: "bg-[#FFEBEE] text-[#D32F2F]" },
};

const STUDY_TYPE_LABELS = {
  school: "مدرسي",
};

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const DetailRow = ({ label, value }) => (
  <div className="flex items-center justify-between py-3 border-b border-[#F3F4F6] last:border-b-0">
    <span className="text-[13px] sm:text-[14px] text-[#575F69]">{label}</span>
    <span className="text-[13px] sm:text-[14px] font-medium text-[#1F2937]">
      {value}
    </span>
  </div>
);

const StatusBadge = ({ status }) => {
  const info = STATUS_LABELS[status] || {
    text: status || "—",
    className: "bg-[#F3F4F6] text-[#575F69]",
  };
  return (
    <span
      className={`px-3 py-1 rounded-full text-[12px] font-medium inline-block whitespace-nowrap ${info.className}`}
    >
      {info.text}
    </span>
  );
};

const RowActions = ({ onView, onDelete }) => (
  <div className="flex gap-3 text-[#575F69]">
    <button
      onClick={onView}
      className="p-1.5 rounded-md hover:bg-[#EAF4FF] hover:text-[#123C91] transition-colors"
      title="عرض التفاصيل"
      aria-label="عرض التفاصيل"
    >
      <Eye size={18} />
    </button>
    <button
      onClick={onDelete}
      className="p-1.5 rounded-md hover:bg-[#FFEBEE] hover:text-red-500 transition-colors"
      title="حذف"
      aria-label="حذف"
    >
      <Trash2 size={18} />
    </button>
  </div>
);

const ChildrenTable = ({
  children = [],
  onStudentRemoved,
  ordersByStudent = {},
  subscribedStudentIds = new Set(),
  payingOrderId,
  onContinuePayment,
}) => {
  const [deletingId, setDeletingId] = useState(null);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);

  const handleConfirmDelete = async () => {
    if (!confirmTarget) return;
    const { id, name } = confirmTarget;

    setDeletingId(id);
    try {
      await removeStudent(id);
      toast.success(`تم حذف ${name} بنجاح`);
      onStudentRemoved?.(id);
    } catch (err) {
      console.error("فشل حذف الابن:", err.response?.data);
      toast.error(err.response?.data?.message || "حدث خطأ أثناء الحذف");
    } finally {
      setDeletingId(null);
      setConfirmTarget(null);
    }
  };

  if (children.length === 0) {
    return (
      <div
        className="w-full bg-white border border-[#E5E5E5] rounded-lg p-10 text-center text-[#575F69]"
        dir="rtl"
      >
        لا يوجد أبناء حالياً
      </div>
    );
  }

  return (
    <>
      {/* جدول — للشاشات المتوسطة وأكبر */}
      <div
        className="hidden md:block w-full bg-white border border-[#E5E5E5] rounded-lg overflow-x-auto shadow-sm"
        dir="rtl"
      >
        <table className="w-full min-w-180 text-right border-collapse">
          <thead className="bg-[#F9FAFA] border-b border-[#E5E5E5]">
            <tr>
              {[
                "الابن",
                "نسبة الحضور",
                "الأداء العام",
                "الدروس النشطة",
                "الدروس المكتملة",
                "الحالة",
                "الإجراءات",
              ].map((h) => (
                <th
                  key={h}
                  className="px-6 py-4 text-[#575F69] font-medium text-[14px] whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {children.map((child) => {
              const studentId = String(child.id || child._id);
              const order = ordersByStudent[studentId];
              const hasActiveSubscription =
                subscribedStudentIds.has(studentId);
              const waitingAdmin =
                order?.paymentStatus === "paid" &&
                order?.approvalStatus === "waiting_admin";
              const showContinuePayment =
                !hasActiveSubscription && !waitingAdmin;
              const name = child.user?.fullName || "بدون اسم";
              const gradeName =
                child.grade?.name?.ar || child.grade?.name?.en || "—";
              const performance = child.averageScore ?? 0;

              return (
                <tr
                  key={child.id}
                  className="border-b border-[#F3F4F6] hover:bg-[#F9FAFA] transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#123C91] text-white [&_svg]:text-white flex items-center justify-center font-bold text-lg shrink-0">
                        {getInitial(name)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-['Tajawal'] font-medium text-[#1F2937] text-[16px] truncate">
                            {name}
                          </p>
                          {showContinuePayment && (
                            <button
                              type="button"
                              onClick={() => onContinuePayment?.(child)}
                              disabled={payingOrderId === order?.id}
                              className="rounded-lg bg-[#123C91] px-2.5 py-1 text-[11px] font-medium text-white disabled:opacity-60"
                            >
                              {payingOrderId === order?.id
                                ? "جاري التحويل..."
                                : "استكمال الدفع"}
                            </button>
                          )}
                          {waitingAdmin && (
                            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700">
                              بانتظار مراجعة الإدارة
                            </span>
                          )}
                        </div>
                        <p className="text-[12px] text-[#6B7280] truncate">
                          {gradeName}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 text-[#575F69] text-[16px]">--</td>
                  <td className="px-6 text-[#575F69] text-[16px]">
                    {performance}%
                  </td>
                  <td className="px-6 text-[#575F69] text-[16px]">--</td>
                  <td className="px-6 text-[#575F69] text-[16px]">--</td>
                  <td className="px-6">
                    <StatusBadge status={child.status} />
                  </td>
                  <td className="px-6">
                    <RowActions
                      onView={() => setViewTarget(child)}
                      onDelete={() => setConfirmTarget({ id: child.id, name })}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* كروت — للموبايل */}
      <div className="md:hidden flex flex-col gap-3" dir="rtl">
        {children.map((child) => {
          const studentId = String(child.id || child._id);
          const order = ordersByStudent[studentId];
          const hasActiveSubscription =
            subscribedStudentIds.has(studentId);
          const waitingAdmin =
            order?.paymentStatus === "paid" &&
            order?.approvalStatus === "waiting_admin";
          const showContinuePayment =
            !hasActiveSubscription && !waitingAdmin;
          const name = child.user?.fullName || "بدون اسم";
          const gradeName =
            child.grade?.name?.ar || child.grade?.name?.en || "—";
          const performance = child.averageScore ?? 0;

          return (
            <div
              key={child.id}
              className="bg-white border border-[#E5E5E5] rounded-xl p-4 shadow-sm"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-full bg-[#123C91] text-white [&_svg]:text-white flex items-center justify-center font-bold text-lg shrink-0">
                    {getInitial(name)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-['Tajawal'] font-medium text-[#1F2937] text-[16px] truncate">
                      {name}
                    </p>
                    <p className="text-[12px] text-[#6B7280] truncate">
                      {gradeName}
                    </p>
                  </div>
                </div>
                <RowActions
                  onView={() => setViewTarget(child)}
                  onDelete={() => setConfirmTarget({ id: child.id, name })}
                />
              </div>

              {showContinuePayment && (
                <button
                  type="button"
                  onClick={() => onContinuePayment?.(child)}
                  disabled={payingOrderId === order?.id}
                  className="mb-3 h-10 w-full rounded-lg bg-[#123C91] text-sm font-medium text-white disabled:opacity-60"
                >
                  {payingOrderId === order?.id
                    ? "جاري التحويل للدفع..."
                    : "استكمال الدفع"}
                </button>
              )}
              {waitingAdmin && (
                <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-center text-xs font-medium text-amber-700">
                  تم الدفع — بانتظار مراجعة الإدارة
                </p>
              )}

              <div className="flex items-center justify-between mb-2">
                <StatusBadge status={child.status} />
                <span className="text-[13px] text-[#575F69]">
                  الأداء: {performance}%
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-[#F3F4F6]">
                <div>
                  <p className="text-[11px] text-[#9CA3AF]">الحضور</p>
                  <p className="text-[13px] font-medium text-[#1F2937]">--</p>
                </div>
                <div>
                  <p className="text-[11px] text-[#9CA3AF]">الدروس النشطة</p>
                  <p className="text-[13px] font-medium text-[#1F2937]">--</p>
                </div>
                <div>
                  <p className="text-[11px] text-[#9CA3AF]">الدروس المكتملة</p>
                  <p className="text-[13px] font-medium text-[#1F2937]">--</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* مودال عرض بيانات الابن */}
      {viewTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          dir="rtl"
        >
          <div className="bg-white rounded-2xl shadow-[0px_20px_60px_0px_#1F29371F] w-full max-w-130 max-h-[90vh] overflow-y-auto p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-['Tajawal'] font-medium text-[18px] sm:text-[20px] text-[#1F2937]">
                بيانات الابن
              </h3>
              <button
                onClick={() => setViewTarget(null)}
                className="text-[#9CA3AF] hover:text-[#1F2937] transition-colors p-1"
                aria-label="إغلاق"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-14 h-14 rounded-full bg-[#123C91] text-white [&_svg]:text-white flex items-center justify-center font-bold text-xl shrink-0">
                {getInitial(viewTarget.user?.fullName)}
              </div>
              <div className="min-w-0">
                <p className="font-['Tajawal'] font-medium text-[17px] sm:text-[18px] text-[#1F2937] truncate">
                  {viewTarget.user?.fullName || "بدون اسم"}
                </p>
                <p className="text-[13px] text-[#575F69] truncate">
                  {viewTarget.grade?.name?.ar ||
                    viewTarget.grade?.name?.en ||
                    "—"}
                </p>
              </div>
            </div>

            <div className="bg-[#F9FAFA] rounded-xl px-4">
              <DetailRow
                label="نوع الدراسة"
                value={
                  STUDY_TYPE_LABELS[viewTarget.studentType] ||
                  viewTarget.studentType ||
                  "—"
                }
              />
              <DetailRow
                label="لغة الدراسة"
                value={
                  viewTarget.studyLanguage === "ar"
                    ? "العربية"
                    : viewTarget.studyLanguage === "en"
                      ? "الإنجليزية"
                      : "—"
                }
              />
              <DetailRow
                label="المعدل العام"
                value={`${viewTarget.averageScore ?? 0}%`}
              />
              <DetailRow
                label="ساعات الدراسة"
                value={viewTarget.totalStudyHours ?? 0}
              />
              <DetailRow
                label="الحالة"
                value={
                  STATUS_LABELS[viewTarget.status]?.text ||
                  viewTarget.status ||
                  "—"
                }
              />
              <DetailRow
                label="تاريخ الإضافة"
                value={formatDate(viewTarget.createdAt)}
              />
            </div>

            <button
              onClick={() => setViewTarget(null)}
              className="w-full h-12 rounded-lg bg-[#123C91] text-white [&_svg]:text-white font-medium text-[14px] mt-6"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}

      {/* مودال تأكيد الحذف */}
      {confirmTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          dir="rtl"
        >
          <div className="bg-white rounded-2xl shadow-[0px_20px_60px_0px_#1F29371F] w-full max-w-105 p-6 sm:p-8 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-[#FFEBEE] flex items-center justify-center mb-4">
              <AlertTriangle size={28} className="text-[#D32F2F]" />
            </div>

            <h3 className="font-['Tajawal'] font-medium text-[18px] sm:text-[20px] text-[#1F2937] mb-2">
              حذف الابن
            </h3>
            <p className="font-['IBM_Plex_Sans_Arabic'] text-[14px] text-[#575F69] mb-6">
              هل أنت متأكد من حذف{" "}
              <span className="font-semibold text-[#1F2937]">
                {confirmTarget.name}
              </span>
              ؟
              <br />
              لا يمكن التراجع عن هذا الإجراء.
            </p>

            <div className="flex gap-3 w-full">
              <button
                onClick={() => setConfirmTarget(null)}
                disabled={deletingId !== null}
                className="flex-1 h-12 rounded-lg border border-[#1F293733] bg-white text-[#1F2937] font-medium text-[14px] disabled:opacity-60 transition-opacity"
              >
                إلغاء
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deletingId !== null}
                className="flex-1 h-12 rounded-lg bg-[#D32F2F] text-white font-medium text-[14px] disabled:opacity-70 transition-opacity"
              >
                {deletingId !== null ? "جاري الحذف..." : "حذف"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChildrenTable;
