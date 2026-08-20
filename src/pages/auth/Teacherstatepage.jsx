import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, Clock, MessageCircle } from "lucide-react";
import logo from "../../assets/icons/logo.svg";
import { getAccountState } from "../../services/APIService";
import useContactSettings, { whatsappLink } from "../../hooks/useContactSettings";

const steps = [
  {
    key: "submitted",
    label: "تم استلام الطلب",
    sub: "تم تسجيل طلبك بنجاح",
    color: "green",
  },
  {
    key: "reviewing",
    label: "قيد المراجعة",
    sub: "يتم مراجعة بياناتك والتحقق من المستندات المرفقة",
    color: "orange",
  },
  {
    key: "activation",
    label: "تفعيل الحساب",
    sub: "سيتم إشعارك فور الموافقة",
    color: "gray",
  },
];

const StepIcon = ({ color, done }) => {
  if (color === "green")
    return (
      <div className="w-8 h-8 rounded-full bg-[#00A63E26] flex items-center justify-center shrink-0">
        <Check size={15} className="text-[#00A63E]" strokeWidth={2.5} />
      </div>
    );
  if (color === "orange")
    return (
      <div className="w-8 h-8 rounded-full bg-[#FF8A0026] flex items-center justify-center shrink-0">
        <Clock size={15} className="text-[#FF8A00]" strokeWidth={2} />
      </div>
    );
  return (
    <div className="w-8 h-8 rounded-full border-2 border-[#E5E5E5] flex items-center justify-center shrink-0" />
  );
};

const AccountStatePage = () => {
  const navigate = useNavigate();
  const [state, setState] = useState(null);
  const { contactSettings } = useContactSettings();
  const whatsappUrl = whatsappLink(contactSettings?.whatsappNumber);

  useEffect(() => {
    getAccountState()
      .then((res) => setState(res.data))
      .catch(() => {});
  }, []);

  return (
    <div
      className="min-h-screen bg-[#F5F7FF] flex items-center justify-center p-4"
      dir="rtl"
    >
      {/* decorative blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-[#123C91]/6" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-[#123C91]/6" />
      </div>

      <div className="relative bg-white rounded-3xl shadow-[0_8px_40px_rgba(18,60,145,0.08)] w-full max-w-md p-10 flex flex-col items-center text-center">
        <Link to="/">
          <img src={logo} alt="الأكاديمية" className="h-8 w-auto mb-8" />
        </Link>

        {/* pending clock icon */}
        <div className="w-16 h-16 rounded-full bg-[#FFF3E0] flex items-center justify-center mb-6">
          <Clock size={34} className="text-[#FF8A00]" strokeWidth={1.5} />
        </div>

        <h2
          className="text-[22px] font-bold text-[#1F2937] mb-2"
          style={{ fontFamily: "Tajawal, sans-serif" }}
        >
          طلبك قيد المراجعة
        </h2>
        <p className="text-[13px] text-[#6B7280] mb-8 leading-6">
          شكراً لتقديم طلبك. يقوم فريقنا حالياً بمراجعة بياناتك والتحقق من
          المستندات المرفقة
        </p>

        {/* steps */}
        <div className="w-full bg-[#F9FAFA] rounded-2xl p-5 mb-6 flex flex-col gap-5 text-right">
          {steps.map((s) => (
            <div key={s.key} className="flex items-start gap-3">
              <StepIcon color={s.color} />
              <div className="flex flex-col gap-0.5">
                <span className="text-[14px] font-semibold text-[#1F2937]">
                  {s.label}
                </span>
                <span className="text-[12px] text-[#9CA3AF] leading-5">
                  {s.sub}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* info cards */}
        <div className="w-full grid grid-cols-2 gap-3 mb-6">
          <div className="bg-[#F9FAFA] rounded-2xl p-4 text-right flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-[#6B7280] text-[12px]">
              <Clock size={14} className="text-[#6B7280]" />
              <span>وقت المراجعة</span>
            </div>
            <p className="text-[13px] font-semibold text-[#1F2937]">
              من 1-3 أيام عمل
            </p>
          </div>
          <div className="bg-[#F9FAFA] rounded-2xl p-4 text-right flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-[#6B7280] text-[12px]">
              <MessageCircle size={14} className="text-[#25D366]" />
              <span>تواصل معنا عبر واتساب</span>
            </div>
            <p className="text-[12px] text-[#6B7280] leading-5">
              حقك في معرفة حالة طلبك، تواصل معنا في أي وقت
            </p>
          </div>
        </div>

        {/* whatsapp button */}
        <a
          href={whatsappUrl || undefined}
          target="_blank"
          rel="noreferrer"
          aria-disabled={!whatsappUrl}
          onClick={(event) => { if (!whatsappUrl) event.preventDefault(); }}
          className={`w-full h-12 mb-4 rounded-xl text-white font-semibold text-[15px] flex items-center justify-center gap-2 transition-colors ${whatsappUrl ? "bg-[#25D366] hover:bg-[#1ebe5d]" : "bg-gray-300 cursor-not-allowed"}`}
          style={{ fontFamily: "Tajawal, sans-serif" }}
        >
          <MessageCircle size={18} />
          تواصل عبر واتساب
        </a>

        <button
          onClick={() => navigate("/login")}
          className="w-full h-12 rounded-xl border border-[#E5E5E5] text-[#6B7280] text-[14px] hover:bg-gray-50 transition-colors"
        >
          العودة لتسجيل الدخول
        </button>
      </div>
    </div>
  );
};

export default AccountStatePage;
