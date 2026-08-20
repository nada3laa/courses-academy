import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import AdminLayout from "../../../components/admin/layout/AdminLayout";
import { getPackage, getSubscription } from "../../../services/APIService";
import Breadcrumbs from "../../shared/Breadcrumbs";
import {
  currencyCodeOf,
  formatEgpEquivalent,
  formatMoney,
} from "../../../utils/currencyDisplay";

const idOf = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value.id || value._id || "";
};

const nameOf = (value) => {
  if (!value) return "--";
  if (typeof value === "string") return value;
  return (
    (typeof value.name === "string" ? value.name : value.name?.ar) ||
    value.name?.en ||
    value.fullName ||
    value.user?.fullName ||
    "--"
  );
};

const pricingOf = (item) => {
  const discount = Number(item.discount) || 0;
  const savedFinalPrice = Number(item.finalPrice);
  const savedPrice = Number(item.price);
  const packagePrice = Number(item.package?.price);
  const finalPrice = Number.isFinite(savedFinalPrice) ? savedFinalPrice : 0;
  const price =
    (Number.isFinite(savedPrice) && savedPrice > 0 && savedPrice) ||
    (Number.isFinite(packagePrice) && packagePrice > 0 && packagePrice) ||
    finalPrice + discount;

  return {
    price,
    discount,
    finalPrice:
      Number.isFinite(savedFinalPrice) && savedFinalPrice >= 0
        ? savedFinalPrice
        : Math.max(0, price - discount),
  };
};

const statusLabel = (status) =>
  ({ active: "نشط", expired: "منتهي", suspended: "موقوف" })[status] ||
  status ||
  "--";

const Detail = ({ label, value }) => (
  <div className="bg-[#F9FAFA] rounded-xl px-4 py-3 flex items-center justify-between gap-3">
    <span className="text-[12px] text-[#8C9198]">{label}</span>
    <span className="text-[14px] font-medium text-[#1F2937] text-left">
      {value ?? "--"}
    </span>
  </div>
);

const SubscriptionDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState(null);
  const [packagesById, setPackagesById] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSubscription = async () => {
      setLoading(true);
      setError("");
      try {
        const subscriptionResponse = await getSubscription(id);
        const subscriptionData =
          subscriptionResponse.data?.data || subscriptionResponse.data;
        const subscriptionItems =
          subscriptionData?.items ||
          subscriptionData?.subjectSubscriptions ||
          [];
        const packageIds = [
          ...new Set(
            subscriptionItems
              .map((item) => idOf(item.package) || item.packageId)
              .filter(Boolean),
          ),
        ];
        const packageResponses = await Promise.allSettled(
          packageIds.map((packageId) => getPackage(packageId)),
        );
        const nextPackagesById = {};

        packageResponses.forEach((result, index) => {
          if (result.status !== "fulfilled") return;
          nextPackagesById[packageIds[index]] =
            result.value.data?.data || result.value.data;
        });

        setSubscription(subscriptionData);
        setPackagesById(nextPackagesById);
      } catch (err) {
        setError(err?.response?.data?.message || "تعذر تحميل تفاصيل الاشتراك");
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [id]);

  if (loading) {
    return (
      <AdminLayout>
        <Breadcrumbs homeTo="/admin-dashboard" />
        <div
          className="flex items-center justify-center gap-2 py-24 text-[#8C9198]"
          dir="rtl"
        >
          <Loader2 size={20} className="animate-spin" />
          <span className="text-[14px]">جاري تحميل تفاصيل الاشتراك...</span>
        </div>
      </AdminLayout>
    );
  }

  if (error || !subscription) {
    return (
      <AdminLayout>
        <Breadcrumbs homeTo="/admin-dashboard" />
        <div
          className="flex flex-col items-center justify-center gap-3 py-24"
          dir="rtl"
        >
          <AlertCircle size={22} className="text-red-500" />
          <p className="text-[14px] text-red-600">
            {error || "الاشتراك غير موجود"}
          </p>
          <button
            onClick={() => navigate("/admin/subscription")}
            className="px-4 py-2 rounded-lg border border-gray-200 text-[13px] text-[#374151] hover:bg-gray-50"
          >
            الرجوع للاشتراكات
          </button>
        </div>
      </AdminLayout>
    );
  }

  const items = subscription.items || subscription.subjectSubscriptions || [];
  const currency = currencyCodeOf(subscription);

  return (
    <AdminLayout>
      <Breadcrumbs homeTo="/admin-dashboard" />
      <div
        dir="rtl"
        className="w-full max-w-full p-3 sm:p-4 md:p-6 font-['IBM_Plex_Sans_Arabic']"
      >
        <div className="flex items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="font-semibold text-[18px] sm:text-[20px] text-[#123C91]">
              تفاصيل الاشتراك
            </h2>
            <p className="text-[13px] text-[#8C9198] mt-1">
              الطالب: {nameOf(subscription.student)}
            </p>
          </div>
          <button
            onClick={() => navigate("/admin/subscription")}
            className="flex items-center gap-2 text-[#575F69] hover:text-[#123C91] text-[13px] transition-colors"
          >
            <ArrowRight size={16} />
            الرجوع
          </button>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 shadow-sm mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Detail label="اسم الطالب" value={nameOf(subscription.student)} />
            <Detail label="ولي الأمر" value={nameOf(subscription.parent)} />
            <Detail
              label="حالة الاشتراك"
              value={statusLabel(subscription.status)}
            />
            <Detail label="عملة الاشتراك" value={currency} />
            {subscription.totalAmount != null && (
              <Detail
                label="إجمالي الاشتراك"
                value={formatMoney(subscription.totalAmount, currency)}
              />
            )}
            {subscription.totalAmount != null &&
              formatEgpEquivalent(subscription.totalAmount, subscription) && (
                <Detail
                  label="ما يعادله بالجنيه"
                  value={formatEgpEquivalent(
                    subscription.totalAmount,
                    subscription,
                  )}
                />
              )}
          </div>
        </div>

        <div className="space-y-3">
          {items.length ? (
            items.map((item, index) => {
              const pricing = pricingOf(item);
              const packageId = idOf(item.package) || item.packageId;
              const packageData = packagesById[packageId];
              const packageName =
                nameOf(packageData) !== "--"
                  ? nameOf(packageData)
                  : typeof item.package === "object"
                    ? nameOf(item.package)
                    : item.packageName || "--";

              return (
                <div
                  key={item.id || item._id || index}
                  className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 shadow-sm"
                >
                  <h3 className="font-['Tajawal'] font-semibold text-[16px] text-[#1F2937] mb-4">
                    {nameOf(item.subject)}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <Detail label="المعلم" value={nameOf(item.teacher)} />
                    <Detail label="الباقة" value={packageName} />
                    <Detail
                      label="نوع الاشتراك"
                      value={item.type === "private" ? "فردي" : "مجموعة"}
                    />
                    <Detail
                      label="السعر"
                      value={formatMoney(pricing.price, currency)}
                    />
                    <Detail
                      label="الخصم"
                      value={formatMoney(pricing.discount, currency)}
                    />
                    <Detail
                      label="السعر النهائي"
                      value={formatMoney(pricing.finalPrice, currency)}
                    />
                    {formatEgpEquivalent(pricing.finalPrice, subscription) && (
                      <Detail
                        label="السعر النهائي بالمصري"
                        value={formatEgpEquivalent(
                          pricing.finalPrice,
                          subscription,
                        )}
                      />
                    )}
                    <Detail
                      label="الجلسات المتبقية"
                      value={item.remainingSessions}
                    />
                    <Detail label="إجمالي الجلسات" value={item.totalSessions} />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white border border-gray-100 rounded-2xl py-12 text-center text-[14px] text-[#9CA3AF]">
              لا توجد مواد في هذا الاشتراك
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default SubscriptionDetailsPage;
