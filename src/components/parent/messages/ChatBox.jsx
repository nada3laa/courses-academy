// ChatBox.jsx
import { useEffect, useRef, useState } from "react";
import {
  Send, CheckCheck, ArrowRight,
  MoreVertical, Pencil, Trash2, X, Check, MessageCircle
} from "lucide-react";
import { editMessage, deleteMessage } from "../../../api/chatApi";

export default function ChatBox({ conversation, onSend, onBack }) {
  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [localMessages, setLocalMessages] = useState([]);
  const endRef = useRef(null);
  const menuRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setLocalMessages(conversation?.messages ?? []);
  }, [conversation?.messages]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages.length]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpenId(null);
      }
    };
    if (menuOpenId) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpenId]);

  useEffect(() => {
    if (conversation?.id) inputRef.current?.focus();
  }, [conversation?.id]);

  if (!conversation) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EAF4FF]">
          <MessageCircle size={28} className="text-blue-900 opacity-40" />
        </div>
        <p className="text-[15px] font-medium text-slate-700">اختر محادثة لعرض الرسائل</p>
        <p className="text-sm text-gray-400">ستظهر رسائلك هنا</p>
      </div>
    );
  }

  const roomInactive = conversation.isActive === false;

  const handleSend = () => {
    if (roomInactive) return;
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(conversation.id, trimmed);
    setText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleStartEdit = (msg) => {
    setEditingId(msg.id);
    setEditText(msg.text);
    setMenuOpenId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const handleConfirmEdit = async (msgId) => {
    const trimmed = editText.trim();
    if (!trimmed) return;
    try {
      await editMessage(msgId, trimmed);
      setLocalMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, text: trimmed } : m))
      );
      setEditingId(null);
      setEditText("");
    } catch (err) {
      console.error("فشل تعديل الرسالة:", err);
    }
  };

  const handleDelete = async (msgId) => {
    setMenuOpenId(null);
    try {
      await deleteMessage(msgId);
      setLocalMessages((prev) => prev.filter((m) => m.id !== msgId));
    } catch (err) {
      console.error("فشل حذف الرسالة:", err);
    }
  };

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">

      {/* Header */}
      <div className="flex min-w-0 shrink-0 items-center gap-3 border-b border-gray-100 px-4 py-3.5 md:px-5 md:py-4">
        <button
          type="button"
          onClick={onBack}
          aria-label="رجوع"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-gray-100 md:hidden"
        >
          <ArrowRight size={18} />
        </button>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-900 text-sm font-bold text-white md:h-11 md:w-11">
          {conversation.avatarInitial}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold leading-tight text-slate-800 md:text-base">
            {conversation.name}
          </p>
          <p className="truncate text-xs text-gray-400">{conversation.role}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto px-3 py-4 md:px-6 md:py-5">
        <div className="flex min-h-full min-w-0 flex-col justify-end gap-2.5 md:gap-3">
          {localMessages.length === 0 && (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 py-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EAF4FF]">
                <MessageCircle size={20} className="text-blue-900 opacity-50" />
              </div>
              <p className="text-sm font-medium text-gray-400">لا توجد رسائل بعد</p>
              <p className="text-xs text-gray-300">ابدأ المحادثة الآن</p>
            </div>
          )}

          {localMessages.map((m) => {
            const isMe = m.sender === "me";
            const isEditing = editingId === m.id;
            const menuOpen = menuOpenId === m.id;

            return (
              <div
                key={m.id}
                className={`flex min-w-0 items-end gap-2 ${isMe ? "justify-start" : "justify-end"}`}
              >
                {/* Bubble */}
                <div className={`group relative min-w-0 max-w-[70%] sm:max-w-[75%] md:max-w-[65%] ${isMe ? "mt-2" : ""}`}>

                  {/* Menu button */}
                  {isMe && !isEditing && (
                    <div className="absolute -top-4 left-0 z-10">
                      <button
                        type="button"
                        onClick={() => setMenuOpenId(menuOpen ? null : m.id)}
                        aria-label="خيارات الرسالة"
                        className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 opacity-0 shadow-md transition-all hover:text-gray-600 group-hover:opacity-100 focus-visible:opacity-100"
                      >
                        <MoreVertical size={12} />
                      </button>

                      {menuOpen && (
                        <div
                          ref={menuRef}
                          className="absolute top-7 right-0 z-50 w-36 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-2xl"
                        >
                          <button
                            type="button"
                            onClick={() => handleStartEdit(m)}
                            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-blue-50"
                          >
                            <Pencil size={14} className="text-blue-600" />
                            تعديل
                          </button>
                          <div className="h-px bg-gray-100" />
                          <button
                            type="button"
                            onClick={() => handleDelete(m.id)}
                            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 transition-colors hover:bg-red-50"
                          >
                            <Trash2 size={14} />
                            حذف
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Bubble content */}
                  <div
                    className={`min-w-0 rounded-2xl px-3.5 py-2.5 shadow-sm md:px-4 ${
                      isMe
                        ? "rounded-tl-sm bg-blue-900 text-white"
                        : "rounded-tr-sm border border-blue-100 bg-[#EAF4FF] text-slate-700"
                    }`}
                  >
                    {isEditing ? (
                      <div className="flex w-full min-w-0 items-center gap-2">
                        <input
                          autoFocus
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleConfirmEdit(m.id);
                            if (e.key === "Escape") handleCancelEdit();
                          }}
                          className="min-w-0 flex-1 rounded-lg border border-white/30 bg-white/20 px-2 py-1 text-sm text-white outline-none focus:border-white/70"
                        />
                        <button type="button" onClick={() => handleConfirmEdit(m.id)} aria-label="تأكيد التعديل" className="shrink-0 text-green-300 hover:text-green-200">
                          <Check size={15} />
                        </button>
                        <button type="button" onClick={handleCancelEdit} aria-label="إلغاء التعديل" className="shrink-0 text-blue-200 hover:text-white">
                          <X size={15} />
                        </button>
                      </div>
                    ) : (
                      <p className="wrap-break-word text-sm leading-relaxed md:text-[15px]">{m.text}</p>
                    )}

                    <div className={`mt-1 flex items-center gap-1 ${isMe ? "justify-start" : "justify-end"}`}>
                      <span className={`text-[10px] ${isMe ? "text-blue-200" : "text-gray-400"}`}>
                        {m.time}
                      </span>
                      {isMe && m.status === "read" && (
                        <CheckCheck size={12} className="text-blue-200" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>
      </div>

      {/* Input */}
      {roomInactive ? (
        <div className="border-t border-amber-200 bg-amber-50 px-4 py-4 text-center text-sm font-medium text-amber-700">
          هذه المحادثة غير مفعلة، وغير مسموح بإرسال رسائل فيها.
        </div>
      ) : (
      <div className="flex min-w-0 shrink-0 items-center gap-2 border-t border-gray-100 p-3 md:gap-3 md:p-4">
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="اكتب رسالتك هنا..."
          className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-slate-700 placeholder:text-gray-400 focus:border-blue-300 focus:outline-none focus:ring-1 focus:ring-blue-300 md:text-[15px]"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!text.trim()}
          aria-label="إرسال"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-900 text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-blue-900/40 md:h-auto md:w-auto md:gap-2 md:px-5 md:py-2.5"
        >
          <Send size={16} />
          <span className="hidden text-sm font-medium md:inline">إرسال</span>
        </button>
      </div>
      )}
    </div>
  );
}
