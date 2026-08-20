import React from "react";
import { HiOutlineDocumentText, HiOutlineDownload } from "react-icons/hi";

const FileCard = ({ name, size, onDownload }) => (
  <div className="flex items-center justify-between gap-2 p-4 rounded-2xl border border-[#E5E5E5] bg-white transition-all cursor-pointer hover:border-gray-300">
    <div className="flex items-center gap-3 min-w-0">
      <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
        <HiOutlineDocumentText size={20} className="text-[#123C91]" />
      </div>
      <div className="min-w-0">
        <p
          className="text-[14px] font-medium text-[#1F2937] truncate mb-2"
          style={{ fontFamily: "IBM Plex Sans Arabic, sans-serif", fontWeight: 500, lineHeight: "16px" }}
        >
          {name}
        </p>
        <p
          className="text-[12px] text-[#575F69] mt-1"
          style={{ fontFamily: "IBM Plex Sans Arabic, sans-serif", fontWeight: 400, lineHeight: "16px" }}
        >
          {size}
        </p>
      </div>
    </div>
    <button
      onClick={onDownload}
      className="p-2 rounded-lg text-[#1F2937] hover:bg-gray-100 transition-all shrink-0"
      aria-label="تحميل الملف"
    >
      <HiOutlineDownload size={20} />
    </button>
  </div>
);

const LessonFiles = ({ files = [] }) => {
  const defaultFiles = [
    { id: 1, name: "شرح المصفوفات", size: "PDF • 24MB" },
    { id: 2, name: "حل واجب المعادلات", size: "PDF • 24MB" },
    { id: 3, name: "شرح المصفوفات", size: "PDF • 24MB" },
    { id: 4, name: "حل واجب المعادلات", size: "PDF • 24MB" },
  ];

  const displayFiles = files.length > 0 ? files : defaultFiles;

  return (
    <div dir="rtl" className="bg-white rounded-2xl border border-[#E5E5E5] p-4">
      <h3
        className="text-[20px] font-semibold text-[#1F2937] mb-4"
        style={{ fontFamily: "IBM Plex Sans Arabic, sans-serif", fontWeight: 600, lineHeight: "24px" }}
      >
        الملفات
      </h3>

      {displayFiles.length === 0 ? (
        <p className="text-[14px] text-[#9CA3AF] text-center py-6" style={{ fontFamily: "IBM Plex Sans Arabic" }}>
          لا توجد ملفات لهذه الحصة حتى الآن
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {displayFiles.map((file) => (
            <FileCard
              key={file.id}
              name={file.name}
              size={file.size}
              onDownload={() => console.log("Download", file.name)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default LessonFiles;