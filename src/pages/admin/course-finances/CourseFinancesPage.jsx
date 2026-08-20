import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, CheckCircle2, BarChart3, Search, ChevronDown } from "lucide-react";
import CommissionDonut from "../../../components/admin/course-finances/CommissionDonut";
import AdminLayout from "../../../components/admin/layout/AdminLayout";
import Breadcrumbs from "../../shared/Breadcrumbs";

// ⚠️ بيانات وهمية مؤقتة - المفروض تتجاب من API زي GET /admin/course-finances/overview
const MOCK_TOP_COURSES = [
  { id: 1, name: "مقدمة في البرمجة", instructor: "سالي السيد", students: 120, price: 500, commissionRate: 20, total: 51200 },
  { id: 2, name: "شرح ال Python", instructor: "سالي السيد", students: 120, price: 450, commissionRate: 20, total: 40200 },
  { id: 3, name: "تعلم اللغة الإنجليزية", instructor: "سالي السيد", students: 120, price: 300, commissionRate: 20, total: 32200 },
];

// ⚠️ بيانات وهمية مؤقتة - المفروض تتجاب من API زي GET /admin/course-finances/transactions
const MOCK_TRANSACTIONS = [
  { id: "TXN-10245", student: "عمر طارق", course: "مقدمة في البرمجة", instructor: "سالي السيد", date: "2026 يوليو 26", total: 500, instructorNet: 425, platformCommission: 75 },
  { id: "TXN-10246", student: "سارة محمود", course: "شرح ال Python", instructor: "سالي السيد", date: "2026 يوليو 25", total: 450, instructorNet: 382, platformCommission: 68 },
  { id: "TXN-10247", student: "مريم حسن", course: "تعلم اللغة الإنجليزية", instructor: "سالي السيد", date: "2026 يوليو 24", total: 300, instructorNet: 255, platformCommission: 45 },
  { id: "TXN-10248", student: "يوسف عادل", course: "مقدمة في البرمجة", instructor: "سالي السيد", date: "2026 يوليو 20", total: 500, instructorNet: 425, platformCommission: 75 },
  { id: "TXN-10885", student: "عمر طارق", course: "شرح ال Python", instructor: "سالي السيد", date: "2026 يوليو 5", total: 450, instructorNet: 382, platformCommission: 68 },
  { id: "TXN-10288", student: "نور الدين", course: "شرح ال Python", instructor: "سالي السيد", date: "2026 يوليو 4", total: 450, instructorNet: 382, platformCommission: 68 },
];

const StatCard = ({ icon: Icon, iconBg, iconColor, label, value, unit }) => (
  <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
    <div>
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-800">
        {value.toLocaleString("ar-EG")} <span className="text-sm font-medium text-gray-400">{unit}</span>
      </p>
    </div>
    <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${iconBg}`}>
      <Icon size={20} className={iconColor} />
    </div>
  </div>
);

const CourseFinancesPage = () => {
  const navigate = useNavigate();
  // ⚠️ القيم دي المفروض تيجي من الـ API نفسه (overview endpoint)
  const [commissionRate] = useState(20);
  const [periodFilter, setPeriodFilter] = useState("all");
  const [sortFilter, setSortFilter] = useState("newest");
  const [search, setSearch] = useState("");

  const filteredTransactions = MOCK_TRANSACTIONS.filter((t) => {
    if (!search.trim()) return true;
    return t.id.includes(search) || t.student.includes(search) || t.course.includes(search);
  });

  return (
    <AdminLayout>
      {/* ⚠️ تأكدي من شكل الـ props بتاعة Breadcrumbs عندك (items/crumbs) وعدّليها لو مختلفة */}
      <Breadcrumbs
        homeTo="/admin-dashboard"
        items={[{ label: "مالية الدورات", to: "/admin/course-finances" }]}
      />

      <div dir="rtl" className="p-6 space-y-6 font-['IBM_Plex_Sans_Arabic']">
        <h1 className="text-xl font-bold text-gray-800">مالية الدورات</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* بطاقة نسبة العمولة */}
          <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4">
            <button
              onClick={() => navigate("/admin/course-finances/commission-settings")}
              className="self-start text-sm font-semibold text-white bg-[#123C91] hover:bg-[#0e2f73] transition-colors rounded-lg px-4 py-2"
            >
              إعدادات العمولة
            </button>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">نسبة عمولة المنصة الحالية</p>
                <p className="text-xs text-gray-400">تُطبق تلقائيًا على كل عملية بيع للدورات</p>
              </div>
              <CommissionDonut percentage={commissionRate} />
            </div>
          </div>

          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard icon={CalendarDays} iconBg="bg-blue-50" iconColor="text-[#123C91]" label="أرباح هذا الشهر" value={760} unit="جنيه" />
            <StatCard icon={CheckCircle2} iconBg="bg-emerald-50" iconColor="text-emerald-600" label="أرباح المنصة (العمولات)" value={2500} unit="جنيه" />
            <StatCard icon={BarChart3} iconBg="bg-sky-50" iconColor="text-sky-600" label="إجمالي حجم المبيعات" value={12500} unit="جنيه" />
          </div>
        </div>

        {/* الدورات الأكثر مبيعًا */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-base font-bold text-gray-800 mb-4">الدورات الأكثر مبيعًا</h2>
          <div className="space-y-3">
            {MOCK_TOP_COURSES.map((c, i) => (
              <div
                key={c.id}
                className="flex items-center justify-between border-b border-gray-50 last:border-0 pb-3 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{c.name}</p>
                    <p className="text-xs text-gray-400">
                      {c.instructor} · {c.students} طالب · سعر الدورة {c.price} ج.م · عمولة {c.commissionRate}%
                    </p>
                  </div>
                </div>
                <span className="text-sm font-bold text-rose-500">
                  {c.total.toLocaleString("ar-EG")} ج.م
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* جدول العمليات */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="relative flex-1 min-w-[220px]">
              <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث برقم العملية، أو اسم الطالب، أو الدورة..."
                className="w-full text-sm border border-gray-200 rounded-lg py-2 pr-9 pl-3 focus:outline-none focus:ring-1 focus:ring-[#123C91]"
              />
            </div>
            <div className="relative">
              <select
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value)}
                className="appearance-none text-sm border border-gray-200 rounded-lg py-2 pr-3 pl-8 text-gray-600 focus:outline-none"
              >
                <option value="all">جميع الأوقات</option>
                <option value="month">هذا الشهر</option>
                <option value="week">هذا الأسبوع</option>
              </select>
              <ChevronDown size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={sortFilter}
                onChange={(e) => setSortFilter(e.target.value)}
                className="appearance-none text-sm border border-gray-200 rounded-lg py-2 pr-3 pl-8 text-gray-600 focus:outline-none"
              >
                <option value="newest">الأحدث أولًا</option>
                <option value="oldest">الأقدم أولًا</option>
              </select>
              <ChevronDown size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 text-xs border-b border-gray-100">
                  <th className="text-right font-medium py-2 px-2">رقم العملية</th>
                  <th className="text-right font-medium py-2 px-2">الطالب</th>
                  <th className="text-right font-medium py-2 px-2">الدورة</th>
                  <th className="text-right font-medium py-2 px-2">المحاضر</th>
                  <th className="text-right font-medium py-2 px-2">التاريخ</th>
                  <th className="text-right font-medium py-2 px-2">إجمالي المبلغ</th>
                  <th className="text-right font-medium py-2 px-2">صافي ربح المحاضر</th>
                  <th className="text-right font-medium py-2 px-2">عمولة المنصة</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((t) => (
                  <tr key={t.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60">
                    <td className="py-3 px-2 font-semibold text-[#123C91]">#{t.id}</td>
                    <td className="py-3 px-2 text-gray-700">{t.student}</td>
                    <td className="py-3 px-2 text-gray-700">{t.course}</td>
                    <td className="py-3 px-2 text-gray-700">{t.instructor}</td>
                    <td className="py-3 px-2 text-gray-500">{t.date}</td>
                    <td className="py-3 px-2 text-gray-700">{t.total} جنيه</td>
                    <td className="py-3 px-2 text-gray-700">{t.instructorNet} جنيه</td>
                    <td className="py-3 px-2 font-semibold text-emerald-600">{t.platformCommission} جنيه</td>
                  </tr>
                ))}
                {filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-6 text-gray-400">
                      لا توجد عمليات مطابقة
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CourseFinancesPage;