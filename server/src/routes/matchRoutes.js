import { Router } from "express";
import { requireAuth, requireVerified } from "../middleware/auth.js";
import * as matchController from "../controllers/matchController.js";

const router = Router();
router.use(requireAuth, requireVerified);

router.get("/", matchController.list);

export default router;
