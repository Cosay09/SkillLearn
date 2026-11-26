import { api } from "./client";

export const getConversations = () => api("/conversations");
export const getMessages = (requestId, after = 0) =>
  api(`/messages/${requestId}?after=${after}`);
export const sendMessage = (data) =>
  api("/messages", { method: "POST", body: data });
