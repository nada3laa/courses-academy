import { useCallback, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { getNotifications, getUsers } from "../services/APIService";
import { getChatRooms } from "./chatApi";
import { getSocket } from "./socket";
import { incrementStoredUnread } from "./chatUnreadStorage";
import {
  ADMIN_NOTIFICATION_EVENT,
  getAdminLocalNotifications,
} from "../utils/adminLocalNotifications";
import { filterIncompleteJoinNotifications } from "../utils/incompleteRegistration";

const extractList = (payload, keys) => {
  let value = payload;
  for (let i = 0; i < 4 && value && !Array.isArray(value); i += 1) {
    const key = keys.find((candidate) => Array.isArray(value[candidate]));
    if (key) return value[key];
    value = value.data;
  }
  return Array.isArray(value) ? value : [];
};

const unreadRoom = (room, userId) => {
  const value =
    room.unreadCount ??
    room.unreadMessagesCount ??
    room.unreadMessageCount ??
    room.unreadMessages ??
    room.hasUnreadMessages ??
    room.hasUnread ??
    room.isUnread ??
    room.unread?.count ??
    room.unread;

  if (Array.isArray(value)) return value.length > 0;
  if (value && typeof value === "object") {
    const ownValue = value[userId] ?? value[String(userId)];
    return Array.isArray(ownValue) ? ownValue.length > 0 : ownValue === true || Number(ownValue) > 0;
  }
  return value === true || Number(value) > 0;
};

export function useSidebarUnread() {
  const { user } = useContext(AuthContext);
  const userId = user?._id ?? user?.id;
  const isAdmin = user?.role === "admin";
  const { pathname } = useLocation();
  const [unread, setUnread] = useState({ messages: false, notifications: false });

  const refresh = useCallback(async () => {
    const [roomsResult, notificationsResult, usersResult] = await Promise.allSettled([
      getChatRooms(),
      getNotifications(),
      isAdmin ? getUsers({ limit: 100 }) : Promise.resolve(null),
    ]);

    const usersPayload = usersResult.status === "fulfilled" ? usersResult.value?.data : null;
    const users = usersPayload?.data || usersPayload?.users || [];
    const remoteNotifications =
      notificationsResult.status === "fulfilled"
        ? filterIncompleteJoinNotifications(
            extractList(notificationsResult.value.data, ["notifications"]),
            users,
          )
        : [];

    setUnread((current) => ({
      messages:
        roomsResult.status === "fulfilled"
          ? extractList(roomsResult.value.data, ["rooms"]).some((room) => unreadRoom(room, userId))
          : current.messages,
      notifications:
        notificationsResult.status === "fulfilled"
          ? [
              ...remoteNotifications,
              ...(isAdmin ? getAdminLocalNotifications() : []),
            ].some((item) => {
              const isRead = item.isRead ?? item.read ?? item.status === "read";
              return !isRead;
            })
          : current.notifications,
    }));
  }, [isAdmin, userId]);

  useEffect(() => {
    if (!isAdmin) return undefined;
    const handleLocalNotification = () => {
      setUnread((current) => ({
        ...current,
        notifications: getAdminLocalNotifications().some((item) => !item.isRead),
      }));
    };
    window.addEventListener(ADMIN_NOTIFICATION_EVENT, handleLocalNotification);
    return () => window.removeEventListener(ADMIN_NOTIFICATION_EVENT, handleLocalNotification);
  }, [isAdmin]);

  useEffect(() => {
    const initial = window.setTimeout(refresh, 0);
    const interval = window.setInterval(refresh, 10000);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(interval);
    };
  }, [pathname, refresh]);

  useEffect(() => {
    const socket = getSocket();
    const onAny = (eventName, payload) => {
      const event = String(eventName).toLowerCase();
      if (event.includes("notification")) {
        setUnread((current) => ({ ...current, notifications: true }));
      }
      if (event.includes("message")) {
        const message = payload?.message ?? payload;
        const senderId = message?.sender?._id ?? message?.sender?.id ?? message?.sender;
        if (String(senderId) !== String(userId)) {
          const roomId = payload?.roomId ?? message?.room?._id ?? message?.room?.id ?? message?.room;
          if (!pathname.includes("/messages")) {
            const messageId = message?._id ?? message?.id;
            incrementStoredUnread(userId, roomId, messageId);
          }
          setUnread((current) => ({ ...current, messages: true }));
        }
      }
    };

    socket.onAny(onAny);
    return () => socket.offAny(onAny);
  }, [pathname, userId]);

  return unread;
}
