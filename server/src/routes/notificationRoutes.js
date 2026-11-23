import { Router } from "express";
import { requireAuth, requireVerified } from "../middleware/auth.js";
import * as notificationController from "../controllers/notificationController.js";

const router = Router();
router.use(requireAuth, requireVerified);

router.get("/", notificationController.list);
router.patch("/read-all", notificationController.readAll);

export default router;
