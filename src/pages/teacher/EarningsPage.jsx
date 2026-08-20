import { useState } from "react";
import { DollarSign } from "lucide-react";
import TeacherLayout from "../../components/teacher/layout/TeacherLayout";
import EarningsStatsBar from "../../components/teacher/earnings/EarningsStatsBar";
import EarningsFilters from "../../components/teacher/earnings/EarningsFilters";
import EarningsTable from "../../components/teacher/earnings/EarningsTable";
import Paginationn from "../../components/teacher/groups/students/Paginationn";


// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_TRANSACTIONS = [
  { id: 1, ref: "145-f578", date: "01/06/2026", account: "01012547896", sessions: 8, status: "قيد المراجعة", amount: 3000 },
  { id: 2, ref: "145-f578", date: "01/06/2026", account: "01012547896", sessions: 8, status: "مكتمل",        amount: 1200 },
  { id: 3, ref: "145-f578", date: "01/06/2026", account: "01012547896", sessions: 8, status: "مكتمل",        amount: 4200 },
  { id: 4, ref: "d85-98745", date: "01/06/2026", account: "01012547896", sessions: 8, status: "مكتمل",       amount: 700 },
  { id: 5, ref: "a12-33201", date: "15/05/2026", account: "01012547896", sessions: 5, status: "مكتمل",       amount: 2500 },
  { id: 6, ref: "b77-10293", date: "10/05/2026", account: "01099887766", sessions: 6, status: "قيد المراجعة", amount: 1800 },
];

const PAGE_SIZE = 6;

const EarningsPage = () => {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("جميع الحالات");
  const [filterTime, setFilterTime] = useState("جميع الأوقات");
  const [page, setPage] = useState(1);

  const filtered = MOCK_TRANSACTIONS.filter((t) => {
    const matchSearch = t.ref.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "جميع الحالات" || t.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = {
    total:     MOCK_TRANSACTIONS.reduce((s, t) => s + t.amount, 0),
    available: 13000,
    withdrawn: 7000,
    pending:   MOCK_TRANSACTIONS.filter((t) => t.status === "قيد المراجعة").reduce((s, t) => s + t.amount, 0),
  };

  const fmt = (n) => `EGP ${Number(n).toLocaleString("en-EG")}`;

  return (
    <TeacherLayout>
      <div className="w-full p-2 font-['IBM_Plex_Sans_Arabic'] text-right space-y-5" dir="rtl">

        {/* ── Page Header ── */}
        <div>
          <h1 className="text-[24px] font-semibold leading-8 text-[#123C91] mb-2">الأرباح والمدفوعات</h1>
          <p className="text-[16px] font-normal leading-6 text-[#575F69]">متابعة أرباحك وسحب المستحقات</p>
        </div>

        {/* ── Hero withdrawal card ── */}
        <div
          className="rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          style={{ background: "#1F2937" }}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <DollarSign size={24} className="text-white" />
            </div>
            <div className="text-right">
              <p className="text-white/70 text-sm mb-2">متاح للطلب</p>
              <p className="text-white text-2xl font-bold mb-2">{fmt(stats.available)}</p>
              <p className="text-white/60 text-xs mt-1">المبلغ الذي يمكنك طلبه من الإدارة</p>
            </div>
          </div>
          <button className="px-5 py-2.5 rounded-lg bg-white text-[#123C91] text-sm font-semibold hover:bg-gray-100 transition-colors shrink-0">
            طلب سحب الأرباح
          </button>
        </div>

        {/* ── Stats Bar ── */}
        <EarningsStatsBar {...stats} />

        {/* ── Filters ── */}
        <div className="bg-white border border-[#E5E5E5] shadow-sm rounded-2xl p-5">
          <EarningsFilters
            search={search}
            onSearchChange={(v) => { setSearch(v); setPage(1); }}
            filterStatus={filterStatus}
            onFilterStatusChange={(v) => { setFilterStatus(v); setPage(1); }}
            filterTime={filterTime}
            onFilterTimeChange={(v) => { setFilterTime(v); setPage(1); }}
          />
        </div>

        {/* ── Pagination ── */}
        <Paginationn
          page={page}
          totalPages={totalPages}
          onChange={setPage}
          totalItems={filtered.length}
          displayedCount={paginated.length}
          unitLabel="معاملة"
        />

        {/* ── Table ── */}
        <EarningsTable transactions={paginated} />
      </div>
    </TeacherLayout>
  );
};

export default EarningsPage;
