import { useEffect, useMemo, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import ParentLayout from "../../components/parent/layout/ParentLayout";
import StudentLayout from "../../components/student/layout/StudentLayout";
import CurrencySelector from "../../components/subscription/CurrencySelector";
import {
  createAddSubjectSubscriptionOrder,
  getAllPackages,
  getAllSubjects,
  getExchangeRates,
  getMyStudentsSubscriptions,
  getMySubscriptions,
  getStudent,
  getStudentSubscriptionOptions,
  startSubscriptionOrderCheckout,
} from "../../services/APIService";
import { formatEgpEquivalent, formatMoney } from "../../utils/currencyDisplay";

const responseData = (response) => response?.data?.data ?? response?.data;
const asSubscriptions = (response) => {
  const data = responseData(response);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.subscriptions)) return data.subscriptions;
  return data ? [data] : [];
};
const entityId = (value) =>
  typeof value === "string" ? value : value?.id || value?._id;
const nameOf = (value) => {
  if (!value) return "—";
  if (typeof value === "string") return value;
  return value.ar || value.en || value.name?.ar || value.name?.en || "—";
};
const money = (value) => `${Number(value || 0).toLocaleString("ar-EG")} ج.م`;

const ERROR_MESSAGES = {
  SOURCE_SUBSCRIPTION_REQUIRED: "بيانات الاشتراك الحالي غير مكتملة.",
  SUBSCRIPTION_NOT_FOUND: "الاشتراك الحالي غير موجود.",
  ACTION_DENIED: "لا تملك صلاحية تعديل هذا الاشتراك.",
  SUBJECT_ALREADY_SUBSCRIBED: "الطالب مشترك بالفعل في هذه المادة.",
  DUPLICATE_SUBJECT_IN_ORDER: "لا يمكن تكرار المادة داخل الطلب.",
  SUBJECT_NOT_FOUND: "المادة المختارة لم تعد متاحة.",
  PACKAGE_NOT_FOUND: "الباقة المختارة لم تعد متاحة.",
};
const requestErrorMessage = (error, fallback) => {
  const body = error.response?.data;
  return (
    ERROR_MESSAGES[body?.code] ||
    ERROR_MESSAGES[body?.message] ||
    body?.message ||
    fallback
  );
};

const AddSubjectPage = ({ role }) => {
  const Layout = role === "parent" ? ParentLayout : StudentLayout;
  const { id: sourceSubscriptionId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [selectedPackages, setSelectedPackages] = useState({});
  const [order, setOrder] = useState(null);
  const [currencies, setCurrencies] = useState([]);
  const [currency, setCurrency] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const subscriptionsResponse =
          role === "parent"
            ? await getMyStudentsSubscriptions()
            : await getMySubscriptions();
        const subscriptions = asSubscriptions(subscriptionsResponse);
        const source = subscriptions.find(
          (subscription) =>
            String(subscription.id || subscription._id) ===
            String(sourceSubscriptionId),
        );
        if (!source) throw new Error("SOURCE_SUBSCRIPTION_NOT_FOUND");

        const studentId = entityId(source.student);
        if (!studentId) throw new Error("STUDENT_NOT_FOUND");

        const profileResponse = await getStudent(studentId);
        const profileData = responseData(profileResponse);
        const profile = profileData?.student || profileData;
        const curriculumId = entityId(profile?.curriculum);
        const stageId = entityId(profile?.stage);
        const gradeId = entityId(profile?.grade);
        if (!gradeId) throw new Error("STUDENT_GRADE_MISSING");
        const subjectParams = {
          ...(curriculumId ? { curriculum: curriculumId } : {}),
          ...(stageId ? { stage: stageId } : {}),
          ...(gradeId ? { grade: gradeId } : {}),
        };

        const [
          optionsResponse,
          ratesResponse,
          subjectsResponse,
          packagesResponse,
        ] = await Promise.all([
          getStudentSubscriptionOptions(studentId),
          getExchangeRates(),
          getAllSubjects(subjectParams),
          getAllPackages({ isActive: true, limit: 100 }),
        ]);
        const options = responseData(optionsResponse);
        const rates = responseData(ratesResponse);
        const gradeSubjects = responseData(subjectsResponse);
        const packagesData = responseData(packagesResponse);
        const availablePackages = Array.isArray(packagesData)
          ? packagesData
          : packagesData?.packages || [];
        const optionSubjects = options?.subjects || [];
        const optionsBySubject = new Map(
          optionSubjects.map((subject) => [String(entityId(subject)), subject]),
        );
        const activeSubjectIds = new Set(
          subscriptions
            .filter(
              (subscription) =>
                String(entityId(subscription.student)) === String(studentId) &&
                !["expired", "ended", "completed", "cancelled"].includes(
                  String(subscription.status || "").toLowerCase(),
                ),
            )
            .flatMap(
              (subscription) =>
                subscription.items || subscription.subjectSubscriptions || [],
            )
            .filter(
              (item) =>
                !["expired", "ended", "completed", "cancelled"].includes(
                  String(item.status || "").toLowerCase(),
                ),
            )
            .map((item) => entityId(item.subject))
            .filter(Boolean)
            .map(String),
        );

        if (!active) return;
        setStudent(profile || options?.student || source.student);
        const availableRates = Array.isArray(rates) ? rates : [];
        setCurrencies(availableRates);
        setCurrency(
          availableRates.find((rate) => rate.isBaseCurrency)?.currency ||
            availableRates[0]?.currency ||
            "",
        );
        const subjectsForGrade = Array.isArray(gradeSubjects)
          ? gradeSubjects
          : gradeSubjects?.subjects || [];
        const mergedSubjects = subjectsForGrade.map((subject) => {
          const option = optionsBySubject.get(String(entityId(subject)));
          return {
            ...subject,
            packages:
              option?.packages?.length > 0
                ? option.packages
                : availablePackages,
          };
        });
        setSubjects(
          mergedSubjects.filter(
            (subject) => !activeSubjectIds.has(String(entityId(subject))),
          ),
        );
      } catch (requestError) {
        if (!active) return;
        const localMessage =
          requestError.message === "SOURCE_SUBSCRIPTION_NOT_FOUND"
            ? "الاشتراك النشط المطلوب غير موجود."
            : requestError.message === "STUDENT_NOT_FOUND"
              ? "تعذر تحديد الطالب صاحب الاشتراك."
              : requestError.message === "STUDENT_GRADE_MISSING"
                ? "الصف الدراسي غير محدد في ملف الطالب. حدّث بياناته أولاً."
                : null;
        setError(
          localMessage ||
            requestErrorMessage(
              requestError,
              "تعذر تحميل المواد المتاحة للإضافة",
            ),
        );
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [role, sourceSubscriptionId]);

  const selectedItems = useMemo(
    () =>
      subjects.flatMap((subject) => {
        const subjectId = entityId(subject);
        const packageId = selectedPackages[subjectId];
        return packageId ? [{ subject: subjectId, package: packageId }] : [];
      }),
    [selectedPackages, subjects],
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
      const response = await createAddSubjectSubscriptionOrder(
        sourceSubscriptionId,
        selectedItems,
        currency,
      );
      const createdOrder = responseData(response);
      setOrder(createdOrder);
      localStorage.setItem("lastSubscriptionOrderId", createdOrder.id);
      toast.success("تم إنشاء الطلب. راجع السعر قبل الدفع.");
    } catch (requestError) {
      toast.error(
        requestErrorMessage(requestError, "تعذر إنشاء طلب إضافة المادة"),
      );
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
      if (!purchaseUrl) throw new Error("PURCHASE_URL_MISSING");
      window.location.assign(purchaseUrl);
    } catch (requestError) {
      if (requestError.response?.status === 409) {
        navigate(`/subscription-orders/${order.id}/status`);
        return;
      }
      toast.error(requestErrorMessage(requestError, "تعذر بدء عملية الدفع"));
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
          <h1 className="text-2xl font-bold text-[#123C91]">
            إضافة مادة للاشتراك
          </h1>
          <p className="mt-2 text-sm text-[#667085]">
            اختر مادة جديدة وباقتها، وسيتم تحديد المدرس والفصل بواسطة الإدارة
            بعد تأكيد الدفع.
          </p>
        </header>

        {loading && (
          <div className="flex items-center justify-center gap-2 rounded-2xl border bg-white py-16 text-[#667085]">
            <Loader2 className="animate-spin" size={22} />
            جاري تحميل المواد المتاحة...
          </div>
        )}
        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="mb-5 rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
              <span className="text-xs text-[#667085]">الطالب</span>
              <h2 className="mt-1 text-lg font-bold text-[#1F2937]">
                {student?.name || student?.user?.fullName || "—"}
              </h2>
            </div>

            {subjects.length === 0 ? (
              <div className="rounded-2xl border bg-white p-8 text-center text-[#667085]">
                لا توجد مواد جديدة متاحة للإضافة حاليًا.
              </div>
            ) : (
              <div className="space-y-4">
                {subjects.map((subject) => {
                  const subjectId = entityId(subject);
                  const packages = subject.packages || [];
                  return (
                    <article
                      key={subjectId}
                      className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm"
                    >
                      <h3 className="mb-4 text-lg font-bold text-[#1F2937]">
                        {nameOf(subject.name)}
                      </h3>
                      {packages.length ? (
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {packages.map((packageOption) => {
                            const packageId = entityId(packageOption);
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
                                <strong className="block pe-6 text-sm">
                                  {nameOf(packageOption.name)}
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
                          لا توجد باقات نشطة لهذه المادة.
                        </p>
                      )}
                    </article>
                  );
                })}
              </div>
            )}

            {order ? (
              <div className="mt-6 rounded-2xl border border-[#DCE8F7] bg-white p-5 shadow-sm">
                <h3 className="text-lg font-bold">ملخص الطلب</h3>
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
                <div className="mt-4 flex justify-between rounded-xl bg-[#F8FAFC] p-4 text-lg font-bold">
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
              subjects.length > 0 && (
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
                    className="mt-6 h-12 w-full rounded-xl bg-[#123C91] font-semibold text-white disabled:opacity-50"
                  >
                    {creating
                      ? "جاري إنشاء الطلب..."
                      : "إنشاء الطلب وعرض السعر"}
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

export default AddSubjectPage;
