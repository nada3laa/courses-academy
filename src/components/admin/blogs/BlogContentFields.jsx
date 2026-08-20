const InputField = ({ label, ...props }) => (
  <div className="w-full">
    <label className="block font-['Tajawal'] font-medium text-[14px] text-right text-[#1F2937] pb-2">{label}</label>
    <input
      {...props}
      className="w-full h-11 px-4 border border-[#E5E5E5] rounded-lg bg-[#F9FAFA] font-['IBM_Plex_Sans_Arabic'] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#123C91] text-right text-[#1F2937]"
    />
  </div>
);

const TextareaField = ({ label, rows = 3, ...props }) => (
  <div className="w-full">
    <label className="block font-['Tajawal'] font-medium text-[14px] text-right text-[#1F2937] pb-2">{label}</label>
    <textarea
      {...props}
      rows={rows}
      className="w-full px-4 py-3 border border-[#E5E5E5] rounded-lg bg-[#F9FAFA] font-['IBM_Plex_Sans_Arabic'] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#123C91] text-right text-[#1F2937] resize-none"
    />
  </div>
);

// عنوان المقال + الوصف المختصر (description) + المحتوى الكامل (content)
const BlogContentFields = ({ data, onChange }) => (
  <div className="space-y-5">
    <InputField
      label="عنوان المقال"
      value={data.title}
      onChange={(e) => onChange("title", e.target.value)}
      placeholder="ادخل عنوان المقال..."
    />
    <TextareaField
      label="ملخص المقال (Description)"
      rows={2}
      value={data.description}
      onChange={(e) => onChange("description", e.target.value)}
      placeholder="اكتب ملخص المقال هنا..."
    />
    <TextareaField
      label="محتوى المقال"
      rows={6}
      value={data.content}
      onChange={(e) => onChange("content", e.target.value)}
      placeholder="اكتب محتوى المقال هنا..."
    />
  </div>
);

export default BlogContentFields;