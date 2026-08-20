import { useRef } from "react";
import { Megaphone } from "lucide-react";

const BlogCoverUploader = ({ color, previewUrl, onFileSelect }) => {
  const inputRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  };

  return (
    <div>
      <label className="block font-['Tajawal'] font-medium text-[14px] text-right text-[#1F2937] pb-2">
        صورة الغلاف
      </label>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="w-full h-40 rounded-xl border-2 border-dashed border-white/40 flex flex-col items-center justify-center gap-2 overflow-hidden relative"
        style={{ backgroundColor: previewUrl ? undefined : color }}
      >
        {previewUrl ? (
          <img src={previewUrl} alt="cover preview" className="w-full h-full object-cover" />
        ) : (
          <>
            <Megaphone className="w-10 h-10 text-white/50" strokeWidth={1.5} />
            <span className="text-white/70 text-[13px] font-['IBM_Plex_Sans_Arabic']">
              اضغط لإضافة صورة غلاف مميزة
            </span>
          </>
        )}
      </button>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
};

export default BlogCoverUploader;