import { useNavigate } from "react-router-dom";
import { CheckCircle2, MessageCircle } from "lucide-react";
import TeacherLayout from '../../components/teacher/layout/TeacherLayout';
// ⚠️ لو المعلم بيستخدم Layout مختلف استبدلي AdminLayout بيه.
import CommissionDonut from "../../components/teacher/earnings/CommissionDonut";
import Breadcrumbs from "../shared/Breadcrumbs";

// ⚠️ بيانات وهمية - المفروض تتجاب من API زي GET /teacher/earnings/commission-rates
const GENERAL_RATE = 20;
const TOTAL_COURSES = 5;
const MOCK_COURSE_RATES = [
  {
    id: 1,
    name: "مقدمة في البرمجة",
    type: "custom",
    rate: 15,
    note: "خصصت من الإدارة بتاريخ 12 يونيو 2026 - تخصيصًا لزيادة الإقبال",
  },
  {
    id: 2,
    name: "تعلم اللغة الإنجليزية",
    type: "general",
    rate: GENERAL_RATE,
    note: "لا يوجد تخصيص نسبة - يتم تطبيق نسبة المنصة الافتراضية",
  },
  {
    id: 3,
    name: "شرح ال Python",
    type: "custom",
    rate: 25,
    note: "خصصت من الإدارة بتاريخ 12 يونيو 2026 - إغلاق إطلاق تمهيدي لمدة شهر",
  },
  {
    id: 4,
    name: "مقدمة في البرمجة",
    type: "general",
    rate: GENERAL_RATE,
    note: "لا يوجد تخصيص نسبة - يتم تطبيق نسبة المنصة الافتراضية",
  },
];

const InstructorCommissionRatesPage = () => {
  const navigate = useNavigate();
  const customCount = MOCK_COURSE_RATES.filter((c) => c.type === "custom").length;

  const openAdminChat = () => {
    navigate("/teacher/messages", { state: { openSupportConversation: true } });
  };

  return (
    <TeacherLayout>
      {/* ⚠️ تأكدي من شكل الـ props بتاعة Breadcrumbs عندك (items/crumbs) */}
      {/* <Breadcrumbs
        homeTo="/teacher-dashboard"
        items={[
          { label: "الأرباح", to: "/teacher/earnings" },
          { label: "نسب العمولات", to: "/teacher/earnings/commission-rates" },
        ]}
      /> */}

      <div dir="rtl" className="p-6 space-y-6 font-['IBM_Plex_Sans_Arabic']">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-800 mb-1">نسب العمولات</h1>
            <p className="text-sm text-gray-500">نسبة عمولة المنصة المطبقة تلقائيًا على دوراتك</p>
          </div>
          <button
            onClick={openAdminChat}
            className="flex items-center gap-1.5 text-sm font-semibold text-white bg-[#123C91] hover:bg-[#0e2f73] transition-colors rounded-lg px-4 py-2"
          >
            <MessageCircle size={16} />
            تواصل مع الإدارة
          </button>
        </div>

        <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm rounded-xl px-4 py-3">
          <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
          <p>
            تُخصم العمولة تلقائيًا من كل عملية بيع، وصافي أرباحك بيتحول مباشرة دون أي طلب أو انتظار.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">النسبة العامة المطبقة على المنصة</p>
            <p className="text-xs text-gray-400 max-w-md">
              تُطبق هذه النسبة على أي دورة ما لم تكن لها نسبة مخصصة كما هو موضح في القائمة أدناه
            </p>
          </div>
          <CommissionDonut percentage={GENERAL_RATE} />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-800">النسب المخصصة لدوراتك</h2>
            <span className="text-xs text-gray-400">
              {customCount} من أصل {TOTAL_COURSES} دورات
            </span>
          </div>

          <div className="space-y-1">
            {MOCK_COURSE_RATES.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 shrink-0" />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-800">{c.name}</p>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          c.type === "custom"
                            ? "bg-amber-50 text-amber-600"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {c.type === "custom" ? "نسبة مخصصة" : "النسبة العامة"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">{c.note}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-bold text-gray-800">{c.rate}%</span>
                  {c.type === "custom" && (
                    <span className="text-xs text-gray-400 line-through">{GENERAL_RATE}%</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
};

export default InstructorCommissionRatesPage;