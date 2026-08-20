import { Users, Calendar, MessageCircle, UserPlus, Share2 } from "lucide-react";
const StatusBadge = ({ status }) => {
  const styles = {
    "نشطة": "bg-[#00A63E26] bg-opacity-[0.15] text-[#00A63E]",
    "معلقة": "bg-[#D32F2F26] bg-opacity-[0.15] text-[#D32F2F]",
    "قيد التسجيل": "bg-[#F59E0B26] bg-opacity-[0.15] text-[#F59E0B]",
  };

  return (
    <span className={`text-[12px] font-medium px-4 py-1 rounded-[999px] ${styles[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
};

const GroupCard = ({ group, onViewLessons, onViewStudents, onOpenChat, onAddStudent, onShare }) => (
  <div className="bg-white rounded-2xl border border-[#E5E5E5] p-6 flex flex-col gap-3 w-full ">

  
    <div className="flex items-center justify-between">
      <StatusBadge status={group.status} />
      <div className="flex gap-2.5 text-[#575F69]">
        {/* <button onClick={() => onDelete(group.id)} className="hover:text-red-500"><Trash2 size={18} /></button>
        <button onClick={() => onEdit(group.id)} className="hover:text-blue-600"><Edit3 size={18} /></button> */}
      </div>
    </div>

    
    <div>
      <h3 className="text-[#1F2937] text-[16px] font-medium leading-6 mb-2">{group.name}</h3>
      <p className="text-[#575F69] text-[14px] font-normal leading-4">{group.grade} • {group.subject}</p>
    </div>

    <div className="border border-[#E5E5E5]"></div>
    {/* Stats: Enrollment */}
    <div className="flex items-center gap-2 text-[#575F69] text-[14px] font-normal">
      <Users size={16}  className="text-[#123C91]"/>
      <span>{group.enrolled} / {group.max} طالباً</span>
    </div>

    {/* Stats: Next Lesson */}
    <div className="flex items-center gap-2 text-[#575F69] text-[14px] font-normal">
      <Calendar size={16}  className="text-[#123C91]"/>
      <span>{group.nextLesson}</span>
    </div>

    {/* Footer: Action Buttons */}
    <div className="grid grid-cols-2 gap-3 mt-2">
      <button
        onClick={() => onViewLessons(group.id)}
        className="col-span-2 bg-[#123C91] text-white [&_svg]:text-white rounded-xl py-2.5 text-[14px] font-medium hover:bg-blue-900 transition"
      >
        الحصص
      </button>
      <button
        onClick={() => onViewStudents(group.id)}
        className="border border-[#E5E5E5] text-[#1F2937] rounded-xl py-2.5 text-[14px] font-medium hover:bg-gray-50 transition"
      >
        الطلاب
      </button>
      <button
        type="button"
        onClick={() => onAddStudent && onAddStudent(group)}
        aria-label={`إضافة طالب إلى ${group.name}`}
        title="إضافة طالب"
        className="flex items-center justify-center gap-2 border border-[#E5E5E5] text-[#123C91] rounded-xl px-3 py-2.5 hover:bg-[#EAF4FF] transition"
      >
        <UserPlus size={18} />
        إضافة طالب
      </button>
      <button
        type="button"
        onClick={() => onShare && onShare(group)}
        aria-label={`مشاركة مجموعة ${group.name}`}
        title="مشاركة المجموعة"
        className="flex items-center justify-center gap-2 border border-[#E5E5E5] text-[#123C91] rounded-xl px-3 py-2.5 hover:bg-[#EAF4FF] transition"
      >
        <Share2 size={18} />
        مشاركة
      </button>
      <button
        type="button"
        onClick={() => onOpenChat(group)}
        aria-label={`فتح شات مجموعة ${group.name}`}
        title="شات المجموعة"
        className="flex items-center justify-center border border-[#E5E5E5] text-[#123C91] rounded-xl px-3 py-2.5 hover:bg-[#EAF4FF] transition"
      >
        <MessageCircle size={18} />
      </button>
    </div>
  </div>
);

export default GroupCard;
