import { useMemo, useState } from "react";
import { BookOpen, ChevronDown, ChevronLeft, ChevronRight, Clock3, Search, WalletCards } from "lucide-react";
import StudentLayout from "../../components/student/layout/StudentLayout";

const PAYMENTS = [
  { id: "TXN-10245", course: "مقدمة في البرمجة", instructor: "سالي السيد", date: "2026-07-26", amount: 500 },
  { id: "TXN-10246", course: "شرح الـ Python", instructor: "سالي السيد", date: "2026-07-25", amount: 450 },
  { id: "TXN-10247", course: "تعلم اللغة الإنجليزية", instructor: "سالي السيد", date: "2026-07-24", amount: 300 },
  { id: "TXN-10248", course: "مقدمة في البرمجة", instructor: "سالي السيد", date: "2026-07-20", amount: 500 },
  { id: "TXN-10885", course: "شرح الـ Python", instructor: "سالي السيد", date: "2026-07-05", amount: 450 },
  { id: "TXN-10288", course: "شرح الـ Python", instructor: "سالي السيد", date: "2026-07-04", amount: 450 },
];

const formatDate = (date) => new Intl.DateTimeFormat("ar-EG", {
  day: "numeric", month: "long", year: "numeric",
}).format(new Date(`${date}T12:00:00`));

const StatCard = ({ icon: Icon, iconClass, iconBackground, value, label }) => (
  <article className="flex min-h-28 items-center gap-4 rounded-xl border border-[#E3E6EA] bg-white p-5 shadow-sm">
    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconBackground}`}>
      <Icon size={21} className={iconClass} />
    </span>
    <div>
      <p className="text-xl font-bold text-[#1F2937]">{value}</p>
      <p className="mt-1 text-sm text-[#69717C]">{label}</p>
    </div>
  </article>
);

const MobilePaymentCard = ({ payment }) => (
  <article className="rounded-xl border border-[#E3E6EA] bg-white p-4 shadow-sm">
    <div className="flex items-start justify-between gap-4 border-b border-[#EEF0F2] pb-3">
      <div>
        <p className="font-semibold text-[#1F2937]">{payment.course}</p>
        <p className="mt-1 text-sm text-[#69717C]">{payment.instructor}</p>
      </div>
      <span className="font-mono text-xs text-[#69717C]">#{payment.id}</span>
    </div>
    <div className="mt-3 flex items-center justify-between text-sm">
      <span className="text-[#69717C]">{formatDate(payment.date)}</span>
      <span className="font-semibold text-[#1F2937]">{payment.amount.toLocaleString("ar-EG")} جنيه</span>
    </div>
  </article>
);

const StudentPaymentsPage = () => {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [period, setPeriod] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const visiblePayments = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("ar");
    const latestDate = Math.max(...PAYMENTS.map(({ date }) => new Date(date).getTime()));
    return PAYMENTS.filter((payment) => {
      const matchesSearch = [payment.id, payment.course, payment.instructor]
        .join(" ").toLocaleLowerCase("ar").includes(query);
      const ageInDays = (latestDate - new Date(payment.date).getTime()) / 86400000;
      return matchesSearch && (period === "all" || ageInDays <= Number(period));
    }).sort((a, b) => (sort === "newest" ? -1 : 1) * (new Date(a.date) - new Date(b.date)));
  }, [period, search, sort]);

  const totalPages = Math.max(1, Math.ceil(visiblePayments.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const firstVisibleIndex = (safeCurrentPage - 1) * itemsPerPage;
  const paginatedPayments = visiblePayments.slice(firstVisibleIndex, firstVisibleIndex + itemsPerPage);

  const resetToFirstPage = (setter) => (event) => {
    setter(event.target.value);
    setCurrentPage(1);
  };

  const totalPaid = PAYMENTS.reduce((sum, payment) => sum + payment.amount, 0);
  const coursesCount = new Set(PAYMENTS.map(({ course }) => course)).size;

  return (
    <StudentLayout>
      <section dir="rtl" className="w-full pb-8  -mt-16 font-['IBM_Plex_Sans_Arabic'] text-right">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-[#123C91]">المدفوعات</h1>
          <p className="mt-2 mb-2 text-sm text-[#69717C]">سجل مشترياتك وفواتيرك في مكان واحد</p>
        </header>

        <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard icon={WalletCards} iconClass="text-[#12BDAA]" iconBackground="bg-[#E5FAF7]" value={`${totalPaid.toLocaleString("en-US")} جنيه`} label="إجمالي المدفوع" />
          <StatCard icon={BookOpen} iconClass="text-[#19A64A]" iconBackground="bg-[#E8F8ED]" value={`${coursesCount} دورات`} label="دوراتي" />
          <StatCard icon={Clock3} iconClass="text-[#1757B8]" iconBackground="bg-[#EAF2FF]" value="قبل 4 أيام" label="آخر عملية دفع" />
        </div>

        <div className="overflow-hidden rounded-xl border border-[#E3E6EA] bg-white shadow-sm">
          <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
            <label className="relative block w-full md:max-w-sm">
              <Search size={18} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#69717C]" />
              <input value={search} onChange={resetToFirstPage(setSearch)} placeholder="ابحث برقم العملية، اسم الدورة أو المحاضر..." className="h-11 w-full rounded-lg border border-[#E3E6EA] bg-[#FAFBFC] pr-10 pl-4 text-sm text-[#1F2937] outline-none transition focus:border-[#123C91] focus:ring-2 focus:ring-[#123C91]/10" />
            </label>
            <div className="flex gap-3">
              <label className="relative min-w-32 flex-1 md:flex-none">
                <select value={sort} onChange={resetToFirstPage(setSort)} className="h-11 w-full appearance-none rounded-lg border border-[#E3E6EA] bg-[#FAFBFC] px-4 pl-9 text-sm text-[#4F5865] outline-none focus:border-[#123C91]">
                  <option value="newest">الأحدث أولاً</option><option value="oldest">الأقدم أولاً</option>
                </select>
                <ChevronDown size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#69717C]" />
              </label>
              <label className="relative min-w-32 flex-1 md:flex-none">
                <select value={period} onChange={resetToFirstPage(setPeriod)} className="h-11 w-full appearance-none rounded-lg border border-[#E3E6EA] bg-[#FAFBFC] px-4 pl-9 text-sm text-[#4F5865] outline-none focus:border-[#123C91]">
                  <option value="all">جميع الأوقات</option><option value="7">آخر 7 أيام</option><option value="30">آخر 30 يوماً</option>
                </select>
                <ChevronDown size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#69717C]" />
              </label>
            </div>
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-180 text-right">
              <thead className="bg-[#F8F9FA] text-xs font-medium text-[#69717C]"><tr>
                {['رقم العملية', 'الدورة', 'المحاضر', 'التاريخ', 'إجمالي المبلغ'].map((title) => <th key={title} className="px-5 py-4 font-medium">{title}</th>)}
              </tr></thead>
              <tbody className="divide-y divide-[#E8EAED]">
                {paginatedPayments.map((payment) => <tr key={payment.id} className="transition-colors hover:bg-[#FAFBFC]">
                  <td className="px-5 py-5 font-mono text-xs text-[#69717C]">#{payment.id}</td>
                  <td className="px-5 py-5 text-sm font-semibold text-[#1F2937]">{payment.course}</td>
                  <td className="px-5 py-5 text-sm text-[#69717C]">{payment.instructor}</td>
                  <td className="px-5 py-5 text-sm text-[#69717C]">{formatDate(payment.date)}</td>
                  <td className="px-5 py-5 text-sm text-[#4F5865]">{payment.amount.toLocaleString("ar-EG")} جنيه</td>
                </tr>)}
              </tbody>
            </table>
          </div>
          <div className="space-y-3 border-t border-[#E8EAED] bg-[#F8F9FA] p-3 md:hidden">
            {paginatedPayments.map((payment) => <MobilePaymentCard key={payment.id} payment={payment} />)}
          </div>
          {visiblePayments.length === 0 && <div className="border-t border-[#E8EAED] px-4 py-12 text-center text-sm text-[#69717C]">لا توجد عمليات دفع مطابقة لبحثك</div>}
          {visiblePayments.length > 0 && (
            <div className="flex flex-col-reverse gap-3 border-t border-[#E8EAED] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            

              <div className="flex flex-wrap items-center gap-3 text-xs text-[#69717C]">
                <span>عرض {firstVisibleIndex + 1}–{Math.min(firstVisibleIndex + itemsPerPage, visiblePayments.length)} من أصل {visiblePayments.length} عملية</span>
                <label className="flex items-center gap-2">
                  <span>عدد الصفوف:</span>
                  <select value={itemsPerPage} onChange={(event) => { setItemsPerPage(Number(event.target.value)); setCurrentPage(1); }} className="h-8 rounded-md border border-[#E3E6EA] bg-white px-2 text-sm text-[#4F5865] outline-none focus:border-[#123C91]">
                    {[5, 10, 20].map((count) => <option key={count} value={count}>{count}</option>)}
                  </select>
                </label>
              </div>

                <nav dir="ltr" aria-label="التنقل بين الصفحات" className="flex items-center gap-1">
                <button type="button" aria-label="الصفحة السابقة" disabled={safeCurrentPage === 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E3E6EA] text-[#4F5865] transition hover:bg-[#F8F9FA] disabled:cursor-not-allowed disabled:opacity-40">
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                  <button key={page} type="button" aria-current={page === safeCurrentPage ? "page" : undefined} onClick={() => setCurrentPage(page)} className={`h-8 min-w-8 rounded-md px-2 text-sm font-medium transition ${page === safeCurrentPage ? "bg-[#123C91] text-white" : "bg-[#EAF2FF] text-[#1F2937] hover:bg-[#DCE9FF]"}`}>
                    {page}
                  </button>
                ))}
                <button type="button" aria-label="الصفحة التالية" disabled={safeCurrentPage === totalPages} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E3E6EA] text-[#4F5865] transition hover:bg-[#F8F9FA] disabled:cursor-not-allowed disabled:opacity-40">
                  <ChevronRight size={16} />
                </button>
              </nav>
            </div>
          )}
        </div>
      </section>
    </StudentLayout>
  );
};

export default StudentPaymentsPage;
