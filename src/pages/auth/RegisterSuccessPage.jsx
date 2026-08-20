import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import logo from "../../assets/icons/logo.svg";
import AuthLayout from "../../components/auth/AuthLayout";

const RegisterSuccessPage = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const role = state?.role || "student";

    const steps = [
        { label: "تم استلام طلبك بنجاح", done: true },
        { label: "جاري مراجعة الحساب من الإدارة", done: false },
        { label: "سيتم إعلامك فور القبول", done: false },
    ];

    return (
        <AuthLayout>
            <div
                className="w-full max-w-md mx-auto p-8 flex flex-col items-center"
                dir="rtl"
            >
                <Link to="/">
                    <img src={logo} alt="logo" className="w-44 h-8 mb-8 cursor-pointer" />
                </Link>

                <div className="w-14 h-14 rounded-full bg-[#ECFDF5] flex items-center justify-center mb-5">
                    <CheckCircle size={30} className="text-[#059669]" />
                </div>

                <h2
                    className="text-[22px] font-bold text-[#1F2937] mb-2 text-center"
                    style={{ fontFamily: "Tajawal, sans-serif" }}
                >
                    تم إنشاء حسابك بنجاح
                </h2>
                <p className="text-[13px] text-[#6B7280] text-center mb-7">
                    حسابك كان قيد المراجعة من قِبل الإدارة
                </p>

                {/* Steps */}
                <div className="w-full bg-[#F9FAFA] rounded-xl border border-[#1F293720] p-5 mb-7 space-y-4">
                    {steps.map((step, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div
                                className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                                    step.done
                                        ? "bg-[#059669]"
                                        : "border-2 border-[#D1D5DB] bg-white"
                                }`}
                            >
                                {step.done && (
                                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                        <path
                                            d="M1 4L3.5 6.5L9 1"
                                            stroke="white"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                )}
                            </div>
                            <span
                                className={`text-[14px] ${
                                    step.done
                                        ? "text-[#059669] font-medium"
                                        : "text-[#9CA3AF]"
                                }`}
                            >
                                {step.label}
                            </span>
                        </div>
                    ))}
                </div>

                <button
                    onClick={() => navigate("/pending", { state: { role } })}
                    className="w-full h-14 rounded-lg bg-[#123C91] text-white [&_svg]:text-white font-medium text-[16px] mb-3"
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
        </AuthLayout>
    );
};

export default RegisterSuccessPage;
