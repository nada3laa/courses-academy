import { useState, useRef, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import AuthLayout from "../../components/auth/AuthLayout";
import logo from "../../assets/icons/logo.svg";
import {
  forgotPassword,
  verifyPasswordResetCode,
  resetPassword,
} from "../../services/APIService";
const OTP_LENGTH = 6;
const TIMER_START = 60;

export default function ForgotPassword() {
  const navigate = useNavigate();
  const otpRefs = useRef([]);

  const [showResetModal, setShowResetModal] = useState(false);
  const [modalStep, setModalStep] = useState("otp"); // "otp" | "password"

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(new Array(OTP_LENGTH).fill(""));
  const [timer, setTimer] = useState(TIMER_START);

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  // ---- modal countdown, same behaviour as RegisterForm ----
  useEffect(() => {
    if (!showResetModal) return;
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [showResetModal, timer]);

  // ---- Step 1: send code to email ----
  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("يرجى إدخال بريد إلكتروني صحيح");
      return;
    }
    setLoading(true);
    try {
      await forgotPassword(email);
      toast.success("تم إرسال كود التحقق. تحقق من مجلد Spam إذا لم تجده.");
      setOtp(new Array(OTP_LENGTH).fill(""));
      setPassword("");
      setPasswordConfirm("");
      setTimer(TIMER_START);
      setModalStep("otp");
      setShowResetModal(true);
    } catch (err) {
      console.error("خطأ من السيرفر (forgot-password):", err.response?.data);
      toast.error(err.response?.data?.message || "حدث خطأ أثناء إرسال الكود");
    } finally {
      setLoading(false);
    }
  };

  // ---- OTP input handling (identical logic to RegisterForm) ----
  const handleOtpChange = (target, index) => {
    const val = target.value;
    if (isNaN(val)) return;
    const newOtp = [...otp];
    newOtp[index] = val.slice(-1);
    setOtp(newOtp);
    if (val && index < OTP_LENGTH - 1) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) otpRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < OTP_LENGTH - 1)
      otpRefs.current[index + 1]?.focus();
  };

  const handleOtpPaste = (e) => {
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
    otpRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
    e.preventDefault();
  };

  // ---- Screen 1 of the modal: verify OTP with the server, then move on ----
  // /auth/verifyResetCode شغال فعلاً على السيرفر (اتأكد من Postman)،
  // فبنتحقق من الكود هنا فعليًا قبل ما نسمح للمستخدم يدخل الباسورد الجديدة.
  const handleOtpNext = async () => {
    const code = otp.join("").trim();
    if (code.length !== OTP_LENGTH) {
      toast.error("يرجى إدخال رمز التحقق كاملاً");
      return;
    }

    setVerifyLoading(true);
    try {
      const verifyRes = await verifyPasswordResetCode(code);
      console.log("Verify Response:", verifyRes.data);
      toast.success("تم التحقق من الكود بنجاح");
      setModalStep("password");
    } catch (err) {
      console.error("Verify Code Error:", err.response?.data);
      toast.error(err.response?.data?.message || "رمز التحقق غير صحيح");
    } finally {
      setVerifyLoading(false);
    }
  };

  const validatePassword = () => {
    if (password.length < 8) {
      toast.error("كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل");
      return false;
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(password)) {
      toast.error(
        "كلمة المرور يجب أن تحتوي على حروف كبيرة وصغيرة ورقم ورمز خاص",
      );
      return false;
    }
    if (password !== passwordConfirm) {
      toast.error("كلمتا المرور غير متطابقتين");
      return false;
    }
    return true;
  };

  // ---- Final step: reset password only (code already verified in handleOtpNext) ----
  const handleResetPassword = async () => {
    if (!validatePassword()) return;

    setResetLoading(true);
    try {
      const resetRes = await resetPassword({
        email,
        newPassword: password,
      });

      console.log("Reset Response:", resetRes.data);

      toast.success("تم تغيير كلمة المرور بنجاح");
      setShowResetModal(false);
      navigate("/login");
    } catch (err) {
      console.error("Status:", err.response?.status);
      console.error("Error:", err.response?.data);

      toast.error(
        err.response?.data?.message || "حدث خطأ أثناء تغيير كلمة المرور",
      );
    } finally {
      setResetLoading(false);
    }
  };

  // ---- Resend the OTP code ----
  const handleResend = async () => {
    setResendLoading(true);
    try {
      await forgotPassword(email);
      toast.success("تم إعادة إرسال الكود. تحقق من مجلد Spam إذا لم تجده.");
      setOtp(new Array(OTP_LENGTH).fill(""));
      setTimer(TIMER_START);
    } catch (err) {
      console.error("Resend Error:", err.response?.data);
      toast.error(err.response?.data?.message || "حدث خطأ أثناء إعادة الإرسال");
    } finally {
      setResendLoading(false);
    }
  };

  const inputClass =
    "w-full h-12 p-4 rounded-lg border border-[#1F293733] bg-[#F9FAFA] focus:outline-none focus:border-[#123C91] text-[14px] text-[#1F2937] placeholder:text-[#9CA3AF] transition-colors";

  return (
    <AuthLayout>
      <div className="relative w-full max-w-175 mx-auto p-6">
        <Link to="/">
          <img src={logo} alt="logo" className="w-44 h-8 mb-4 cursor-pointer" />
        </Link>
        <h2 className="text-[24px] font-bold mb-4 text-[#1F2937]">
          استعادة كلمة المرور
        </h2>

        <form className="space-y-4" onSubmit={handleSendEmail}>
          <div>
            <label className="block text-[13px] font-medium text-[#1F2937] mb-1">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              placeholder="example@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 rounded-lg bg-[#123C91] text-white [&_svg]:text-white font-medium text-[16px] flex items-center justify-center disabled:opacity-70 transition-opacity mt-2"
            style={{ fontFamily: "Tajawal, sans-serif" }}
          >
            {loading ? "جاري الإرسال..." : "إرسال الكود"}
          </button>

          <div className="flex items-center justify-center gap-1 pt-2">
            <span className="text-[14px] text-[#1F2937]">
              تذكرت كلمة المرور؟
            </span>
            <Link
              to="/login"
              className="text-[14px] font-medium text-[#123C91] border-b border-[#123C91]"
            >
              تسجيل الدخول
            </Link>
          </div>
        </form>

        {/* Reset Modal — OTP first (verified with server), then new password */}
        {showResetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div
              className="bg-white p-8 md:p-10 flex flex-col items-center shadow-[0px_20px_60px_0px_#1F29371F] overflow-y-auto max-h-[90vh]"
              style={{
                width: "100%",
                maxWidth: "720px",
                borderRadius: "24px",
                gap: "16px",
              }}
            >
              {modalStep === "otp" && (
                <>
                  <p className="font-normal text-[18px] md:text-[20px] leading-8 text-center text-[#1F2937] p-2">
                    نرجو إدخال رمز التحقق المرسل إلى البريد الإلكتروني:
                  </p>
                  <p className="font-medium text-[20px] md:text-[22px] leading-8 text-center text-[#123C91] p-2 mb-2">
                    {email}
                  </p>
                  <p
                    dir="rtl"
                    className="rounded-xl border-2 border-amber-300 bg-[#FFF8E6] px-4 py-3 text-center text-[14px] font-bold text-[#6B4700] shadow-sm"
                  >
                    إذا لم تجد الرسالة، تحقق من مجلد البريد غير المرغوب فيه
                    (Spam).
                  </p>

                  <div
                    dir="ltr"
                    className="flex justify-center gap-2 mb-4"
                    onPaste={handleOtpPaste}
                  >
                    {otp.map((data, i) => (
                      <input
                        key={i}
                        ref={(el) => (otpRefs.current[i] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength="1"
                        value={data}
                        onChange={(e) => handleOtpChange(e.target, i)}
                        onKeyDown={(e) => handleOtpKeyDown(e, i)}
                        className="w-12 h-14 md:w-14 md:h-14 rounded-lg border border-[#1F293733] bg-[#F9FAFA] text-center text-xl outline-none focus:border-[#123C91] transition-colors"
                      />
                    ))}
                  </div>

                  <div className="mb-4">
                    {timer > 0 ? (
                      <p className="font-bold text-[20px] text-center text-[#123C91]">
                        {timer} ثانية
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResend}
                        disabled={resendLoading}
                        className="text-[#123C91] underline w-full disabled:opacity-60"
                      >
                        {resendLoading
                          ? "جاري إعادة الإرسال..."
                          : "إعادة إرسال الكود"}
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col md:flex-row gap-4 w-full justify-center">
                    <button
                      type="button"
                      onClick={() => setShowResetModal(false)}
                      className="w-full md:w-77 h-14 rounded-lg border border-[#1F293733] bg-white text-[#123C91]"
                    >
                      إلغاء
                    </button>
                    <button
                      type="button"
                      onClick={handleOtpNext}
                      disabled={verifyLoading}
                      className="w-full md:w-77 h-14 rounded-lg bg-[#123C91] text-white [&_svg]:text-white transition-opacity disabled:opacity-70"
                    >
                      {verifyLoading ? "جاري التحقق..." : "التالي"}
                    </button>
                  </div>
                </>
              )}

              {modalStep === "password" && (
                <>
                  <p className="font-normal text-[18px] md:text-[20px] leading-8 text-center text-[#1F2937] p-2 mb-2">
                    أدخل كلمة المرور الجديدة
                  </p>

                  <div className="w-full space-y-4">
                    <div>
                      <label className="block text-[13px] font-medium text-[#1F2937] mb-1">
                        كلمة المرور الجديدة
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="********"
                          value={password}
                          autoComplete="new-password"
                          onChange={(e) => setPassword(e.target.value)}
                          className={inputClass}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
                        >
                          {showPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[13px] font-medium text-[#1F2937] mb-1">
                        تأكيد كلمة المرور
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="********"
                          value={passwordConfirm}
                          autoComplete="new-password"
                          onChange={(e) => setPasswordConfirm(e.target.value)}
                          className={inputClass}
                          required
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
                        >
                          {showConfirmPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-4 w-full justify-center mt-6">
                    <button
                      type="button"
                      onClick={() => setModalStep("otp")}
                      className="w-full md:w-77 h-14 rounded-lg border border-[#1F293733] bg-white text-[#123C91]"
                    >
                      رجوع
                    </button>
                    <button
                      type="button"
                      onClick={handleResetPassword}
                      disabled={resetLoading}
                      className="w-full md:w-77 h-14 rounded-lg bg-[#123C91] text-white [&_svg]:text-white disabled:opacity-70 transition-opacity"
                    >
                      {resetLoading ? "جاري الحفظ..." : "حفظ كلمة المرور"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </AuthLayout>
  );
}
