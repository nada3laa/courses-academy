import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useLayoutEffect,
} from "react";
import { createPortal } from "react-dom";
import {
  MoreVertical,
  X,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Percent,
  Banknote,
  Copy,
  Check,
  Plus,
  TicketPercent,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  PauseCircle,
  PlayCircle,
  Trash2,
} from "lucide-react";
import {
  getAllDiscounts,
  createDiscount,
  updateDiscount,
  deleteDiscount,
} from "../../../../services/APIService"; // ⚠️ عدّل المسار حسب مكان api.js عندك

const PAGE_SIZE = 8;

// ─── Tokens ───────────────────────────────────────────────────────────────────
const STATUS_STYLES = {
  نشط: {
    dot: "bg-[#15A862]",
    text: "text-[#15A862]",
    bg: "bg-[#15A862]/10",
    ring: "ring-[#15A862]/20",
  },
  موقوف: {
    dot: "bg-[#E0394C]",
    text: "text-[#E0394C]",
    bg: "bg-[#E0394C]/10",
    ring: "ring-[#E0394C]/20",
  },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_STYLES[status] ?? {
    dot: "bg-gray-400",
    text: "text-gray-500",
    bg: "bg-gray-100",
    ring: "ring-gray-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap ring-1 ${s.bg} ${s.text} ${s.ring}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
};

const TypeIcon = ({ type }) => (
  <span
    className={`inline-flex items-center justify-center w-8 h-8 rounded-lg shrink-0 ${type === "percentage" ? "bg-[#123C91]/10 text-[#123C91]" : "bg-[#0E7C66]/10 text-[#0E7C66]"}`}
  >
    {type === "percentage" ? (
      <Percent size={14} strokeWidth={2.4} />
    ) : (
      <Banknote size={14} strokeWidth={2.4} />
    )}
  </span>
);

const typeLabel = (type) =>
  type === "percentage" ? "نسبة مئوية" : "مبلغ ثابت";
const discountLabel = (d) =>
  d.type === "percentage" ? `${d.value}%` : `${d.value} جنيه`;

const UsageCount = ({ usedCount }) => (
  <span className="text-[13px] tabular-nums text-[#575F69]" dir="ltr">
    استُخدم {usedCount ?? 0} مرة
  </span>
);

// ─── Copyable code ────────────────────────────────────────────────────────────
const CodeChip = ({ code }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };
  return (
    <button
      onClick={handleCopy}
      dir="ltr"
      className="group inline-flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg border border-dashed border-gray-300 bg-[#F9FAFA] hover:border-[#123C91]/40 hover:bg-[#123C91]/5 transition-colors"
      title="نسخ الكود"
    >
      <span className="font-mono font-semibold text-[13px] text-[#1F2937]">
        {code}
      </span>
      {copied ? (
        <Check size={13} className="text-[#15A862]" />
      ) : (
        <Copy
          size={13}
          className="text-[#9CA3AF] group-hover:text-[#123C91] transition-colors"
        />
      )}
    </button>
  );
};

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ toast, onDismiss }) => {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onDismiss, 3200);
    return () => clearTimeout(t);
  }, [toast, onDismiss]);

  if (!toast) return null;
  const isError = toast.type === "error";
  return (
    <div
      dir="rtl"
      className={`fixed z-[100] bottom-5 left-1/2 -translate-x-1/2 sm:left-auto sm:right-6 sm:translate-x-0 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-[13px] font-medium max-w-[92vw] sm:max-w-sm
        ${isError ? "bg-white border-[#E0394C]/30 text-[#B4283A]" : "bg-white border-[#15A862]/30 text-[#0E7C51]"}`}
    >
      {isError ? (
        <XCircle size={17} className="shrink-0" />
      ) : (
        <CheckCircle2 size={17} className="shrink-0" />
      )}
      <span className="leading-snug">{toast.message}</span>
    </div>
  );
};

// ─── Confirm Dialog (used for delete) ─────────────────────────────────────────
const ConfirmDialog = ({
  open,
  title,
  description,
  confirmLabel,
  danger,
  loading,
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0B1220]/50 backdrop-blur-[2px] px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onCancel();
      }}
    >
      <div
        dir="rtl"
        className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 text-center"
      >
        <div
          className={`mx-auto mb-4 w-12 h-12 rounded-full flex items-center justify-center ${danger ? "bg-[#E0394C]/10 text-[#E0394C]" : "bg-[#123C91]/10 text-[#123C91]"}`}
        >
          <AlertTriangle size={22} />
        </div>
        <h3 className="font-['Tajawal'] font-semibold text-[16px] text-[#1F2937] mb-1.5">
          {title}
        </h3>
        <p className="text-[13px] text-[#6B7280] leading-relaxed mb-6">
          {description}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 border border-[#E5E7EB] rounded-xl text-[#374151] font-medium text-[13px] hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            إلغاء
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-2.5 rounded-xl text-white font-medium text-[13px] transition-colors flex items-center justify-center gap-2 disabled:opacity-70
              ${danger ? "bg-[#E0394C] hover:bg-[#c62e3f]" : "bg-[#123C91] text-white [&_svg]:text-white hover:bg-[#0f3280]"}`}
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Row Actions ──────────────────────────────────────────────────────────────
// Rendered through a portal into document.body and positioned with
// `position: fixed`, computed from the trigger button's bounding rect — this
// is what stops it from being clipped by `overflow-x-auto` on the table, or by
// the mobile card list's scroll container.
//
// Responsive handling added:
//  - horizontal position is clamped so the menu never overflows past either
//    edge of the viewport (important on narrow phone screens where a button
//    near the left edge would otherwise push the menu off-screen)
//  - if there isn't enough room below the button (e.g. the last row/card on a
//    short mobile screen), the menu opens upward instead of getting clipped
//    by the bottom of the viewport
const MENU_WIDTH = 160; // matches w-40
const MENU_HEIGHT_ESTIMATE = 96; // ~2 items

const RowActions = ({ discount, busy, onToggleActive, onDeleteRequest }) => {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, openUpward: false });
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  const computeCoords = useCallback(() => {
    const rect = btnRef.current?.getBoundingClientRect();
    if (!rect) return;

    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpward = spaceBelow < MENU_HEIGHT_ESTIMATE + 12;

    // Anchor to the button's right edge (menu reads RTL), then clamp so it
    // never runs off either side of the viewport.
    let left = rect.right - MENU_WIDTH;
    left = Math.max(8, Math.min(left, window.innerWidth - MENU_WIDTH - 8));

    const top = openUpward ? rect.top - 6 : rect.bottom + 6;

    setCoords({ top, left, openUpward });
  }, []);

  useLayoutEffect(() => {
    if (open) computeCoords();
  }, [open, computeCoords]);

  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        btnRef.current &&
        !btnRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    const reposition = () => computeCoords();
    document.addEventListener("mousedown", close);
    // capture=true so this also fires for scrolls inside the table's
    // overflow-x-auto container, not just window-level scrolls
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      document.removeEventListener("mousedown", close);
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [open, computeCoords]);

  return (
    <>
      <button
        ref={btnRef}
        onClick={() => setOpen((p) => !p)}
        disabled={busy}
        className="p-2.5 sm:p-2 rounded-lg text-[#575F69] hover:bg-gray-100 hover:text-[#123C91] transition-colors disabled:opacity-40"
      >
        {busy ? (
          <Loader2 size={17} className="animate-spin" />
        ) : (
          <MoreVertical size={17} />
        )}
      </button>
      {open &&
        createPortal(
          <ul
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
            className="z-[70] bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden py-1"
          >
            <li
              onClick={() => {
                setOpen(false);
                onToggleActive(discount);
              }}
              className="px-4 py-3 sm:py-2.5 text-[13px] cursor-pointer hover:bg-gray-50 active:bg-gray-100 font-['IBM_Plex_Sans_Arabic'] text-right text-[#E8821C] flex items-center gap-2 justify-end"
            >
              {discount.isActive ? "إيقاف" : "تفعيل"}
              {discount.isActive ? (
                <PauseCircle size={14} />
              ) : (
                <PlayCircle size={14} />
              )}
            </li>
            <li
              onClick={() => {
                setOpen(false);
                onDeleteRequest(discount);
              }}
              className="px-4 py-3 sm:py-2.5 text-[13px] cursor-pointer hover:bg-gray-50 active:bg-gray-100 font-['IBM_Plex_Sans_Arabic'] text-right text-[#E0394C] flex items-center gap-2 justify-end"
            >
              حذف
              <Trash2 size={14} />
            </li>
          </ul>,
          document.body,
        )}
    </>
  );
};

// ─── Form Field ───────────────────────────────────────────────────────────────
const Field = ({ label, children }) => (
  <div>
    <label className="block font-['Tajawal'] font-medium text-[13px] text-[#374151] mb-1.5 text-right">
      {label}
    </label>
    {children}
  </div>
);

const inputCls =
  "w-full h-11 px-4 border border-[#E5E7EB] rounded-xl bg-[#F9FAFA] text-[13px] font-['IBM_Plex_Sans_Arabic'] focus:outline-none focus:ring-2 focus:ring-[#123C91]/30 focus:border-[#123C91] text-right transition-colors placeholder:text-[#9CA3AF]";
const selectCls =
  "w-full h-11 px-4 border border-[#E5E7EB] rounded-xl bg-[#F9FAFA] text-[13px] font-['IBM_Plex_Sans_Arabic'] focus:outline-none focus:ring-2 focus:ring-[#123C91]/30 focus:border-[#123C91] appearance-none text-right transition-colors";

// ─── Add Code Modal ───────────────────────────────────────────────────────────
const AddCodeModal = ({ open, onClose, onCreated }) => {
  const [form, setForm] = useState({ name: "", code: "", type: "", value: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setForm({ name: "", code: "", type: "", value: "" });
      setError("");
    }
  }, [open]);

  if (!open) return null;

  const handleChange = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.code || !form.type || !form.value) {
      setError("من فضلك أكمل الكود والنوع والقيمة");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await createDiscount({
        name: form.name || form.code,
        code: form.code,
        type: form.type,
        value: Number(form.value),
      });
      onCreated();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || "حدث خطأ أثناء إنشاء الكود");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#0B1220]/50 backdrop-blur-[2px] px-0 sm:px-4 py-0 sm:py-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        dir="rtl"
        className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-[#E5E5E5]" />
        </div>

        <div className="flex items-center justify-between px-5 sm:px-6 pt-4 sm:pt-6 pb-4 border-b border-gray-100">
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#9CA3AF] hover:bg-gray-100 hover:text-[#374151] transition-colors shrink-0"
          >
            <X size={16} />
          </button>
          <div className="flex items-center gap-2.5">
            <h3 className="font-['Tajawal'] font-semibold text-[15px] sm:text-[16px] text-[#1F2937]">
              إنشاء كود خصم جديد
            </h3>
            <span className="w-8 h-8 rounded-lg bg-[#123C91]/10 text-[#123C91] flex items-center justify-center shrink-0">
              <TicketPercent size={16} />
            </span>
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-4">
          <Field label="اسم الكود">
            <input
              value={form.name}
              onChange={handleChange("name")}
              placeholder="مثال: خصم العيد"
              className={inputCls}
            />
          </Field>

          <Field label="الكود">
            <input
              value={form.code}
              onChange={handleChange("code")}
              placeholder="مثال: SAVE20"
              className={inputCls}
              dir="ltr"
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="نوع الخصم">
              <div className="relative">
                <select
                  value={form.type}
                  onChange={handleChange("type")}
                  className={selectCls}
                >
                  <option value="" disabled>
                    اختر النوع
                  </option>
                  <option value="percentage">نسبة مئوية</option>
                  <option value="fixed">مبلغ ثابت</option>
                </select>
                <ChevronDown
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#9CA3AF]"
                />
              </div>
            </Field>
            <Field label="قيمة الخصم">
              <input
                value={form.value}
                onChange={handleChange("value")}
                placeholder="20"
                type="number"
                className={inputCls}
              />
            </Field>
          </div>

          {error && (
            <p className="text-[12px] text-[#E0394C] text-right">{error}</p>
          )}
        </div>

        <div className="flex flex-col-reverse sm:flex-row-reverse gap-3 px-5 sm:px-6 pb-5 sm:pb-6">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 py-3 bg-[#123C91] text-white [&_svg]:text-white rounded-xl font-medium text-[14px] hover:bg-[#0f3280] disabled:opacity-60 transition-colors shadow-sm shadow-[#123C91]/20 flex items-center justify-center gap-2"
          >
            {submitting && <Loader2 size={15} className="animate-spin" />}
            إنشاء الكود
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-[#E5E7EB] rounded-xl text-[#374151] font-medium text-[14px] hover:bg-gray-50 transition-colors"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Pagination ───────────────────────────────────────────────────────────────
const Pagination = ({ page, total, totalPages, onChange }) => (
  <div
    dir="rtl"
    className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 px-1"
  >
    <span className="text-[12px] sm:text-[13px] text-[#8C9198] text-center sm:text-right">
      عرض{" "}
      <span className="font-medium text-[#575F69]">
        {Math.min(PAGE_SIZE, total - (page - 1) * PAGE_SIZE)}
      </span>{" "}
      من أصل <span className="font-medium text-[#575F69]">{total}</span> كود خصم
    </span>
    <div className="flex items-center flex-wrap justify-center gap-1">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-[#575F69] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors shrink-0"
      >
        <ChevronRight size={16} />
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`w-8 h-8 flex items-center justify-center rounded-lg text-[13px] font-medium transition-colors shrink-0 ${
            p === page
              ? "bg-[#123C91] text-white [&_svg]:text-white shadow-sm shadow-[#123C91]/25"
              : "border border-gray-200 text-[#575F69] hover:bg-gray-50"
          }`}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-[#575F69] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors shrink-0"
      >
        <ChevronLeft size={16} />
      </button>
    </div>
  </div>
);

// ─── Mobile Card ──────────────────────────────────────────────────────────────
const CodeCard = ({ code, busy, onToggleActive, onDeleteRequest }) => (
  <div
    dir="rtl"
    className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm"
  >
    <div className="flex items-center justify-between gap-2 mb-3.5">
      <CodeChip code={code.code} />
      <StatusBadge status={code.isActive ? "نشط" : "موقوف"} />
    </div>

    <div className="flex items-center justify-between gap-3 mb-3">
      <div className="flex items-center gap-2 min-w-0">
        <TypeIcon type={code.type} />
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-[#1F2937] leading-tight">
            {discountLabel(code)}
          </p>
          <p className="text-[11px] text-[#9CA3AF] leading-tight mt-0.5">
            {typeLabel(code.type)}
          </p>
        </div>
      </div>
      <div className="text-left shrink-0">
        <p className="text-[11px] text-[#9CA3AF] mb-1">الاستخدامات</p>
        <UsageCount usedCount={code.usedCount} />
      </div>
    </div>

    <div className="flex justify-end pt-2.5 border-t border-gray-100">
      <RowActions
        discount={code}
        busy={busy}
        onToggleActive={onToggleActive}
        onDeleteRequest={onDeleteRequest}
      />
    </div>
  </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
const DiscountCodesTab = ({ showAdd, onCloseAdd, onOpenAdd }) => {
  const [page, setPage] = useState(1);
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // id -> "toggle" | "delete" while a row action is in flight
  const [busyId, setBusyId] = useState(null);
  const [toast, setToast] = useState(null);
  const [confirmTarget, setConfirmTarget] = useState(null); // discount pending delete confirmation
  const [deleting, setDeleting] = useState(false);

  const showToast = (type, message) => setToast({ type, message });

  const fetchDiscounts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getAllDiscounts();
      setCodes(res.data?.data ?? []);
    } catch (err) {
      setError(err?.response?.data?.message || "تعذر تحميل أكواد الخصم");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDiscounts();
  }, [fetchDiscounts]);

  // ── Toggle active / paused ──────────────────────────────────────────────
  const handleToggleActive = async (discount) => {
    if (busyId) return;
    setBusyId(discount.id);
    const nextActive = !discount.isActive;

    // optimistic update
    setCodes((prev) =>
      prev.map((c) =>
        c.id === discount.id ? { ...c, isActive: nextActive } : c,
      ),
    );

    try {
      await updateDiscount(discount.id, { isActive: nextActive });
      showToast(
        "success",
        nextActive
          ? `تم تفعيل الكود "${discount.code}"`
          : `تم إيقاف الكود "${discount.code}"`,
      );
    } catch (err) {
      // rollback on failure
      setCodes((prev) =>
        prev.map((c) =>
          c.id === discount.id ? { ...c, isActive: discount.isActive } : c,
        ),
      );
      showToast(
        "error",
        err?.response?.data?.message || "تعذر تحديث حالة الكود، حاول مرة أخرى",
      );
    } finally {
      setBusyId(null);
    }
  };

  // ── Delete (with confirmation) ──────────────────────────────────────────
  const handleDeleteRequest = (discount) => setConfirmTarget(discount);

  const handleDeleteConfirm = async () => {
    if (!confirmTarget) return;
    const discount = confirmTarget;
    setDeleting(true);
    setBusyId(discount.id);

    const prevCodes = codes;
    setCodes((c) => c.filter((x) => x.id !== discount.id));

    try {
      await deleteDiscount(discount.id);
      showToast("success", `تم حذف الكود "${discount.code}"`);
      setConfirmTarget(null);
      // adjust page if last item on page was removed
      setPage((p) => {
        const remaining = prevCodes.length - 1;
        const maxPage = Math.max(1, Math.ceil(remaining / PAGE_SIZE));
        return Math.min(p, maxPage);
      });
    } catch (err) {
      setCodes(prevCodes); // rollback
      showToast(
        "error",
        err?.response?.data?.message || "تعذر حذف الكود، حاول مرة أخرى",
      );
    } finally {
      setDeleting(false);
      setBusyId(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(codes.length / PAGE_SIZE));
  const paged = codes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="w-full max-w-full" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h2 className="font-['Tajawal'] font-semibold text-[16px] sm:text-[18px] text-[#1F2937]">
            أكواد الخصم
          </h2>
          <p className="text-[12px] sm:text-[13px] text-[#9CA3AF] mt-0.5">
            إدارة ومتابعة أكواد الخصم النشطة
          </p>
        </div>
        {onOpenAdd && (
          <button
            onClick={onOpenAdd}
            className="flex items-center gap-1.5 bg-[#123C91] text-white [&_svg]:text-white hover:bg-[#0f3280] text-white text-[13px] font-medium px-4 py-2.5 rounded-xl transition-colors shadow-sm shadow-[#123C91]/20 shrink-0"
          >
            <Plus size={15} />
            <span className="hidden xs:inline">إنشاء كود</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-[#9CA3AF] gap-2">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-[13px]">جاري التحميل...</span>
        </div>
      ) : error ? (
        <div className="bg-white border border-gray-200 rounded-2xl py-14 px-4 text-center">
          <p className="text-[14px] text-[#E0394C] mb-3">{error}</p>
          <button
            onClick={fetchDiscounts}
            className="text-[13px] text-[#123C91] font-medium hover:underline"
          >
            إعادة المحاولة
          </button>
        </div>
      ) : codes.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl py-14 px-4 text-center">
          <p className="text-[14px] text-[#9CA3AF]">لا توجد أكواد خصم حالياً</p>
        </div>
      ) : (
        <>
          <Pagination
            page={page}
            total={codes.length}
            totalPages={totalPages}
            onChange={setPage}
          />

          {/* Desktop / tablet table */}
          <div className="hidden sm:block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right" style={{ minWidth: 720 }}>
                <thead className="bg-[#F9FAFA] border-b border-gray-100">
                  <tr>
                    {["الكود", "الخصم", "الاستخدامات", "الحالة", ""].map(
                      (h, i) => (
                        <th
                          key={i}
                          className="px-5 py-3.5 text-[12px] font-semibold text-[#8C9198] whitespace-nowrap tracking-wide"
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paged.map((c) => (
                    <tr
                      key={c.id}
                      className={`transition-colors ${busyId === c.id ? "bg-[#F9FAFA]" : "hover:bg-gray-50/60"}`}
                    >
                      <td className="px-5 py-3.5">
                        <CodeChip code={c.code} />
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <TypeIcon type={c.type} />
                          <div>
                            <p className="text-[13px] font-semibold text-[#1F2937] leading-tight">
                              {discountLabel(c)}
                            </p>
                            <p className="text-[11px] text-[#9CA3AF] leading-tight mt-0.5">
                              {typeLabel(c.type)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <UsageCount usedCount={c.usedCount} />
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={c.isActive ? "نشط" : "موقوف"} />
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <RowActions
                          discount={c}
                          busy={busyId === c.id}
                          onToggleActive={handleToggleActive}
                          onDeleteRequest={handleDeleteRequest}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden space-y-3">
            {paged.map((c) => (
              <CodeCard
                key={c.id}
                code={c}
                busy={busyId === c.id}
                onToggleActive={handleToggleActive}
                onDeleteRequest={handleDeleteRequest}
              />
            ))}
          </div>

        </>
      )}

      <AddCodeModal
        open={showAdd}
        onClose={onCloseAdd}
        onCreated={fetchDiscounts}
      />

      <ConfirmDialog
        open={!!confirmTarget}
        title="حذف كود الخصم"
        description={
          confirmTarget
            ? `هل أنت متأكد من حذف الكود "${confirmTarget.code}"؟ لا يمكن التراجع عن هذا الإجراء.`
            : ""
        }
        confirmLabel="حذف نهائي"
        danger
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => !deleting && setConfirmTarget(null)}
      />

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
};

export default DiscountCodesTab;
