import React from "react";

const Badge = ({ label, type }) => {
  const map = {
    green:  "bg-[#00A63E26] text-[#00A63E]",
    orange: "bg-[#FF8A0026] text-[#FF8A00]",
    gray:   "bg-gray-100 text-[#8C9198]",
  };
  return (
    <span
      className={`inline-flex items-center justify-center px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${map[type] ?? map.gray}`}
    >
      {label}
    </span>
  );
};

const statusBadge = (status) => {
  if (status === "مكتمل")       return <Badge label={status} type="green" />;
  if (status === "قيد المراجعة") return <Badge label={status} type="orange" />;
  return <Badge label={status} type="gray" />;
};

const MobileField = ({ label, children }) => (
  <div className="flex items-center justify-between gap-3 py-2.5 border-b border-gray-50 last:border-b-0">
    <span className="text-xs font-medium text-[#8C9198] shrink-0">{label}</span>
    <span className="text-sm text-[#575F69] font-medium text-left">{children}</span>
  </div>
);

const HEADERS = [
  "رقم المعاملة",
  "التاريخ",
  "الحساب",
  "إجمالي الحصص",
  "الحالة",
  "المبلغ",
];

const EarningsTable = ({ transactions = [] }) => {
  if (transactions.length === 0) {
    return (
      <div
        dir="rtl"
        className="w-full bg-white rounded-2xl border border-gray-200 shadow-sm py-12 text-center text-sm text-[#575F69]"
      >
        لا توجد معاملات
      </div>
    );
  }

  const fmt = (n) => `EGP ${Number(n).toLocaleString("en-EG")}`;

  return (
    <div dir="rtl" className="w-full">
      {/* Desktop */}
      <div className="hidden md:block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr style={{ backgroundColor: "#F9FAFA" }}>
                {HEADERS.map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3.5 text-[#575F69] text-[13px] font-medium whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-5 py-3.5 text-[#575F69] text-sm font-medium whitespace-nowrap">{t.ref}</td>
                  <td className="px-5 py-3.5 text-[#575F69] text-sm whitespace-nowrap">{t.date}</td>
                  <td className="px-5 py-3.5 text-[#575F69] text-sm whitespace-nowrap">{t.account}</td>
                  <td className="px-5 py-3.5 text-[#575F69] text-sm whitespace-nowrap">{t.sessions} حصص</td>
                  <td className="px-5 py-3.5">{statusBadge(t.status)}</td>
                  <td className="px-5 py-3.5 text-[#575F69] text-sm font-semibold whitespace-nowrap">{fmt(t.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden space-y-3">
        {transactions.map((t) => (
          <div key={t.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#1A1A1A] font-semibold text-sm">{t.ref}</span>
              {statusBadge(t.status)}
            </div>
            <div className="space-y-0.5">
              <MobileField label="التاريخ">{t.date}</MobileField>
              <MobileField label="الحساب">{t.account}</MobileField>
              <MobileField label="إجمالي الحصص">{t.sessions} حصص</MobileField>
              <MobileField label="المبلغ">{fmt(t.amount)}</MobileField>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EarningsTable;