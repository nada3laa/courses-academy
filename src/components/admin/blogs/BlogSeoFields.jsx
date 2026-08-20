const InputField = ({ label, ...props }) => (
  <div className="w-full">
    <label className="block font-['Tajawal'] font-medium text-[14px] text-right text-[#1F2937] pb-2">{label}</label>
    <input
      {...props}
      className="w-full h-11 px-4 border border-[#E5E5E5] rounded-lg bg-[#F9FAFA] font-['IBM_Plex_Sans_Arabic'] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#123C91] text-right text-[#1F2937]"
    />
  </div>
);

const TextareaField = ({ label, rows = 2, ...props }) => (
  <div className="w-full">
    <label className="block font-['Tajawal'] font-medium text-[14px] text-right text-[#1F2937] pb-2">{label}</label>
    <textarea
      {...props}
      rows={rows}
      className="w-full px-4 py-3 border border-[#E5E5E5] rounded-lg bg-[#F9FAFA] font-['IBM_Plex_Sans_Arabic'] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#123C91] text-right text-[#1F2937] resize-none"
    />
  </div>
);

// seoTitle / seoDescription — منفصلين عن عنوان وملخص المقال العاديين
const BlogSeoFields = ({ data, onChange }) => (
  <div className="bg-[#F9FAFA] border border-[#E5E5E5] rounded-xl p-4 space-y-4">
    <p className="font-['Tajawal'] font-medium text-[14px] text-[#1F2937] text-right">
      إعدادات السيو (SEO)
    </p>
    <InputField
      label="عنوان السيو"
      value={data.seoTitle}
      onChange={(e) => onChange("seoTitle", e.target.value)}
      placeholder="عنوان مخصص لمحركات البحث..."
    />
    <TextareaField
      label="وصف السيو"
      value={data.seoDescription}
      onChange={(e) => onChange("seoDescription", e.target.value)}
      placeholder="وصف مخصص لمحركات البحث..."
    />
  </div>
);

export default BlogSeoFields;