import React from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Check, Clock } from "lucide-react";
import logo from "../../assets/icons/logo.svg";

const steps = [
  { label: "تم استلام طلبك بنجاح", done: true },
  { label: "جاري مراجعة الحساب من الإدارة", done: false },
  { label: "سيتم إشعارك فور القبول", done: false },
];

const PendingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F5F7FF] flex items-center justify-center p-4" dir="rtl">
      {/* decorative blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-[#123C91]/6" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-[#123C91]/6" />
      </div>

      <div className="relative bg-white rounded-3xl shadow-[0_8px_40px_rgba(18,60,145,0.08)] w-full max-w-md p-10 flex flex-col items-center text-center">

        <Link to="/">
          <img src={logo} alt="الأكاديمية" className="h-8 w-auto mb-8" />
        </Link>

        {/* success icon */}
        <div className="w-16 h-16 rounded-full border-2 border-[#00A63E] flex items-center justify-center mb-6">
          <CheckCircle size={36} className="text-[#00A63E]" strokeWidth={1.5} />
        </div>

        <h2 className="text-[22px] font-bold text-[#1F2937] mb-2"
            style={{ fontFamily: "Tajawal, sans-serif" }}>
          تم إنشاء حسابك بنجاح
        </h2>
        <p className="text-[14px] text-[#6B7280] mb-8">
          حسابك الآن قيد المراجعة من قبل الإدارة
        </p>

        {/* steps */}
        <div className="w-full bg-[#F9FAFA] rounded-2xl p-5 mb-8 flex flex-col gap-4 text-right">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                s.done
                  ? "bg-[#00A63E26]"
                  : "border-2 border-[#E5E5E5]"
              }`}>
                {s.done && <Check size={13} className="text-[#00A63E]" strokeWidth={2.5} />}
              </div>
              <span className={`text-[14px] ${s.done ? "text-[#1F2937] font-medium" : "text-[#9CA3AF]"}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate("/pending")}
          className="w-full h-13 rounded-xl bg-[#123C91] text-white [&_svg]:text-white font-semibold text-[15px] mb-4 hover:bg-[#0f3278] transition-colors"
          style={{ fontFamily: "Tajawal, sans-serif" }}
        >
          عرض حالة الطلب
        </button>

        {/* <button
          onClick={() => navigate("/login")}
          className="text-[14px] text-[#6B7280] hover:text-[#123C91] transition-colors"
        >
          العودة لتسجيل الدخول
        </button> */}

      </div>
    </div>
  );
};

export default PendingPage;
