import { Router } from "express";
import { listSecurityAudits, listSessions } from "../controllers/securityController";
import { protect, requireRole } from "../middleware/auth";

const router = Router();
router.use(protect, requireRole("admin"));
router.get("/audits", listSecurityAudits);
router.get("/sessions", listSessions);
export default router;
