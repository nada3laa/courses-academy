import { useCallback, useContext, useEffect, useState } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import toast from "react-hot-toast";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import logo from "../../assets/icons/logo.svg";
import AuthLayout from "../../components/auth/AuthLayout";
import { AuthContext } from "../../context/AuthContext";
import {
  getMyStudentsSubscriptions,
  getMySubscriptions,
  getSubscriptionOrder,
  startSubscriptionOrderCheckout,
} from "../../services/APIService";
import { formatEgpEquivalent, formatMoney } from "../../utils/currencyDisplay";

const responseData = (response) => response?.data?.data ?? response?.data;
const terminalPayments = new Set(["paid", "failed", "refunded"]);

const SubscriptionOrderStatusPage = () => {
  const { user } = useContext(AuthContext);
  const userRole = user?.role;
  const { pathname } = useLocation();
  const isWhopReturn = pathname === "/payment/success";
  const hasActiveAccount =
    user?.isActive === true || user?.registrationStatus === "active";
  const { orderId: pathOrderId } = useParams();
  const [searchParams] = useSearchParams();
  const orderId = pathOrderId || searchParams.get("orderId");
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [pollingExpired, setPollingExpired] = useState(false);

  const refresh = useCallback(
    async (quiet = false) => {
      if (!orderId) {
        if (!quiet) {
          setLoading(false);
          toast.error("رقم طلب الاشتراك غير موجود في رابط العودة");
        }
        return null;
      }
      if (!quiet) setLoading(true);
      try {
        const response = await getSubscriptionOrder(orderId);
        const current = responseData(response);
        setOrder(current);
        if (
          current.paymentStatus === "paid" &&
          current.approvalStatus === "approved"
        ) {
          if (userRole === "parent") {
            await getMyStudentsSubscriptions();
            navigate("/parent/subscription", { replace: true });
          } else {
            await getMySubscriptions();
            navigate("/student-dashboard", { replace: true });
          }
        }
        return current;
      } catch (error) {
        if (
          isWhopReturn &&
          hasActiveAccount &&
          [403, 404].includes(error.response?.status)
        ) {
          navigate(
            userRole === "parent" ? "/parent-dashboard" : "/student-dashboard",
            { replace: true },
          );
          return null;
        }
        if (!quiet)
          toast.error(error.response?.data?.message || "تعذر تحميل حالة الطلب");
        return null;
      } finally {
        if (!quiet) setLoading(false);
      }
    },
    [hasActiveAccount, isWhopReturn, navigate, orderId, userRole],
  );

  useEffect(() => {
    const initialRefresh = window.setTimeout(() => refresh(), 0);
    const startedAt = Date.now();
    const timer = window.setInterval(async () => {
      if (Date.now() - startedAt >= 120000) {
        window.clearInterval(timer);
        setPollingExpired(true);
        return;
      }
      const current = await refresh(true);
      if (current && terminalPayments.has(current.paymentStatus))
        window.clearInterval(timer);
    }, 4000);
    return () => {
      window.clearTimeout(initialRefresh);
      window.clearInterval(timer);
    };
  }, [refresh]);

  const continuePayment = async () => {
    if (!orderId) return;
    setPaying(true);
    try {
      const response = await startSubscriptionOrderCheckout(orderId);
      const checkoutData = responseData(response);
      const purchaseUrl = checkoutData?.paymentUrl || checkoutData?.purchaseUrl;
      if (!purchaseUrl) throw new Error("Missing checkout URL");
      window.location.assign(purchaseUrl);
    } catch (error) {
      if (error.response?.status === 409) await refresh();
      else toast.error(error.response?.data?.message || "تعذر متابعة الدفع");
      setPaying(false);
    }
  };

  const paid = order?.paymentStatus === "paid";
  const rejected = order?.approvalStatus === "rejected";
  const labels = [
    ["تم اختيار الباقة", true],
    ["الدفع قيد الانتظار", ["pending", "paid"].includes(order?.paymentStatus)],
    ["تم استلام الدفع", paid],
    [
      "مراجعة الإدارة",
      paid && ["waiting_admin", "approved"].includes(order?.approvalStatus),
    ],
    ["تم تفعيل الاشتراك", order?.approvalStatus === "approved"],
  ];

  return (
    <AuthLayout>
      <div className="w-full max-w-md mx-auto p-6" dir="rtl">
        <img src={logo} alt="الأكاديمية" className="w-40 h-9 mx-auto mb-7" />
        <div className="bg-white border border-[#DCE8F7] rounded-2xl p-6 shadow-sm">
          <div className="flex justify-center mb-4">
            {rejected ? (
              <XCircle className="text-red-600" size={44} />
            ) : paid ? (
              <CheckCircle className="text-emerald-600" size={44} />
            ) : (
              <Clock className="text-amber-500" size={44} />
            )}
          </div>
          <h1 className="text-xl font-bold text-center">حالة طلب الاشتراك</h1>
          <p
            className={`mt-2 mb-6 text-center text-sm ${paid ? "font-bold text-emerald-700" : "text-gray-500"}`}
          >
            {!orderId
              ? "رابط العودة لا يحتوي على رقم الطلب"
              : loading
                ? "جاري التحقق من الخادم..."
                : rejected
                  ? "تم رفض الطلب"
                  : paid
                    ? order.approvalStatus === "waiting_admin"
                      ? "تم استلام الدفع — بانتظار موافقة الأكاديمية"
                      : "تم استلام الدفع بنجاح"
                    : "لم يتم تأكيد الدفع بعد"}
          </p>
          {paid && (
            <div className="mb-6 rounded-xl border-2 border-emerald-300 bg-emerald-50 px-4 py-4 text-center shadow-sm">
              <div className="flex items-center justify-center gap-2 text-emerald-700">
                <CheckCircle size={22} />
                <strong className="text-base font-bold sm:text-lg">
                  تم استلام الدفع بنجاح
                </strong>
              </div>
              {order?.approvalStatus === "waiting_admin" && (
                <p className="mt-2 text-sm font-semibold text-emerald-800/80">
                  طلبك الآن بانتظار مراجعة وموافقة الإدارة
                </p>
              )}
            </div>
          )}
          {!loading && orderId && (
            <div>
              {order && (
                <div className="mb-6 rounded-xl bg-[#F9FAFA] p-4 text-center">
                  <p className="text-xs text-gray-500">قيمة الطلب</p>
                  <strong className="mt-1 block text-xl text-[#123C91]">
                    {formatMoney(order.totalAmount, order.currency)}
                  </strong>
                  {formatEgpEquivalent(order.totalAmount, order) && (
                    <p className="mt-1 text-sm text-gray-600">
                      ما يعادله {formatEgpEquivalent(order.totalAmount, order)}
                    </p>
                  )}
                  {order.currency !== "EGP" && order.exchangeRate && (
                    <p className="mt-1 text-xs text-gray-400">
                      سعر الصرف المستخدم: 1 {order.currency} ={" "}
                      {order.exchangeRate} ج.م
                    </p>
                  )}
                </div>
              )}
              <div className="space-y-4">
                {labels.map(([label, done]) => {
                  const isPaymentReceived = label === "تم استلام الدفع";
                  return (
                    <div
                      key={label}
                      className={`flex items-center gap-3 rounded-lg px-2 py-1.5 ${isPaymentReceived && done ? "border border-emerald-200 bg-emerald-50" : ""}`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full border-2 ${isPaymentReceived && done ? "border-emerald-600 bg-emerald-600" : done ? "bg-[#123C91] border-[#123C91]" : "bg-white border-gray-300"}`}
                      />
                      <span
                        className={
                          isPaymentReceived && done
                            ? "text-base font-extrabold text-emerald-700"
                            : done
                              ? "font-medium text-[#123C91]"
                              : "text-gray-400"
                        }
                      >
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {["created", "pending"].includes(order?.paymentStatus) && (
            <button
              disabled={paying}
              onClick={continuePayment}
              className="w-full h-12 mt-6 rounded-lg bg-[#123C91] text-white disabled:opacity-60"
            >
              {paying
                ? "جاري التحويل..."
                : order.paymentStatus === "pending"
                  ? "متابعة الدفع"
                  : "الدفع الآن"}
            </button>
          )}
          {orderId && (
            <button
              disabled={loading}
              onClick={() => refresh()}
              className="w-full h-11 mt-3 rounded-lg border border-[#123C91] text-[#123C91]"
            >
              تحديث الحالة
            </button>
          )}
          <button
            type="button"
            onClick={() =>
              navigate(
                userRole === "parent"
                  ? "/parent-dashboard"
                  : "/student-dashboard",
              )
            }
            className="w-full h-11 mt-3 rounded-lg bg-[#F3F4F6] text-[#1F2937] font-medium"
          >
            الشاشة الرئيسية
          </button>
          {pollingExpired && (
            <p className="text-xs text-gray-500 text-center mt-3">
              توقف التحديث التلقائي. يمكنك تحديث الحالة يدوياً.
            </p>
          )}
          {order?.paymentStatus === "refunded" && (
            <p className="text-sm text-red-700 mt-4 text-center">
              تم رد المبلغ. يرجى التواصل مع الدعم.
            </p>
          )}
          {order?.paymentStatus === "failed" && (
            <p className="text-sm text-red-700 mt-4 text-center">
              تعذرت عملية الدفع. سياسة إعادة المحاولة غير متاحة حالياً.
            </p>
          )}
        </div>
      </div>
    </AuthLayout>
  );
};

export default SubscriptionOrderStatusPage;
