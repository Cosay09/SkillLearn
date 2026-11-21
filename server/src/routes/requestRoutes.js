import { Router } from "express";
import { z } from "zod";
import { validate } from "../middleware/validate.js";
import { requireAuth, requireVerified } from "../middleware/auth.js";
import * as requestController from "../controllers/requestController.js";

const createSchema = z.object({
  receiverId: z.number().int().positive(),
  skillId: z.number().int().positive(),
});

const updateSchema = z.object({
  status: z.enum(["accepted", "declined", "cancelled"]),
});

const router = Router();
router.use(requireAuth, requireVerified);

router.post("/", validate(createSchema), requestController.create);
router.get("/", requestController.list);
router.patch("/:id", validate(updateSchema), requestController.update);

export default router;
