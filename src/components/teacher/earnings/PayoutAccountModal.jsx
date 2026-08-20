import { useEffect, useState } from "react";
import { X } from "lucide-react";

const PayoutAccountModal = ({ isOpen, initialData, onClose, onSave }) => {
  const [label, setLabel] = useState(initialData?.label ?? "");
  const [number, setNumber] = useState(initialData?.number ?? "");

  useEffect(() => {
    if (isOpen) {
      setLabel(initialData?.label ?? "");
      setNumber(initialData?.number ?? "");
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!label.trim() || !number.trim()) return;
    onSave({ label: label.trim(), number: number.trim() });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      dir="rtl"
    >
      <div className="w-full max-w-sm bg-[#1F2937] text-white rounded-2xl shadow-xl p-5 font-['IBM_Plex_Sans_Arabic']">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold">
            {initialData ? "تعديل حساب الاستلام" : "إضافة حساب استلام"}
          </h3>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <label className="block text-sm text-white/70 mb-2">اسم وسيلة الاستلام</label>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="إنستاباي / فودافون كاش..."
          className="w-full bg-[#111827] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-[#12C6B0] mb-4"
        />

        <label className="block text-sm text-white/70 mb-2">رقم الحساب / المحفظة</label>
        <input
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          placeholder="01xxxxxxxxx"
          className="w-full bg-[#111827] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-[#12C6B0] mb-6"
        />

        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            className="flex-1 bg-[#123C91] hover:bg-[#0e2f73] transition-colors text-white text-sm font-semibold rounded-lg py-2.5"
          >
            حفظ
          </button>
          <button
            onClick={onClose}
            className="flex-1 border border-white/15 hover:bg-white/5 transition-colors text-white text-sm font-semibold rounded-lg py-2.5"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
};

export default PayoutAccountModal;