export const BLOG_COLORS = [
  { name: "peach", hex: "#F2A65A" },
  { name: "teal", hex: "#2DD4BF" },
  { name: "pink", hex: "#EC4899" },
  { name: "blue", hex: "#123C91" },
];

const BlogColorPicker = ({ value, onChange }) => (
  <div>
    <label className="block font-['Tajawal'] font-medium text-[14px] text-right text-[#1F2937] pb-2">
      لون الغلاف
    </label>
    <div className="flex items-center gap-3 justify-end">
      {BLOG_COLORS.map((c) => (
        <button
          key={c.name}
          type="button"
          onClick={() => onChange(c.hex)}
          style={{ backgroundColor: c.hex }}
          className={`w-8 h-8 rounded-full transition-all ${
            value === c.hex ? "ring-2 ring-offset-2 ring-[#123C91]" : "hover:scale-110"
          }`}
          aria-label={c.name}
        />
      ))}
    </div>
  </div>
);

export default BlogColorPicker;