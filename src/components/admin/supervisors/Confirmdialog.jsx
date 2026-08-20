import { X } from "lucide-react";

const ConfirmDialog = ({
  open,
  title,
  message,
  confirmLabel = "تأكيد",
  cancelLabel = "إلغاء",
  danger = false,
  loading = false,
  onConfirm,
  onClose,
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/40 px-0 sm:px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div
        className="bg-white w-full sm:max-w-96 rounded-t-3xl sm:rounded-2xl p-6 pb-8 sm:pb-6 shadow-xl"
        dir="rtl"
      >
        <div className="flex justify-center mb-4 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-[#E5E5E5]" />
        </div>

        <div className="flex items-center justify-between mb-3">
          <h3 className="font-['IBM_Plex_Sans_Arabic'] font-medium text-[17px] text-[#1F2937]">
            {title}
          </h3>
          <button
            onClick={onClose}
            disabled={loading}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#6B7280] transition-colors disabled:opacity-50"
          >
            <X size={16} />
          </button>
        </div>

        <p className="font-['IBM_Plex_Sans_Arabic'] text-[14px] text-[#575F69] text-right mb-6">
          {message}
        </p>

        <div className="flex flex-col-reverse sm:flex-row gap-3">
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-3 px-6 rounded-xl font-medium text-[15px] disabled:opacity-60 cursor-pointer font-['IBM_Plex_Sans_Arabic'] text-white ${
              danger ? "bg-red-600" : "bg-[#123C91] text-white [&_svg]:text-white"
            }`}
          >
            {loading ? "جارٍ التنفيذ..." : confirmLabel}
          </button>
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 px-6 border border-[#E5E5E5] rounded-xl text-[#123C91] font-medium text-[15px] cursor-pointer font-['IBM_Plex_Sans_Arabic'] disabled:opacity-50"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;