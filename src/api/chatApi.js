import axios from "axios";

const API = axios.create({
  baseURL: "https://api.alacademeya.com/api",
});

const attachToken = (config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};
API.interceptors.request.use(attachToken);

export const getChatRooms = () => API.get("/chats/rooms");

export const getRoomMessages = (roomId, params = {}) =>
  API.get(`/chats/rooms/${roomId}/messages`, { params });

export const startSupportRoom = (payload = {}) => API.post("/chats/support-room", payload);

export const sendMessageApi = (roomId, text) => API.post("/messages", { roomId, text });

export const editMessage = (messageId, text) => API.patch(`/messages/${messageId}`, { text });


export const deleteMessage = (messageId) => API.delete(`/messages/${messageId}`);

export const updateChatRoom = (roomId, payload) =>
  API.patch(`/chats/rooms/${roomId}`, payload);

export const deleteChatRoom = (roomId) =>
  API.delete(`/chats/rooms/${roomId}`);
