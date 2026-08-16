import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";

/**
 * A message from the public site: Contact form, Admissions enquiry, or a
 * Donation verification (donor identity + document, submitted before the
 * payment QRs are revealed). Stored in one inbox and distinguished by `type`.
 */
const submissionSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["contact", "admission", "donation"],
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, default: "" },
    subject: { type: String, default: "" },
    message: { type: String, default: "" },

    // Admission-specific optional fields
    gradeApplyingFor: { type: String, default: "" },
    studentName: { type: String, default: "" },

    // Donation-specific: the donor's uploaded ID / document (image or PDF).
    documentUrl: { type: String, default: "" },
    documentName: { type: String, default: "" },
    documentMime: { type: String, default: "" },
    documentEncrypted: { type: Boolean, default: false },
    documentExpiresAt: { type: Date, default: null, index: true },

    status: {
      type: String,
      enum: ["new", "read", "archived"],
      default: "new",
      index: true,
    },
    reviewStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    reviewNote: { type: String, default: "" },
    reviewedAt: { type: Date, default: null },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "Admin", default: null },
  },
  { timestamps: true }
);

export type Submission = InferSchemaType<typeof submissionSchema>;
export type SubmissionDoc = HydratedDocument<Submission>;
export const SubmissionModel = model<Submission>("Submission", submissionSchema);
