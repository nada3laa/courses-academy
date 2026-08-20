import React from "react";

export default function CertificateModal({ open, onClose = () => {}, course = {} }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl p-6 w-11/12 max-w-2xl text-right">
        <div className="text-center mb-4">
          <div className="text-2xl font-bold text-[#123C91]">تهانينا! لقد أكملت الدورة بنجاح</div>
          <div className="text-sm text-[#7B8490] mt-2">{course.title}</div>
        </div>

        <div className="border rounded p-6 mb-4">
          <div className="w-full h-48 bg-[#EEF1F4] flex items-center justify-center">شهادة الدورة (معاينة)</div>
        </div>

        <div className="flex justify-between">
          <button onClick={onClose} className="px-4 py-2 rounded border">إغلاق</button>
          <a download className="px-4 py-2 rounded bg-[#123C91] text-white" href="#">تنزيل الشهادة</a>
        </div>
      </div>
    </div>
  );
}
