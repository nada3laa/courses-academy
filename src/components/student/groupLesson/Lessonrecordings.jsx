import React from "react";
import { HiOutlinePlay, HiOutlineDownload, HiOutlineShare } from "react-icons/hi";

const RecordingCard = ({ title, subject, date, size, thumbnail, isLive, onPlay, onDownload, onShare }) => (
  <div className="rounded-2xl border border-[#E5E5E5] overflow-hidden bg-white hover:border-gray-300 transition-all">
    <div className="relative aspect-video bg-gray-100 overflow-hidden">
      {thumbnail ? (
        <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <HiOutlinePlay size={40} className="text-gray-300" />
        </div>
      )}
      {isLive && (
        <span
          className="absolute top-2 right-2 bg-[#00A63E] text-white text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ fontFamily: "IBM Plex Sans Arabic" }}
        >
          الآن
        </span>
      )}
      <button
        onClick={onPlay}
        className="absolute inset-0 flex items-center justify-center bg-[#1F2937]/20 opacity-0 hover:opacity-100 transition-all"
      >
        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg">
          <HiOutlinePlay size={24} className="text-[#1F2937] ml-1" />
        </div>
      </button>
    </div>

    <div className="p-4" dir="rtl">
      <h4
        className="text-[14px] font-medium text-[#1F2937] truncate mb-2"
        style={{ fontFamily: "IBM Plex Sans Arabic, sans-serif", lineHeight: "16px" }}
      >
        {title}
      </h4>
      <p
        className="text-[12px] text-[#575F69] mt-1 mb-3"
        style={{ fontFamily: "IBM Plex Sans Arabic, sans-serif", lineHeight: "16px" }}
      >
        {subject} • {date}
      </p>
      <div className="flex items-center justify-between">
        <span className="text-[12px] text-[#575F69]" style={{ fontFamily: "IBM Plex Sans Arabic" }}>
          {size}
        </span>
        <div className="flex items-center gap-1">
          <button onClick={onShare} className="p-1.5 rounded-lg text-[#1F2937] hover:bg-gray-100 transition-all">
            <HiOutlineShare size={18} />
          </button>
          <button onClick={onDownload} className="p-1.5 rounded-lg text-[#1F2937] hover:bg-gray-100 transition-all">
            <HiOutlineDownload size={18} />
          </button>
        </div>
      </div>
    </div>
  </div>
);

const LessonRecordings = ({ recordings = [] }) => {
  const defaultRecordings = [
    { id: 1, title: "حساب المتجهات والمصفوفات", subject: "رياضيات A", date: "2024-06-13", size: "1.8 GB", isLive: false, thumbnail: null },
    { id: 2, title: "حساب المتجهات والمصفوفات", subject: "رياضيات A", date: "2024-06-13", size: "1.8 GB", isLive: true, thumbnail: null },
  ];

  const displayRecordings = recordings.length > 0 ? recordings : defaultRecordings;

  return (
    <div dir="rtl" className="p-5">
      <h3
        className="text-[20px] font-semibold text-[#1F2937] mb-4"
        style={{ fontFamily: "IBM Plex Sans Arabic, sans-serif", lineHeight: "24px" }}
      >
        التسجيلات
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayRecordings.map((rec) => (
          <RecordingCard key={rec.id} {...rec} />
        ))}
      </div>
    </div>
  );
};

export default LessonRecordings;