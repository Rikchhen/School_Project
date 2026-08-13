import { Router } from "express";
import {
  createCommittee,
  deleteCommittee,
  listCommittee,
  updateCommittee,
} from "../controllers/committeeController";
import { validate } from "../middleware/validate";
import { protect, requireRole } from "../middleware/auth";
import {
  createCommitteeSchema,
  idParamSchema,
  updateCommitteeSchema,
} from "../validators";

const router = Router();

router.get("/", listCommittee);

router.post("/", protect, requireRole("admin", "editor"), validate(createCommitteeSchema), createCommittee);
router.put("/:id", protect, requireRole("admin", "editor"), validate(updateCommitteeSchema), updateCommittee);
router.delete("/:id", protect, requireRole("admin", "editor"), validate(idParamSchema), deleteCommittee);

export default router;
