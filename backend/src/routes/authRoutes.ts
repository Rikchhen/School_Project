import { Router } from "express";
import { login, logout, me } from "../controllers/authController";
import { validate } from "../middleware/validate";
import { protect } from "../middleware/auth";
import { loginSchema } from "../validators";
import { authLimiter } from "../middleware/rateLimiters";

const router = Router();

router.post("/login", authLimiter, validate(loginSchema), login);
router.post("/logout", logout);
router.get("/me", protect, me);

export default router;
