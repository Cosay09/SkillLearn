/*
    Jim push korbe
*/

import { api } from "./client";

export const updateProfile = (data) =>
  api("/users/me", { method: "PUT", body: data });
export const getAvailability = () => api("/users/me/availability");
export const saveAvailability = (slots) =>
  api("/users/me/availability", { method: "PUT", body: { slots } });