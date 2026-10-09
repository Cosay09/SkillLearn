import { Router } from "express";
import { z } from "zod";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import * as c from "../controllers/userController.js";

const profileSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").optional(),
  department: z.string().trim().max(100).nullable().optional(),
  year: z.number().int().min(1).max(4).nullable().optional(),
  bio: z.string().trim().max(500, "Bio is too long").nullable().optional(),
});

const addSkillSchema = z.object({
  skillId: z.number().int().positive(),
  type: z.enum(["offer", "want"]),
  level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
});

const time = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:MM, for example 16:00");

const slotsSchema = z.object({
  slots: z
    .array(
      z
        .object({
          dayOfWeek: z.number().int().min(0).max(6),
          startTime: time,
          endTime: time,
        })
        .refine((s) => s.startTime < s.endTime, {
          message: "End time must be after start time",
        }),
    )
    .max(30),
});

const router = Router();
router.use(requireAuth);

///me comes first because it is more specific than /:id

router.put("/me", validate(profileSchema), c.updateMe);

router.get("/me/skills", c.mySkills);
router.post("/me/skills", validate(addSkillSchema), c.addSkill);
router.delete("/me/skills/:id", c.removeSkill);

router.get("/me/availability", c.mySlots);
router.put("/me/availability", validate(slotsSchema), c.saveSlots);

router.get("/:id", c.getProfile);

export default router;
