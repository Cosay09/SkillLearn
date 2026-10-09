import { Router } from "express";
import { z } from "zod";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import * as c from "../controllers/skillController.js";

const createSchema = z.object({
  name: z.string().trim().min(2, "Skill name is too short").max(50),
  category: z.string().trim().max(50).optional(),
});

const router = Router();
router.use(requireAuth);

router.get("/", c.list);
router.post("/", validate(createSchema), c.create);

export default router;
