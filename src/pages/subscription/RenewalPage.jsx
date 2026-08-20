import { useEffect, useMemo, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import ParentLayout from "../../components/parent/layout/ParentLayout";
import StudentLayout from "../../components/student/layout/StudentLayout";
import CurrencySelector from "../../components/subscription/CurrencySelector";
import {
  createRenewalSubscriptionOrder,
  getExchangeRates,
  getSubscriptionRenewOptions,
  startSubscriptionOrderCheckout,
} from "../../services/APIService";
import { formatEgpEquivalent, formatMoney } from "../../utils/currencyDisplay";

const responseData = (response) => response?.data?.data ?? response?.data;

const localizedName = (value) => {
  if (!value) return "—";
  if (typeof value === "string") return value;
  return value.ar || value.en || value.name?.ar || value.name?.en || "—";
};

const money = (value) => `${Number(value || 0).toLocaleString("ar-EG")} ج.م`;

const STATUS_LABELS = {
  active: "نشط",
  expired: "منتهي",
  ended: "منتهي",
  completed: "منتهي",
  pending: "قيد المراجعة",
};

const ERROR_MESSAGES = {
  SOURCE_SUBSCRIPTION_REQUIRED: "بيانات الاشتراك المراد تجديده غير مكتملة.",
  SUBSCRIPTION_NOT_FOUND: "الاشتراك المطلوب غير موجود.",
  ACTION_DENIED: "لا تملك صلاحية تجديد هذا الاشتراك.",
  SUBJECT_NOT_IN_SOURCE_SUBSCRIPTION:
    "إحدى المواد المختارة ليست ضمن الاشتراك الحالي.",
  DUPLICATE_SUBJECT_IN_RENEWAL: "لا يمكن تكرار المادة في طلب التجديد.",
  SUBJECT_NOT_FOUND: "إحدى المواد المختارة لم تعد متاحة.",
  PACKAGE_NOT_FOUND: "إحدى الباقات المختارة لم تعد متاحة.",
  SUBSCRIPTION_ORDER_ITEMS_REQUIRED: "اختر باقة لمادة واحدة على الأقل.",
};

const errorMessage = (error, fallback) => {
  const code = error.response?.data?.code;
  const message = error.response?.data?.message;
  return ERROR_MESSAGES[code] || ERROR_MESSAGES[message] || message || fallback;
};

const RenewalPage = ({ role }) => {
  const Layout = role === "parent" ? ParentLayout : StudentLayout;
  const navigate = useNavigate();
  const { state } = useLocation();
  const { id } = useParams();
  const [details, setDetails] = useState(null);
  const [selectedPackages, setSelectedPackages] = useState({});
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState(null);
  const [currencies, setCurrencies] = useState([]);
  const [currency, setCurrency] = useState("");

  useEffect(() => {
    let active = true;

    const loadOptions = async () => {
      try {
        setLoading(true);
        setError("");
        const [response, ratesResponse] = await Promise.all([
          getSubscriptionRenewOptions(id),
          getExchangeRates(),
        ]);
        if (active) {
          setDetails(responseData(response));
          const rates = responseData(ratesResponse);
          const availableRates = Array.isArray(rates) ? rates : [];
          setCurrencies(availableRates);
          setCurrency(
            availableRates.find((rate) => rate.isBaseCurrency)?.currency ||
              availableRates[0]?.currency ||
              "",
          );
        }
      } catch (requestError) {
        if (active) {
          setError(
            errorMessage(requestError, "تعذر تحميل خيارات تجديد الاشتراك"),
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadOptions();
    return () => {
      active = false;
    };
  }, [id]);

  const items = useMemo(() => details?.items ?? [], [details]);
  const selectedItems = useMemo(
    () =>
      items.flatMap((item) => {
        const subjectId = item.subject?.id || item.subject?._id;
        const packageId = selectedPackages[subjectId];
        return packageId ? [{ subject: subjectId, package: packageId }] : [];
      }),
    [items, selectedPackages],
  );

  const choosePackage = (subjectId, packageId) => {
    if (order) return;
    setSelectedPackages((current) => ({
      ...current,
      [subjectId]: current[subjectId] === packageId ? undefined : packageId,
    }));
  };

  const createOrder = async () => {
    if (!selectedItems.length) {
      toast.error("اختر باقة لمادة واحدة على الأقل");
      return;
    }
    if (!currency) return toast.error("اختر عملة الدفع");

    try {
      setCreating(true);
      const response = await createRenewalSubscriptionOrder(
        id,
        selectedItems,
        currency,
      );
      const createdOrder = responseData(response);
      setOrder(createdOrder);
      localStorage.setItem("lastSubscriptionOrderId", createdOrder.id);
      toast.success("تم إنشاء طلب التجديد. راجع الإجمالي قبل الدفع.");
    } catch (requestError) {
      toast.error(errorMessage(requestError, "تعذر إنشاء طلب التجديد"));
    } finally {
      setCreating(false);
    }
  };

  const checkout = async () => {
    try {
      setCheckoutLoading(true);
      const response = await startSubscriptionOrderCheckout(order.id);
      const checkoutData = responseData(response);
      const purchaseUrl = checkoutData?.paymentUrl || checkoutData?.purchaseUrl;
      if (!purchaseUrl) throw new Error("Missing checkout URL");
      window.location.assign(purchaseUrl);
    } catch (requestError) {
      if (requestError.response?.status === 409) {
        navigate(`/subscription-orders/${order.id}/status`);
        return;
      }
      toast.error(errorMessage(requestError, "تعذر بدء عملية الدفع"));
      setCheckoutLoading(false);
    }
  };

  return (
    <Layout>
      <div
        dir="rtl"
        className="mx-auto w-full max-w-6xl py-3 font-['IBM_Plex_Sans_Arabic']"
      >
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-3 text-sm font-medium text-[#123C91]"
        >
          رجوع
        </button>
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-[#123C91]">تجديد الاشتراك</h1>
          <p className="mt-2 text-sm text-[#667085]">
            اختر المواد والباقات التي تريد تجديدها، ثم راجع السعر المؤكد من
            الخادم قبل الدفع.
          </p>
        </header>

        {loading && (
          <div className="flex items-center justify-center gap-2 rounded-2xl border bg-white py-16 text-[#667085]">
            <Loader2 className="animate-spin" size={22} />
            جاري تحميل خيارات التجديد...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && details && (
          <>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
              <div>
                <span className="text-xs text-[#667085]">الطالب</span>
                <h2 className="mt-1 text-lg font-bold text-[#1F2937]">
                  {details.student?.name || "—"}
                </h2>
                <p className="mt-1 text-xs text-[#98A2B3]">
                  رقم الاشتراك: {details.subscription?.id || id}
                </p>
              </div>
              <span className="rounded-full bg-red-50 px-4 py-2 text-xs font-semibold text-red-600">
                {STATUS_LABELS[details.subscription?.status] ||
                  details.subscription?.status ||
                  "—"}
              </span>
            </div>

            <div className="space-y-5">
              {items.map((item) => {
                const subjectId = item.subject?.id || item.subject?._id;
                const highlighted =
                  state?.subjectId && state.subjectId === subjectId;
                return (
                  <article
                    key={item.id || subjectId}
                    className={`rounded-2xl border bg-white p-5 shadow-sm ${
                      highlighted ? "border-[#123C91]" : "border-[#E5E7EB]"
                    }`}
                  >
                    <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-bold text-[#1F2937]">
                          {localizedName(item.subject?.name)}
                        </h3>
                        <p className="mt-1 text-sm text-[#667085]">
                          المعلم: {item.teacher?.name || "—"} · الفصل:{" "}
                          {item.classroom?.name || "—"}
                        </p>
                      </div>
                      <div className="text-left text-xs text-[#667085]">
                        <p>
                          الباقة الحالية:{" "}
                          <strong className="text-[#1F2937]">
                            {localizedName(item.currentPackage?.name)}
                          </strong>
                        </p>
                        <p className="mt-1">
                          {item.usedSessions ?? 0} مستخدمة ·{" "}
                          {item.remainingSessions ?? 0} متبقية من{" "}
                          {item.totalSessions ?? 0}
                        </p>
                      </div>
                    </div>

                    <h4 className="mb-3 text-sm font-semibold text-[#344054]">
                      اختر باقة التجديد
                    </h4>
                    {item.availablePackages?.length ? (
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {item.availablePackages.map((packageOption) => {
                          const packageId =
                            packageOption.id || packageOption._id;
                          const selected =
                            selectedPackages[subjectId] === packageId;
                          return (
                            <button
                              key={packageId}
                              type="button"
                              disabled={Boolean(order)}
                              onClick={() =>
                                choosePackage(subjectId, packageId)
                              }
                              className={`relative rounded-xl border p-4 text-right transition ${
                                selected
                                  ? "border-[#123C91] bg-[#EEF5FF]"
                                  : "border-[#E5E7EB] hover:border-[#9DB6E4]"
                              } disabled:cursor-default`}
                            >
                              {selected && (
                                <Check
                                  size={18}
                                  className="absolute left-3 top-3 text-[#123C91]"
                                />
                              )}
                              <strong className="block pe-6 text-sm text-[#1F2937]">
                                {localizedName(packageOption.name)}
                              </strong>
                              <span className="mt-2 block text-xs text-[#667085]">
                                {packageOption.sessions} حصة
                              </span>
                              <span className="mt-3 block font-bold text-[#123C91]">
                                {money(packageOption.price)}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="rounded-xl bg-[#F9FAFB] p-4 text-sm text-[#667085]">
                        لا توجد باقات متاحة لهذه المادة حاليًا.
                      </p>
                    )}
                  </article>
                );
              })}
            </div>

            {!items.length && (
              <div className="rounded-2xl border bg-white p-8 text-center text-[#667085]">
                لا توجد مواد متاحة للتجديد في هذا الاشتراك.
              </div>
            )}

            {order ? (
              <div className="mt-6 rounded-2xl border border-[#DCE8F7] bg-white p-5 shadow-sm">
                <h3 className="text-lg font-bold text-[#1F2937]">
                  ملخص طلب التجديد
                </h3>
                <div className="mt-4 divide-y rounded-xl border">
                  {(order.items || []).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 p-4"
                    >
                      <div>
                        <strong className="text-sm">{item.subjectName}</strong>
                        <span className="mt-1 block text-xs text-[#667085]">
                          {item.packageName} · {item.sessions} حصة
                        </span>
                      </div>
                      <strong className="text-[#123C91]">
                        {formatMoney(item.finalPrice, order.currency)}
                      </strong>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between rounded-xl bg-[#F8FAFC] p-4 text-lg font-bold">
                  <span>الإجمالي المؤكد</span>
                  <span className="text-[#123C91]">
                    {formatMoney(order.totalAmount, order.currency)}
                  </span>
                </div>
                {formatEgpEquivalent(order.totalAmount, order) && (
                  <p className="mt-2 text-left text-sm text-[#667085]">
                    ما يعادله {formatEgpEquivalent(order.totalAmount, order)}
                  </p>
                )}
                <button
                  type="button"
                  disabled={checkoutLoading}
                  onClick={checkout}
                  className="mt-4 h-12 w-full rounded-xl bg-[#123C91] font-semibold text-white disabled:opacity-60"
                >
                  {checkoutLoading
                    ? "جاري التحويل للدفع..."
                    : order.paymentStatus === "pending"
                      ? "استكمال الدفع"
                      : "الدفع الآن"}
                </button>
              </div>
            ) : (
              items.length > 0 && (
                <>
                  <CurrencySelector
                    currencies={currencies}
                    value={currency}
                    onChange={setCurrency}
                  />
                  <button
                    type="button"
                    disabled={creating || !selectedItems.length || !currency}
                    onClick={createOrder}
                    className="mt-6 h-12 w-full rounded-xl bg-[#123C91] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {creating
                      ? "جاري إنشاء طلب التجديد..."
                      : "إنشاء طلب التجديد وعرض السعر"}
                  </button>
                </>
              )
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default RenewalPage;
