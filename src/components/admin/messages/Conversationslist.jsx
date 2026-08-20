import { useMemo, useState } from "react";
import { Inbox, Plus, Search, X } from "lucide-react";
import { getUsers } from "../../../services/APIService";

const filters = [
  { key: "all", label: "الكل" },
  { key: "teachers", label: "المعلمون" },
  { key: "students", label: "الطلاب" },
  { key: "parents", label: "أولياء الأمور" },
];

export default function ConversationsLists({
  conversations,
  activeId,
  onSelect,
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  onCreateChat,
  mode = "chat",
}) {
  const [showNewChat, setShowNewChat] = useState(false);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [creatingId, setCreatingId] = useState(null);
  const [userSearch, setUserSearch] = useState("");
  const [error, setError] = useState("");

  const openNewChat = async () => {
    setShowNewChat(true);
    if (users.length) return;
    setUsersLoading(true);
    setError("");
    try {
      const res = await getUsers({ page: 1, limit: 100 });
      const body = res.data ?? {};
      const list = body.data ?? body.users ?? (Array.isArray(body) ? body : []);
      setUsers(
        list.filter(
          (user) =>
            !user.isDeleted &&
            ["student", "teacher", "parent"].includes(user.role),
        ),
      );
    } catch {
      setError("تعذر تحميل المستخدمين");
    } finally {
      setUsersLoading(false);
    }
  };

  const matchingUsers = useMemo(() => {
    const query = userSearch.trim().toLowerCase();
    if (!query) return users;
    return users.filter((user) =>
      [user.fullName, user.name, user.email, user.username]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [users, userSearch]);

  const roleLabel = { student: "طالب", teacher: "معلم", parent: "ولي أمر" };

  const createChat = async (user) => {
    const userId = user.id ?? user._id;
    setCreatingId(userId);
    setError("");
    const created = await onCreateChat?.(userId);
    setCreatingId(null);
    if (created) {
      setShowNewChat(false);
      setUserSearch("");
    } else {
      setError("تعذر إنشاء محادثة الدعم");
    }
  };
  const filtered = conversations.filter((c) => {
    const matchesSearch =
      (c.name ?? "").includes(searchQuery) ||
      (c.teacherName ?? "").includes(searchQuery) ||
      (c.parentName ?? "").includes(searchQuery) ||
      (c.role ?? "").includes(searchQuery);
    return matchesSearch;
  });

  return (
    <div className="flex h-full w-full flex-col" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between px-3 pb-2.5 pt-3.5 sm:px-4 sm:pb-3 sm:pt-4">
        <h2 className="text-[15px] font-bold text-slate-800 font-['IBM_Plex_Sans_Arabic'] sm:text-base">
          المحادثات
        </h2>
        {mode === "chat" && (
          <button
            type="button"
            aria-label="محادثة جديدة"
            onClick={openNewChat}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#123C91] text-white [&_svg]:text-white transition-colors hover:bg-[#0f2f70]"
          >
            <Plus size={18} />
          </button>
        )}
      </div>

      {/* Search */}
      <div className="px-3 pb-2.5 sm:px-4 sm:pb-3">
        <div className="relative">
          <Search
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={
              mode === "chat"
                ? "ابحث عن معلم او مجموعة..."
                : "ابحث عن معلم او طالب..."
            }
            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-3 pr-9 text-[13px] text-slate-700 placeholder:text-gray-400 focus:border-[#123C91] focus:outline-none focus:ring-1 focus:ring-[#123C91] font-['IBM_Plex_Sans_Arabic'] sm:py-2 sm:text-sm"
          />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="scrollbar-none flex items-center gap-1.5 overflow-x-auto px-3 pb-3 sm:px-4">
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => onFilterChange(f.key)}
            className={`shrink-0 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors font-['IBM_Plex_Sans_Arabic']
              ${
                activeFilter === f.key
                  ? "bg-[#123C91] text-white [&_svg]:text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 space-y-2 overflow-y-auto px-2.5 pb-4 sm:px-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-50">
              <Inbox size={18} className="text-gray-300" />
            </div>
            <p className="text-sm text-gray-400 font-['IBM_Plex_Sans_Arabic']">
              لا توجد محادثات مطابقة
            </p>
          </div>
        ) : (
          filtered.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelect(c.id)}
              className={`w-full rounded-xl border p-3 text-right shadow-sm transition-colors font-['IBM_Plex_Sans_Arabic']
                ${
                  c.id === activeId
                    ? "border-blue-200 bg-blue-50"
                    : c.unreadCount > 0
                      ? "border-red-200 bg-red-50/80 ring-1 ring-red-100"
                      : "border-gray-100 bg-white hover:bg-gray-50"
                }`}
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#123C91] text-white [&_svg]:text-white text-sm font-bold text-white">
                    {c.avatarInitial}
                  </span>
                  <div className="min-w-0 text-right">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {c.name}
                    </p>
                    {mode === "monitor" && (
                      <p className="truncate text-[11px] text-gray-400">
                        معلم ←&nbsp;ولي أمر
                      </p>
                    )}
                    {mode === "chat" && (
                      <p className="truncate text-[11px] text-gray-400">
                        {c.role}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <span className="whitespace-nowrap text-xs text-gray-400">
                    {c.lastMessageTime}
                  </span>
                  {c.unreadCount > 0 && (
                    <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white shadow-sm">
                      {c.unreadCount}
                    </span>
                  )}
                </div>
              </div>

              {/* Preview */}
              <p className="mt-1.5 truncate text-xs text-gray-500 text-right">
                {c.lastMessagePreview}
              </p>
            </button>
          ))
        )}
      </div>

      {showNewChat && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 p-4"
          dir="rtl"
        >
          <div className="flex max-h-[620px] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 p-4">
              <div>
                <h3 className="font-semibold text-slate-800">
                  محادثة دعم جديدة
                </h3>
                <p className="mt-0.5 text-xs text-gray-400">
                  اختر المستخدم الذي تريد مراسلته
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowNewChat(false)}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
                aria-label="إغلاق"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-4">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="ابحث بالاسم أو البريد الإلكتروني..."
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pr-9 pl-3 text-sm focus:border-[#123C91] focus:outline-none"
                  autoFocus
                />
              </div>
            </div>
            <div className="min-h-40 flex-1 overflow-y-auto px-3 pb-4">
              {usersLoading ? (
                <p className="py-10 text-center text-sm text-gray-400">
                  جاري تحميل المستخدمين...
                </p>
              ) : error ? (
                <p className="py-10 text-center text-sm text-red-500">
                  {error}
                </p>
              ) : matchingUsers.length === 0 ? (
                <p className="py-10 text-center text-sm text-gray-400">
                  لا يوجد مستخدمون مطابقون
                </p>
              ) : (
                matchingUsers.map((user) => {
                  const id = user.id ?? user._id;
                  const name =
                    user.fullName ?? user.name ?? user.username ?? "مستخدم";
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => createChat(user)}
                      disabled={creatingId !== null}
                      className="flex w-full items-center gap-3 rounded-xl p-3 text-right hover:bg-blue-50 disabled:opacity-60"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#123C91] text-white [&_svg]:text-white font-bold text-white">
                        {name.trim().charAt(0)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-slate-800">
                          {name}
                        </span>
                        <span className="block truncate text-xs text-gray-400">
                          {roleLabel[user.role] ?? user.role}
                          {user.email ? ` · ${user.email}` : ""}
                        </span>
                      </span>
                      {creatingId === id && (
                        <span className="text-xs text-[#123C91]">
                          جاري الإنشاء...
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
