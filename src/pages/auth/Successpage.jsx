import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/icons/logo.svg";
import AuthLayout from "../../components/auth/AuthLayout";

const SuccessPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const role = state?.role || "student";

  return (
    <AuthLayout>
      <div className="w-full max-w-md mx-auto p-8 flex flex-col items-center" dir="rtl">
        <Link to="/">
          <img src={logo} alt="logo" className="w-44 h-8 mb-8 cursor-pointer" />
        </Link>

        <div className="w-12 h-12 rounded-full border-2 border-[#14B8A6] flex items-center justify-center mb-5">
          <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
            <path d="M1 8L7 14L19 1" stroke="#14B8A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h2 className="text-[20px] font-bold text-[#1F2937] mb-1 text-center" style={{ fontFamily: "Tajawal, sans-serif" }}>
          تم إنشاء حسابك بنجاح
        </h2>
        <p className="text-[13px] text-[#6B7280] text-center mb-6">
          حسابك الآن قيد المراجعة من قبل الإدارة
        </p>

        <div className="w-full bg-[#F9FAFA] rounded-xl border border-[#1F293733] p-5 mb-6">
          <div className="flex items-center gap-3 py-2">
            <div className="w-5 h-5 rounded-full bg-[#059669] flex items-center justify-center shrink-0">
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-[14px] text-[#059669] font-medium">تم إنشاء طلبك بنجاح</span>
          </div>
          <div className="flex items-center gap-3 py-2">
            <div className="w-5 h-5 rounded-full border-2 border-[#D1D5DB] bg-white shrink-0" />
            <span className="text-[14px] text-[#9CA3AF]">جاري مراجعة الحساب من الإدارة</span>
          </div>
          <div className="flex items-center gap-3 py-2">
            <div className="w-5 h-5 rounded-full border-2 border-[#D1D5DB] bg-white shrink-0" />
            <span className="text-[14px] text-[#9CA3AF]">سيتم إعلامك فور القبول</span>
          </div>
        </div>

        <button
          onClick={() => navigate("/pending", { state: { role } })}
          className="w-full h-14 rounded-xl bg-[#123C91] text-white [&_svg]:text-white font-medium text-[16px] mb-3"
          style={{ fontFamily: "Tajawal, sans-serif" }}
        >
          عرض حالة الطلب
        </button>

        <button
          onClick={() => navigate("/login")}
          className="w-full h-14 rounded-xl border border-[#1F293733] text-[#6B7280] font-medium text-[16px] bg-white"
          style={{ fontFamily: "Tajawal, sans-serif" }}
        >
          العودة لتسجيل الدخول
        </button>
      </div>
    </AuthLayout>
  );
};

export default SuccessPage;
