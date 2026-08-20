import { HiOutlineEye, HiOutlineStop } from "react-icons/hi";
import { useNavigate } from "react-router-dom";

const StatusBadge = ({ status }) => {
  const styles = {
    "مجدولة — لم تبدأ بعد": "bg-[#EAF4FF] text-[#123C91] ",
    "مباشر الآن": "bg-[#00A63E26] text-[#00A63E] ",
    "منتهية": "bg-blue-100 text-[#123C91] ",
    "ملغية": "bg-[#1F293726] text-[#1F2937] ",
    "بدأت متأخرة": "bg-[#FF8A0026] text-[#B45309] ",
    "مؤجلة": "bg-orange-100 text-orange-700 ",
    "لم تُعقد": "bg-red-50 text-red-500 ",
  };

  return (
    <span
      className={`inline-flex items-center justify-center px-3 py-1 text-[11px] md:text-xs font-semibold rounded-full whitespace-nowrap ${styles[status] || "bg-gray-100 text-gray-600"
        }`}
    >
      {status}
    </span>
  );
};

const ActionButton = ({ children, onClick, colorClass = "" }) => (
  <button
    onClick={onClick}
    className={`p-2 flex items-center justify-center rounded-lg transition-all duration-200 ${colorClass}`}
  >
    {children}
  </button>
);

const MobileField = ({ label, children }) => (
  <div className="flex items-center justify-between gap-3 py-2.5 border-b border-gray-50 last:border-b-0">
    <span className="text-xs font-medium text-[#8C9198] shrink-0">{label}</span>
    <span className="text-sm text-[#575F69] font-medium text-left">{children}</span>
  </div>
);

// ⚠️ لازم يتمرر groupId من الصفحة الأب (GroupLessonsPage) عشان الـ navigate
// يبني الرابط الصح ويوصل صفحة التفاصيل بالـ groupId + lessonId الاتنين
const LessonsTable = ({ lessons = [], groupId, role = "teacher", onEndSession, navigationState }) => {
  const navigate = useNavigate();

  const handleView = (lessonId) => {
    if (!lessonId) return;
    if (role === "admin") {
      navigate(`/admin/classrooms/${groupId}/sessions/${lessonId}`);
      return;
    }

    navigate(`/teacher/groups/${groupId}/lessons/${lessonId}`, {
      state: navigationState,
    });
  };

  if (lessons.length === 0) {
    return (
      <div
        dir="rtl"
        className="w-full bg-white rounded-2xl border border-gray-200 shadow-sm py-12 text-center text-sm sm:text-base text-[#575F69]"
      >
        لا توجد حصص متاحة
      </div>
    );
  }

  const attendanceValue = (lesson) =>
    lesson.attendance === 0 && (lesson.absence === 0 || lesson.status === "مجدولة — لم تبدأ بعد") ? "--" : lesson.attendance;
  const absenceValue = (lesson) =>
    lesson.absence === 0 && (lesson.attendance === 0 || lesson.status === "مجدولة — لم تبدأ بعد") ? "--" : lesson.absence;

  return (
    <div dir="rtl" className="w-full">
      {/* ── Desktop / Tablet table (md and up) ───────────────────────────── */}
      <div className="hidden md:block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-205 text-right">
            <thead>
              <tr
                style={{
                  backgroundColor: "#F9FAFA",
                  fontFamily: "IBM Plex Sans Arabic, sans-serif",
                }}
              >
                {["عنوان الحصة", "التاريخ", "الوقت", "المدة", "حضور", "غياب", "الحالة", "الإجراءات"].map((header) => (
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
              {lessons.map((lesson) => (
                <tr key={lesson.id} className="hover:bg-gray-50/80 transition-colors">
                  {/* عنوان الحصة */}
                  <td
                    className="px-4 lg:px-6 py-3 lg:py-4 text-[#575F69]"
                    style={{
                      fontFamily: "Tajawal, sans-serif",
                      fontWeight: 500,
                      fontSize: "16px",
                      lineHeight: "20px",
                    }}
                  >
                    <button
                      onClick={() => handleView(lesson.id)}
                      className="hover:text-[#123C91] hover:underline transition-colors text-right"
                    >
                      {lesson.title}
                    </button>
                  </td>

                  {[lesson.date, lesson.time, lesson.duration, attendanceValue(lesson), absenceValue(lesson)].map(
                    (cellData, index) => (
                      <td
                        key={index}
                        className={`px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap ${index === 1 ? "text-base font-bold text-[#1F2937]" : "text-[15px] font-semibold text-[#575F69]"}`}
                        style={{
                          fontFamily: "IBM Plex Sans Arabic, sans-serif",
                          lineHeight: "24px",
                        }}
                      >
                        {cellData}
                      </td>
                    )
                  )}

                  <td className="px-4 lg:px-6 py-3 lg:py-4">
                    <StatusBadge status={lesson.status} />
                  </td>

                  <td className="px-4 lg:px-6 py-3 lg:py-4">
                    <div className="flex items-center gap-2">
                      <ActionButton
                        onClick={() => handleView(lesson.id)}
                        colorClass="text-[#575F69] hover:text-blue-600"
                      >
                        <HiOutlineEye size={18} />
                      </ActionButton>
                      {role !== "admin" && lesson.rawStatus === "live" && (
                        <ActionButton
                          onClick={() => onEndSession?.(lesson)}
                          colorClass="text-[#575F69] hover:text-red-600"
                        >
                          <HiOutlineStop size={18} />
                        </ActionButton>
                      )}
                      {/* <ActionButton
                        onClick={() => onEdit?.(lesson.id)}
                        colorClass="text-[#575F69] hover:text-amber-600"
                      >
                        <HiOutlinePencil size={18} />
                      </ActionButton> */}
                      {/* <ActionButton
                        onClick={() => onDelete?.(lesson.id)}
                        colorClass="text-[#575F69] hover:text-red-600"
                      >
                        <HiOutlineTrash size={18} />
                      </ActionButton> */}
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
        {lessons.map((lesson) => (
          <div key={lesson.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={() => handleView(lesson.id)}
                className="text-[#1A1A1A] font-semibold text-[16px] hover:text-[#123C91] hover:underline transition-colors text-right"
                style={{ fontFamily: "Tajawal, sans-serif" }}
              >
                {lesson.title}
              </button>
              <StatusBadge status={lesson.status} />
            </div>

            <div className="space-y-0.5">
              <MobileField label="التاريخ">{lesson.date}</MobileField>
              <MobileField label="الوقت">{lesson.time}</MobileField>
              <MobileField label="المدة">{lesson.duration}</MobileField>
              <MobileField label="حضور">{attendanceValue(lesson)}</MobileField>
              <MobileField label="غياب">{absenceValue(lesson)}</MobileField>
            </div>

            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
              <ActionButton
                onClick={() => handleView(lesson.id)}
                colorClass="text-[#575F69] hover:text-blue-600 bg-gray-50 flex-1 justify-center"
              >
                <HiOutlineEye size={18} />
              </ActionButton>
              {role !== "admin" && lesson.rawStatus === "live" && (
                <ActionButton
                  onClick={() => onEndSession?.(lesson)}
                  colorClass="text-[#575F69] hover:text-red-600 bg-gray-50 flex-1 justify-center"
                >
                  <HiOutlineStop size={18} />
                </ActionButton>
              )}
              {/* <ActionButton
                onClick={() => onEdit?.(lesson.id)}
                colorClass="text-[#575F69] hover:text-amber-600 bg-gray-50 flex-1 justify-center"
              >
                <HiOutlinePencil size={18} />
              </ActionButton> */}
              {/* <ActionButton
                onClick={() => onDelete?.(lesson.id)}
                colorClass="text-[#575F69] hover:text-red-600 bg-gray-50 flex-1 justify-center"
              >
                <HiOutlineTrash size={18} />
              </ActionButton> */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LessonsTable;
