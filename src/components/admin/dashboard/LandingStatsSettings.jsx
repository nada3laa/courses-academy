import { useState } from "react";
import { Save } from "lucide-react";
import toast from "react-hot-toast";
import { getLandingStats, saveLandingStats } from "../../../utils/landingStats";

const fields = [
  { key: "teachers", label: "المعلمون", min: 0 },
  { key: "students", label: "الطلاب", min: 0 },
  { key: "courses", label: "الدورات التدريبية", min: 0 },
  { key: "satisfaction", label: "رضا المعلمين (%)", min: 0, max: 100 },
];

export default function LandingStatsSettings() {
  const [values, setValues] = useState(getLandingStats);

  const handleSubmit = (event) => {
    event.preventDefault();
    const normalized = Object.fromEntries(
      fields.map(({ key, min, max }) => {
        const number = Math.max(min, Number(values[key]) || 0);
        return [key, max === undefined ? number : Math.min(max, number)];
      }),
    );
    setValues(normalized);
    saveLandingStats(normalized);
    toast.success("تم تحديث أرقام الصفحة الرئيسية");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-[#E5E5E5] bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="mb-5">
        <h2 className="text-lg font-bold text-[#123C91]">إحصائيات الصفحة الرئيسية</h2>
        <p className="mt-1 text-sm text-[#6B7280]">
          هذه القيم محفوظة على هذا المتصفح فقط ولا ترتبط بقاعدة البيانات.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {fields.map((field) => (
          <label key={field.key} className="text-sm font-medium text-[#374151]">
            {field.label}
            <input
              type="number"
              min={field.min}
              max={field.max}
              value={values[field.key]}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  [field.key]: event.target.value,
                }))
              }
              className="mt-2 h-11 w-full rounded-xl border border-[#D1D5DB] bg-[#F9FAFB] px-3 outline-none focus:border-[#123C91] focus:ring-2 focus:ring-blue-100"
            />
          </label>
        ))}
      </div>

      <button
        type="submit"
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#123C91] px-5 py-3 text-sm font-semibold text-white"
      >
        <Save size={17} />
        حفظ الأرقام
      </button>
    </form>
  );
}
