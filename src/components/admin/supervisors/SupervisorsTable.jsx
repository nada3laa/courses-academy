import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { MoreVertical, Pencil, Ban, Trash2 } from "lucide-react";

const StatusBadge = ({ status }) => {
  const isActive = status === "نشط";
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
        isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
      }`}
    >
      {status}
    </span>
  );
};

const roleLabel = (role) => {
  if (role === "super-admin") return "مشرف عام";
  if (role === "admin") return "مشرف";
  return role || "—";
};

/* ─── Actions Dropdown (rendered via portal so it can never be clipped) ──── */
const ActionsMenu = ({ s, onEdit, onToggleSuspend, onDelete }) => {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const menuRef = useRef(null);
  const btnRef = useRef(null);

  const MENU_WIDTH = 176; // w-44

  const computePosition = () => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpward = spaceBelow < 190; // menu height estimate

    // Anchor to the button's right edge (RTL-friendly), clamp to viewport
    let left = rect.right - MENU_WIDTH;
    left = Math.max(8, Math.min(left, window.innerWidth - MENU_WIDTH - 8));

    const top = openUpward ? rect.top - 8 : rect.bottom + 6;

    setCoords({ top, left, openUpward });
  };

  const toggleOpen = () => {
    if (!open) computePosition();
    setOpen((v) => !v);
  };

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        !btnRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    const handleReposition = () => computePosition();

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleReposition, true);
    window.addEventListener("resize", handleReposition);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleReposition, true);
      window.removeEventListener("resize", handleReposition);
    };
  }, [open]);

  const isActive = s.status === "نشط";

  const items = [
    { label: "تعديل", icon: Pencil, onClick: () => onEdit?.(s) },
    {
      label: isActive ? "إيقاف الحساب" : "تفعيل الحساب",
      icon: Ban,
      onClick: () => onToggleSuspend?.(s),
    },
    { label: "حذف", icon: Trash2, onClick: () => onDelete?.(s), danger: true },
  ];

  return (
    <>
      <button
        ref={btnRef}
        onClick={toggleOpen}
        className="p-1.5 rounded-lg hover:bg-[#F3F4F6] text-[#9CA3AF] hover:text-[#1F2937] transition-colors"
      >
        <MoreVertical size={18} />
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            dir="rtl"
            style={{
              position: "fixed",
              top: coords.openUpward ? undefined : coords.top,
              bottom: coords.openUpward
                ? window.innerHeight - coords.top
                : undefined,
              left: coords.left,
              width: MENU_WIDTH,
            }}
            className="z-[999] rounded-xl bg-[#1F2937] shadow-xl py-1.5 animate-in fade-in zoom-in-95 duration-100"
          >
            {items.map(({ label, icon: Icon, onClick, danger }) => (
              <button
                key={label}
                onClick={() => {
                  onClick();
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3.5 py-2.5 text-[13px] text-right transition-colors ${
                  danger
                    ? "text-red-400 hover:bg-red-500/10"
                    : "text-gray-200 hover:bg-white/10"
                }`}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
};

/* ─── Desktop Table Row ─────────────────────────────────────────────────── */
const TableRow = ({ s, onEdit, onToggleSuspend, onDelete }) => (
  <tr className="border-b border-[#E5E5E5] last:border-b-0 hover:bg-[#F9FAFA] transition-colors bg-white">
    <td className="px-4 py-4 text-[14px] font-medium text-[#1F2937]">{s.name}</td>
    <td className="px-4 py-4 text-[14px] text-[#575F69]">{s.email}</td>
    <td className="px-4 py-4 text-[14px] text-[#575F69]" dir="ltr">{s.phone}</td>
    <td className="px-4 py-4 text-[14px] text-[#575F69]">{roleLabel(s.role)}</td>
    <td className="px-4 py-4"><StatusBadge status={s.status} /></td>
    <td className="px-4 py-4">
      <ActionsMenu s={s} onEdit={onEdit} onToggleSuspend={onToggleSuspend} onDelete={onDelete} />
    </td>
  </tr>
);

/* ─── Mobile Card ────────────────────────────────────────────────────────── */
const MobileCard = ({ s, onEdit, onToggleSuspend, onDelete }) => (
  <div className="bg-white border border-[#E5E5E5] rounded-2xl p-4 space-y-3 font-['IBM_Plex_Sans_Arabic']" dir="rtl">
    <div className="flex items-center justify-between">
      <span className="text-[15px] font-medium text-[#1F2937]">{s.name}</span>
      <ActionsMenu s={s} onEdit={onEdit} onToggleSuspend={onToggleSuspend} onDelete={onDelete} />
    </div>

    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[12px] text-[#9CA3AF]">البريد الإلكتروني</span>
        <span className="text-[13px] text-[#575F69]">{s.email}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[12px] text-[#9CA3AF]">رقم الهاتف</span>
        <span className="text-[13px] text-[#575F69]" dir="ltr">{s.phone}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[12px] text-[#9CA3AF]">الصلاحية</span>
        <span className="text-[13px] text-[#575F69]">{roleLabel(s.role)}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[12px] text-[#9CA3AF]">الحالة</span>
        <StatusBadge status={s.status} />
      </div>
    </div>
  </div>
);

/* ─── Main Component ─────────────────────────────────────────────────────── */
const SupervisorsTable = ({ supervisors = [], onEdit, onToggleSuspend, onDelete }) => {
  return (
    <>
      <div className="hidden sm:block bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden shadow-[0px_0px_4px_0px_rgba(0,0,0,0.08)]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse" dir="rtl">
            <thead>
              <tr className="bg-[#F9FAFA] border-b border-[#E5E5E5]">
                <th className="px-4 py-3 text-right text-[13px] font-medium text-[#575F69]">الاسم</th>
                <th className="px-4 py-3 text-right text-[13px] font-medium text-[#575F69]">البريد الإلكتروني</th>
                <th className="px-4 py-3 text-right text-[13px] font-medium text-[#575F69]">رقم الهاتف</th>
                <th className="px-4 py-3 text-right text-[13px] font-medium text-[#575F69]">الصلاحية</th>
                <th className="px-4 py-3 text-right text-[13px] font-medium text-[#575F69]">الحالة</th>
                <th className="px-4 py-3 text-right text-[13px] font-medium text-[#575F69]">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {supervisors.map((s) => (
                <TableRow key={s.id} s={s} onEdit={onEdit} onToggleSuspend={onToggleSuspend} onDelete={onDelete} />
              ))}
              {supervisors.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-[#9CA3AF] text-[14px]">
                    لا توجد نتائج مطابقة
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex sm:hidden flex-col gap-3">
        {supervisors.length === 0 ? (
          <p className="text-center text-[#9CA3AF] text-[14px] py-10">لا توجد نتائج مطابقة</p>
        ) : (
          supervisors.map((s) => (
            <MobileCard key={s.id} s={s} onEdit={onEdit} onToggleSuspend={onToggleSuspend} onDelete={onDelete} />
          ))
        )}
      </div>
    </>
  );
};

export default SupervisorsTable;
