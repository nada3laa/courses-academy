import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { AlertCircle, ArrowRight, CheckCircle, Loader2 } from "lucide-react";
import AdminLayout from "../../../components/admin/layout/AdminLayout";
import Breadcrumbs from "../../shared/Breadcrumbs";
import {
  approveSubscriptionOrder,
  getAdminSubscriptionOrder,
  getAvailableClassrooms,
  getTeachers,
} from "../../../services/APIService";
import {
  formatEgpEquivalent,
  formatMoney,
} from "../../../utils/currencyDisplay";

const dataOf = (response) => response?.data?.data ?? response?.data;
const listOf = (response) => {
  const data = dataOf(response);
  return Array.isArray(data) ? data : [];
};
const idOf = (value) =>
  typeof value === "string" ? value : value?.id || value?._id || "";
const localName = (value) =>
  typeof value === "string"
    ? value
    : value?.name?.ar ||
      value?.name?.en ||
      value?.name ||
      value?.user?.fullName ||
      value?.fullName ||
      "—";

const SubscriptionOrderReviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [assignments, setAssignments] = useState({});
  const [teachersByItem, setTeachersByItem] = useState({});
  const [classroomsByItem, setClassroomsByItem] = useState({});
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getAdminSubscriptionOrder(id);
      const current = dataOf(response);
      setOrder(current);
      const initial = Object.fromEntries(
        (current.items || []).map((item) => [
          idOf(item),
          { teacher: "", classroom: "", type: item.type || "group" },
        ]),
      );
      setAssignments(initial);

      const teacherEntries = await Promise.all(
        (current.items || []).map(async (item) => {
          const subject = idOf(item.subject);
          const response = await getTeachers({
            subjects: subject,
            status: "approved",
            limit: 100,
          });
          return [
            idOf(item),
            listOf(response).filter((teacher) =>
              (teacher.subjects || []).some(
                (teacherSubject) => idOf(teacherSubject) === subject,
              ),
            ),
          ];
        }),
      );
      setTeachersByItem(Object.fromEntries(teacherEntries));
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "تعذر تحميل تفاصيل طلب الاشتراك",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const updateAssignment = (itemId, patch) =>
    setAssignments((current) => ({
      ...current,
      [itemId]: { ...current[itemId], ...patch },
    }));

  const loadClassrooms = async (item, patch) => {
    const itemId = idOf(item);
    const next = { ...assignments[itemId], ...patch, classroom: "" };
    updateAssignment(itemId, next);
    setClassroomsByItem((current) => ({ ...current, [itemId]: [] }));
    if (!next.teacher || !next.type) return;
    try {
      const response = await getAvailableClassrooms({
        teacher: next.teacher,
        subject: idOf(item.subject),
        type: next.type,
      });
      setClassroomsByItem((current) => ({
        ...current,
        [itemId]: listOf(response),
      }));
    } catch (requestError) {
      toast.error(
        requestError.response?.data?.message || "تعذر تحميل الفصول المتاحة",
      );
    }
  };

  const complete = useMemo(
    () =>
      (order?.items || []).every((item) => {
        const assignment = assignments[idOf(item)];
        return assignment?.teacher && assignment?.classroom && assignment?.type;
      }),
    [assignments, order],
  );

  const approve = async () => {
    if (!complete) return toast.error("أكمل تعيينات جميع المواد أولاً");
    setApproving(true);
    try {
      const items = order.items.map((item) => ({
        orderItemId: idOf(item),
        ...assignments[idOf(item)],
      }));
      await approveSubscriptionOrder(id, items);
      toast.success("تمت الموافقة وتفعيل الاشتراك بنجاح");
      navigate("/admin/subscriptions/requests", { replace: true });
    } catch (requestError) {
      toast.error(
        requestError.response?.data?.message || "تعذر الموافقة على الطلب",
      );
    } finally {
      setApproving(false);
    }
  };

  if (loading)
    return (
      <AdminLayout>
        <Breadcrumbs homeTo="/admin-dashboard" />
        <div
          dir="rtl"
          className="py-24 flex justify-center gap-2 text-gray-500"
        >
          <Loader2 className="animate-spin" />
          جاري تحميل الطلب...
        </div>
      </AdminLayout>
    );
  if (error || !order)
    return (
      <AdminLayout>
        <Breadcrumbs homeTo="/admin-dashboard" />
        <div dir="rtl" className="py-24 text-center">
          <AlertCircle className="mx-auto text-red-500 mb-2" />
          <p className="text-red-600">{error || "الطلب غير موجود"}</p>
          <button onClick={load} className="mt-3 text-[#123C91]">
            إعادة المحاولة
          </button>
        </div>
      </AdminLayout>
    );

  return (
    <AdminLayout>
      <Breadcrumbs homeTo="/admin-dashboard" />
      <section dir="rtl" className="p-2 sm:p-4 max-w-5xl mx-auto">
        <button
          onClick={() => navigate("/admin/subscriptions/requests")}
          className="flex items-center gap-2 text-sm text-gray-600 mb-4"
        >
          <ArrowRight size={16} />
          العودة للطلبات
        </button>
        <div className="bg-white border rounded-2xl p-5 mb-5">
          <div className="flex flex-wrap justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-[#123C91]">
                مراجعة طلب الاشتراك
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                الطالب: {localName(order.student)}
              </p>
            </div>
            <div className="text-left">
              <p className="text-sm text-gray-500">الإجمالي المؤكد</p>
              <strong className="block text-xl text-[#123C91]">
                {formatMoney(order.totalAmount, order.currency)}
              </strong>
              {formatEgpEquivalent(order.totalAmount, order) && (
                <small className="text-gray-500">
                  يعادل {formatEgpEquivalent(order.totalAmount, order)}
                </small>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {(order.items || []).map((item) => {
            const itemId = idOf(item);
            const assignment = assignments[itemId] || {};
            return (
              <article key={itemId} className="bg-white border rounded-2xl p-5">
                <div className="flex flex-wrap justify-between gap-3 mb-5">
                  <div>
                    <h2 className="font-semibold">
                      {localName(item.subject) || item.subjectName}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {localName(item.package) || item.packageName} ·{" "}
                      {item.sessions} حصة
                    </p>
                  </div>
                  <strong className="text-[#123C91]">
                    {formatMoney(item.finalPrice, order.currency)}
                  </strong>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="text-sm">
                    نوع الاشتراك
                    <select
                      value={assignment.type || "group"}
                      onChange={(event) =>
                        loadClassrooms(item, { type: event.target.value })
                      }
                      className="block w-full h-11 border rounded-lg px-3 mt-2"
                    >
                      <option value="group">مجموعة</option>
                      <option value="private">فردي</option>
                    </select>
                  </label>
                  <label className="text-sm">
                    المعلم
                    <select
                      value={assignment.teacher || ""}
                      onChange={(event) =>
                        loadClassrooms(item, { teacher: event.target.value })
                      }
                      className="block w-full h-11 border rounded-lg px-3 mt-2"
                    >
                      <option value="">اختر المعلم</option>
                      {(teachersByItem[itemId] || []).map((teacher) => (
                        <option key={idOf(teacher)} value={idOf(teacher)}>
                          {localName(teacher)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm">
                    الفصل
                    <select
                      disabled={!assignment.teacher}
                      value={assignment.classroom || ""}
                      onChange={(event) =>
                        updateAssignment(itemId, {
                          classroom: event.target.value,
                        })
                      }
                      className="block w-full h-11 border rounded-lg px-3 mt-2 disabled:bg-gray-100"
                    >
                      <option value="">اختر الفصل</option>
                      {(classroomsByItem[itemId] || []).map((classroom) => (
                        <option key={idOf(classroom)} value={idOf(classroom)}>
                          {localName(classroom)}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </article>
            );
          })}
        </div>
        <button
          disabled={!complete || approving}
          onClick={approve}
          className="w-full sm:w-auto mt-6 px-7 h-12 rounded-xl bg-[#123C91] text-white disabled:opacity-50 inline-flex items-center justify-center gap-2"
        >
          {approving ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <CheckCircle size={18} />
          )}
          {approving ? "جاري التفعيل..." : "الموافقة وتفعيل الاشتراك"}
        </button>
      </section>
    </AdminLayout>
  );
};

export default SubscriptionOrderReviewPage;
