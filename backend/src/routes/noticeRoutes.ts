import { Router } from "express";
import {
  createNotice,
  deleteNotice,
  getNotice,
  listNotices,
  updateNotice,
} from "../controllers/noticeController";
import { validate } from "../middleware/validate";
import { protect, requireRole } from "../middleware/auth";
import {
  createNoticeSchema,
  idParamSchema,
  listNoticeSchema,
  updateNoticeSchema,
} from "../validators";

const router = Router();

// Public
router.get("/", validate(listNoticeSchema), listNotices);
router.get("/:id", validate(idParamSchema), getNotice);

// Admin
router.post("/", protect, requireRole("admin", "editor"), validate(createNoticeSchema), createNotice);
router.put("/:id", protect, requireRole("admin", "editor"), validate(updateNoticeSchema), updateNotice);
router.delete("/:id", protect, requireRole("admin", "editor"), validate(idParamSchema), deleteNotice);

export default router;
