import { useState, useEffect, useCallback, useMemo } from "react";
import { Eye, ChevronRight, ChevronLeft, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getAllSubscriptions } from "../../../../services/APIService"; // ⚠️ عدّل المسار حسب مكان api.js عندك
import EntityProfileModal from "../../users/EntityProfileModal";

const PAGE_SIZE = 6;

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    active: "bg-[#00A63E26] text-[#00A63E]",
    expired: "bg-[#FF8A0026] text-[#FF8A00]",
    suspended: "bg-red-100 text-red-500",
  };
  const label =
    { active: "نشط", expired: "منتهي", suspended: "موقوف" }[status] ?? status;
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap ${map[status] ?? "bg-gray-100 text-gray-500"}`}
    >
      {label}
    </span>
  );
};

// ─── Row Actions ──────────────────────────────────────────────────────────────
const RowActions = ({ onView }) => (
  <button
    onClick={onView}
    className="p-2 rounded-lg text-[#575F69] hover:bg-[#EAF4FF] hover:text-[#123C91] transition-colors"
    title="عرض التفاصيل"
  >
    <Eye size={17} />
  </button>
);

const valueOrDash = (value) => (value == null || value === "" ? "--" : value);

const sessionValue = (...values) => {
  const value = values.find((item) => item != null && item !== "");
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
};

const sessionDisplay = (value) => (value == null ? "--" : `${value} حصة`);

// ─── Pagination ───────────────────────────────────────────────────────────────
const Pagination = ({ page, total, totalPages, onChange }) => (
  <div
    className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 px-1"
    dir="rtl"
  >
    <span className="text-[13px] text-[#575F69] text-center sm:text-right">
      عرض {Math.min(PAGE_SIZE, total - (page - 1) * PAGE_SIZE)} من أصل {total}{" "}
      اشتراك
    </span>
    <div className="flex items-center gap-1 flex-wrap justify-center">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-[#575F69] disabled:opacity-40 hover:bg-gray-50 shrink-0"
      >
        <ChevronRight size={16} />
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`w-8 h-8 flex items-center justify-center rounded-lg text-[13px] font-medium transition-colors shrink-0 ${p === page ? "bg-[#123C91] text-white [&_svg]:text-white" : "border border-gray-200 text-[#575F69] hover:bg-gray-50"}`}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-[#575F69] disabled:opacity-40 hover:bg-gray-50 shrink-0"
      >
        <ChevronLeft size={16} />
      </button>
    </div>
  </div>
);

// ─── Mobile Card ──────────────────────────────────────────────────────────────
const SubCard = ({ s, onView, onStudentClick }) => (
  <div className="p-4 flex flex-col gap-2.5">
    <div className="flex items-start justify-between gap-2">
      <button
        type="button"
        onClick={onStudentClick}
        className="font-['Tajawal'] font-semibold text-[15px] text-[#123C91] hover:underline"
      >
        {s.student}
      </button>
      <RowActions onView={onView} />
    </div>
    <div className="flex items-center justify-between text-[13px]">
      <span className="text-[#9CA3AF]">المادة</span>
      <span className="text-[#575F69]">{s.subject}</span>
    </div>
    <div className="flex items-center justify-between text-[13px]">
      <span className="text-[#9CA3AF]">الباقة</span>
      <span className="text-[#575F69]">{s.package}</span>
    </div>
    <div className="flex items-center justify-between text-[13px]">
      <span className="text-[#9CA3AF]">الخصم</span>
      <span className="text-[#575F69]">{s.discount}</span>
    </div>
    <div className="flex items-center justify-between text-[13px]">
      <span className="text-[#9CA3AF]">المستهلك</span>
      <span className="text-[#575F69]">{s.usedSessions}</span>
    </div>
    <div className="flex items-center justify-between text-[13px]">
      <span className="text-[#9CA3AF]">المتبقي</span>
      <span className="font-medium text-[#123C91]">{s.remainingSessions}</span>
    </div>
    <div className="flex items-center justify-between text-[13px]">
      <span className="text-[#9CA3AF]">الحالة</span>
      <StatusBadge status={s.status} />
    </div>
  </div>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────
// API بترجع "subscription" واحد فيه array "items" (مادة لكل item ممكن يكون بمعلم/باقة مختلفين).
// بنفرد كل item كصف مستقل في الجدول عشان يطابق تصميم الـ UI الحالي.
const flattenSubscriptions = (subscriptions) => {
  const rows = [];
  for (const sub of subscriptions) {
    const studentName = sub.student?.user?.fullName ?? "--";
    for (const [index, item] of (sub.items ?? []).entries()) {
      const totalSessions = sessionValue(
        item.totalSessions,
        item.package?.sessions,
        item.packageSessions,
      );
      const remainingSessions = sessionValue(
        item.remainingSessions,
        item.sessionsRemaining,
        item.remaining,
      );
      const usedSessions = sessionValue(
        item.usedSessions,
        item.consumedSessions,
        item.sessionsUsed,
        totalSessions != null && remainingSessions != null
          ? totalSessions - remainingSessions
          : null,
      );

      rows.push({
        rowId: item.id ?? item._id ?? `${sub.id || sub._id}-${index}`,
        subscriptionId: sub.id || sub._id,
        student: studentName,
        studentEntity: sub.student,
        subject: item.subject?.name?.ar ?? item.subject?.name?.en ?? "--",
        package: item.package?.name ?? "--",
        discount: item.discount ? `${item.discount} جنيه` : "--",
        usedSessions: sessionDisplay(usedSessions),
        remainingSessions: sessionDisplay(remainingSessions),
        status: item.status ?? sub.status,
      });
    }
  }
  return rows;
};

// ─── Main ─────────────────────────────────────────────────────────────────────
const SubscriptionsTab = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profileStudent, setProfileStudent] = useState(null);

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getAllSubscriptions();
      setSubscriptions(res.data?.data ?? []);
    } catch (err) {
      setError(err?.response?.data?.message || "تعذر تحميل الاشتراكات");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const rows = useMemo(
    () => flattenSubscriptions(subscriptions),
    [subscriptions],
  );
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const paged = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-[#9CA3AF] gap-2">
        <Loader2 size={18} className="animate-spin" />
        <span className="text-[13px]">جاري التحميل...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl py-14 px-4 text-center">
        <p className="text-[14px] text-[#E0394C] mb-3">{error}</p>
        <button
          onClick={fetchSubscriptions}
          className="text-[13px] text-[#123C91] font-medium hover:underline"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full">
      {rows.length > 0 && (
        <Pagination
          page={page}
          total={rows.length}
          totalPages={totalPages}
          onChange={setPage}
        />
      )}

      <div
        className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
        dir="rtl"
      >
        {rows.length === 0 ? (
          <div className="py-14 px-4 text-center">
            <p className="text-[14px] text-[#9CA3AF]">
              لا توجد اشتراكات حالياً
            </p>
          </div>
        ) : (
          <>
            {/* Mobile: stacked cards */}
            <div className="md:hidden divide-y divide-gray-100">
              {paged.map((s) => (
                <SubCard
                  key={s.rowId}
                  s={s}
                  onView={() =>
                    navigate(`/admin/subscriptions/${s.subscriptionId}`)
                  }
                  onStudentClick={() => setProfileStudent(s.studentEntity)}
                />
              ))}
            </div>

            {/* Desktop/tablet: table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-right" style={{ minWidth: 680 }}>
                <thead className="bg-[#F9FAFA] border-b border-gray-100">
                  <tr>
                    {[
                      "الطالب",
                      "المادة",
                      "الباقة",
                      "الخصم",
                      "المستهلك",
                      "المتبقي",
                      "الحالة",
                      "الإجراءات",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-3.5 text-[13px] font-medium text-[#575F69] whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paged.map((s) => (
                    <tr
                      key={s.rowId}
                      className="hover:bg-gray-50/70 transition-colors"
                    >
                      <td className="px-5 py-3.5 font-['Tajawal'] font-semibold text-[15px] text-[#1F2937] whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setProfileStudent(s.studentEntity)}
                          className="text-[#123C91] hover:underline"
                        >
                          {s.student}
                        </button>
                      </td>
                      <td className="px-5 py-3.5 text-[14px] text-[#575F69] whitespace-nowrap">
                        {s.subject}
                      </td>
                      <td className="px-5 py-3.5 text-[14px] text-[#575F69] whitespace-nowrap">
                        {s.package}
                      </td>
                      <td className="px-5 py-3.5 text-[14px] text-[#575F69] whitespace-nowrap">
                        {valueOrDash(s.discount)}
                      </td>
                      <td className="px-5 py-3.5 text-[14px] text-[#575F69] whitespace-nowrap">
                        {s.usedSessions}
                      </td>
                      <td className="px-5 py-3.5 text-[14px] font-medium text-[#123C91] whitespace-nowrap">
                        {s.remainingSessions}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={s.status} />
                      </td>
                      <td className="px-5 py-3.5">
                        <RowActions
                          onView={() =>
                            navigate(`/admin/subscriptions/${s.subscriptionId}`)
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
      <EntityProfileModal
        entity={profileStudent}
        role="student"
        onClose={() => setProfileStudent(null)}
      />
    </div>
  );
};

export default SubscriptionsTab;
