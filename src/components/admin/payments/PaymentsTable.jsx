import { Eye } from "lucide-react";

const payerLabel = (type) =>
  type === "parent" ? "ولي أمر" : type === "student" ? "طالب" : "—";

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString("ar-EG", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "—";

const shortId = (value) => {
  const id = String(value || "");
  return id.length > 12 ? `${id.slice(0, 6)}…${id.slice(-4)}` : id || "—";
};

const Items = ({ items = [] }) => (
  <div className="space-y-1.5">
    {items.map((item, index) => (
      <div key={item.id || index} className="text-xs leading-5">
        <span className="font-medium text-[#1F2937]">
          {item.subject || "—"}
        </span>
        <span className="text-[#8C9198]"> — {item.package || "—"}</span>
      </div>
    ))}
  </div>
);

const PaymentsTable = ({ payments, onView }) => (
  <>
    <div className="hidden overflow-x-auto rounded-3xl border border-[#DCE8F7] bg-white shadow-sm lg:block">
      <table className="w-full min-w-[1180px] border-separate border-spacing-0 text-right" dir="rtl">
        <thead className="bg-[#F2F7FD] text-xs text-[#41546D]">
          <tr>
            <th className="border-b border-[#DCE8F7] px-5 py-4 font-semibold">رقم العملية</th>
            <th className="border-b border-[#DCE8F7] px-5 py-4 font-semibold">الدافع</th>
            <th className="border-b border-[#DCE8F7] px-5 py-4 font-semibold">الطالب</th>
            <th className="border-b border-[#DCE8F7] px-5 py-4 font-semibold">المواد والباقات</th>
            <th className="border-b border-[#DCE8F7] px-5 py-4 font-semibold">المبلغ</th>
            <th className="border-b border-[#DCE8F7] px-5 py-4 font-semibold">تاريخ الدفع</th>
            <th className="border-b border-[#DCE8F7] px-5 py-4 font-semibold">Payment ID</th>
            <th className="border-b border-[#DCE8F7] px-5 py-4 font-semibold">الحالة</th>
            <th className="border-b border-[#DCE8F7] px-5 py-4 font-semibold">الإجراء</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {payments.map((payment) => (
            <tr
              key={payment.id}
              onClick={() => onView(payment.id)}
              className="cursor-pointer transition-colors hover:bg-[#F8FBFF]"
            >
              <td className="border-b border-[#EEF2F7] px-5 py-5 font-mono text-xs" title={payment.id}>
                {shortId(payment.id)}
              </td>
              <td className="border-b border-[#EEF2F7] px-5 py-5">
                <p className="text-sm font-medium text-[#1F2937]">
                  {payment.payer?.name || "—"}
                </p>
                <p className="mt-1 text-xs text-[#8C9198]">
                  {payerLabel(payment.payer?.type)}
                </p>
              </td>
              <td className="border-b border-[#EEF2F7] px-5 py-5 text-sm">{payment.student?.name || "—"}</td>
              <td className="border-b border-[#EEF2F7] px-5 py-5"><Items items={payment.items} /></td>
              <td className="whitespace-nowrap border-b border-[#EEF2F7] px-5 py-5 font-semibold text-[#123C91]">
                {Number(payment.amount || 0).toLocaleString("ar-EG")}{" "}
                {payment.currency || "EGP"}
              </td>
              <td className="whitespace-nowrap border-b border-[#EEF2F7] px-5 py-5 text-xs text-[#575F69]">
                {formatDate(payment.paidAt)}
              </td>
              <td className="border-b border-[#EEF2F7] px-5 py-5 font-mono text-xs">
                {payment.whopPaymentId || "—"}
              </td>
              <td className="border-b border-[#EEF2F7] px-5 py-5">
                <span className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
                  {payment.paymentStatus === "paid"
                    ? "مدفوع"
                    : payment.paymentStatus || "—"}
                </span>
              </td>
              <td className="border-b border-[#EEF2F7] px-5 py-5">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onView(payment.id);
                  }}
                  className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-[#C9DBF2] bg-white px-3 py-2 text-sm font-medium text-[#123C91] hover:bg-[#EAF4FF]"
                >
                  <Eye size={16} />
                  التفاصيل
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <div className="space-y-3 lg:hidden">
      {payments.map((payment) => (
        <button
          type="button"
          key={payment.id}
          onClick={() => onView(payment.id)}
          className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-right shadow-sm"
          dir="rtl"
        >
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <p className="font-medium text-[#1F2937]">
                {payment.student?.name || "—"}
              </p>
              <p className="mt-1 text-xs text-[#8C9198]">
                الدافع: {payment.payer?.name || "—"} ·{" "}
                {payerLabel(payment.payer?.type)}
              </p>
            </div>
            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
              مدفوع
            </span>
          </div>
          <Items items={payment.items} />
          <div className="mt-4 flex items-end justify-between border-t pt-3">
            <span className="text-xs text-[#8C9198]">
              {formatDate(payment.paidAt)}
            </span>
            <strong className="text-[#123C91]">
              {Number(payment.amount || 0).toLocaleString("ar-EG")}{" "}
              {payment.currency || "EGP"}
            </strong>
          </div>
        </button>
      ))}
    </div>
  </>
);

export default PaymentsTable;
