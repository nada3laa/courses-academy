import React, { useState } from "react";

export default function RatingModal({ open, onClose = () => {}, onSubmit = () => {}, course = {} }) {
  const [stars, setStars] = useState(5);
  const [text, setText] = useState("");

  if (!open) return null;

  const submit = () => {
    onSubmit({ stars, text, course });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl p-6 w-11/12 max-w-md text-right">
        <h3 className="text-lg font-bold mb-3">قيم هذه الدورة</h3>
        <div className="flex gap-2 mb-3">
          {[1,2,3,4,5].map((s) => (
            <button key={s} onClick={() => setStars(s)} className={`text-2xl ${s <= stars ? "text-yellow-400" : "text-gray-300"}`}>
              ★
            </button>
          ))}
        </div>
        <input placeholder="اسمك (اختياري)" className="w-full border rounded p-2 mb-2" />
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="اكتب رأيك في الدورة..." className="w-full border rounded p-2 mb-4" rows={4} />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded border">إلغاء</button>
          <button onClick={submit} className="px-4 py-2 rounded bg-[#123C91] text-white">تقييم</button>
        </div>
      </div>
    </div>
  );
}
