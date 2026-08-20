import { HiOutlineEye } from "react-icons/hi";

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const styles = {
    "نشط": "bg-[#00A63E26] text-[#00A63E]",
    "مستبعد": "bg-[#D32F2F26] text-[#D32F2F]",
    "معلق": "bg-[#FF8A0026] text-[#FF8A00]",
  };

  return (
    <span
      className={`inline-flex items-center justify-center px-3 py-1 text-[11px] md:text-xs font-semibold rounded-full whitespace-nowrap ${
        styles[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
};

// ─────────────────────────────────────────────────────────────
// Action Button (Styled to fit the table)
// ─────────────────────────────────────────────────────────────
const ActionButton = ({ children, onClick, colorClass = "" }) => (
  <button
    onClick={onClick}
    className={`p-2 flex items-center justify-center rounded-lg transition-all duration-200 ${colorClass}`}
  >
    {children}
  </button>
);

// ─── Mobile Row Field ─────────────────────────────────────────────────────────
const MobileField = ({ label, children }) => (
  <div className="flex items-center justify-between gap-3 py-2.5 border-b border-gray-50 last:border-b-0">
    <span className="text-xs font-medium text-[#8C9198] shrink-0">{label}</span>
    <span className="text-sm text-[#575F69] font-medium text-left">{children}</span>
  </div>
);

// ─────────────────────────────────────────────────────────────
// Students Table
// ─────────────────────────────────────────────────────────────
/**
 * Props:
 *  students: Array<{ id, name, joinDate, parent, status }>
 *  onView: (id) => void
 */
const StudentsTable = ({ students = [], onView }) => {
  if (students.length === 0) {
    return (
      <div
        dir="rtl"
        className="w-full bg-white rounded-2xl border border-gray-200 shadow-sm py-12 text-center text-sm sm:text-base text-[#575F69]"
      >
        لا يوجد طلاب
      </div>
    );
  }

  return (
    <div dir="rtl" className="w-full">
      {/* ── Desktop / Tablet table (md and up) ───────────────────────────── */}
      <div className="hidden md:block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-170 text-right">
            <thead>
              <tr
                style={{
                  backgroundColor: "#F9FAFA",
                  fontFamily: "IBM Plex Sans Arabic, sans-serif",
                }}
              >
                {["اسم الطالب", "تاريخ الإنضمام", "ولي الأمر", "الحالة", "الإجراءات"].map((header) => (
                  <th
                    key={header}
                    className="px-4 lg:px-6 py-3 lg:py-4 text-[#575F69] text-[13px] lg:text-[14px] font-medium text-right uppercase tracking-wider whitespace-nowrap"
                    style={{ fontWeight: 500, lineHeight: "16px" }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50/80 transition-colors">
                  {/* اسم الطالب */}
                  <td
                    className="px-4 lg:px-6 py-3 lg:py-4 text-[#575F69]"
                    style={{
                      fontFamily: "Tajawal, sans-serif",
                      fontWeight: 500,
                      fontSize: "16px",
                      lineHeight: "20px",
                    }}
                  >
                    {student.name}
                  </td>

                  {[student.joinDate, student.parent].map((cellData, index) => (
                    <td
                      key={index}
                      className="px-4 lg:px-6 py-3 lg:py-4 text-[#575F69] whitespace-nowrap"
                      style={{
                        fontFamily: "IBM Plex Sans Arabic, sans-serif",
                        fontWeight: 400,
                        fontSize: "14px",
                        lineHeight: "24px",
                      }}
                    >
                      {cellData}
                    </td>
                  ))}

                  <td className="px-4 lg:px-6 py-3 lg:py-4">
                    <StatusBadge status={student.status} />
                  </td>

                  <td className="px-4 lg:px-6 py-3 lg:py-4">
                    <div className="flex items-center gap-2">
                      <ActionButton onClick={() => onView?.(student.id)} colorClass="text-[#575F69] hover:text-blue-600">
                        <HiOutlineEye size={18} />
                      </ActionButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Mobile cards (below md) ───────────────────────────────────────── */}
      <div className="md:hidden space-y-3">
        {students.map((student) => (
          <div key={student.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <h4
                className="text-[#1A1A1A] font-semibold text-[16px]"
                style={{ fontFamily: "Tajawal, sans-serif" }}
              >
                {student.name}
              </h4>
              <StatusBadge status={student.status} />
            </div>

            <div className="space-y-0.5">
              <MobileField label="تاريخ الإنضمام">{student.joinDate}</MobileField>
              <MobileField label="ولي الأمر">{student.parent}</MobileField>
            </div>

            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
              <ActionButton onClick={() => onView?.(student.id)} colorClass="text-[#575F69] hover:text-blue-600 bg-gray-50 flex-1 justify-center">
                <HiOutlineEye size={18} />
                <span className="text-xs font-medium mr-1">عرض</span>
              </ActionButton>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentsTable;
