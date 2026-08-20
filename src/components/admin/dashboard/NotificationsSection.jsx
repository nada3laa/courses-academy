import { useEffect, useState } from "react";

import NotificationsList from "../notifications/NotificationsSection";
import { getNotifications, getUsers } from "../../../services/APIService";
import { mergeAdminNotifications } from "../../../utils/adminLocalNotifications";
import { filterIncompleteJoinNotifications } from "../../../utils/incompleteRegistration";

const extractList = (response) => {
  const body = response?.data?.data ?? response?.data ?? response ?? [];
  return Array.isArray(body) ? body : body.items || body.results || [];
};

const NotificationsSection = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        setLoadError("");
        const [response, usersResponse] = await Promise.all([
          getNotifications(),
          getUsers({ limit: 100 }).catch(() => null),
        ]);
        const usersBody = usersResponse?.data || {};
        const users = usersBody.data || usersBody.users || [];
        setNotifications(
          mergeAdminNotifications(
            filterIncompleteJoinNotifications(extractList(response), users),
          ),
        );
      } catch (err) {
        setLoadError(err.response?.data?.message || "تعذر تحميل الإشعارات");
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  return (
    <NotificationsList
      compact
      maxItems={4}
      notifications={notifications}
      loading={loading}
      loadError={loadError}
      onChange={setNotifications}
    />
  );
};

export default NotificationsSection;
