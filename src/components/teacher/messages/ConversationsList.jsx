import { Plus, Search } from "lucide-react";

// ⚠️ الـ key هنا لازم يطابق قيمة category اللي بيرجعها normalizeRoom في useChatRooms.js
// الباك إند بيرجع type: "classroom" أو "support"، وnormalizeRoom بيحولها لـ:
//   support   -> "admin"
//   classroom -> "classroom"
const filters = [
  { key: "all", label: "الكل" },
  { key: "classroom", label: "الفصول الدراسية" },
  { key: "admin", label: "الإدارة" },
];

export default function ConversationsList({
  conversations,
  activeId,
  onSelect,
  onNewConversation,
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
}) {
  const filtered = conversations.filter((c) => {
    const matchesFilter = activeFilter === "all" || c.category === activeFilter;
    const matchesSearch =
      c.name.includes(searchQuery) ||
      (c.studentName ?? "").includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex w-full flex-col md:max-w-85 md:border-r md:border-gray-100">
      <div className="flex items-center justify-between p-4 pb-3">
        <h2 className="text-base font-bold text-slate-800">المحادثات</h2>
        <button
          type="button"
          onClick={onNewConversation}
          aria-label="تواصل مع الإدارة"
          className="flex h-9 items-center justify-center gap-1.5 rounded-lg bg-blue-900 px-3 text-xs font-medium text-white hover:bg-blue-800"
        >
          <Plus size={16} />
          <span>تواصل مع الإدارة</span>
        </button>
      </div>

      <div className="px-4 pb-3">
        <div className="relative">
          <Search
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="ابحث عن فصل أو طالب..."
            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pr-9 pl-3 text-sm text-slate-700 placeholder:text-gray-400 focus:border-blue-300 focus:outline-none focus:ring-1 focus:ring-blue-300"
          />
        </div>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto px-4 pb-3 md:gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => onFilterChange(f.key)}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors md:px-4 md:text-sm ${
              activeFilter === f.key
                ? "bg-blue-900 text-white"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto px-3 pb-4">
        {filtered.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-gray-400">
            لا توجد محادثات مطابقة
          </p>
        ) : (
          filtered.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelect(c.id)}
              className={`flex w-full items-start gap-3 rounded-xl border p-3 text-right shadow-sm transition-colors ${
                c.id === activeId
                  ? "border-blue-200 bg-blue-50"
                  : c.unreadCount > 0
                    ? "border-red-200 bg-red-50/80 ring-1 ring-red-100"
                    : "border-gray-100 bg-white hover:bg-gray-50"
              }`}
            >
              {/* Avatar */}
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-900 text-sm font-bold text-white">
                {c.avatarInitial}
              </span>

              {/* Content */}
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                {/* Row 1: name + time */}
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-sm font-semibold text-slate-800">
                    {c.name}
                    <span className="mr-1 font-normal text-gray-400">
                      ({c.role})
                    </span>
                  </span>
                  <span className="shrink-0 text-[11px] text-gray-400">
                    {c.lastMessageTime}
                  </span>
                </div>

                {/* Row 2: student name (if present) */}
                {c.studentName && (
                  <p className="truncate text-xs text-gray-400">
                    الطالب: {c.studentName}
                  </p>
                )}

                {/* Row 3: last message preview + unread badge */}
                <div className="flex items-center justify-between gap-2">
                  <p className="line-clamp-1 min-h-4.5 flex-1 truncate text-xs text-gray-500">
                    {c.lastMessagePreview || "لا توجد رسائل بعد"}
                  </p>
                  {c.unreadCount > 0 && (
                    <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white shadow-sm">
                      {c.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
