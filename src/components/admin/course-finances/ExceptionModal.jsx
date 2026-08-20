import { useEffect, useState } from "react";
import { X, Search, Pencil } from "lucide-react";

// ⚠️ بيانات وهمية للبحث - المفروض تتجاب من API زي GET /admin/courses?search=
const MOCK_COURSES = [
  { id: 1, name: "مقدمة في البرمجة", instructor: "سالي السيد", currentRate: 20 },
  { id: 2, name: "شرح ال Python", instructor: "علي ماهر", currentRate: 20 },
  { id: 3, name: "شرح البرمجة", instructor: "قادرة محمد", currentRate: 20 },
];

const ExceptionModal = ({ isOpen, mode = "add", initialData, onClose, onSave }) => {
  const [step, setStep] = useState(mode === "edit" ? "form" : "search");
  const [query, setQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(
    mode === "edit" ? initialData?.course ?? null : null
  );
  const [customRate, setCustomRate] = useState(
    mode === "edit" ? initialData?.customRate ?? "" : ""
  );
  const [reason, setReason] = useState(mode === "edit" ? initialData?.reason ?? "" : "");

  useEffect(() => {
    if (!isOpen) return;
    setStep(mode === "edit" ? "form" : "search");
    setQuery("");
    setSelectedCourse(mode === "edit" ? initialData?.course ?? null : null);
    setCustomRate(mode === "edit" ? initialData?.customRate ?? "" : "");
    setReason(mode === "edit" ? initialData?.reason ?? "" : "");
  }, [isOpen, mode, initialData]);

  if (!isOpen) return null;

  const results = MOCK_COURSES.filter(
    (c) => !query.trim() || c.name.includes(query) || c.instructor.includes(query)
  );

  const handlePick = (course) => {
    setSelectedCourse(course);
    setStep("form");
  };

  const handleSave = () => {
    if (!selectedCourse || customRate === "") return;
    onSave({ course: selectedCourse, customRate: Number(customRate), reason });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      dir="rtl"
    >
      <div className="w-full max-w-sm bg-[#1F2937] text-white rounded-2xl shadow-xl p-5 font-['IBM_Plex_Sans_Arabic']">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold">
            {mode === "edit" ? "تعديل استثناء الكورس" : "إضافة استثناء"}
          </h3>
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {step === "search" ? (
          <div>
            <div className="relative mb-3">
              <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ابحث باسم الدورة أو المحاضر..."
                className="w-full bg-[#111827] border border-white/10 rounded-lg py-2 pr-9 pl-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#12C6B0]"
              />
            </div>
            <div className="space-y-1 max-h-56 overflow-y-auto">
              {results.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handlePick(c)}
                  className="w-full text-right px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <p className="text-sm font-semibold">{c.name}</p>
                  <p className="text-xs text-white/50">{c.instructor}</p>
                </button>
              ))}
              {results.length === 0 && (
                <p className="text-xs text-white/40 text-center py-4">لا توجد نتائج</p>
              )}
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-4">
              <p className="text-xs text-white/50 mb-1">نسبة عمولة المنصة الحالية</p>
              <div className="flex items-center justify-between bg-[#111827] border border-white/10 rounded-lg px-3 py-2">
                <span className="text-sm font-semibold">{selectedCourse?.name}</span>
                {mode === "add" && (
                  <button
                    onClick={() => setStep("search")}
                    className="text-white/40 hover:text-white transition-colors"
                  >
                    <Pencil size={14} />
                  </button>
                )}
              </div>
              <p className="text-xs text-white/40 mt-1">{selectedCourse?.instructor}</p>
            </div>

            <label className="block text-sm text-white/70 mb-2">
              نسبة العمولة المخصصة (%)
            </label>
            <input
              type="number"
              min={0}
              max={100}
              value={customRate}
              onChange={(e) => setCustomRate(e.target.value)}
              className="w-full bg-[#111827] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#12C6B0] mb-4"
            />

            <label className="block text-sm text-white/70 mb-2">
              سبب الاستثناء (اختياري)
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="طلبت تخفيض نسبة زيادة الإقبال"
              className="w-full bg-[#111827] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-[#12C6B0] mb-6 resize-none"
            />

            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                className="flex-1 bg-[#123C91] hover:bg-[#0e2f73] transition-colors text-white text-sm font-semibold rounded-lg py-2.5"
              >
                حفظ الاستثناء
              </button>
              <button
                onClick={onClose}
                className="flex-1 border border-white/15 hover:bg-white/5 transition-colors text-white text-sm font-semibold rounded-lg py-2.5"
              >
                إلغاء
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExceptionModal;