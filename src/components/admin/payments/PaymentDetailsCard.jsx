const paymentLabel = (status) =>
  status === "paid" ? "مدفوع" : status || "—";

const approvalLabels = {
  waiting_payment: "في انتظار الدفع",
  waiting_admin: "في انتظار موافقة الإدارة",
  approved: "تمت الموافقة",
  rejected: "مرفوض",
};

const Row = ({ label, value, mono = false }) => (
  <div className="rounded-xl bg-[#F9FAFA] p-3">
    <p className="text-xs text-[#8C9198]">{label}</p>
    <p className={`mt-1 break-all text-sm font-medium text-[#1F2937] ${mono ? "font-mono" : ""}`}>
      {value ?? "—"}
    </p>
  </div>
);

const PaidBadge = ({ status }) => (
  <span
    className={`inline-flex w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${
      status === "paid"
        ? "bg-[#00A63E1A] text-[#008A34]"
        : "bg-gray-100 text-gray-600"
    }`}
  >
    {paymentLabel(status)}
  </span>
);

const PaymentDetailsCard = ({ order }) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
    <h2 className="mb-4 font-semibold text-[#1F2937]">بيانات عملية الدفع</h2>
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <Row label="Order ID" value={order.id} mono />
      <Row label="حالة الدفع" value={<PaidBadge status={order.status} />} />
      <Row
        label="حالة المراجعة"
        value={approvalLabels[order.approvalStatus] || order.approvalStatus}
      />
      <Row
        label="المبلغ"
        value={`${Number(order.amount || 0).toLocaleString("ar-EG")} ${order.currency || "EGP"}`}
      />
      <Row
        label="تاريخ الدفع"
        value={
          order.paidAt
            ? new Date(order.paidAt).toLocaleString("ar-EG")
            : "—"
        }
      />
      <Row label="مزود الدفع" value={order.paymentProvider || "—"} />
      <Row label="Whop Payment ID" value={order.whopPaymentId || "—"} mono />
      <Row label="Whop Checkout ID" value={order.whopCheckoutId || "—"} mono />
    </div>
    {order.approvalStatus === "rejected" && order.rejectionReason && (
      <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">
        سبب الرفض: {order.rejectionReason}
      </div>
    )}
  </div>
);

export default PaymentDetailsCard;
