import { useCallback, useEffect, useState } from "react";
import { AlertCircle, ArrowRight, Loader2, RefreshCw } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import AdminLayout from "../../../components/admin/layout/AdminLayout";
import PaymentDetailsCard from "../../../components/admin/payments/PaymentDetailsCard";
import PaymentStudentCard from "../../../components/admin/payments/PaymentStudentCard";
import PaymentWhopCard from "../../../components/admin/payments/PaymentWhopCard";
import Breadcrumbs from "../../shared/Breadcrumbs";
import { getAdminPaymentDetails } from "../../../services/APIService";

const money = (value, currency = "EGP") =>
  `${Number(value || 0).toLocaleString("ar-EG")} ${currency}`;

const PaymentItemsCard = ({ items = [], currency }) => (
  <div className="overflow-hidden rounded-3xl border border-[#DCE8F7] bg-white shadow-sm">
    <div className="border-b border-[#DCE8F7] bg-[#F8FBFF] px-7 py-5 sm:px-8">
      <h2 className="font-semibold text-[#1F2937]">تفاصيل المواد والباقات</h2>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full min-w-[820px] border-separate border-spacing-0 text-right text-sm" dir="rtl">
        <thead className="bg-[#F2F7FD] text-xs text-[#41546D]">
          <tr>
            {["المادة", "الباقة", "الحصص", "السعر الأصلي", "الخصم", "السعر النهائي", "التعيين"].map((heading) => (
              <th key={heading} className="border-b border-[#DCE8F7] px-5 py-4 font-semibold">
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {items.map((item, index) => (
            <tr key={item._id || item.id || index} className="transition-colors hover:bg-[#F8FBFF]">
              <td className="border-b border-[#EEF2F7] px-5 py-5 font-medium">
                {item.subjectName || item.subject?.name?.ar || "—"}
              </td>
              <td className="border-b border-[#EEF2F7] px-5 py-5">
                {item.packageName || item.package?.name || "—"}
              </td>
              <td className="border-b border-[#EEF2F7] px-5 py-5">{item.sessions ?? "—"}</td>
              <td className="border-b border-[#EEF2F7] px-5 py-5">{money(item.originalPrice, currency)}</td>
              <td className="border-b border-[#EEF2F7] px-5 py-5">{money(item.discount, currency)}</td>
              <td className="border-b border-[#EEF2F7] px-5 py-5 font-semibold text-[#123C91]">
                {money(item.finalPrice, currency)}
              </td>
              <td className="border-b border-[#EEF2F7] px-5 py-5 text-xs text-[#575F69]">
                {item.teacher?.user?.fullName || "لم يُعيّن"}
                {item.classroom?.name ? ` · ${item.classroom.name}` : ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const PaymentDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDetails = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getAdminPaymentDetails(id);
      setData(response.data?.data || null);
    } catch (requestError) {
      const message =
        requestError.response?.data?.message ||
        "تعذر تحميل تفاصيل عملية الدفع";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const timer = window.setTimeout(loadDetails, 0);
    return () => window.clearTimeout(timer);
  }, [loadDetails]);

  const order = data?.order;

  return (
    <AdminLayout>
      <Breadcrumbs homeTo="/admin-dashboard" />
      <main className="space-y-5 px-4 py-3 sm:px-6 sm:py-5" dir="rtl">
        <header className="flex items-start justify-between gap-3 px-1 sm:px-2">
          <div>
            <button
              type="button"
              onClick={() => navigate("/admin/payments")}
              className="mb-2 inline-flex items-center gap-1 text-sm text-[#123C91]"
            >
              <ArrowRight size={16} />
              العودة إلى المدفوعات
            </button>
            <h1 className="text-xl font-semibold text-[#123C91] sm:text-2xl">
              تفاصيل عملية الدفع
            </h1>
          </div>
          <button
            type="button"
            onClick={loadDetails}
            disabled={loading}
            className="rounded-xl border bg-white p-2.5 text-[#123C91] disabled:opacity-50"
            aria-label="تحديث"
          >
            <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
          </button>
        </header>

        {loading ? (
          <div className="flex justify-center gap-2 py-20 text-[#8C9198]">
            <Loader2 className="animate-spin" size={20} />
            جاري تحميل التفاصيل...
          </div>
        ) : error || !order ? (
          <div className="rounded-2xl border border-red-100 bg-white py-16 text-center">
            <AlertCircle className="mx-auto mb-2 text-red-500" />
            <p className="text-red-600">{error || "عملية الدفع غير موجودة"}</p>
            <button
              type="button"
              onClick={() => navigate("/admin/payments")}
              className="mt-4 text-sm font-medium text-[#123C91]"
            >
              الرجوع إلى القائمة
            </button>
          </div>
        ) : (
          <>
            <PaymentDetailsCard order={order} />
            <PaymentStudentCard order={order} />
            <PaymentItemsCard
              items={order.items}
              currency={order.currency}
            />
            <PaymentWhopCard
              whop={data.whop}
              error={data.whopLookupError}
              paymentId={order.whopPaymentId}
            />
          </>
        )}
      </main>
    </AdminLayout>
  );
};

export default PaymentDetailsPage;
