import React from "react";
import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

// ─── Badge Helper ─────────────────────────────────────────────────────────────
const Badge = ({ label, type, subLabel }) => {
  const map = {
    green: "bg-[#00A63E1A] text-[#00A63E]",
    blue: "bg-[#EAF4FF] text-[#123C91]",
    orange: "bg-[#FF8A001A] text-[#FF8A00]",
    gray: "bg-[#F3F4F6] text-[#8C9198]",
  };
  return (
    <div className="inline-flex flex-col items-start gap-1">
      <span
        className={`inline-flex items-center justify-center whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-semibold md:text-xs ${
          map[type] ?? map.gray
        }`}
      >
        {label}
      </span>
      {subLabel && (
        <span className="whitespace-nowrap text-[11px] text-[#8C9198]">{subLabel}</span>
      )}
    </div>
  );
};

const assignmentStatusBadge = (status, timeRemaining) => {
  if (status === "نشط") {
    return <Badge label={status} type="blue" subLabel={timeRemaining ? `الوقت المتبقي ${timeRemaining}` : null} />;
  }
  return <Badge label={status} type="gray" />;
};

const correctionStatusBadge = (v) => {
  if (v === "تم التصحيح") return <Badge label={v} type="green" />;
  if (v === "قيد التصحيح") return <Badge label={v} type="orange" />;
  return <Badge label={v} type="gray" />;
};

// ─── View Action (single eye icon) ────────────────────────────────────────────
const ViewAction = ({ assignmentId, onView }) => (
  <button
    onClick={() => onView?.(assignmentId)}
    className="flex items-center justify-center rounded-lg p-2 text-[#575F69] transition-all duration-200 hover:bg-[#EAF4FF] hover:text-[#123C91]"
    aria-label="عرض تفاصيل الواجب"
  >
    <Eye size={18} />
  </button>
);

// ─── Mobile Row Field ─────────────────────────────────────────────────────────
const MobileField = ({ label, children }) => (
  <div className="flex items-center justify-between gap-3 border-b border-gray-50 py-2.5 last:border-b-0">
    <span className="shrink-0 text-xs font-medium text-[#8C9198]">{label}</span>
    <span className="text-left text-sm font-medium text-[#575F69]">{children}</span>
  </div>
);

const TABLE_HEADERS = [
  "عنوان الواجب",
  "المجموعة",
  "المادة",
  "الحصة",
  "موعد التسليم",
  "تم التسليم",
  "حالة الواجب",
  "حالة التصحيح",
  "الإجراءات",
];

const AssignmentsTable = ({ assignments = [], onView }) => {
  const navigate = useNavigate();

  // Default navigation: go to the assignment details page.
  // Caller can still override by passing a custom onView prop.
  const handleView = (assignmentId) => {
    if (onView) {
      onView(assignmentId);
    } else {
      navigate(`/teacher/assignments/${assignmentId}`);
    }
  };

  if (assignments.length === 0) {
    return (
      <div
        dir="rtl"
        className="w-full rounded-2xl border border-gray-200 bg-white py-14 text-center text-sm text-[#575F69] shadow-sm sm:text-base"
      >
        لا توجد واجبات متاحة
      </div>
    );
  }

  return (
    <div dir="rtl" className="w-full font-['IBM_Plex_Sans_Arabic']">
      {/* Desktop table — table-fixed with relative widths so it always fits the
          container's width with no horizontal scroll; long text truncates instead. */}
      <div className="hidden overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm md:block">
        <table className="w-full table-fixed text-right">
          <colgroup>
            <col className="w-[15%]" />
            <col className="w-[11%]" />
            <col className="w-[9%]" />
            <col className="w-[8%]" />
            <col className="w-[11%]" />
            <col className="w-[7%]" />
            <col className="w-[12%]" />
            <col className="w-[12%]" />
            <col className="w-[9%]" />
          </colgroup>
          <thead>
            <tr className="border-b border-gray-100 bg-[#F9FAFB]">
              {TABLE_HEADERS.map((header) => (
                <th
                  key={header}
                  className="truncate px-2 py-3 text-right text-[13px] font-semibold text-[#575F69] lg:px-3"
                  title={header}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {assignments.map((a) => (
              <tr key={a.id} className="transition-colors hover:bg-[#F9FAFB]">
                <td className="px-2 py-3 lg:px-3">
                  <button
                    type="button"
                    onClick={() => handleView(a.id)}
                    title={a.title}
                    className="block w-full truncate text-right font-['Tajawal'] text-[15px] font-medium text-[#123C91] hover:underline"
                  >
                    {a.title}
                  </button>
                </td>

                {[a.group, a.subject, a.lesson, a.dueDate].map((cellData, index) => (
                  <td
                    key={index}
                    title={cellData || undefined}
                    className="truncate px-2 py-3 text-[14px] leading-6 text-[#575F69] lg:px-3"
                  >
                    {cellData || "—"}
                  </td>
                ))}

                <td className="truncate px-2 py-3 text-[14px] leading-6 text-[#575F69] lg:px-3">
                  {a.submitted}/{a.totalStudents}
                </td>

                <td className="px-2 py-3 lg:px-3">
                  {assignmentStatusBadge(a.status, a.timeRemaining)}
                </td>
                <td className="px-2 py-3 lg:px-3">{correctionStatusBadge(a.correctionStatus)}</td>

                <td className="px-2 py-3 text-center lg:px-3">
                  <ViewAction assignmentId={a.id} onView={handleView} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {assignments.map((a) => (
          <div key={a.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => handleView(a.id)}
                className="text-right font-['Tajawal'] text-[16px] font-semibold text-[#123C91] hover:underline"
              >
                {a.title}
              </button>
              <ViewAction assignmentId={a.id} onView={handleView} />
            </div>

            <div className="mb-3 flex flex-wrap items-center gap-2">
              {assignmentStatusBadge(a.status, a.timeRemaining)}
              {correctionStatusBadge(a.correctionStatus)}
            </div>

            <div className="space-y-0.5">
              <MobileField label="المجموعة">{a.group}</MobileField>
              <MobileField label="المادة">{a.subject || "—"}</MobileField>
              <MobileField label="المكان">{a.place || "—"}</MobileField>
              <MobileField label="الحصة">{a.lesson}</MobileField>
              <MobileField label="موعد التسليم">{a.dueDate}</MobileField>
              <MobileField label="تم التسليم">
                {a.submitted}/{a.totalStudents}
              </MobileField>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssignmentsTable;