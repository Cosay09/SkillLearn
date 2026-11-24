import * as messageService from "../services/messageService.js";
import { parseId } from "../utils/parseId.js";

export async function conversations(req, res) {
  res.json({
    conversations: await messageService.listConversations(req.userId),
  });
}

export async function list(req, res) {
  const after = Number(req.query.after) || 0;
  const messages = await messageService.listMessages(
    req.userId,
    parseId(req.params.requestId),
    after,
  );
  res.json({ messages });
}

export async function create(req, res) {
  res
    .status(201)
    .json({
      message: await messageService.createMessage(req.userId, req.body),
    });
}
