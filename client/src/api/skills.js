/*
    Jim push korbe
*/

import { api } from "./client";

export const listSkills = () => api("/skills");
export const createSkill = (name) =>
  api("/skills", { method: "POST", body: { name } });
export const getMySkills = () => api("/users/me/skills");
export const addMySkill = (data) =>
  api("/users/me/skills", { method: "POST", body: data });
export const removeMySkill = (id) =>
  api(`/users/me/skills/${id}`, { method: "DELETE" });
