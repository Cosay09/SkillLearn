import * as sessionService from "../services/sessionService.js";
import { parseId } from "../utils/parseId.js";

export async function create(req, res) {
  const session = await sessionService.createSession(req.userId, req.body);
  res.status(201).json({ session });
}

export async function list(req, res) {
  const when = req.query.when === "past" ? "past" : "upcoming";
  const sessions = await sessionService.listSessions(req.userId, when);
  res.json({ sessions });
}

export async function update(req, res) {
  const session = await sessionService.updateSessionStatus(
    req.userId,
    parseId(req.params.id),
    req.body.status,
  );
  res.json({ session });
}
