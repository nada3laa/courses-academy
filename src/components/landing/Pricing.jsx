import { useContext, useEffect, useMemo, useState } from "react";
import { Check, Crown, Loader2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
// ⚠️ عدّل المسار ده حسب مكان ملف الـ api عندك في المشروع
import { getAllPackages } from "../../services/APIService";
import { AuthContext } from "../../context/AuthContext";

// باقة التجربة المجانية مش باقة حقيقية من الباك إند، ثابتة تسويقياً فقط
const FREE_TRIAL_PLAN = {
  id: "free-trial",
  title: "التجربة المجانية",
  sub: "مثالية للتجربة والتعرف على المنصة",
  price: "مجانية",
  period: "وصول محدود لمدة 7 أيام",
  features: ["حضور حصة تجريبية مجانية", "التواصل مع الإدارة فقط"],
  button: "ابدأ الآن",
  variant: "outline",
  isPopular: false,
};

const ANNUAL_DISCOUNT = 0.2;

const mapApiPackage = (pkg, isAnnual, isPopular) => {
  const monthly = pkg.price;
  const annual = Math.round(monthly * 12 * (1 - ANNUAL_DISCOUNT));

  return {
    id: pkg.id,
    title: pkg.name,
    sub: `باقة تشمل ${pkg.sessions} حصة دراسية شهرياً`,
    price: isAnnual
      ? `EGP ${annual.toLocaleString()}`
      : `EGP ${monthly.toLocaleString()}`,
    period: `حتى ${pkg.sessions} حصة شهرياً`,
    features: [
      `${pkg.sessions} حصة دراسية شهرياً`,
      "حضور الدروس المباشرة",
      "مشاهدة تسجيلات الحصص",
      "الواجبات والمتابعة",
      "تقييمات وتقارير أداء",
      "تواصل ولي الأمر مع المدرس",
    ],
    button: "ابدأ الآن",
    variant: isPopular ? "solid" : "outline",
    isPopular,
  };
};

const Pricing = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext) || {};
  const isLoggedIn = Boolean(user || localStorage.getItem("token"));
  const [isAnnual, setIsAnnual] = useState(false);
  const [apiPackages, setApiPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPackages = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await getAllPackages();
        const active = (res.data.data || [])
          .filter((p) => p.isActive)
          .sort((a, b) => a.price - b.price);
        setApiPackages(active);
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            "تعذر تحميل الباقات، حاول مرة أخرى لاحقاً",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, []);

  // أغلى باقة تتعامل كـ "الأكثر اختياراً"
  const plans = useMemo(() => {
    if (apiPackages.length === 0) return [FREE_TRIAL_PLAN];
    const popularId = apiPackages[apiPackages.length - 1].id;
    const mapped = apiPackages.map((pkg) =>
      mapApiPackage(pkg, isAnnual, pkg.id === popularId),
    );
    return [FREE_TRIAL_PLAN, ...mapped];
  }, [apiPackages, isAnnual]);

  return (
    <section className="py-20 font-sans" dir="rtl" id="pricing">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <h2 className="font-['Tajawal'] font-bold text-[48px] leading-14 text-[#1F2937] p-4 rounded-lg text-center">
          الباقات و الأسعار
        </h2>
        <p className="font-['IBM_Plex_Sans_Arabic'] font-normal text-[18px] leading-6 text-[#1F2937B2] p-4 rounded-lg text-center mb-8">
          اختر الباقة المناسبة لك ولأبنائك واستمتع بتجربة تعليمية متميزة
        </p>

        <div className="flex items-center justify-center gap-4 mb-12" dir="rtl">
          <span
            className={`font-semibold text-[16px] ${isAnnual ? "text-gray-500" : "text-[#123C91]"}`}
          >
            شهرياً
          </span>

          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className={`relative w-14 h-7 rounded-full p-1 flex items-center transition-colors duration-300 ${
              isAnnual
                ? "bg-[#123C91] text-white [&_svg]:text-white"
                : "bg-gray-300"
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full transition-all duration-300 shadow-sm ${
                isAnnual ? "mr-7" : "mr-0"
              }`}
            />
          </button>

          <div className="flex items-center gap-2">
            <span
              className={`font-semibold text-[16px] ${isAnnual ? "text-[#123C91]" : "text-gray-500"}`}
            >
              سنوياً
            </span>

            <div
              className={`bg-[#EBF4FF] text-[#123C91] text-[10px] font-bold px-2 mr-1 py-0.5 rounded-md border border-[#123C91] transition-all duration-300 ${isAnnual ? "opacity-100 visible" : "opacity-0 invisible"}`}
            >
              وفّر 20%
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16 text-[#8C9198]">
            <Loader2 size={20} className="animate-spin ml-2" />
            <span className="text-[14px]">جاري تحميل الباقات...</span>
          </div>
        )}

        {!loading && error && (
          <div className="flex items-center justify-center gap-2 py-6 text-red-600 text-[14px]">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {!loading && (
          <div className="flex flex-wrap items-stretch justify-center gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative flex w-full max-w-sm flex-col rounded-2xl border p-6 transition-shadow md:basis-[calc(33.333%-1rem)] ${plan.isPopular ? "border-[#123C91] shadow-2xl" : "border-[#1F293733] bg-[#FFFFFF]"}`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#EAF4FF] text-[#123C91] text-xs font-bold px-4 py-1 rounded-full border border-[#123C91] flex items-center gap-1">
                    <Crown size={12} /> الأكثر اختياراً
                  </div>
                )}

                <h3 className="font-['Tajawal'] font-bold text-[27px] text-[#1F2937] text-right">
                  {plan.title}
                </h3>
                <p className="font-['IBM_Plex_Sans_Arabic'] text-[14px] text-[#1F2937] text-right mt-1">
                  {plan.sub}
                </p>
                <div className="font-['Tajawal'] font-bold text-[32px] text-[#1F2937] text-right mt-2">
                  {plan.price}
                </div>
                <p className="font-['IBM_Plex_Sans_Arabic'] text-[14px] text-[#5D3A82] text-right mt-1 mb-6">
                  {plan.period}
                </p>

                <ul className="text-right space-y-3 mb-8 grow">
                  {plan.features.map((f, j) => (
                    <li
                      key={j}
                      className="flex items-center gap-2 font-['IBM_Plex_Sans_Arabic'] text-[14px] text-[#1F2937]"
                    >
                      <Check
                        size={16}
                        className="text-[#123C91] shrink-0"
                        strokeWidth={3}
                      />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                {!isLoggedIn && (
                  <button
                    type="button"
                    onClick={() => navigate("/select-account-type")}
                    className={`h-12 rounded-lg font-['Tajawal'] font-medium text-[16px] transition-all ${plan.variant === "solid" ? "bg-[#123C91] text-white [&_svg]:text-white" : "bg-white text-[#123C91] border border-[#123C91] hover:bg-[#123C91] hover:text-white hover:[&_svg]:text-white"}`}
                  >
                    ابدأ الآن
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Pricing;
