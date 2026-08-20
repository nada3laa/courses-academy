import { useState, useEffect } from "react";
import ParentLayout from "../../components/parent/layout/ParentLayout";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";
import ChildrenStatsCards from "../../components/parent/children/ChildrenStatsCard";
import ChildrenSearch from "../../components/parent/children/ChildrenSearch";
import ChildrenTable from "../../components/parent/children/ChildrenTable";

import {
  getMyStudents,
  getMyStudentsSubscriptions,
  getMySubscriptionOrders,
  getStudentsStatistics,
  startSubscriptionOrderCheckout,
} from "../../services/APIService";
import Paginationn from "../../components/teacher/groups/students/Paginationn";
import LoadingState from "../../components/shared/LoadingState";

const PER_PAGE = 10;

const ChildrenPage = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ordersByStudent, setOrdersByStudent] = useState({});
  const [subscribedStudentIds, setSubscribedStudentIds] = useState(new Set());
  const [payingOrderId, setPayingOrderId] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const load = async () => {
      try {
        const [studentsRes, statsRes, ordersRes, subscriptionsRes] =
          await Promise.all([
            getMyStudents(),
            getStudentsStatistics(),
            getMySubscriptionOrders().catch(() => ({ data: { data: [] } })),
            getMyStudentsSubscriptions().catch(() => ({
              data: { data: [] },
            })),
          ]);
        setStudents(studentsRes.data?.data || []);
        setStats(statsRes.data?.data || null);

        const orders = ordersRes.data?.data || [];
        setOrdersByStudent(
          orders.reduce((map, order) => {
            const studentId = order.student?.id || order.student?._id;
            if (studentId && !map[String(studentId)]) {
              map[String(studentId)] = order;
            }
            return map;
          }, {}),
        );

        const subscriptions = subscriptionsRes.data?.data || [];
        setSubscribedStudentIds(
          new Set(
            subscriptions
              .filter(
                (subscription) =>
                  subscription.status === "active" ||
                  (subscription.items || []).some(
                    (item) => item.status === "active",
                  ),
              )
              .map(
                (subscription) =>
                  subscription.student?.id ||
                  subscription.student?._id ||
                  subscription.student,
              )
              .filter(Boolean)
              .map(String),
          ),
        );
      } catch (err) {
        console.error("فشل تحميل بيانات الأبناء:", err.response?.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const hasChildren = students.length > 0;

  const filteredStudents = students.filter((s) =>
    (s.user?.fullName || "").toLowerCase().includes(search.toLowerCase()),
  );

  // — Pagination —
  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginated = filteredStudents.slice(
    (safePage - 1) * PER_PAGE,
    safePage * PER_PAGE,
  );

  // reset to page 1 whenever search changes
  const handleSearch = (val) => {
    setSearch(val);
    setPage(1);
  };

  const handleContinuePayment = async (child) => {
    const studentId = String(child.id || child._id);
    const order = ordersByStudent[studentId];

    if (!order || !["created", "pending"].includes(order.paymentStatus)) {
      navigate(`/parent/students/${studentId}/subscription/packages`, {
        state: {
          parentFlow: true,
          skipProfileCreation: true,
          studentId,
        },
      });
      return;
    }

    setPayingOrderId(order.id);
    try {
      const response = await startSubscriptionOrderCheckout(order.id);
      const purchaseUrl =
        response.data?.data?.paymentUrl ||
        response.data?.data?.purchaseUrl ||
        response.data?.paymentUrl ||
        response.data?.purchaseUrl;
      if (!purchaseUrl) throw new Error("PURCHASE_URL_MISSING");
      window.location.assign(purchaseUrl);
    } catch (error) {
      if (error.response?.status === 409) {
        navigate(`/subscription-orders/${order.id}/status`);
      } else {
        toast.error(
          error.response?.data?.message || "تعذر استكمال عملية الدفع",
        );
      }
      setPayingOrderId("");
    }
  };

  return (
    <ParentLayout>
      <div
        className="w-full p-2 font-['IBM_Plex_Sans_Arabic'] text-right"
        dir="rtl"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-[24px] font-semibold leading-8 text-[#123C91] mb-3">
              إدارة الأبناء
            </h1>
            <p className="text-[16px] font-normal leading-6 text-[#575F69]">
              إدارة ومتابعة بيانات وأداء أبنائك
            </p>
          </div>
          <button
            onClick={() => navigate("/parent-dashboard/add-child")}
            className="flex items-center justify-center bg-[#123C91] text-white [&_svg]:text-white text-sm rounded-lg w-40 h-3 py-3 px-6 gap-2"
            style={{ height: "48px" }}
          >
            <Plus size={20} />
            <span>إضافة ابن</span>
          </button>
        </div>

        <div className="w-full mb-8">
          <ChildrenStatsCards stats={stats} hasChildren={hasChildren} />
        </div>

        <div className="bg-white border mb-8 border-[#E5E5E5] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.12)] rounded-2xl p-5 w-full items-center">
          <ChildrenSearch value={search} onChange={handleSearch} />
        </div>

        <div>
          {loading ? (
            <LoadingState
              label="جاري تحميل الأبناء..."
              className="rounded-2xl border border-gray-200 bg-white"
            />
          ) : (
            <>
              <Paginationn
                page={safePage}
                totalPages={totalPages}
                onChange={setPage}
                totalItems={filteredStudents.length}
                displayedCount={paginated.length}
                unitLabel="ابن"
              />

              <ChildrenTable
                children={paginated}
                ordersByStudent={ordersByStudent}
                subscribedStudentIds={subscribedStudentIds}
                payingOrderId={payingOrderId}
                onContinuePayment={handleContinuePayment}
                onStudentRemoved={(removedId) =>
                  setStudents((prev) => prev.filter((s) => s.id !== removedId))
                }
              />
            </>
          )}
        </div>
      </div>
    </ParentLayout>
  );
};

export default ChildrenPage;
