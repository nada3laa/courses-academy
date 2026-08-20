import { useState, useEffect, useRef, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";
import toast from "react-hot-toast";
import AuthLayout from "../../components/auth/AuthLayout";
import { verifyAccount, resendOtp } from "../../services/APIService";
import { AuthContext } from "../../context/AuthContext";

const OTP_LENGTH = 6;
const TIMER_START = 60;

const NEXT_ROUTE = {
  parent: "/parent-dashboard",
  student: "/register/student-details",
  teacher: "/register/teacher-details",
};

const OtpPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  const email = state?.email || "";
  const role = state?.role || "student";

  const [otp, setOtp] = useState(new Array(OTP_LENGTH).fill(""));
  const [timer, setTimer] = useState(TIMER_START);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!email) navigate("/select-account-type");
  }, [email, navigate]);

  useEffect(() => {
    if (timer <= 0) return;
    const id = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  const handleChange = (e, index) => {
    const val = e.target.value;
    if (isNaN(val)) return;
    const newOtp = [...otp];
    newOtp[index] = val.slice(-1);
    setOtp(newOtp);
    if (val && index < OTP_LENGTH - 1) inputRefs.current[index + 1].focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
    if (e.key === "ArrowLeft" && index > 0)
      inputRefs.current[index - 1].focus();
    if (e.key === "ArrowRight" && index < OTP_LENGTH - 1)
      inputRefs.current[index + 1].focus();
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    if (!pasted) return;
    const newOtp = [...otp];
    pasted.split("").forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtp(newOtp);
    inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)].focus();
    e.preventDefault();
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length !== OTP_LENGTH) {
      toast.error("يرجى إدخال رمز التفعيل كاملاً");
      return;
    }
    setLoading(true);
    try {
      const res = await verifyAccount({ email, code });
      console.log("verifyAccount response:", res.data);

      // ✅ احفظ الـ token والـ user
      const token = res.data?.token || res.data?.data?.token;
      const userData = res.data?.data || res.data?.user;

      if (token) localStorage.setItem("token", token);
      if (userData) {
        setUser(userData);
      }

      toast.success("تم تفعيل الحساب بنجاح!");
      navigate(NEXT_ROUTE[role] || "/login", { state: { email, role } });
    } catch (err) {
      toast.error(
        err.response?.data?.message || "الكود غير صحيح، حاول مرة أخرى",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await resendOtp(email);
      setTimer(TIMER_START);
      setOtp(new Array(OTP_LENGTH).fill(""));
      inputRefs.current[0].focus();
      toast.success(
        "تم إرسال كود جديد. تحقق من البريد غير المرغوب فيه (Spam) إذا لم تجده.",
      );
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || "";

      if (status === 429 || msg.includes("PLEASE_WAIT")) {
        toast.error("يرجى الانتظار قبل طلب كود جديد");
        setTimer(TIMER_START);
      } else if (status === 503) {
        toast.error("السيرفر مشغول حالياً، حاول بعد قليل");
      } else {
        toast.error("فشل إعادة الإرسال، حاول لاحقاً");
      }
    }
  };

  return (
    <AuthLayout>
      <div
        className="w-full max-w-md mx-auto p-8 flex flex-col items-center"
        dir="rtl"
      >
        <div className="w-16 h-16 rounded-full bg-[#EEF2FF] flex items-center justify-center mb-5">
          <Mail size={28} className="text-[#123C91]" />
        </div>

        <h2
          className="text-[24px] font-bold text-[#1F2937] mb-2 text-center"
          style={{ fontFamily: "Tajawal, sans-serif" }}
        >
          تحقق من بريدك الإلكتروني
        </h2>
        <p className="text-[14px] text-[#6B7280] text-center mb-2">
          أرسلنا رمز التفعيل إلى
        </p>
        <p className="text-[15px] font-semibold text-[#123C91] mb-6 text-center">
          {email}
        </p>
        <p className="mb-5 rounded-xl border-2 border-amber-300 bg-[#FFF8E6] px-4 py-3 text-center text-[14px] font-bold text-[#6B4700] shadow-sm">
          إذا لم تجد الرسالة، تحقق من مجلد البريد غير المرغوب فيه (Spam).
        </p>

        <div className="flex gap-3 mb-5" dir="ltr" onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              className="w-12 h-14 rounded-xl border border-[#1F293733] bg-[#F9FAFA] text-center text-[22px] font-semibold text-[#1F2937] outline-none focus:border-[#123C91] transition-colors"
            />
          ))}
        </div>

        <div className="mb-6 text-center">
          {timer > 0 ? (
            <p className="text-[15px] font-bold text-[#123C91]">
              {timer} ثانية
            </p>
          ) : (
            <button
              onClick={handleResend}
              className="text-[14px] font-medium text-[#123C91] underline"
            >
              إعادة إرسال الكود
            </button>
          )}
        </div>

        <button
          onClick={handleVerify}
          disabled={loading}
          className="w-full h-14 rounded-xl bg-[#123C91] text-white [&_svg]:text-white font-medium text-[16px] flex items-center justify-center disabled:opacity-70 transition-opacity"
          style={{ fontFamily: "Tajawal, sans-serif" }}
        >
          {loading ? "جاري التحقق..." : "تأكيد"}
        </button>

        <button
          onClick={() => navigate(-1)}
          className="mt-4 text-[14px] text-[#6B7280] hover:text-[#123C91] transition-colors"
        >
          ← تغيير البريد الإلكتروني
        </button>
      </div>
    </AuthLayout>
  );
};

export default OtpPage;
