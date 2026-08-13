import { Router } from "express";
import {
  createProgram,
  deleteProgram,
  listPrograms,
  updateProgram,
} from "../controllers/programController";
import { validate } from "../middleware/validate";
import { protect, requireRole } from "../middleware/auth";
import { createProgramSchema, idParamSchema, updateProgramSchema } from "../validators";

const router = Router();

router.get("/", listPrograms);

router.post("/", protect, requireRole("admin", "editor"), validate(createProgramSchema), createProgram);
router.put("/:id", protect, requireRole("admin", "editor"), validate(updateProgramSchema), updateProgram);
router.delete("/:id", protect, requireRole("admin", "editor"), validate(idParamSchema), deleteProgram);

export default router;
