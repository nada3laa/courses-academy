const storageKey = (userId) => `chat-unread:${String(userId || "guest")}`;
const seenStorageKey = (userId) =>
  `chat-unread-seen:${String(userId || "guest")}`;

export const getStoredUnreadCounts = (userId) => {
  try {
    return JSON.parse(localStorage.getItem(storageKey(userId)) || "{}") || {};
  } catch {
    return {};
  }
};

const saveCounts = (userId, counts) => {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(counts));
  } catch {
    // Browsers can disable or limit localStorage; realtime state still works.
  }
};

export const incrementStoredUnread = (userId, roomId, messageId) => {
  if (!roomId) return 0;
  const counts = getStoredUnreadCounts(userId);
  const key = String(roomId);

  if (messageId) {
    try {
      const seen = JSON.parse(localStorage.getItem(seenStorageKey(userId)) || "[]");
      const messageKey = String(messageId);
      if (seen.includes(messageKey)) return Number(counts[key] || 0);
      localStorage.setItem(
        seenStorageKey(userId),
        JSON.stringify([...seen, messageKey].slice(-200)),
      );
    } catch {
      // Continue counting when storage is unavailable or malformed.
    }
  }

  counts[key] = Number(counts[key] || 0) + 1;
  saveCounts(userId, counts);
  return counts[key];
};

export const clearStoredUnread = (userId, roomId) => {
  if (!roomId) return;
  const counts = getStoredUnreadCounts(userId);
  delete counts[String(roomId)];
  saveCounts(userId, counts);
};
