import * as notificationService from "../services/notificationService.js";

export async function list(req, res) {
  res.json(await notificationService.list(req.userId));
}

export async function readAll(req, res) {
  await notificationService.markAllRead(req.userId);
  res.json({ ok: true });
}
