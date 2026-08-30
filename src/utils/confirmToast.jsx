import toast from "react-hot-toast";

export const confirmToast = ({ title, message, confirmLabel = "تأكيد", danger = false }) =>
  new Promise((resolve) => {
    let settled = false;
    const finish = (toastId, value) => {
      if (settled) return;
      settled = true;
      toast.dismiss(toastId);
      resolve(value);
    };

    toast.custom(
      (currentToast) => (
        <div dir="rtl" className="w-[min(92vw,390px)] rounded-2xl border border-[#E5E7EB] bg-white p-4 text-right shadow-2xl">
          <strong className="block text-base text-[#1F2937]">{title}</strong>
          <p className="mt-1.5 text-sm leading-6 text-[#667085]">{message}</p>
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" onClick={() => finish(currentToast.id, false)} className="rounded-lg border border-[#D0D5DD] px-4 py-2 text-sm font-semibold text-[#344054]">إلغاء</button>
            <button type="button" onClick={() => finish(currentToast.id, true)} className={`rounded-lg px-4 py-2 text-sm font-semibold text-white ${danger ? "bg-[#D92D20]" : "bg-[#123C91]"}`}>{confirmLabel}</button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
      },
    );
  });
