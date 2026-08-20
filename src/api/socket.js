import { io } from "socket.io-client";

const SOCKET_URL = "https://api.alacademeya.com";
let socket = null;

export function getSocket() {
  if (!socket) {
    const token = localStorage.getItem("token");

    socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket"],
      autoConnect: true,
    });

    // 1. مراقبة جميع الأحداث (للتصحيح فقط - يمكنك إزالتها لاحقاً)
    socket.onAny((event, ...args) => {
      console.log("EVENT:", event, args);
    });

    // 2. ربط حدث 'newMessage' بالدالة الخاصة بك
    socket.on("newMessage", (payload) => {
      handleNewMessage(payload);
    });

    socket.on("connect", () => console.log("✅ Socket Connected"));
    socket.on("connect_error", (err) => console.error("❌ Error:", err.message));
  }
  return socket;
}

export const handleNewMessage = (payload) => {
  console.log("🔥 NEW MESSAGE RECEIVED:", payload);
  // ضع هنا الكود الخاص بتحديث الـ State
};

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}