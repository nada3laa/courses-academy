// ─── Mobile Row Field ─────────────────────────────────────────────────────────
const MobileField = ({ label, children, highlight }) => (
  <div className="flex items-center justify-between gap-3 py-2.5 border-b border-gray-50 last:border-b-0">
    <span className="text-xs font-medium text-[#8C9198] shrink-0">{label}</span>
    <span className={`text-sm font-medium text-left ${highlight ? "text-red-500" : "text-[#575F69]"}`}>
      {children}
    </span>
  </div>
);

const AttendanceTable = ({ records = [] }) => {
  if (records.length === 0) {
    return (
      <div
        dir="rtl"
        className="w-full bg-white rounded-2xl border border-gray-200 shadow-sm py-12 text-center text-sm sm:text-base text-[#575F69]"
      >
        لا توجد سجلات حضور متاحة
      </div>
    );
  }

  return (
    <div dir="rtl" className="w-full">
      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-150 text-right">
            <thead>
              <tr
                style={{
                  backgroundColor: "#F9FAFA",
                  fontFamily: "IBM Plex Sans Arabic, sans-serif",
                }}
              >
                {["اسم الطالب", "عدد الحضور", "عدد الغياب", "عدد التأخير", "بعذر"].map((header) => (
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
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50/80 transition-colors">
                  <td
                    className="px-4 lg:px-6 py-3 lg:py-4 text-[#575F69]"
                    style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 500, fontSize: "16px", lineHeight: "20px" }}
                  >
                    {r.studentName}
                  </td>

                  <td
                    className="px-4 lg:px-6 py-3 lg:py-4 text-[#575F69] whitespace-nowrap"
                    style={{
                      fontFamily: "IBM Plex Sans Arabic, sans-serif",
                      fontWeight: 400,
                      fontSize: "14px",
                      lineHeight: "24px",
                    }}
                  >
                    {r.attendanceCount}
                  </td>

                  <td
                    className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap"
                    style={{
                      fontFamily: "IBM Plex Sans Arabic, sans-serif",
                      fontWeight: 500,
                      fontSize: "14px",
                      lineHeight: "24px",
                      color: r.absenceCount > 0 ? "#EF4444" : "#575F69",
                    }}
                  >
                    {r.absenceCount}
                  </td>

                  <td
                    className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap"
                    style={{
                      fontFamily: "IBM Plex Sans Arabic, sans-serif",
                      fontWeight: 500,
                      fontSize: "14px",
                      lineHeight: "24px",
                      color: r.lateCount > 0 ? "#B45309" : "#575F69",
                    }}
                  >
                    {r.lateCount}
                  </td>

                  <td
                    className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap"
                    style={{
                      fontFamily: "IBM Plex Sans Arabic, sans-serif",
                      fontWeight: 500,
                      fontSize: "14px",
                      lineHeight: "24px",
                      color: r.excusedCount > 0 ? "#123C91" : "#575F69",
                    }}
                  >
                    {r.excusedCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {records.map((r) => (
          <div key={r.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <h4 className="text-[#1A1A1A] font-semibold text-[16px] mb-2" style={{ fontFamily: "Tajawal, sans-serif" }}>
              {r.studentName}
            </h4>
            <div className="space-y-0.5">
              <MobileField label="عدد الحضور">{r.attendanceCount}</MobileField>
              <MobileField label="عدد الغياب" highlight={r.absenceCount > 0}>
                {r.absenceCount}
              </MobileField>
              <MobileField label="عدد التأخير" highlight={r.lateCount > 0}>
                {r.lateCount}
              </MobileField>
              <MobileField label="بعذر">{r.excusedCount}</MobileField>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AttendanceTable;
