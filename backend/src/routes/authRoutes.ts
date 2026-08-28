import { Router } from "express";
import { beginTwoFactor, changePassword, confirmTwoFactor, disableTwoFactor, login, logout, logoutAll, me } from "../controllers/authController";
import { validate } from "../middleware/validate";
import { protect } from "../middleware/auth";
import { changePasswordSchema, disableTwoFactorSchema, loginSchema, twoFactorCodeSchema } from "../validators";
import { authLimiter } from "../middleware/rateLimiters";

const router = Router();

router.post("/login", authLimiter, validate(loginSchema), login);
router.post("/logout", protect, logout);
router.get("/me", protect, me);
router.post("/logout-all", protect, logoutAll);
router.post("/2fa/setup", protect, beginTwoFactor);
router.post("/2fa/confirm", protect, validate(twoFactorCodeSchema), confirmTwoFactor);
router.post("/2fa/disable", protect, validate(disableTwoFactorSchema), disableTwoFactor);
router.post("/change-password", protect, validate(changePasswordSchema), changePassword);

export default router;
