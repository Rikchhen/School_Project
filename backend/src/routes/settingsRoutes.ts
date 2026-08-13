import { Router } from "express";
import { getSettings, updateSettings } from "../controllers/settingsController";
import { validate } from "../middleware/validate";
import { protect, requireRole } from "../middleware/auth";
import { updateSettingsSchema } from "../validators";

const router = Router();

router.get("/", getSettings);
router.put("/", protect, requireRole("admin"), validate(updateSettingsSchema), updateSettings);

export default router;
