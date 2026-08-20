import { useRef, useState } from "react";
import { AlertTriangle, FileText, Paperclip, X } from "lucide-react";

const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes} بايت`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} كيلوبايت`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} ميجابايت`;
};

const EndSessionDetailsModal = ({ open, lesson, loading, error, onConfirm, onClose }) => {
  const [title, setTitle] = useState(lesson?.title || "");
  const [description, setDescription] = useState(lesson?.description || "");
  const [files, setFiles] = useState([]);
  const [validationError, setValidationError] = useState("");
  const fileInputRef = useRef(null);

  if (!open) return null;

  const handleFilesSelected = (e) => {
    setFiles((prev) => [...prev, ...Array.from(e.target.files || [])]);
    e.target.value = "";
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      setValidationError("من فضلك أدخل الاسم الفعلي للحصة");
      return;
    }
    setValidationError("");
    onConfirm({
      title: title.trim(),
      description: description.trim(),
      files,
    });
  };

  const inputClass =
    "w-full border border-[#E5E5E5] rounded-lg px-4 py-3 text-sm text-[#1A1A1A] focus:border-[#123C91] focus:ring-1 focus:ring-[#123C91] outline-none transition-all bg-[#F9FAFA] placeholder:text-[#8C9198]";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div className="bg-white w-full max-w-lg rounded-2xl p-5 sm:p-6 shadow-xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <div className="flex items-start gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
            <AlertTriangle size={20} className="text-amber-500" />
          </div>
          <div>
            <h3 className="font-['Tajawal'] font-semibold text-[16px] text-[#1F2937] mb-1">
              إنهاء الحصة
            </h3>
            <p className="text-sm text-[#575F69]">
              قبل إنهاء الحصة، أدخل الاسم الفعلي والوصف والمرفقات التي ستظهر للطلاب.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              الاسم الفعلي للحصة
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: مراجعة الفصل الأول"
              className={inputClass}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              وصف الحصة
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="اكتب ملخص الحصة أو النقاط التي تم شرحها"
              rows={3}
              className={`${inputClass} resize-none`}
              disabled={loading}
            />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Paperclip size={17} className="text-[#575F69]" />
              <label className="text-sm font-semibold text-gray-700">
                مرفقات الحصة
              </label>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFilesSelected}
              className="hidden"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="w-full border-2 border-dashed border-[#E5E5E5] rounded-lg py-5 flex flex-col items-center justify-center gap-2 text-[#8C9198] hover:border-[#123C91] hover:text-[#123C91] transition-colors disabled:opacity-60"
            >
              <Paperclip size={20} />
              <span className="text-sm font-medium">اضغط لاختيار الملفات</span>
            </button>

            {files.length > 0 && (
              <ul className="mt-3 space-y-2">
                {files.map((file, index) => (
                  <li
                    key={`${file.name}-${index}`}
                    className="flex items-center justify-between gap-3 bg-[#F9FAFA] border border-[#E5E5E5] rounded-lg px-3 py-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText size={16} className="text-[#575F69] shrink-0" />
                      <span className="text-sm text-[#1A1A1A] truncate">{file.name}</span>
                      <span className="text-xs text-[#8C9198] shrink-0">{formatSize(file.size)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-[#8C9198] hover:text-red-500 shrink-0"
                      disabled={loading}
                    >
                      <X size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {(validationError || error) && (
          <p className="text-sm text-red-500 mt-4">{validationError || error}</p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-3 bg-red-600 text-white rounded-xl font-medium text-[14px] font-['IBM_Plex_Sans_Arabic'] hover:bg-red-700 transition-colors disabled:opacity-60"
          >
            {loading ? "جاري الحفظ والإنهاء..." : "حفظ وإنهاء الحصة"}
          </button>
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 border border-[#E5E5E5] rounded-xl text-[#123C91] font-medium text-[14px] font-['IBM_Plex_Sans_Arabic'] hover:border-[#123C91] transition-colors disabled:opacity-60"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
};

export default EndSessionDetailsModal;
