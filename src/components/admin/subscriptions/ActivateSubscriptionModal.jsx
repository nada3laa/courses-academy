import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronDown, ChevronUp, ArrowLeft } from "lucide-react";
// import AdminLayout from "../../../components/admin/layout/AdminLayout";

const MOCK_REQUESTS = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  student: "محمد أحمد",
  subjects:
    i % 3 === 0
      ? ["رياضيات", "لغة عربية", "فيزياء"]
      : i % 3 === 1
      ? ["رياضيات"]
      : ["كيمياء", "رياضيات", "لغة عربية", "فيزياء"],
}));

const TEACHERS  = ["محمد أحمد", "فاطمة حسن", "أحمد سالم", "منى صالح"];
const GROUPS    = ["مجموعة أ", "مجموعة ب", "مجموعة ج"];
const PACKAGES  = ["باقة المادة الواحدة", "باقة الثلاث مواد", "باقة شاملة"];
const DISCOUNTS = ["بدون خصم", "SAVE20 — 20%", "FLAT150 — 150 جنيه"];
const PACKAGE_PRICES = {
  "باقة المادة الواحدة": 250,
  "باقة الثلاث مواد":   650,
  "باقة شاملة":         1200,
};

const SelectField = ({ label, options, value, onChange }) => (
  <div className="mb-3">
    <label className="block text-[13px] font-medium text-[#575F69] mb-1 text-right">{label}</label>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-11 px-4 border border-[#E5E5E5] rounded-lg bg-white font-['IBM_Plex_Sans_Arabic'] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#123C91] appearance-none text-right text-[#1F2937] hover:border-[#123C91] transition-colors"
      >
        <option value="">{"اختر " + label}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#9CA3AF]" />
    </div>
  </div>
);

const SubjectAccordion = ({ subject, index }) => {
  const [open,     setOpen]     = useState(index === 0);
  const [teacher,  setTeacher]  = useState("");
  const [group,    setGroup]    = useState("");
  const [pkg,      setPkg]      = useState("");
  const [discount, setDiscount] = useState("");

  const basePrice   = PACKAGE_PRICES[pkg] ?? null;
  const discountAmt =
    discount === "SAVE20 — 20%"       ? Math.round((basePrice ?? 0) * 0.2) :
    discount === "FLAT150 — 150 جنيه" ? 150 : 0;
  const finalPrice  = basePrice !== null ? Math.max(0, basePrice - discountAmt) : null;

  return (
    <div className="border border-[#E5E5E5] rounded-xl overflow-hidden hover:shadow-sm transition-shadow">
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between px-5 py-4 bg-[#F9FAFA] hover:bg-gray-50 transition-colors"
      >
        <span className="text-[#6B7280]">
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
        <span className="font-['Tajawal'] font-semibold text-[15px] text-[#1F2937]">{subject}</span>
      </button>

      {open && (
        <div className="px-5 pt-4 pb-5 bg-white">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <SelectField label="المعلم"   options={TEACHERS}  value={teacher}  onChange={setTeacher}  />
            <SelectField label="المجموعة" options={GROUPS}    value={group}    onChange={setGroup}    />
            <SelectField label="الباقة"   options={PACKAGES}  value={pkg}      onChange={setPkg}      />
            <SelectField label="الخصم"    options={DISCOUNTS} value={discount} onChange={setDiscount} />
          </div>
          {finalPrice !== null && (
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <span className="font-['Tajawal'] font-bold text-[15px] text-[#123C91]">{finalPrice} جنيه مصري</span>
              <span className="text-[13px] text-[#8C9198]">السعر النهائي</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ActivateSubscriptionPage = () => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const request = MOCK_REQUESTS.find((r) => r.id === Number(id)) ?? MOCK_REQUESTS[0];

  const handleSubmit = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      navigate("/admin/subscriptions/requests");
    }, 800);
  };

  return (

      <div dir="rtl" className="w-full p-2 sm:p-4 font-['IBM_Plex_Sans_Arabic']">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
          <button
            onClick={() => navigate(`/admin/subscriptions/requests/${id}`)}
            className="flex items-center gap-2 text-[#575F69] hover:text-[#123C91] text-[14px] transition-colors"
          >
            <ArrowLeft size={16} />
            <span>تفاصيل الطلب</span>
          </button>
          <div className="text-right">
            <h2 className="font-['IBM_Plex_Sans_Arabic'] font-semibold text-[20px] text-[#123C91]">
              تفعيل الاشتراك
            </h2>
            <p className="text-[#575F69] text-[13px] mt-0.5">
              حدد المعلم والمجموعة والباقة لكل مادة ثم أكد الاشتراك
            </p>
          </div>
        </div>

        {/* ✅ Content - full width like RequestDetailsPage */}
        <div className="space-y-3 max-w-2xl mr-auto">
          {request.subjects.map((subject, i) => (
            <SubjectAccordion key={subject} subject={subject} index={i} />
          ))}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex-1 py-3 bg-[#123C91] text-white [&_svg]:text-white rounded-xl font-medium text-[14px] hover:bg-[#0f3280] disabled:opacity-60 transition-colors"
            >
              {saving ? "جارٍ التفعيل..." : "تفعيل الاشتراك"}
            </button>
            <button
              onClick={() => navigate(`/admin/subscriptions/requests/${id}`)}
              className="flex-1 py-3 border border-[#E5E5E5] rounded-xl text-[#374151] font-medium text-[14px] hover:border-gray-400 transition-colors"
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>
   
  );
};

export default ActivateSubscriptionPage;