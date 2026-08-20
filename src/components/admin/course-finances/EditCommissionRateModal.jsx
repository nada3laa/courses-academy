import { useEffect, useState } from "react";
import { X } from "lucide-react";

const EditCommissionRateModal = ({ isOpen, currentRate, onClose, onSave }) => {
  const [rate, setRate] = useState(currentRate);

  useEffect(() => {
    if (isOpen) setRate(currentRate);
  }, [isOpen, currentRate]);

  if (!isOpen) return null;

  const exampleAmount = 1000;
  const exampleCommission = Math.round((exampleAmount * (Number(rate) || 0)) / 100);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      dir="rtl"
    >
      <div className="w-full max-w-sm bg-[#1F2937] text-white rounded-2xl shadow-xl p-5 font-['IBM_Plex_Sans_Arabic']">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold">تعديل النسبة</h3>
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <label className="block text-sm text-white/70 mb-2">
          % عمولة المنصة على كل دورة
        </label>
        <input
          type="number"
          min={0}
          max={100}
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          className="w-full bg-[#111827] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#12C6B0] mb-3"
        />

        <p className="text-xs text-emerald-400 mb-6">
          مثال: دورة سعرها {exampleAmount.toLocaleString("ar-EG")} جنيه ستحقق{" "}
          {exampleCommission.toLocaleString("ar-EG")} جنيه للمنصة
        </p>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onSave(Number(rate))}
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

export default EditCommissionRateModal;