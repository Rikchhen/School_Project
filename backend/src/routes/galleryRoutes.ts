import { Router } from "express";
import {
  createGalleryItem,
  deleteGalleryItem,
  listGallery,
  updateGalleryItem,
} from "../controllers/galleryController";
import { validate } from "../middleware/validate";
import { protect, requireRole } from "../middleware/auth";
import {
  createGallerySchema,
  idParamSchema,
  updateGallerySchema,
} from "../validators";

const router = Router();

router.get("/", listGallery);

router.post("/", protect, requireRole("admin", "editor"), validate(createGallerySchema), createGalleryItem);
router.put("/:id", protect, requireRole("admin", "editor"), validate(updateGallerySchema), updateGalleryItem);
router.delete("/:id", protect, requireRole("admin", "editor"), validate(idParamSchema), deleteGalleryItem);

export default router;
