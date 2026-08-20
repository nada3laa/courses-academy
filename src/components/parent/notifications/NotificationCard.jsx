
import { Eye, EyeOff, GraduationCap, Settings, Trash2 } from "lucide-react";

const NotificationCard = ({
  title,
  description,
  time,
  type,
  isRead,
  onToggleRead,
  onOpen,
  onDelete,
}) => {
  const isAcademic = type === "academic";
  const Icon = isAcademic ? GraduationCap : Settings;

  return (
    <div
      dir="rtl"
      onClick={onOpen}
      onKeyDown={(event) => {
        if (onOpen && (event.key === "Enter" || event.key === " ")) onOpen();
      }}
      role={onOpen ? "link" : undefined}
      tabIndex={onOpen ? 0 : undefined}
      className={`border border-[#E5E5E5] rounded-xl p-4 transition-all ${
        isRead ? "bg-white" : "bg-[#EAF4FF]"
      } ${onOpen ? "cursor-pointer hover:border-[#123C91] focus:outline-none focus:ring-2 focus:ring-[#123C91]/30" : ""}`}
    >
      <div className="flex flex-col sm:flex-row gap-4">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
            isAcademic
              ? "bg-[#E1F5EE] text-[#0F6E56]"
              : "bg-[#E6F1FB] text-[#185FA5]"
          }`}
        >
          <Icon size={18} />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] sm:text-[16px] font-medium text-[#1F2937]">
            {title}
          </h3>
          <p className="mt-2 text-[13px] sm:text-[14px] leading-6 text-[#1F2937BF]">
            {description}
          </p>
          <span className="block mt-2 text-[12px] text-[#1F2937BF]">
            {time}
          </span>
        </div>

        <button
          onClick={(event) => {
            event.stopPropagation();
            onToggleRead();
          }}
          className="flex items-center justify-center sm:justify-start gap-1 text-[13px] sm:text-[14px] text-[#1F2937] hover:text-[#123C91] transition-colors self-start sm:self-center"
        >
          {isRead ? <EyeOff size={15} /> : <Eye size={15} />}
          <span>{isRead ? "وضع علامة كغير مقروءة" : "وضع علامة كمقروءة"}</span>
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onDelete();
          }}
          aria-label="حذف الإشعار"
          title="حذف الإشعار"
          className="flex h-9 w-9 shrink-0 items-center justify-center self-start rounded-lg text-[#8C9198] transition-colors hover:bg-red-50 hover:text-red-600 sm:self-center"
        >
          <Trash2 size={17} />
        </button>
      </div>
    </div>
  );
};

export default NotificationCard;
