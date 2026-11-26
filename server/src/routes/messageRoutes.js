import { Router } from "express";
import { z } from "zod";
import { validate } from "../middleware/validate.js";
import { requireAuth, requireVerified } from "../middleware/auth.js";
import * as messageController from "../controllers/messageController.js";

const createSchema = z.object({
  matchRequestId: z.number().int().positive(),
  body: z
    .string()
    .trim()
    .min(1, "Write a message first")
    .max(1000, "Message is too long"),
});

const guard = [requireAuth, requireVerified];
const router = Router();

router.get("/conversations", guard, messageController.conversations);
router.get("/messages/:requestId", guard, messageController.list);
router.post(
  "/messages",
  guard,
  validate(createSchema),
  messageController.create,
);

export default router;
