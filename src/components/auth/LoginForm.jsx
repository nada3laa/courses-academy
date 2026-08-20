import { useState, useContext } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import logo from "../../assets/icons/logo.svg";
import { AuthContext } from "../../context/AuthContext";
import { getDashboardPathByRole, getRegistrationContinuation } from "../../utils/roles";

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  // بدل "email" بس، بقى فيه حقل واحد بياخد إيميل أو يوزرنيم أو رقم تليفون
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const rawIdentifier = credentials.email.trim();
      const normalizedIdentifier = rawIdentifier.includes("@")
        ? rawIdentifier.toLowerCase()
        : rawIdentifier;

      const loginPayload = {
        password: credentials.password,
        email: normalizedIdentifier,
        username: normalizedIdentifier,
        phone: normalizedIdentifier,
        identifier: normalizedIdentifier,
      };

      const data = await login(loginPayload);
      toast.success("تم تسجيل الدخول بنجاح!");

      const loggedInUser = data?.user ?? data;
      const continuation = getRegistrationContinuation(loggedInUser);
      navigate(continuation?.path || getDashboardPathByRole(loggedInUser), {
        state: continuation?.state,
      });

    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        "حدث خطأ أثناء تسجيل الدخول، يرجى المحاولة لاحقاً."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-8 flex flex-col items-center" dir="rtl">
      <div className="w-full max-w-150 flex flex-col items-start mb-10">
        <Link to="/" className="mb-4">
          <img src={logo} alt="logo" className="cursor-pointer" style={{ width: "176px", height: "32px" }} />
        </Link>
        <h2 className="font-bold text-[24px] text-[#1F2937]" style={{ fontFamily: "Tajawal, sans-serif" }}>
          مرحباً بك...
        </h2>
      </div>

      <form className="w-full space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
            البريد الإلكتروني أو اسم المستخدم أو رقم الهاتف
          </label>
          <input
            type="text"
            placeholder="أدخل بريدك الإلكتروني أو اسم المستخدم أو رقم هاتفك"
            required
            autoComplete="username"
            onChange={(e) => setCredentials({ ...credentials, email: e.target.value.trim() })}
            className="w-full h-12 px-4 rounded-lg border border-[#1F293733] bg-[#F9FAFA] focus:outline-none focus:border-[#123C91] text-[14px]"
          />
        </div>

        <div>
          <label className="block text-[14px] font-medium text-[#1F2937] mb-2">كلمة المرور</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="********"
              required
              autoComplete="current-password"
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              className="w-full h-12 px-4 rounded-lg border border-[#1F293733] bg-[#F9FAFA] focus:outline-none focus:border-[#123C91] text-[14px]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-[14px] text-[#1F2937] cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 accent-[#123C91]" />
            تذكرني
          </label>
          <Link to="/forgot-password" className="text-[14px] font-medium text-[#123C91] border-b border-[#123C91]">
            نسيت كلمة المرور؟
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-14 rounded-lg bg-[#123C91] text-white [&_svg]:text-white font-medium text-[16px] flex items-center justify-center disabled:opacity-70 transition-opacity"
          style={{ fontFamily: "Tajawal, sans-serif" }}
        >
          {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
        </button>

        <div className="flex items-center justify-center gap-1 pt-2">
          <span className="text-[14px] text-[#1F2937]">ليس لديك حساب؟</span>
          <Link to="/select-account-type" className="text-[14px] font-medium text-[#123C91] border-b border-[#123C91]">
            إنشاء حساب
          </Link>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
