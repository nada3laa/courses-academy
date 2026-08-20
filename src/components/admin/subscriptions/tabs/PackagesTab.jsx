import { useEffect, useState } from "react";
import {
  Trash2,
  Pencil,
  CheckCircle2,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  getAllPackages,
  createPackage,
  updatePackage,
  deletePackage,
} from "../../../../services/APIService";

// ─── Add/Edit Package Modal ───────────────────────────────────────────────────
const PackageModal = ({ open, onClose, pkg, onSaved }) => {
  const isEdit = !!pkg;

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [sessions, setSessions] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setName(pkg?.name ?? "");
      setPrice(pkg?.price ?? "");
      setSessions(pkg?.sessions ?? "");
      setError("");
    }
  }, [open, pkg]);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!name.trim() || !price || !sessions) {
      setError("من فضلك املأ كل الحقول");
      return;
    }

    const payload = {
      name: name.trim(),
      price: Number(price),
      sessions: Number(sessions),
    };

    setSaving(true);
    setError("");
    try {
      if (isEdit) {
        const res = await updatePackage(pkg.id, payload);
        onSaved(res.data.data);
      } else {
        const res = await createPackage(payload);
        onSaved(res.data.data);
      }
      onClose();
    } catch (err) {
      setError(
        err?.response?.data?.message || "حدث خطأ أثناء الحفظ، حاول مرة أخرى",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl"
        dir="rtl"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-['Tajawal'] font-semibold text-[17px] text-[#1F2937]">
            {isEdit ? "تعديل الباقة" : "إضافة باقة جديدة"}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#6B7280]"
          >
            <X size={15} />
          </button>
        </div>

        <div className="space-y-4">
          <Field label="اسم الباقة">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="باقة المادة الواحدة"
              className={inputCls}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="السعر (جنيه)">
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                type="number"
                placeholder="250"
                className={inputCls}
              />
            </Field>
            <Field label="عدد الحصص">
              <input
                value={sessions}
                onChange={(e) => setSessions(e.target.value)}
                type="number"
                placeholder="8"
                className={inputCls}
              />
            </Field>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 mt-3 text-[13px] text-red-600">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}

        <div className="flex gap-3 mt-5">
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 py-3 bg-[#123C91] text-white [&_svg]:text-white rounded-xl font-medium text-[14px] hover:bg-[#0f3280] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {saving && <Loader2 size={15} className="animate-spin" />}
            {isEdit ? "حفظ التغييرات" : "إضافة الباقة"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-[#E5E5E5] rounded-xl text-[#123C91] font-medium text-[14px] hover:border-[#123C91] transition-colors"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, children }) => (
  <div>
    <label className="block font-['Tajawal'] font-medium text-[14px] text-[#1F2937] mb-1">
      {label}
    </label>
    {children}
  </div>
);
const inputCls =
  "w-full h-11 px-4 border border-[#E5E5E5] rounded-lg bg-[#F9FAFA] text-[13px] font-['IBM_Plex_Sans_Arabic'] focus:outline-none focus:ring-2 focus:ring-[#123C91] text-right";

// ─── Package Card ─────────────────────────────────────────────────────────────
const PackageCard = ({ pkg, onEdit, onDelete, onToggle, toggling }) => (
  <div
    className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col gap-3"
    dir="rtl"
  >
    {/* Top row */}
    <div className="flex items-start justify-between">
      <div className="items-center gap-2">
        <h1 className="font-['Tajawal'] font-semibold mb-2 text-[17px] text-[#1F2937]">
          {pkg.name}
        </h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            role="switch"
            aria-checked={pkg.isActive !== false}
            aria-label={pkg.isActive !== false ? "إلغاء تفعيل الباقة" : "تفعيل الباقة"}
            title={pkg.isActive !== false ? "إلغاء تفعيل الباقة" : "تفعيل الباقة"}
            disabled={toggling}
            onClick={() => onToggle(pkg)}
            className={`relative h-6 w-11 rounded-full transition-colors disabled:cursor-wait disabled:opacity-60 ${pkg.isActive !== false ? "bg-[#00A63E]" : "bg-gray-300"}`}
          >
            <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${pkg.isActive !== false ? "right-6" : "right-1"}`} />
          </button>
          <span
            className={`text-[12px] font-medium px-3 py-1 rounded-full ${
              pkg.isActive !== false
                ? "bg-[#00A63E26] text-[#00A63E]"
                : "bg-[#EF444426] text-[#EF4444]"
            }`}
          >
            {toggling ? "جاري التحديث..." : pkg.isActive !== false ? "نشطة" : "غير نشطة"}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onDelete(pkg)}
          className="p-1.5 rounded-lg hover:bg-red-50 text-[#9CA3AF] hover:text-red-500 transition-colors"
        >
          <Trash2 size={15} />
        </button>
        <button
          onClick={() => onEdit(pkg)}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-[#9CA3AF] hover:text-[#374151] transition-colors"
        >
          <Pencil size={15} />
        </button>
      </div>
    </div>

    {/* Price */}
    <div className="text-right">
      <span className="font-['Tajawal'] font-bold text-[28px] text-[#123C91]">
        {pkg.price?.toLocaleString()} جنيه
      </span>
      <span className="text-[#8C9198] text-[13px] mr-1">/ شهر</span>
    </div>

    {/* Sessions */}
    <div className="flex items-center justify-start gap-2 text-[13px] text-[#575F69]">
      <CheckCircle2 size={15} className="text-[#00A63E] shrink-0" />
      <span>{pkg.sessions} حصة شهرياً</span>
    </div>

    {/* Meta */}
    <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-auto">
      <span className="text-[12px] text-[#8C9198]">آخر تحديث</span>
      <span className="text-[13px] font-medium text-[#123C91]">
        {pkg.updatedAt
          ? new Date(pkg.updatedAt).toLocaleDateString("ar-EG")
          : "—"}
      </span>
    </div>
  </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
const PackagesTab = ({ showAdd, onCloseAdd }) => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editPkg, setEditPkg] = useState(null);
  const [deletePkg, setDeletePkg] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingIds, setTogglingIds] = useState([]);

  const fetchPackages = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getAllPackages();
      setPackages(res.data.data);
    } catch (err) {
      setError(
        err?.response?.data?.message || "تعذر تحميل الباقات، حاول مرة أخرى",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  // بعد ما مودال الإضافة/التعديل يحفظ بنجاح، نحدّث القايمة محليًا بدل ما نعمل fetch تاني
  const handleSaved = (saved) => {
    setPackages((prev) => {
      const exists = prev.some((p) => p.id === saved.id);
      return exists
        ? prev.map((p) => (p.id === saved.id ? saved : p))
        : [saved, ...prev];
    });
  };

  const handleConfirmDelete = async () => {
    if (!deletePkg) return;
    const packageId = deletePkg.id || deletePkg._id;
    setDeleting(true);
    try {
      await deletePackage(packageId);
      setPackages((prev) => prev.filter((p) => String(p.id || p._id) !== String(packageId)));
      setDeletePkg(null);
    } catch (err) {
      setError(
        err?.response?.data?.message || "تعذر حذف الباقة، حاول مرة أخرى",
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleTogglePackage = async (pkg) => {
    const packageId = pkg.id || pkg._id;
    if (!packageId || togglingIds.includes(String(packageId))) return;
    const nextActive = pkg.isActive === false;
    setTogglingIds((current) => [...current, String(packageId)]);
    setError("");
    try {
      const response = await updatePackage(packageId, { isActive: nextActive });
      const updated = response.data?.data ?? response.data?.package ?? response.data;
      setPackages((current) =>
        current.map((item) =>
          String(item.id || item._id) === String(packageId)
            ? { ...item, ...(updated && typeof updated === "object" ? updated : {}), isActive: nextActive }
            : item,
        ),
      );
    } catch (err) {
      setError(err?.response?.data?.message || "تعذر تحديث حالة الباقة، حاول مرة أخرى");
    } finally {
      setTogglingIds((current) => current.filter((id) => id !== String(packageId)));
    }
  };

  if (loading) {
    return (
      <div
        className="flex items-center justify-center py-20 text-[#8C9198]"
        dir="rtl"
      >
        <Loader2 size={20} className="animate-spin ml-2" />
        <span className="text-[14px]">جاري تحميل الباقات...</span>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div
          className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-[13px]"
          dir="rtl"
        >
          <AlertCircle size={15} />
          <span>{error}</span>
        </div>
      )}

      {packages.length === 0 ? (
        <div className="text-center py-20 text-[#8C9198] text-[14px]" dir="rtl">
          لا توجد باقات حالياً
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {packages.map((pkg) => (
            <PackageCard
              key={pkg.id || pkg._id}
              pkg={pkg}
              onEdit={setEditPkg}
              onDelete={setDeletePkg}
              onToggle={handleTogglePackage}
              toggling={togglingIds.includes(String(pkg.id || pkg._id))}
            />
          ))}
        </div>
      )}

      {/* Add Modal */}
      <PackageModal open={showAdd} onClose={onCloseAdd} onSaved={handleSaved} />

      {/* Edit Modal */}
      <PackageModal
        open={!!editPkg}
        onClose={() => setEditPkg(null)}
        pkg={editPkg}
        onSaved={handleSaved}
      />

      {/* Delete Confirm */}
      {deletePkg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeletePkg(null);
          }}
        >
          <div
            className="bg-white w-full max-w-xs rounded-2xl p-6 shadow-xl text-center"
            dir="rtl"
          >
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={20} className="text-red-500" />
            </div>
            <h3 className="font-['Tajawal'] font-semibold text-[16px] text-[#1F2937] mb-2">
              حذف الباقة
            </h3>
            <p className="text-[13px] text-[#6B7280] mb-6">
              هل أنت متأكد من حذف باقة "{deletePkg.name}"؟ لا يمكن التراجع.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-medium text-[14px] hover:bg-red-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {deleting && <Loader2 size={14} className="animate-spin" />}
                حذف
              </button>
              <button
                onClick={() => setDeletePkg(null)}
                disabled={deleting}
                className="flex-1 py-2.5 border border-[#E5E5E5] rounded-xl text-[#374151] font-medium text-[14px] hover:border-gray-400 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PackagesTab;
