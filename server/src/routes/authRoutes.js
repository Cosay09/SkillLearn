import { Router } from "express";
import { z } from "zod";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import * as authController from "../controllers/authController.js";

const registerSchema = z.object({
  name: z.string().trim().min(2, "Name is too short"),
  email: z.email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

const verifySchema = z.object({
  token: z.string().min(10, "The link is incomplete"),
});

const forgotSchema = z.object({
  email: z.email("Enter a valid email address"),
});

const resetSchema = z.object({
  token: z.string().min(10, "The link is incomplete"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const router = Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.get("/me", requireAuth, authController.me);

router.post(
  "/verify-email",
  validate(verifySchema),
  authController.verifyEmail,
);

router.post(
  "/resend-verification",
  requireAuth,
  authController.resendVerification,
);

router.post(
  "/forgot-password",
  validate(forgotSchema),
  authController.forgotPassword,
);

router.post(
  "/reset-password",
  validate(resetSchema),
  authController.resetPassword,
);

export default router;
