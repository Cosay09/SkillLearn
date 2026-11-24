import { api } from "./client";

export const createSession = (data) =>
  api("/sessions", { method: "POST", body: data });
export const listSessions = (when) => api(`/sessions?when=${when}`);
export const updateSession = (id, status) =>
  api(`/sessions/${id}`, { method: "PATCH", body: { status } });
