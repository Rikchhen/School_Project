import { Router } from "express";
import { createSyllabus, deleteSyllabus, listSyllabi, updateSyllabus } from "../controllers/syllabusController";
import { protect, requireRole } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createSyllabusSchema, idParamSchema, updateSyllabusSchema } from "../validators";

const router = Router();
router.get("/", listSyllabi);
router.post("/", protect, requireRole("admin", "editor"), validate(createSyllabusSchema), createSyllabus);
router.put("/:id", protect, requireRole("admin", "editor"), validate(updateSyllabusSchema), updateSyllabus);
router.delete("/:id", protect, requireRole("admin", "editor"), validate(idParamSchema), deleteSyllabus);
export default router;
