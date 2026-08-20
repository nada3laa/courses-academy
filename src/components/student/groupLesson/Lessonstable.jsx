import { HiOutlineEye } from "react-icons/hi";

const StatusBadge = ({ status }) => {
  const styles = {
    "مجدولة — لم تبدأ بعد": "bg-[#EAF4FF] text-[#123C91]",
    "مباشر الآن": "bg-[#00A63E26] text-[#00A63E]",
    منتهية: "bg-blue-100 text-[#123C91]",
    ملغية: "bg-[#1F293726] text-[#1F2937]",
    "بدأت متأخرة": "bg-[#FF8A0026] text-[#B45309]",
    مؤجلة: "bg-orange-100 text-orange-700",
    "لم تُعقد": "bg-red-50 text-red-500",
  };
  return (
    <span
      className={`inline-flex items-center justify-center px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
        styles[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
};

const LessonsTable = ({ lessons = [], onView }) => {
  return (
    <div dir="rtl" className="bg-white border border-[#E5E5E5] rounded-2xl overflow-x-auto">
      <table className="w-full text-right min-w-[700px]">
        <thead>
          <tr className="border-b border-[#E5E5E5] text-[#575F69] text-sm">
            <th className="py-4 px-4 font-medium">عنوان الحصة</th>
            <th className="py-4 px-4 font-medium">التاريخ</th>
            <th className="py-4 px-4 font-medium">الوقت</th>
            <th className="py-4 px-4 font-medium">المدة</th>
            <th className="py-4 px-4 font-medium">الحالة</th>
            <th className="py-4 px-4 font-medium">الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {lessons.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-10 text-center text-[#9CA3AF] text-sm">
                لا توجد حصص مطابقة
              </td>
            </tr>
          ) : (
            lessons.map((lesson) => (
              <tr
                key={lesson.id}
                onClick={() => onView?.(lesson.id)}
                className="border-b border-[#F1F1F1] last:border-0 text-[15px] font-semibold text-[#1F2937] hover:bg-gray-50 cursor-pointer transition-all"
              >
                <td className="py-4 px-4 text-base font-bold">{lesson.title}</td>
                <td className="py-4 px-4 text-[#575F69]">{lesson.date}</td>
                <td className="py-4 px-4 text-base font-bold text-[#1F2937]">{lesson.time}</td>
                <td className="py-4 px-4 text-[#575F69]">{lesson.duration} دقيقة</td>
                <td className="py-4 px-4">
                  <StatusBadge status={lesson.status} />
                </td>
                <td className="py-4 px-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onView?.(lesson.id);
                    }}
                    className="p-2 rounded-lg text-[#123C91] hover:bg-[#EAF4FF] transition-all"
                    aria-label="عرض الحصة"
                  >
                    <HiOutlineEye size={18} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default LessonsTable;
