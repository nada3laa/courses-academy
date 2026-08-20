import { useCallback, useEffect, useState } from "react";
import { AlertCircle, Inbox, Loader2, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";

import AdminLayout from "../../../components/admin/layout/AdminLayout";
import PaymentsTable from "../../../components/admin/payments/PaymentsTable";
import Breadcrumbs from "../../shared/Breadcrumbs";
import { getAdminPayments } from "../../../services/APIService";

const PAGE_LIMIT = 20;

const AdminPaymentsPage = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPayments = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getAdminPayments({
        page,
        limit: PAGE_LIMIT,
      });
      setPayments(response.data?.data || []);
      setPagination(response.data?.pagination || null);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "تعذر تحميل عمليات الدفع",
      );
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    const timer = window.setTimeout(loadPayments, 0);
    return () => window.clearTimeout(timer);
  }, [loadPayments]);

  const meta = pagination?.meta || {};
  const currentPage = meta.current_page || page;
  const lastPage = Math.max(meta.last_page || 1, 1);
  const total = meta.total ?? payments.length;

  return (
    <AdminLayout>
      <Breadcrumbs homeTo="/admin-dashboard" />
      <main className="px-4 py-3 sm:px-6 sm:py-5" dir="rtl">
        <header className="mb-6 flex items-start justify-between gap-3 px-1 sm:px-2">
          <div>
            <h1 className="text-xl font-semibold text-[#123C91] sm:text-2xl">
              المدفوعات
            </h1>
            <p className="mt-1 text-sm text-[#575F69]">
              جميع عمليات الاشتراك التي تم تأكيد دفعها.
            </p>
          </div>
          <button
            type="button"
            onClick={loadPayments}
            disabled={loading}
            aria-label="تحديث"
            className="rounded-xl border border-gray-200 bg-white p-2.5 text-[#123C91] disabled:opacity-50"
          >
            <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
          </button>
        </header>

        {!loading && !error && (
          <div className="mb-4 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#575F69]">
            إجمالي عمليات الدفع:{" "}
            <strong className="text-[#123C91]">{total}</strong>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center gap-2 py-20 text-[#8C9198]">
            <Loader2 className="animate-spin" size={20} />
            جاري تحميل المدفوعات...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-100 bg-white py-16 text-center">
            <AlertCircle className="mx-auto mb-2 text-red-500" />
            <p className="text-red-600">{error}</p>
            <button
              type="button"
              onClick={loadPayments}
              className="mt-3 text-sm font-medium text-[#123C91]"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : !payments.length ? (
          <div className="rounded-2xl border border-gray-200 bg-white py-16 text-center text-[#8C9198]">
            <Inbox className="mx-auto mb-2" />
            لا توجد عمليات دفع
          </div>
        ) : (
          <>
            <PaymentsTable
              payments={payments}
              onView={(id) => navigate(`/admin/payments/${id}`)}
            />
            {lastPage > 1 && (
              <div className="mt-5 flex items-center justify-center gap-3">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setPage((value) => Math.max(value - 1, 1))}
                  className="rounded-lg border bg-white px-4 py-2 text-sm disabled:opacity-40"
                >
                  السابق
                </button>
                <span className="text-sm text-[#575F69]">
                  صفحة {currentPage} من {lastPage}
                </span>
                <button
                  type="button"
                  disabled={currentPage >= lastPage}
                  onClick={() =>
                    setPage((value) => Math.min(value + 1, lastPage))
                  }
                  className="rounded-lg border bg-white px-4 py-2 text-sm disabled:opacity-40"
                >
                  التالي
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </AdminLayout>
  );
};

export default AdminPaymentsPage;
