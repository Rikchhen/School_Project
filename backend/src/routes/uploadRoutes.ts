import { Router } from "express";
import { uploadFile, uploadFiles } from "../controllers/uploadController";
import { protect, requireRole } from "../middleware/auth";
import { scanFilesForMalware, upload, verifyFileSignatures } from "../middleware/upload";

const router = Router();

// Admin: single-file upload (field name: "file")
router.post(
  "/",
  protect,
  requireRole("admin", "editor"),
  upload.single("file"),
  verifyFileSignatures,
  scanFilesForMalware,
  uploadFile
);

// Admin: multi-file upload (field name: "files", up to 12)
router.post(
  "/multiple",
  protect,
  requireRole("admin", "editor"),
  upload.array("files", 12),
  verifyFileSignatures,
  scanFilesForMalware,
  uploadFiles
);

export default router;
