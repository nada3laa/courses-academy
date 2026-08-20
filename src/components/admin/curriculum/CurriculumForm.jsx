import React, { useState, useEffect } from "react";
import { getCountries } from "../../../services/APIService";
import { Loader2 } from "lucide-react";
import { countryOption } from "../../../utils/countryName";

const CurriculumForm = ({ data, onChange }) => {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getCountries()
      .then((res) => {
        const list = res?.data?.data || res?.data || [];
        setCountries(
          list.map(countryOption),
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const inputClass =
    "w-full h-12 px-4 border border-[#E5E5E5] rounded-lg bg-[#F9FAFA] font-['IBM_Plex_Sans_Arabic'] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#123C91] transition-all text-right";

  return (
    <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-sm space-y-4">
      <h3 className="font-['Tajawal'] font-bold text-[16px] text-[#1F2937] mb-2">
        بيانات المنهج الأساسية
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[14px] text-[#575F69] mb-1">
            اسم المنهج (عربي)
          </label>
          <input
            className={inputClass}
            value={data.name.ar}
            onChange={(e) =>
              onChange("name", { ...data.name, ar: e.target.value })
            }
            placeholder="مثال: المنهج المصري"
          />
        </div>
        <div>
          <label className="block text-[14px] text-[#575F69] mb-1">
            اسم المنهج (English)
          </label>
          <input
            className={inputClass}
            dir="ltr"
            value={data.name.en}
            onChange={(e) =>
              onChange("name", { ...data.name, en: e.target.value })
            }
            placeholder="e.g. Egyptian Curriculum"
          />
        </div>
      </div>

      <div>
        <label className="block text-[14px] text-[#575F69] mb-1">الدولة</label>
        <select
          className={inputClass}
          value={data.country}
          onChange={(e) => onChange("country", e.target.value)}
        >
          <option value="">
            {loading ? "جاري التحميل..." : "اختر الدولة"}
          </option>
          {countries.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-[14px] text-[#575F69] mb-1">
          وصف المنهج
        </label>
        <textarea
          className={`${inputClass} h-24 pt-3`}
          value={data.description}
          onChange={(e) => onChange("description", e.target.value)}
          placeholder="أدخل وصفاً للمنهج..."
        />
      </div>
    </div>
  );
};

export default CurriculumForm;
