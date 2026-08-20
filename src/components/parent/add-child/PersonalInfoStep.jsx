import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { getCountries } from "../../../services/APIService";
import { getArabicCountryName } from "../../../utils/countryName";

const getName = getArabicCountryName;

const getFlagUrl = (code) =>
  code ? `https://flagcdn.com/w40/${code.toLowerCase()}.png` : null;

const normalizeCountries = (raw) => {
  const list = Array.isArray(raw) ? raw : raw?.data || [];
  return list.map((c) => ({
    id: c.id,
    code: c.code,
    name: getName(c),
    flagUrl: getFlagUrl(c.code),
  }));
};

const CountryDropdown = ({ value, onChange, countries, loading }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);
  const selected = countries.find((c) => c.id === value);

  const filtered = countries.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const inputClass =
    "w-full h-12 p-4 rounded-lg border border-[#1F293733] bg-[#F9FAFA] " +
    "text-[14px] text-[#1F2937] transition-colors focus:outline-none focus:border-[#123C91]";

  return (
    <div ref={ref} className="relative">
      <label className="block font-['Tajawal'] font-medium text-[17px] text-right text-[#1F2937] p-2 w-fit">
        الدولة
      </label>
      <button
        type="button"
        onClick={() => {
          if (!loading) {
            setOpen(!open);
            setSearch("");
          }
        }}
        disabled={loading}
        className={`${inputClass} flex items-center justify-between cursor-pointer
          ${!value ? "text-[#9CA3AF]" : "text-[#1F2937]"}
          ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
      >
        <span className="flex items-center gap-2">
          {loading ? (
            "جاري تحميل الدول..."
          ) : selected ? (
            <>
              {selected.flagUrl && (
                <img
                  src={selected.flagUrl}
                  alt=""
                  className="w-5 h-3.5 object-cover rounded-xs shrink-0"
                />
              )}
              {selected.name}
            </>
          ) : (
            "اختر الدولة"
          )}
        </span>
        <ChevronDown
          size={18}
          className={`text-[#9CA3AF] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute top-full right-0 left-0 mt-1 bg-white border border-[#1F293733] rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="p-2 border-b border-[#1F293710]">
            <input
              type="text"
              placeholder="ابحث عن دولة..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 px-3 rounded-md border border-[#1F293733] bg-[#F9FAFA] text-[13px] outline-none focus:border-[#123C91]"
              autoFocus
            />
          </div>
          <ul className="max-h-48 overflow-y-auto">
            {filtered.map((c) => (
              <li
                key={c.id}
                onClick={() => {
                  onChange(c);
                  setOpen(false);
                }}
                className="px-4 py-2.5 cursor-pointer flex items-center gap-3 hover:bg-[#F0F4FC]"
              >
                {c.flagUrl && (
                  <img
                    src={c.flagUrl}
                    alt=""
                    className="w-5 h-3.5 object-cover rounded-xs shrink-0"
                  />
                )}
                <span>{c.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const PersonalInfoStep = ({ onNext, data, onChange }) => {
  const navigate = useNavigate();
  const [countries, setCountries] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [startDate, setStartDate] = useState(data.birthDate || null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    getCountries()
      .then((res) => setCountries(normalizeCountries(res.data)))
      .catch(console.error)
      .finally(() => setLoadingCountries(false));
  }, []);

  const handleDateChange = (date) => {
    setStartDate(date);
    onChange("birthDate", date);
    if (errors.birthDate) setErrors((p) => ({ ...p, birthDate: null }));
  };

  const handleField = (field, value) => {
    onChange(field, value);
    if (errors[field]) setErrors((p) => ({ ...p, [field]: null }));
  };

  const validate = () => {
    const next = {};
    if (!data.fullName?.trim()) next.fullName = "الاسم الكامل مطلوب";
    if (!data.email?.trim()) {
      next.email = "البريد الإلكتروني مطلوب";
    } else if (!/^\S+@\S+\.\S+$/.test(data.email.trim())) {
      next.email = "أدخل بريدًا إلكترونيًا صحيحًا";
    }
    if (!startDate) next.birthDate = "تاريخ الميلاد مطلوب";
    if (!data.country?.id) next.country = "الدولة مطلوبة";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleNext = () => {
    if (validate()) onNext();
  };

  const inputClass = (hasError) =>
    "w-full h-12 px-4 border rounded-lg bg-[#F9FAFA] " +
    'font-["IBM_Plex_Sans_Arabic"] font-normal text-[14px] text-right ' +
    "focus:outline-none focus:ring-2 transition-all placeholder:text-[#1F293780] " +
    (hasError
      ? "border-red-400 focus:ring-red-300"
      : "border-[#E5E5E5] focus:ring-[#123C91]");

  return (
    <div dir="rtl" className="w-full p-2">
      <div className="mb-6 sm:mb-8">
        <h2 className="font-medium text-[18px] sm:text-[20px] text-[#1F2937] text-right mb-2">
          المعلومات الشخصية
        </h2>
        <p className="text-[14px] sm:text-[16px] text-[#575F69] text-right">
          يرجى إدخال البيانات الأساسية للطالب.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* الاسم بالكامل */}
        <div className="sm:col-span-2">
          <label className="block font-['Tajawal'] font-medium text-[15px] sm:text-[17px] text-right text-[#1F2937] pb-1 w-fit">
            الاسم بالكامل
          </label>
          <input
            type="text"
            className={inputClass(!!errors.fullName)}
            placeholder="ادخل اسمه الكامل"
            value={data.fullName || ""}
            onChange={(e) => handleField("fullName", e.target.value)}
          />
          {errors.fullName && (
            <p className="text-red-500 text-[12px] mt-1 text-right">
              {errors.fullName}
            </p>
          )}
        </div>

        {/* البريد الإلكتروني */}
        <div className="sm:col-span-2">
          <label className="block font-['Tajawal'] font-medium text-[15px] sm:text-[17px] text-right text-[#1F2937] pb-1 w-fit">
            البريد الإلكتروني
          </label>
          <input
            type="email"
            className={inputClass(!!errors.email)}
            placeholder="example@mail.com"
            value={data.email || ""}
            onChange={(e) => handleField("email", e.target.value)}
          />
          {errors.email && (
            <p className="text-red-500 text-[12px] mt-1 text-right">
              {errors.email}
            </p>
          )}
        </div>

        {/* تاريخ الميلاد */}
        <div className="sm:col-span-2">
          <label className="block font-['Tajawal'] font-medium text-[15px] sm:text-[17px] text-right text-[#1F2937] pb-1 w-fit">
            تاريخ الميلاد
          </label>
          <div className="relative w-full">
            <DatePicker
              selected={startDate}
              onChange={handleDateChange}
              placeholderText="يوم / شهر / سنة"
              dateFormat="dd/MM/yyyy"
              wrapperClassName="w-full"
              className={`${inputClass(!!errors.birthDate)} pr-11`}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#9CA3AF]">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
          </div>
          {errors.birthDate && (
            <p className="text-red-500 text-[12px] mt-1 text-right">
              {errors.birthDate}
            </p>
          )}
        </div>

      

      </div>
      <div>
        <CountryDropdown
          value={data.country?.id}
          countries={countries}
          loading={loadingCountries}
          onChange={(country) => handleField("country", country)}
        />
        {errors.country && (
          <p className="text-red-500 text-[12px] mt-1 text-right">
            {errors.country}
          </p>
        )}
      </div>

      {/* الأزرار */}
      <div className="flex flex-col-reverse sm:flex-row gap-3 mt-8">
        <button
          onClick={() => navigate("/parent-dashboard")}
          className="flex-1 py-3 px-6 border border-[#E5E5E5] rounded-xl text-[#123C91] font-medium cursor-pointer text-[14px] sm:text-[16px]"
        >
          إلغاء
        </button>
        <button
          onClick={handleNext}
          className="flex-1 py-3 px-6 bg-[#123C91] text-white [&_svg]:text-white rounded-xl font-medium cursor-pointer text-[14px] sm:text-[16px]"
        >
          التالي
        </button>
      </div>
    </div>
  );
};

export default PersonalInfoStep;
