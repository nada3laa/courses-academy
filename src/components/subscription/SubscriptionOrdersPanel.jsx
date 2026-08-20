import { useCallback, useEffect, useState } from "react";
import { CreditCard, Loader2, RefreshCw, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {
  cancelSubscriptionOrder,
  getMySubscriptionOrders,
  startSubscriptionOrderCheckout,
} from "../../services/APIService";
import { formatEgpEquivalent, formatMoney } from "../../utils/currencyDisplay";

const PAYMENT_LABELS = {
  created: "جاهز للدفع",
  pending: "الدفع قيد الانتظار",
  paid: "تم تأكيد الدفع",
  failed: "فشل الدفع",
  refunded: "تم رد المبلغ",
};

const APPROVAL_LABELS = {
  waiting_payment: "بانتظار الدفع",
  waiting_admin: "بانتظار مراجعة الإدارة",
  approved: "تم تفعيل الاشتراك",
  rejected: "مرفوض",
};
const ORDER_TYPE_LABELS = {
  new_subscription: "اشتراك جديد",
  renewal: "تجديد اشتراك",
  add_subject: "إضافة مادة",
};

const responseData = (response) => response?.data?.data ?? response?.data;

const SubscriptionOrdersPanel = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState("");
  const [cancellingId, setCancellingId] = useState("");

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getMySubscriptionOrders();
      const data = responseData(response);
      setOrders(
        Array.isArray(data)
          ? data.filter(
              (order) =>
                order.approvalStatus !== "approved" &&
                order.approvalStatus !== "cancelled" &&
                order.paymentStatus !== "cancelled",
            )
          : [],
      );
    } catch (error) {
      toast.error(error.response?.data?.message || "تعذر تحميل طلبات الاشتراك");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(loadOrders, 0);
    return () => window.clearTimeout(timer);
  }, [loadOrders]);

  const startCheckout = async (orderId) => {
    setPayingId(orderId);
    try {
      const response = await startSubscriptionOrderCheckout(orderId);
      const checkoutData = responseData(response);
      const purchaseUrl = checkoutData?.paymentUrl || checkoutData?.purchaseUrl;
      if (!purchaseUrl) throw new Error("PURCHASE_URL_MISSING");
      window.location.assign(purchaseUrl);
    } catch (error) {
      if (error.response?.status === 409) {
        navigate(`/subscription-orders/${orderId}/status`);
      } else {
        toast.error(error.response?.data?.message || "تعذر بدء عملية الدفع");
      }
      setPayingId("");
    }
  };

  const cancelOrder = async (order) => {
    if (
      !window.confirm(
        "هل تريد إلغاء طلب الاشتراك؟ لن تتمكن من دفعه بعد الإلغاء.",
      )
    )
      return;
    setCancellingId(order.id);
    try {
      await cancelSubscriptionOrder(order.id);
      setOrders((current) => current.filter((item) => item.id !== order.id));
      toast.success("تم إلغاء طلب الاشتراك");
    } catch (error) {
      toast.error(error.response?.data?.message || "تعذر إلغاء طلب الاشتراك");
    } finally {
      setCancellingId("");
    }
  };

  if (!loading && orders.length === 0) return null;

  return (
    <section className="mt-7" dir="rtl">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[#1F2937]">
            طلبات الاشتراك
          </h2>
          <p className="mt-1 text-sm text-[#8C9198]">
            تابع الدفع وموافقة الإدارة لكل طلب.
          </p>
        </div>
        <button
          type="button"
          onClick={loadOrders}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-[#E5E5E5] bg-white px-3 py-2 text-sm text-[#123C91] disabled:opacity-60"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          تحديث
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-[#E5E5E5] bg-white py-12 text-[#575F69]">
          <Loader2 size={20} className="animate-spin" />
          جاري تحميل الطلبات...
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <article
              key={order.id}
              className="rounded-2xl border border-[#E5E5E5] bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-[#1F2937]">
                      {order.student?.name || "الطالب"}
                    </h3>
                    {order.orderType && (
                      <span className="rounded-full bg-violet-50 px-3 py-1 text-xs text-violet-700">
                        {ORDER_TYPE_LABELS[order.orderType] || order.orderType}
                      </span>
                    )}
                    <span className="rounded-full bg-[#EAF4FF] px-3 py-1 text-xs text-[#123C91]">
                      {PAYMENT_LABELS[order.paymentStatus] ||
                        order.paymentStatus}
                    </span>
                    {(order.paymentStatus === "paid" ||
                      order.approvalStatus === "rejected") && (
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-[#575F69]">
                        {APPROVAL_LABELS[order.approvalStatus] ||
                          order.approvalStatus}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-[#9CA3AF]">
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString("ar-EG")
                      : "—"}
                  </p>
                </div>
                <div className="text-left">
                  <strong className="block text-lg text-[#123C91]">
                    {formatMoney(order.totalAmount, order.currency)}
                  </strong>
                  {formatEgpEquivalent(order.totalAmount, order) && (
                    <span className="mt-1 block text-xs text-[#8C9198]">
                      ما يعادله {formatEgpEquivalent(order.totalAmount, order)}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 divide-y rounded-xl bg-[#F9FAFA] px-4">
                {(order.items || []).map((item) => (
                  <div
                    key={item.id || item._id}
                    className="flex items-center justify-between gap-4 py-3 text-sm"
                  >
                    <div>
                      <strong className="text-[#1F2937]">
                        {item.subjectName || "مادة"}
                      </strong>
                      <span className="mr-2 text-[#8C9198]">
                        {item.packageName} · {item.sessions} حصة
                      </span>
                    </div>
                    <span className="font-medium text-[#123C91]">
                      {formatMoney(item.finalPrice, order.currency)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                {["created", "pending"].includes(order.paymentStatus) && (
                  <button
                    type="button"
                    onClick={() => startCheckout(order.id)}
                    disabled={payingId === order.id}
                    className="flex h-11 items-center justify-center gap-2 rounded-lg bg-[#123C91] px-5 text-sm font-medium text-white disabled:opacity-60"
                  >
                    <CreditCard size={17} />
                    {payingId === order.id
                      ? "جاري التحويل..."
                      : order.paymentStatus === "pending"
                        ? "استكمال الدفع"
                        : "ادفع الآن"}
                  </button>
                )}
                {!["created", "pending"].includes(order.paymentStatus) && (
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/subscription-orders/${order.id}/status`)
                    }
                    className="h-11 rounded-lg border border-[#123C91] px-5 text-sm font-medium text-[#123C91]"
                  >
                    عرض حالة الطلب
                  </button>
                )}
                {["created", "pending"].includes(order.paymentStatus) && (
                  <button
                    type="button"
                    onClick={() => cancelOrder(order)}
                    disabled={
                      cancellingId === order.id || payingId === order.id
                    }
                    className="flex h-11 items-center justify-center gap-2 rounded-lg border border-red-200 px-5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
                  >
                    {cancellingId === order.id ? (
                      <Loader2 size={17} className="animate-spin" />
                    ) : (
                      <XCircle size={17} />
                    )}
                    {cancellingId === order.id
                      ? "جارٍ الإلغاء..."
                      : "إلغاء الطلب"}
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default SubscriptionOrdersPanel;
