import { useState, useCallback } from "react";
import { X, UploadCloud, FileText } from "lucide-react";

const ACCEPTED_LABEL = "PDF, DOCX, JPG, PPT";
const ACCEPTED_EXT = [".pdf", ".docx", ".jpg", ".jpeg", ".ppt", ".pptx"];

const SubmitAssignmentModal = ({ open, onClose, onSubmit }) => {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFiles = (fileList) => {
    const picked = fileList?.[0];
    if (!picked) return;
    const ext = "." + picked.name.split(".").pop().toLowerCase();
    if (!ACCEPTED_EXT.includes(ext)) return;
    setFile(picked);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  }, []);

  const handleSubmit = () => {
    if (!file) return;
    onSubmit?.(file);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-[#123C91]" />
            <h3 className="text-[16px] font-semibold text-[#1A1A1A]" style={{ fontFamily: "Tajawal, sans-serif" }}>
              تسليم الواجب
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8C9198] hover:bg-gray-100 hover:text-[#575F69] transition-colors"
            aria-label="إغلاق"
          >
            <X size={18} />
          </button>
        </div>

        <p className="px-5 text-sm text-[#8C9198] mb-4">
          قم برفع ملف الحل الخاص بك ليتم إرساله إلى المعلم للمراجعة والتقييم.
        </p>

        {/* Drop zone */}
        <div className="px-5">
          <label
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl py-10 px-4 cursor-pointer transition-colors ${
              dragActive ? "border-[#123C91] bg-[#EAF4FF]" : "border-gray-200 bg-[#F9FAFA]"
            }`}
          >
            <input
              type="file"
              className="hidden"
              accept={ACCEPTED_EXT.join(",")}
              onChange={(e) => handleFiles(e.target.files)}
            />
            <div className="p-3 rounded-full bg-[#EAF4FF]">
              <UploadCloud size={22} className="text-[#123C91]" />
            </div>
            {file ? (
              <span className="text-sm font-medium text-[#123C91] text-center break-all">{file.name}</span>
            ) : (
              <span className="text-sm font-medium text-[#575F69] text-center">
                اسحب الملفات هنا أو اضغط للاختيار
              </span>
            )}
            <span className="text-xs text-[#8C9198]">{ACCEPTED_LABEL}</span>
          </label>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-5 py-5">
          <button
            onClick={onClose}
            className="flex-1 h-11 rounded-lg border border-gray-200 text-[#575F69] font-medium text-sm hover:bg-gray-50 transition-colors"
          >
            إلغاء
          </button>
          <button
            onClick={handleSubmit}
            disabled={!file}
            className="flex-1 h-11 rounded-lg bg-[#123C91] text-white [&_svg]:text-white font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#0e2f73] transition-colors"
          >
            إرسال
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubmitAssignmentModal;