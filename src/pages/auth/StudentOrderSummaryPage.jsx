import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import logo from "../../assets/icons/logo.svg";
import AuthLayout from "../../components/auth/AuthLayout";
import {
  cancelSubscriptionOrder,
  completeStudentProfile,
  createSubscriptionOrder,
  startSubscriptionOrderCheckout,
} from "../../services/APIService";
import { formatEgpEquivalent, formatMoney } from "../../utils/currencyDisplay";

const responseData = (response) => response?.data?.data ?? response?.data;
const isExistingProfileError = (error) => {
  const message = String(error.response?.data?.message || "").toLowerCase();
  return message.includes("profile") && message.includes("already exists");
};

const StudentOrderSummaryPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [loading, setLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [editingOrder, setEditingOrder] = useState(false);
  const [order, setOrder] = useState(state?.order || null);
  const items = useMemo(() => state?.orderItems || [], [state]);

  useEffect(() => {
    if (order) return;
    if (!items.length) {
      navigate("/register/subjects", { replace: true });
      return;
    }

    let active = true;
    const createOrder = async () => {
      setLoading(true);
      try {
        if (!state?.renewal && !state?.skipProfileCreation) {
          try {
            await completeStudentProfile({
              birthDate: state.birthDate,
              studyLanguage: state.studyLanguage,
              curriculum: state.curriculumId,
              stage: state.stageId,
              grade: state.gradeId,
              studentType: state.studentType || "school",
              preferredSubjects: state.preferredSubjects,
            });
          } catch (error) {
            if (!isExistingProfileError(error)) throw error;
          }
        }
        const response = await createSubscriptionOrder(
          items.map(({ subject, package: packageId }) => ({
            subject,
            package: packageId,
          })),
          state?.studentId,
          state?.currency,
        );
        const created = responseData(response);
        if (!active) return;
        setOrder(created);
        localStorage.setItem("lastSubscriptionOrderId", created.id);
      } catch (error) {
        if (active) {
          const message =
            error.response?.status === 404
              ? "خدمة إنشاء طلب الاشتراك غير متاحة من الخادم حالياً"
              : error.response?.data?.message || "تعذر إنشاء طلب الاشتراك";
          toast.error(message);
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    const timer = window.setTimeout(createOrder, 0);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [items, navigate, order, state]);

  const checkout = async () => {
    setCheckoutLoading(true);
    try {
      const response = await startSubscriptionOrderCheckout(order.id);
      const checkoutData = responseData(response);
      const purchaseUrl = checkoutData?.paymentUrl || checkoutData?.purchaseUrl;
      if (!purchaseUrl) throw new Error("Missing checkout URL");
      window.location.assign(purchaseUrl);
    } catch (error) {
      if (error.response?.status === 409) {
        navigate(`/subscription-orders/${order.id}/status`, { replace: true });
      } else {
        toast.error(error.response?.data?.message || "تعذر بدء عملية الدفع");
      }
      setCheckoutLoading(false);
    }
  };

  const editOrder = async () => {
    if (!order?.id || !["created", "pending"].includes(order.paymentStatus))
      return;

    setEditingOrder(true);
    try {
      await cancelSubscriptionOrder(order.id);
      if (
        localStorage.getItem("lastSubscriptionOrderId") === String(order.id)
      ) {
        localStorage.removeItem("lastSubscriptionOrderId");
      }

      const initialSelections = Object.fromEntries(
        items.map((item) => [item.subject, item.package]),
      );
      const studentId = state?.studentId;
      const packagesPath = state?.parentFlow
        ? `/parent/students/${studentId}/subscription/packages`
        : "/register/packages";

      navigate(packagesPath, {
        replace: true,
        state: {
          ...(state || {}),
          order: null,
          orderItems: undefined,
          initialSelections,
          currency: order.currency || state?.currency,
        },
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "تعذر فتح الطلب للتعديل");
      setEditingOrder(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-[650px] mx-auto p-5" dir="rtl">
        <Link to="/">
          <img src={logo} alt="الأكاديمية" className="w-40 h-9 mx-auto mb-6" />
        </Link>
        <div className="bg-white border border-[#DCE8F7] rounded-2xl p-6 shadow-sm">
          <button
            onClick={() => navigate(-1)}
            className="text-[#123C91] text-sm mb-2"
          >
            رجوع
          </button>
          <h1 className="text-[22px] font-bold">ملخص طلبك</h1>
          <p className="text-sm text-gray-400 mb-5">
            {order
              ? "راجع تفاصيل اشتراكك قبل الدفع"
              : "جاري تجهيز تفاصيل طلبك..."}
          </p>

          {loading && !order && (
            <div className="flex items-center justify-center gap-3 py-10 text-gray-500">
              <span className="w-5 h-5 border-2 border-[#123C91] border-t-transparent rounded-full animate-spin" />
              جاري إنشاء الطلب وحساب السعر...
            </div>
          )}
          {order && (
            <>
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                {(order.items || []).map((item) => (
                  <div
                    key={item.id || `${item.subject}-${item.package}`}
                    className="px-4 py-3 border-b last:border-b-0 border-gray-100"
                  >
                    <div className="flex justify-between gap-3">
                      <div>
                        <strong>{item.subjectName}</strong>
                        <small className="block text-gray-500">
                          {item.packageName} · {item.sessions} حصة
                        </small>
                      </div>
                      <strong className="text-[#123C91]">
                        {formatMoney(
                          item.finalPrice,
                          order.currency || state?.currency,
                        )}
                      </strong>
                    </div>
                    {(item.discount || 0) > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        السعر الأصلي{" "}
                        {formatMoney(
                          item.originalPrice,
                          order.currency || state?.currency,
                        )}{" "}
                        — الخصم{" "}
                        {formatMoney(
                          item.discount,
                          order.currency || state?.currency,
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between border border-gray-200 rounded-xl p-4 mt-5 text-lg font-bold">
                <span>الإجمالي</span>
                <strong className="text-[#123C91]">
                  {formatMoney(
                    order.totalAmount,
                    order.currency || state?.currency,
                  )}
                </strong>
              </div>
              {formatEgpEquivalent(order.totalAmount, order) && (
                <div className="mt-2 text-left text-sm text-gray-500">
                  ما يعادله {formatEgpEquivalent(order.totalAmount, order)}
                  {order.currency !== "EGP" && order.exchangeRate
                    ? ` بسعر 1 ${order.currency} = ${order.exchangeRate} ج.م`
                    : ""}
                </div>
              )}
            </>
          )}

          {order && (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                disabled={checkoutLoading || editingOrder}
                onClick={checkout}
                className="h-12 rounded-lg bg-[#123C91] text-white disabled:opacity-60"
              >
                {checkoutLoading
                  ? "جاري التحويل للدفع..."
                  : order.paymentStatus === "pending"
                    ? "متابعة الدفع"
                    : "الدفع الآن"}
              </button>
              {["created", "pending"].includes(order.paymentStatus) && (
                <button
                  type="button"
                  disabled={editingOrder || checkoutLoading}
                  onClick={editOrder}
                  className="h-12 rounded-lg border border-[#123C91] bg-white font-semibold text-[#123C91] disabled:opacity-60"
                >
                  {editingOrder ? "جاري فتح التعديل..." : "تعديل الطلب"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </AuthLayout>
  );
};

export default StudentOrderSummaryPage;
