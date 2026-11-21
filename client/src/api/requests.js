import { api } from "./client";

export const createRequest = (data) =>
  api("/requests", { method: "POST", body: data });
export const listRequests = (box) => api(`/requests?box=${box}`);
export const updateRequest = (id, status) =>
  api(`/requests/${id}`, { method: "PATCH", body: { status } });
