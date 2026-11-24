import { Router } from "express";
import { z } from "zod";
import { validate } from "../middleware/validate.js";
import { requireAuth, requireVerified } from "../middleware/auth.js";
import * as sessionController from "../controllers/sessionController.js";

const createSchema = z.object({
  matchRequestId: z.number().int().positive(),
  startTime: z.iso.datetime(),
  endTime: z.iso.datetime(),
  meetingInfo: z.string().trim().max(200).optional(),
});

const updateSchema = z.object({
  status: z.enum(["cancelled", "completed"]),
});

const router = Router();
router.use(requireAuth, requireVerified);

router.post("/", validate(createSchema), sessionController.create);
router.get("/", sessionController.list);
router.patch("/:id", validate(updateSchema), sessionController.update);

export default router;
