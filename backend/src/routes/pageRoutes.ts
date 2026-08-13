import { Router } from "express";
import {
  deletePage,
  getPageBySlug,
  listPages,
  upsertPage,
} from "../controllers/pageController";
import { validate } from "../middleware/validate";
import { protect, requireRole } from "../middleware/auth";
import { slugParamSchema, upsertPageSchema } from "../validators";

const router = Router();

router.get("/", listPages);
router.get("/:slug", validate(slugParamSchema), getPageBySlug);

router.put("/", protect, requireRole("admin"), validate(upsertPageSchema), upsertPage);
router.delete("/:slug", protect, requireRole("admin"), validate(slugParamSchema), deletePage);

export default router;
