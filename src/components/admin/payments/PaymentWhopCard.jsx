import { AlertTriangle, ExternalLink } from "lucide-react";

const Row = ({ label, value }) => (
  <div className="flex justify-between gap-4 border-b border-[#F1F1F1] px-4 py-4 last:border-0">
    <span className="text-sm text-[#8C9198]">{label}</span>
    <span className="break-all text-left text-sm font-medium" dir="ltr">
      {value ?? "—"}
    </span>
  </div>
);

const PaymentWhopCard = ({ whop, error, paymentId }) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <h2 className="font-semibold text-[#1F2937]">تفاصيل Whop</h2>
      <a
        href="https://whop.com/dashboard/"
        target="_blank"
        rel="noopener noreferrer"
        title={
          whop?.paymentId || paymentId
            ? `Payment ID: ${whop?.paymentId || paymentId}`
            : "فتح لوحة Whop"
        }
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FA4616] px-5 py-3 text-sm font-semibold !text-white transition-colors hover:bg-[#dc3b12] [&_svg]:!text-white"
      >
        عرض العملية في Whop
        <ExternalLink size={16} />
      </a>
    </div>
    {error && (
      <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-100 bg-amber-50 p-3 text-sm text-amber-800">
        <AlertTriangle className="mt-0.5 shrink-0" size={17} />
        <p>
          تعذر تحميل تفاصيل الدفع من Whop، ولكن بيانات العملية المحلية متاحة.
          {error.message ? ` ${error.message}` : ""}
        </p>
      </div>
    )}
    {whop ? (
      <div className="overflow-hidden rounded-2xl border border-[#F1F1F1] bg-[#FCF6F5]/40">
        <Row label="Payment ID" value={whop.paymentId} />
        <Row label="الحالة" value={whop.status} />
        <Row
          label="تاريخ الإنشاء"
          value={whop.createdAt ? new Date(whop.createdAt).toLocaleString("ar-EG") : "—"}
        />
        <Row
          label="تاريخ الدفع"
          value={whop.paidAt ? new Date(whop.paidAt).toLocaleString("ar-EG") : "—"}
        />
        <Row
          label="المبلغ"
          value={`${Number(whop.amount || 0).toLocaleString("ar-EG")} ${whop.currency || "EGP"}`}
        />
        <Row
          label="Checkout Configuration ID"
          value={whop.checkoutConfigurationId}
        />
      </div>
    ) : (
      !error && <p className="py-6 text-center text-sm text-[#8C9198]">لا توجد تفاصيل Whop متاحة.</p>
    )}
  </div>
);

export default PaymentWhopCard;
