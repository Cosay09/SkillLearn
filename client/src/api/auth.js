
/*
    Mahadi push korbe
*/

import { api } from "./client";

export const registerUser = (data) =>
  api("/auth/register", { method: "POST", body: data });
export const loginUser = (data) =>
  api("/auth/login", { method: "POST", body: data });
export const getMe = () => api("/auth/me");
