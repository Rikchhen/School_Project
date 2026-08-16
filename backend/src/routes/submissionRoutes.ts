import { Router } from "express";
import {
  createAdmission,
  createContact,
  createDonation,
  deleteSubmission,
  getDonationDocument,
  listSubmissions,
  updateSubmission,
} from "../controllers/submissionController";
import { validate } from "../middleware/validate";
import { protect, requireRole } from "../middleware/auth";
import { formLimiter } from "../middleware/rateLimiters";
import { donationUpload, encryptDonationDocument, scanFilesForMalware, verifyFileSignatures } from "../middleware/upload";
import { botProtection } from "../middleware/security";
import {
  admissionSubmissionSchema,
  contactSubmissionSchema,
  donationSubmissionSchema,
  idParamSchema,
  listSubmissionSchema,
  updateSubmissionSchema,
} from "../validators";

const router = Router();

// Public form endpoints (rate limited)
router.post("/contact", formLimiter, botProtection, validate(contactSubmissionSchema), createContact);
router.post("/admission", formLimiter, botProtection, validate(admissionSubmissionSchema), createAdmission);
// Donation verification: multipart with a `document` file. multer parses the
// body + file first, then zod validates the text fields.
router.post(
  "/donation",
  formLimiter,
  donationUpload.single("document"),
  verifyFileSignatures,
  scanFilesForMalware,
  encryptDonationDocument,
  botProtection,
  validate(donationSubmissionSchema),
  createDonation
);

// Admin inbox
router.get("/", protect, requireRole("admin", "editor"), validate(listSubmissionSchema), listSubmissions);
router.get("/:id/document", protect, requireRole("admin"), validate(idParamSchema), getDonationDocument);
router.patch("/:id", protect, requireRole("admin", "editor"), validate(updateSubmissionSchema), updateSubmission);
router.delete("/:id", protect, requireRole("admin"), validate(idParamSchema), deleteSubmission);

export default router;
