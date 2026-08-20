import BlogColorPicker from "./BlogColorPicker";
import BlogCoverUploader from "./BlogCoverUploader";
import BlogCategoryPicker from "./BlogCategoryPicker";

const Toggle = ({ checked, onChange, label, hint }) => (
  <div className="flex items-center justify-between bg-[#F9FAFA] border border-[#E5E5E5] rounded-lg px-4 py-3">
    <div className="text-right">
      <p className="text-[14px] font-medium text-[#1F2937]">{label}</p>
      {hint && <p className="text-[12px] text-[#8C9198] mt-0.5">{hint}</p>}
    </div>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${checked ? "bg-[#123C91]" : "bg-gray-300"}`}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${checked ? "left-0.5" : "left-5"}`}
      />
    </button>
  </div>
);

// كل حاجة متعلقة بالنشر: الغلاف، التصنيف، وقت القراءة، مقال مميز
// ⚠️ coverColor مش حقل موجود في الـ API — مستخدم هنا بس كخلفية شكلية قبل ما ترفعي صورة فعلية
const BlogPublishPanel = ({
  data,
  onChange,
  categories,
  onCreateCategory,
  creatingCategory,
  coverPreviewUrl,
  onCoverFileSelect,
}) => (
  <div className="space-y-5">
    <BlogColorPicker value={data.coverColor} onChange={(v) => onChange("coverColor", v)} />

    <BlogCoverUploader
      color={data.coverColor}
      previewUrl={coverPreviewUrl}
      onFileSelect={onCoverFileSelect}
    />

    <BlogCategoryPicker
      categories={categories}
      value={data.category}
      onChange={(v) => onChange("category", v)}
      onCreateCategory={onCreateCategory}
      creating={creatingCategory}
    />

    <div className="w-full">
      <label className="block font-['Tajawal'] font-medium text-[14px] text-right text-[#1F2937] pb-2">
        وقت القراءة (بالدقائق)
      </label>
      <input
        type="number"
        min="1"
        value={data.readingTime}
        onChange={(e) => onChange("readingTime", e.target.value)}
        placeholder="5"
        className="w-full h-11 px-4 border border-[#E5E5E5] rounded-lg bg-[#F9FAFA] font-['IBM_Plex_Sans_Arabic'] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#123C91] text-right text-[#1F2937]"
      />
    </div>

    <Toggle
      checked={data.isFeatured}
      onChange={(v) => onChange("isFeatured", v)}
      label="مقال مميز"
      hint="إضافة المقال إلى قسم المقالات المميزة"
    />
  </div>
);

export default BlogPublishPanel;