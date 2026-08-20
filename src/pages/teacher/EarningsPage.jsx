import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  DollarSign,
  Users,
  CalendarDays,
  Plus,
  Pencil,
  AlertCircle,
  MoreVertical,
  ChevronLeft,
  Search,
  ChevronDown,
} from "lucide-react";
import TeacherLayout from '../../components/teacher/layout/TeacherLayout';

import Breadcrumbs from "../shared/Breadcrumbs";
import CommissionDonut from "../../components/teacher/earnings/CommissionDonut";
import PayoutAccountModal from "../../components/teacher/earnings/PayoutAccountModal";

// ⚠️ بيانات وهمية مؤقتة - المفروض تتجاب من API زي GET /teacher/earnings/overview
const MOCK_TOP_COURSES = [
  { id: 1, name: "مقدمة في البرمجة", students: 120, price: 500, commissionRate: 20, netTotal: 51200 },
  { id: 2, name: "شرح ال Python", students: 120, price: 450, commissionRate: 20, netTotal: 40200 },
  { id: 3, name: "تعلم اللغة الإنجليزية", students: 120, price: 300, commissionRate: 20, netTotal: 32200 },
];

// ⚠️ بيانات وهمية مؤقتة - المفروض تتجاب من API زي GET /teacher/earnings/transactions
const MOCK_TRANSACTIONS = [
  { id: "TXN-10245", student: "عمر طارق", course: "مقدمة في البرمجة", date: "2026 يوليو 26", total: 500, platformCommission: 75, netProfit: 425 },
  { id: "TXN-10246", student: "سارة محمود", course: "شرح ال Python", date: "2026 يوليو 25", total: 450, platformCommission: 68, netProfit: 382 },
  { id: "TXN-10247", student: "مريم حسن", course: "تعلم اللغة الإنجليزية", date: "2026 يوليو 24", total: 300, platformCommission: 45, netProfit: 255 },
  { id: "TXN-10248", student: "يوسف عادل", course: "مقدمة في البرمجة", date: "2026 يوليو 20", total: 500, platformCommission: 75, netProfit: 425 },
  { id: "TXN-10885", student: "عمر طارق", course: "شرح ال Python", date: "2026 يوليو 5", total: 450, platformCommission: 68, netProfit: 382 },
  { id: "TXN-10288", student: "نور الدين", course: "شرح ال Python", date: "2026 يوليو 4", total: 450, platformCommission: 68, netProfit: 382 },
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

const EarningsPage = () => {
  const navigate = useNavigate();
  // ⚠️ القيم دي المفروض تيجي من الـ API نفسه (overview endpoint)
  const [totalEarnings] = useState(4336);
  const [totalSalesBeforeCommission] = useState(5420);
  const [studentsCount] = useState(312);
  const [monthlyEarnings] = useState(2760);

  const [accounts, setAccounts] = useState([
    { id: 1, label: "إنستاباي", number: "01598631745", status: "ok" },
    { id: 2, label: "فودافون كاش", number: "01047848752", status: "warning" },
  ]);
  const [accountModal, setAccountModal] = useState({ open: false, editId: null, data: null });

  const [periodFilter, setPeriodFilter] = useState("all");
  const [sortFilter, setSortFilter] = useState("newest");
  const [search, setSearch] = useState("");

  const filteredTransactions = MOCK_TRANSACTIONS.filter((t) => {
    if (!search.trim()) return true;
    return t.id.includes(search) || t.student.includes(search) || t.course.includes(search);
  });

  const handleSaveAccount = (payload) => {
    // ⚠️ لازم تتوصل بـ API فعلي (POST عند الإضافة / PUT عند التعديل)
    // زي POST أو PUT /teacher/earnings/payout-accounts
    if (accountModal.editId) {
      setAccounts((prev) =>
        prev.map((a) => (a.id === accountModal.editId ? { ...a, ...payload } : a))
      );
    } else {
      setAccounts((prev) => [...prev, { id: Date.now(), status: "ok", ...payload }]);
    }
    setAccountModal({ open: false, editId: null, data: null });
  };

  return (
    <TeacherLayout>
      {/* ⚠️ تأكدي من شكل الـ props بتاعة Breadcrumbs عندك (items/crumbs) */}
      {/* <Breadcrumbs
        homeTo="/teacher-dashboard"
        items={[{ label: "الأرباح والمدفوعات", to: "/teacher/earnings" }]}
      /> */}

      <div dir="rtl" className="p-6 space-y-6 font-['IBM_Plex_Sans_Arabic']">
        <div>
          <h1 className="text-xl font-bold text-gray-800 mb-1">الأرباح والمدفوعات</h1>
          <p className="text-sm text-gray-500">منصة أرباحك ومستحقاتك في مكان واحد</p>
        </div>

        {/* البطاقة الرئيسية */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
            <DollarSign size={24} className="text-[#123C91]" />
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">إجمالي أرباحك حتى الآن</p>
            <p className="text-3xl font-bold text-gray-800 mb-1">
              {totalEarnings.toLocaleString("ar-EG")} جنيه
            </p>
            <p className="text-xs text-gray-400">
              من إجمالي مبيعات قدرها {totalSalesBeforeCommission.toLocaleString("ar-EG")} جنيه – بعد خصم عمولة المنصة
            </p>
          </div>
        </div>

        {/* الإحصائيات */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard icon={Users} iconBg="bg-blue-50" iconColor="text-[#123C91]" label="طلاب اشتروا دوراتك" value={studentsCount} unit="طالب" />
          <StatCard icon={CalendarDays} iconBg="bg-sky-50" iconColor="text-sky-600" label="أرباح هذا الشهر" value={monthlyEarnings} unit="جنيه" />
          <StatCard icon={DollarSign} iconBg="bg-emerald-50" iconColor="text-emerald-600" label="إجمالي الأرباح" value={totalEarnings} unit="جنيه" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                        {c.students} طالب · سعر الدورة {c.price} ج.م · عمولة {c.commissionRate}%
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-emerald-600">
                    {c.netTotal.toLocaleString("ar-EG")} ج.م
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* حسابات الاستلام */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-800">حسابات الاستلام</h2>
              <button
                onClick={() => setAccountModal({ open: true, editId: null, data: null })}
                className="flex items-center gap-1.5 text-sm font-semibold text-white bg-[#123C91] hover:bg-[#0e2f73] transition-colors rounded-lg px-3 py-1.5"
              >
                <Plus size={14} />
                إضافة حساب
              </button>
            </div>
            <p className="text-xs text-gray-400 mb-3">سيتم تحويل أرباحك إلى الحسابات الموضحة تلقائيًا</p>

            <div className="space-y-2 mb-4">
              {accounts.map((acc) => (
                <div
                  key={acc.id}
                  className="flex items-center justify-between border border-gray-100 rounded-xl px-3 py-2.5"
                >
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setAccountModal({ open: true, editId: acc.id, data: acc })}
                      className="text-gray-400 hover:text-[#123C91] transition-colors"
                    >
                      <MoreVertical size={16} />
                    </button>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{acc.label}</p>
                      <p className="text-xs text-gray-400">{acc.number}</p>
                    </div>
                  </div>
                  {acc.status === "warning" ? (
                    <AlertCircle size={18} className="text-red-500" />
                  ) : (
                    <button
                      onClick={() => setAccountModal({ open: true, editId: acc.id, data: acc })}
                      className="text-gray-400 hover:text-[#123C91] transition-colors"
                    >
                      <Pencil size={16} />
                    </button>
                  )}
                </div>
              ))}
              {accounts.length === 0 && (
                <p className="text-center text-sm text-gray-400 py-4">لا توجد حسابات استلام مضافة</p>
              )}
            </div>

            <button
              onClick={() => navigate("/teacher/earnings/commission-rates")}
              className="w-full flex items-center justify-between text-sm text-[#123C91] font-semibold pt-3 border-t border-gray-100"
            >
              <span>عرض نسب العمولات</span>
              <ChevronLeft size={16} />
            </button>
            <p className="text-xs text-gray-400 mt-1">اطلع على نسبة عمولة المنصة لكل دورة عندك</p>
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
                  <th className="text-right font-medium py-2 px-2">التاريخ</th>
                  <th className="text-right font-medium py-2 px-2">إجمالي المبلغ</th>
                  <th className="text-right font-medium py-2 px-2">عمولة المنصة</th>
                  <th className="text-right font-medium py-2 px-2">صافي ربحك</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((t) => (
                  <tr key={t.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60">
                    <td className="py-3 px-2 font-semibold text-[#123C91]">#{t.id}</td>
                    <td className="py-3 px-2 text-gray-700">{t.student}</td>
                    <td className="py-3 px-2 text-gray-700">{t.course}</td>
                    <td className="py-3 px-2 text-gray-500">{t.date}</td>
                    <td className="py-3 px-2 text-gray-700">{t.total} جنيه</td>
                    <td className="py-3 px-2 text-gray-700">{t.platformCommission} جنيه</td>
                    <td className="py-3 px-2 font-semibold text-emerald-600">{t.netProfit} جنيه</td>
                  </tr>
                ))}
                {filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-6 text-gray-400">
                      لا توجد عمليات مطابقة
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <PayoutAccountModal
        isOpen={accountModal.open}
        initialData={accountModal.data}
        onClose={() => setAccountModal({ open: false, editId: null, data: null })}
        onSave={handleSaveAccount}
      />
    </TeacherLayout>
  );
};

export default EarningsPage;