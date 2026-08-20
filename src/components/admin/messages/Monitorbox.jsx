import { useEffect, useRef } from "react";
import { ArrowRight, Trash2, Eye } from "lucide-react";

const bubbleStyle = (sender) => {
  if (sender === "teacher") return "rounded-tr-sm bg-[#123C91] text-white [&_svg]:text-white ml-auto";
  return "rounded-tl-sm border border-blue-100 bg-[#EAF4FF] text-slate-700 mr-auto";
};

const timeStyle = (sender) =>
  sender === "teacher" ? "text-blue-200 justify-end" : "text-gray-400 justify-start";

export default function MonitorBox({ conversation, onBack }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages?.length]);

  if (!conversation) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-50">
          <Eye size={20} className="text-gray-300" />
        </div>
        <p className="text-sm text-gray-400 font-['IBM_Plex_Sans_Arabic']">
          اختر محادثة لعرض الرسائل
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-gray-100 px-3 py-3 sm:gap-3 sm:px-4 sm:py-4">
        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-gray-100 md:hidden"
            aria-label="رجوع"
          >
            <ArrowRight size={18} />
          </button>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#123C91] text-white [&_svg]:text-white text-sm font-bold text-white sm:h-10 sm:w-10">
            {conversation.avatarInitial}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold text-slate-800 font-['IBM_Plex_Sans_Arabic'] sm:text-[15px]">
              {conversation.teacherName}
              <span className="mx-1.5 text-gray-400">←</span>
              {conversation.parentName}
            </p>
            <p className="truncate text-[11px] text-gray-400 font-['IBM_Plex_Sans_Arabic'] sm:text-[12px]">
              معلم &nbsp;←&nbsp; ولي أمر
            </p>
          </div>
        </div>

        <button
          type="button"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-red-400 transition-colors hover:bg-red-50 hover:text-red-600"
          aria-label="حذف المحادثة"
        >
          <Trash2 size={17} />
        </button>
      </div>

      {/* Messages — read only */}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-3 sm:p-5">
        <div className="mt-auto space-y-3 sm:space-y-4">
          {conversation.messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === "teacher" ? "items-end" : "items-start"}`}
            >
              <span className="mb-1 px-1 text-[10px] text-gray-400 font-['IBM_Plex_Sans_Arabic'] sm:text-[11px]">
                {m.senderName} · {m.senderRole}
              </span>

              <div className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 sm:max-w-[72%] sm:px-4 sm:py-3 ${bubbleStyle(m.sender)}`}>
                <p className="whitespace-pre-wrap break-words text-[13px] leading-relaxed font-['IBM_Plex_Sans_Arabic'] sm:text-sm">
                  {m.text}
                </p>
                <div className={`mt-1 flex items-center gap-1 ${timeStyle(m.sender)}`}>
                  <span className="text-[10px] sm:text-[11px]">{m.time}</span>
                </div>
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>
      </div>

      {/* Monitor notice bar — no input */}
      <div className="border-t border-[#FDE68A] bg-[#FFFBEB] px-3 py-2.5 sm:px-5 sm:py-3">
        <p className="text-[12px] text-[#B45309] text-center font-['IBM_Plex_Sans_Arabic'] sm:text-[13px]">
          <span className="font-semibold">وضع المراقبة</span> — يمكنك مشاهدة المحادثة وحذف الرسائل غير اللائقة فقط
        </p>
      </div>
    </div>
  );
}