import { api } from "./client";

export const registerUser = (data) =>
  api("/auth/register", { method: "POST", body: data });
export const loginUser = (data) =>
  api("/auth/login", { method: "POST", body: data });
export const getMe = () => api("/auth/me");
export const verifyEmail = (token) =>
  api("/auth/verify-email", { method: "POST", body: { token } });
export const resendVerification = () =>
  api("/auth/resend-verification", { method: "POST" });
export const forgotPassword = (email) =>
  api("/auth/forgot-password", { method: "POST", body: { email } });
export const resetPassword = (data) =>
  api("/auth/reset-password", { method: "POST", body: data });
