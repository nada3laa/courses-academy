import { useCallback, useEffect, useState } from "react";
import StatsCardds from "../../../components/admin/notifications/StatsCards";
import NotificationsSection from "../../../components/admin/notifications/NotificationsSection";
import AdminLayout from "../../../components/admin/layout/AdminLayout";
import {
  getAllStudents,
  getAdminSubscriptionOrder,
  getNotifications,
  getUsers,
} from "../../../services/APIService";
import Breadcrumbs from "../../shared/Breadcrumbs";
import { mergeAdminNotifications } from "../../../utils/adminLocalNotifications";
import { filterIncompleteJoinNotifications } from "../../../utils/incompleteRegistration";

const extractList = (resData) => {
  if (!resData) return [];
  const root = resData?.data || resData;
  const raw = root?.data || root || [];
  return Array.isArray(raw) ? raw : [];
};

const idOf = (value) =>
  typeof value === "string" ? value : value?.id || value?._id || "";

const enrichSubscriptionNotifications = (notifications, students) => {
  const studentsById = new Map();
  students.forEach((student) => {
    const name =
      student.user?.fullName || student.fullName || student.name || "";
    [idOf(student), idOf(student.user), student.studentId, student.userId]
      .filter(Boolean)
      .forEach((id) => studentsById.set(String(id), name));
  });

  return notifications.map((notification) => {
    const searchable = [
      notification.key,
      notification.type,
      notification.title,
      notification.description,
      notification.message,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    if (!searchable.includes("subscription") && !searchable.includes("اشتراك"))
      return notification;

    const sources = [notification, notification.data, notification.metadata];
    const candidateIds = sources.flatMap((source) =>
      source
        ? [
            idOf(source.student),
            idOf(source.studentId),
            idOf(source.user),
            idOf(source.userId),
          ]
        : [],
    );
    const matchedId = candidateIds.find((id) => studentsById.has(String(id)));
    const studentName = matchedId && studentsById.get(String(matchedId));
    if (!studentName) return notification;

    return {
      ...notification,
      description: `قام الطالب ${studentName} بإنشاء طلب اشتراك جديد`,
      data: { ...notification.data, studentName },
    };
  });
};

const notificationText = (notification) =>
  String(
    notification.description ||
      notification.message ||
      notification.body ||
      notification.data?.message ||
      "",
  );

const paymentOrderId = (notification) => {
  const sources = [notification, notification.data, notification.metadata];
  for (const source of sources) {
    if (!source) continue;
    const orderId =
      idOf(source.orderId) ||
      idOf(source.subscriptionOrderId) ||
      idOf(source.order) ||
      idOf(source.subscriptionOrder);
    if (orderId) return String(orderId);
  }
  return notificationText(notification).match(/\b[a-f\d]{24}\b/i)?.[0] || "";
};

const enrichPaymentNotifications = async (notifications) => {
  const paymentNotifications = notifications.filter((notification) => {
    const searchable = [
      notification.key,
      notification.type,
      notification.title,
      notificationText(notification),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return (
      searchable.includes("payment") ||
      searchable.includes("دفعة") ||
      searchable.includes("تم دفع")
    );
  });
  const orderIds = [
    ...new Set(paymentNotifications.map(paymentOrderId).filter(Boolean)),
  ];
  const orderEntries = await Promise.all(
    orderIds.map(async (orderId) => {
      try {
        const response = await getAdminSubscriptionOrder(orderId);
        return [orderId, response.data?.data ?? response.data];
      } catch {
        return [orderId, null];
      }
    }),
  );
  const ordersById = new Map(orderEntries);

  return notifications.map((notification) => {
    const orderId = paymentOrderId(notification);
    const order = ordersById.get(orderId);
    if (!order) return notification;
    const personName =
      order.student?.user?.fullName ||
      order.student?.fullName ||
      order.studentName ||
      order.user?.fullName;
    if (!personName) return notification;

    const amount = notificationText(notification).match(
      /تم دفع\s+(.+?)\s+للطلب/i,
    )?.[1];
    return {
      ...notification,
      title: "تم استلام دفعة جديدة",
      description: amount
        ? `تم دفع ${amount} بواسطة ${personName}`
        : `تم استلام دفعة جديدة من ${personName}`,
      data: { ...notification.data, studentName: personName },
    };
  });
};

const AdminNotificationss = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const [res, usersResponse, studentsResponse] = await Promise.all([
        getNotifications(),
        getUsers({ limit: 100 }).catch(() => null),
        getAllStudents({ limit: 500 }).catch(() => null),
      ]);
      const usersBody = usersResponse?.data || {};
      const users = usersBody.data || usersBody.users || [];
      const students = extractList(studentsResponse?.data);
      const baseNotifications = enrichSubscriptionNotifications(
        filterIncompleteJoinNotifications(extractList(res.data), users),
        students,
      );
      const enrichedNotifications =
        await enrichPaymentNotifications(baseNotifications);
      setNotifications(mergeAdminNotifications(enrichedNotifications));
    } catch (err) {
      setLoadError(err.response?.data?.message || "تعذر تحميل الإشعارات");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Data loading is intentionally triggered when the page mounts.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <AdminLayout>
      <div
        className="max-w-7xl mx-auto p-2 space-y-6 font-['IBM_Plex_Sans_Arabic'] text-right"
        dir="rtl"
      >
        <Breadcrumbs homeTo="/admin-dashboard" />
        <h1 className="text-[24px] font-semibold leading-8 text-[#123C91] mb-2">
          الإشعارات
        </h1>

        <p className="text-[16px] font-normal leading-6 text-[#575F69]">
          متابعة جميع التحديثات والتنبيهات المهمة
        </p>

        <StatsCardds notifications={notifications} />
        <NotificationsSection
          notifications={notifications}
          loading={loading}
          loadError={loadError}
          onChange={setNotifications}
        />
      </div>
    </AdminLayout>
  );
};
export default AdminNotificationss;
