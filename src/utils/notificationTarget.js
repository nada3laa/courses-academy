const idOf = (value) =>
  value?.id ?? value?._id ?? (typeof value === "string" ? value : null);

const firstId = (notification, keys) => {
  for (const key of keys) {
    const value = idOf(notification[key]);
    if (value) return value;
    const dataValue = idOf(notification.data?.[key]);
    if (dataValue) return dataValue;
    const metadataValue = idOf(notification.metadata?.[key]);
    if (metadataValue) return metadataValue;
  }
  return null;
};

export const getNotificationChatState = (notification) => {
  const type = String(notification.type ?? "").toLowerCase();
  const roomId = firstId(notification, ["roomId", "room", "chatRoom"]);
  const classroomId = firstId(notification, ["classroomId", "classroom"]);
  const isChat = ["chat", "message", "new_message"].includes(type) || roomId;
  if (!isChat) return undefined;

  return {
    openRoomId: roomId,
    openClassroomId: classroomId,
    openClassroomName:
      notification.classroomName ??
      notification.data?.classroomName ??
      notification.metadata?.classroomName,
  };
};

export const getNotificationTarget = (notification, role) => {
  const type = String(notification.type ?? "").toLowerCase();
  const roomId = firstId(notification, ["roomId", "room", "chatRoom"]);
  const assignmentId = firstId(notification, ["assignmentId", "assignment"]);
  const classroomId = firstId(notification, ["classroomId", "classroom"]);
  const sessionId = firstId(notification, ["sessionId", "session"]);

  if (["chat", "message", "new_message"].includes(type) || roomId) {
    return role === "teacher" ? "/teacher/messages" : `/${role}/messages`;
  }

  const explicitTarget =
    notification.targetUrl ??
    notification.url ??
    notification.link ??
    notification.data?.targetUrl ??
    notification.data?.url;
  if (typeof explicitTarget === "string" && explicitTarget.startsWith("/")) {
    return explicitTarget;
  }

  if (assignmentId || ["assignment", "submission", "grading", "grade"].includes(type)) {
    if (role === "teacher" && assignmentId) {
      return `/teacher/assignments/${assignmentId}`;
    }
    if (role === "student") {
      return assignmentId
        ? `/student/assignments?assignment=${encodeURIComponent(assignmentId)}`
        : "/student/assignments";
    }
  }

  if (classroomId && sessionId) {
    if (role === "teacher") {
      return `/teacher/groups/${classroomId}/lessons/${sessionId}`;
    }
    if (role === "student") {
      return `/student/groups/${classroomId}/lessons/${sessionId}`;
    }
    if (role === "parent") {
      return `/parent/classrooms/${classroomId}/sessions/${sessionId}`;
    }
  }

  if (classroomId) {
    if (role === "teacher") return `/teacher/groups/${classroomId}/lessons`;
    if (role === "student") return `/student/groups/${classroomId}/lessons`;
  }

  return null;
};
