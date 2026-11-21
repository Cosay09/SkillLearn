import * as requestService from "../services/requestService.js";
import { parseId } from "../utils/parseId.js";

export async function create(req, res) {
  const request = await requestService.createRequest(req.userId, req.body);
  res.status(201).json({ request });
}

export async function list(req, res) {
  const box = req.query.box === "outgoing" ? "outgoing" : "incoming";
  const requests = await requestService.listRequests(req.userId, box);
  res.json({ requests });
}

export async function update(req, res) {
  const request = await requestService.updateRequestStatus(
    req.userId,
    parseId(req.params.id),
    req.body.status,
  );
  res.json({ request });
}
