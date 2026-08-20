import { HiOutlineDocumentText, HiOutlineDownload } from "react-icons/hi";
import { getAssetUrl } from "../../../../services/APIService";
const sizeLabel = (size) => size ? `${(size / 1024 / 1024).toFixed(1)} MB` : "";

const LessonFiles = ({ files = [] }) => (
  <div dir="rtl" className="rounded-2xl border border-[#E5E5E5] bg-white p-4">
    <h3 className="mb-4 text-xl font-semibold text-[#1F2937]">مرفقات الحصة</h3>
    {!files.length ? <p className="py-6 text-center text-sm text-[#9CA3AF]">لا توجد مرفقات لهذه الحصة</p> : (
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {files.map((file) => <div key={file.id || file._id || file.url} className="flex items-center justify-between rounded-xl border p-4">
          <div className="flex min-w-0 items-center gap-3"><HiOutlineDocumentText size={22} className="text-[#123C91]" /><div className="min-w-0"><p className="truncate text-sm font-medium">{file.originalName || "ملف مرفق"}</p><p className="text-xs text-[#8C9198]">{file.mimeType} {sizeLabel(file.size)}</p></div></div>
          <a href={getAssetUrl(file.url)} target="_blank" rel="noreferrer" download={file.originalName} className="rounded-lg p-2 hover:bg-gray-100" aria-label="تحميل"><HiOutlineDownload size={20} /></a>
        </div>)}
      </div>
    )}
  </div>
);

export default LessonFiles;
