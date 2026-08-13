import { Router } from "express";
import {
  createAdmission,
  createContact,
  deleteSubmission,
  listSubmissions,
  updateSubmission,
} from "../controllers/submissionController";
import { validate } from "../middleware/validate";
import { protect, requireRole } from "../middleware/auth";
import { formLimiter } from "../middleware/rateLimiters";
import {
  admissionSubmissionSchema,
  contactSubmissionSchema,
  idParamSchema,
  listSubmissionSchema,
  updateSubmissionSchema,
} from "../validators";

const router = Router();

// Public form endpoints (rate limited)
router.post("/contact", formLimiter, validate(contactSubmissionSchema), createContact);
router.post("/admission", formLimiter, validate(admissionSubmissionSchema), createAdmission);

// Admin inbox
router.get("/", protect, requireRole("admin", "editor"), validate(listSubmissionSchema), listSubmissions);
router.patch("/:id", protect, requireRole("admin", "editor"), validate(updateSubmissionSchema), updateSubmission);
router.delete("/:id", protect, requireRole("admin"), validate(idParamSchema), deleteSubmission);

export default router;
