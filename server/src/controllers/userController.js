import * as userService from "../services/userService.js";
import * as skillService from "../services/skillService.js";
import * as availabilityService from "../services/availabilityService.js";
import { parseId } from "../utils/parseId.js";

export async function getProfile(req, res) {
  const profile = await userService.getPublicProfile(parseId(req.params.id));
  res.json({ user: profile });
}

export async function updateMe(req, res) {
  const user = await userService.updateProfile(req.userId, req.body);
  res.json({ user });
}

export async function mySkills(req, res) {
  const skills = await skillService.getMySkills(req.userId);
  res.json({ skills });
}

export async function addSkill(req, res) {
  const skill = await skillService.addMySkill(req.userId, req.body);
  res.status(201).json({ skill });
}

export async function removeSkill(req, res) {
  await skillService.removeMySkill(req.userId, parseId(req.params.id));
  res.json({ ok: true });
}

export async function mySlots(req, res) {
  const slots = await availabilityService.getSlots(req.userId);
  res.json({ slots });
}

export async function saveSlots(req, res) {
  const slots = await availabilityService.replaceSlots(
    req.userId,
    req.body.slots,
  );
  res.json({ slots });
}
