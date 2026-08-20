// ─── Badge Helper ─────────────────────────────────────────────────────────────
const Badge = ({ label, type }) => {
  const map = {
    green: "bg-[#00A63E26] text-[#00A63E]",
    red: "bg-[#D32F2F26] text-[#D32F2F]",
    orange: "bg-[#FF8A0026] text-[#FF8A00]",
    blue: "bg-[#EAF4FF] text-[#123C91]",
    gray: "bg-gray-100 text-gray-500",
  };
  return (
    <span
      className={`inline-flex items-center justify-center px-3 py-1 text-[11px] md:text-xs font-semibold rounded-full whitespace-nowrap ${
        map[type] ?? map.gray
      }`}
    >
      {label}
    </span>
  );
};

const attendanceBadge = (v) => {
  if (v === "حاضر") return <Badge label={v} type="green" />;
  if (v === "متأخر") return <Badge label={v} type="orange" />;
  if (v === "بعذر") return <Badge label={v} type="blue" />;
  return <Badge label={v} type="red" />;
};

const homeworkBadge = (v) => {
  if (v === "تم التسليم" || v === "تم تسليم") return <Badge label={v} type="green" />;
  if (v === "لا يوجد واجب") return <Badge label={v} type="gray" />;
  return <Badge label={v} type="orange" />;
};

// ─── Mobile Row Field ─────────────────────────────────────────────────────────
const MobileField = ({ label, children }) => (
  <div className="flex items-center justify-between gap-3 py-2.5 border-b border-gray-50 last:border-b-0">
    <span className="text-xs font-medium text-[#8C9198] shrink-0">{label}</span>
    <span className="text-sm text-[#575F69] font-medium text-left">{children}</span>
  </div>
);

// ─── StudentLessonsTable ──────────────────────────────────────────────────────
/**
 * Props:
 *  lessons: Array<{
 *    id, title, date,
 *    attendance, homeworkStatus, grade
 *  }>
 */
const StudentLessonsTable = ({ lessons = [] }) => {
  if (lessons.length === 0) {
    return (
      <div
        dir="rtl"
        className="w-full bg-white rounded-2xl border border-gray-200 shadow-sm py-12 text-center text-sm sm:text-base text-[#575F69]"
      >
        لا توجد بيانات
      </div>
    );
  }

  return (
    <div dir="rtl" className="w-full">
      {/* ── Desktop / Tablet table (md and up) ───────────────────────────── */}
      <div className="hidden md:block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-190 text-right">
            <thead>
              <tr
                style={{
                  backgroundColor: "#F9FAFA",
                  fontFamily: "IBM Plex Sans Arabic, sans-serif",
                }}
              >
                {["اسم الحصة", "التاريخ", "الحضور", "حالة الواجب", "الدرجة"].map(
                  (header) => (
                    <th
                      key={header}
                      className="px-4 lg:px-6 py-3 lg:py-4 text-[#575F69] text-[13px] lg:text-[14px] font-medium text-right uppercase tracking-wider whitespace-nowrap"
                      style={{ fontWeight: 500, lineHeight: "16px" }}
                    >
                      {header}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {lessons.map((lesson) => (
                <tr key={lesson.id} className="hover:bg-gray-50/80 transition-colors">
                  <td
                    className="px-4 lg:px-6 py-3 lg:py-4 text-[#575F69]"
                    style={{
                      fontFamily: "Tajawal, sans-serif",
                      fontWeight: 500,
                      fontSize: "16px",
                      lineHeight: "20px",
                    }}
                  >
                    {lesson.title}
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
                    {lesson.date}
                  </td>

                  <td className="px-4 lg:px-6 py-3 lg:py-4">{attendanceBadge(lesson.attendance)}</td>
                  <td className="px-4 lg:px-6 py-3 lg:py-4">{homeworkBadge(lesson.homeworkStatus)}</td>

                  <td
                    className="px-4 lg:px-6 py-3 lg:py-4 text-[#575F69] font-medium whitespace-nowrap"
                    style={{
                      fontFamily: "IBM Plex Sans Arabic, sans-serif",
                      fontSize: "14px",
                      lineHeight: "24px",
                    }}
                  >
                    {lesson.grade}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Mobile cards (below md) ───────────────────────────────────────── */}
      <div className="md:hidden space-y-3">
        {lessons.map((lesson) => (
          <div
            key={lesson.id}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <h4
                className="text-[#1A1A1A] font-semibold text-[16px]"
                style={{ fontFamily: "Tajawal, sans-serif" }}
              >
                {lesson.title}
              </h4>
              {attendanceBadge(lesson.attendance)}
            </div>

            <p className="text-xs text-[#8C9198] mb-3">{lesson.date}</p>

            <div className="space-y-0.5">
              <MobileField label="حالة الواجب">{homeworkBadge(lesson.homeworkStatus)}</MobileField>
              <MobileField label="الدرجة">{lesson.grade}</MobileField>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentLessonsTable;
