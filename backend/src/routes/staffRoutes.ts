import { Router } from "express";
import {
  createStaff,
  deleteStaff,
  getStaff,
  listStaff,
  updateStaff,
} from "../controllers/staffController";
import { validate } from "../middleware/validate";
import { protect, requireRole } from "../middleware/auth";
import { createStaffSchema, idParamSchema, updateStaffSchema } from "../validators";

const router = Router();

router.get("/", listStaff);
router.get("/:id", validate(idParamSchema), getStaff);

router.post("/", protect, requireRole("admin", "editor"), validate(createStaffSchema), createStaff);
router.put("/:id", protect, requireRole("admin", "editor"), validate(updateStaffSchema), updateStaff);
router.delete("/:id", protect, requireRole("admin", "editor"), validate(idParamSchema), deleteStaff);

export default router;
