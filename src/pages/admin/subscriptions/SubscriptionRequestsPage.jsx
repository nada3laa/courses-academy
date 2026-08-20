import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Eye, Inbox, Loader2, RefreshCw } from "lucide-react";
import AdminLayout from "../../../components/admin/layout/AdminLayout";
import Breadcrumbs from "../../shared/Breadcrumbs";
import EntityProfileModal from "../../../components/admin/users/EntityProfileModal";
import { getPendingSubscriptionOrders } from "../../../services/APIService";
import {
  formatEgpEquivalent,
  formatMoney,
} from "../../../utils/currencyDisplay";

const date = (value) =>
  value
    ? new Date(value).toLocaleDateString("ar-EG", { dateStyle: "medium" })
    : "—";
const name = (value) => value?.user?.fullName || value?.fullName || "—";

const SubscriptionRequestsPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profileStudent, setProfileStudent] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getPendingSubscriptionOrders({ page, limit: 10 });
      setOrders(response.data?.data || []);
      setPagination(response.data?.pagination || null);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "تعذر تحميل طلبات الاشتراك المدفوعة",
      );
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const totalPages = pagination?.totalPages || pagination?.pages || 1;

  return (
    <AdminLayout>
      <Breadcrumbs homeTo="/admin-dashboard" />
      <section dir="rtl" className="p-2 sm:p-4">
        <div className="flex items-start justify-between gap-3 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-[#123C91]">
              طلبات الاشتراك المدفوعة
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              راجع الطلبات التي أكد Whop دفعها وعيّن المدرس والفصل لكل مادة
            </p>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="p-2.5 rounded-xl border border-gray-200 bg-white text-[#123C91] disabled:opacity-50"
            aria-label="تحديث"
          >
            <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center gap-2 text-gray-400">
            <Loader2 className="animate-spin" size={19} />
            جاري التحميل...
          </div>
        ) : error ? (
          <div className="py-16 bg-white border rounded-2xl text-center">
            <AlertCircle className="mx-auto text-red-500 mb-2" />
            <p className="text-red-600">{error}</p>
            <button onClick={load} className="mt-3 text-[#123C91]">
              إعادة المحاولة
            </button>
          </div>
        ) : !orders.length ? (
          <div className="py-16 bg-white border rounded-2xl text-center text-gray-400">
            <Inbox className="mx-auto mb-2" />
            <p>لا توجد طلبات مدفوعة بانتظار المراجعة</p>
          </div>
        ) : (
          <>
            <div className="bg-white border border-gray-200 rounded-2xl overflow-x-auto">
              <table className="w-full min-w-[760px] text-right">
                <thead className="bg-gray-50 text-xs text-gray-500">
                  <tr>
                    <th className="p-4">الطالب</th>
                    <th className="p-4">المواد</th>
                    <th className="p-4">الإجمالي</th>
                    <th className="p-4">تاريخ الدفع</th>
                    <th className="p-4">الحالة</th>
                    <th className="p-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {orders.map((order) => (
                    <tr
                      key={order.id || order._id}
                      className="hover:bg-gray-50"
                    >
                      <td className="p-4 font-medium">
                        <button
                          type="button"
                          onClick={() => setProfileStudent(order.student)}
                          className="text-[#123C91] hover:underline"
                        >
                          {name(order.student)}
                        </button>
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {(order.items || [])
                          .map(
                            (item) =>
                              item.subject?.name?.ar ||
                              item.subject?.name?.en ||
                              item.subjectName ||
                              "مادة",
                          )
                          .join("، ")}
                      </td>
                      <td className="p-4 font-semibold text-[#123C91]">
                        <span className="block">
                          {formatMoney(order.totalAmount, order.currency)}
                        </span>
                        {formatEgpEquivalent(order.totalAmount, order) && (
                          <small className="block font-normal text-gray-500">
                            يعادل{" "}
                            {formatEgpEquivalent(order.totalAmount, order)}
                          </small>
                        )}
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {date(order.paidAt)}
                      </td>
                      <td className="p-4">
                        <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs">
                          بانتظار الإدارة
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() =>
                            navigate(
                              `/admin/subscription-orders/${order.id || order._id}`,
                            )
                          }
                          className="inline-flex items-center gap-2 text-[#123C91] text-sm"
                        >
                          <Eye size={16} />
                          مراجعة
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-5">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((current) => current - 1)}
                  className="px-4 py-2 border rounded-lg disabled:opacity-40"
                >
                  السابق
                </button>
                <span className="text-sm">
                  صفحة {page} من {totalPages}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((current) => current + 1)}
                  className="px-4 py-2 border rounded-lg disabled:opacity-40"
                >
                  التالي
                </button>
              </div>
            )}
          </>
        )}
      </section>
      <EntityProfileModal
        entity={profileStudent}
        role="student"
        onClose={() => setProfileStudent(null)}
      />
    </AdminLayout>
  );
};

export default SubscriptionRequestsPage;
