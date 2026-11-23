import { api } from "./client";

export const getNotifications = () => api("/notifications");
export const markAllRead = () =>
  api("/notifications/read-all", { method: "PATCH" });
