import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";

/**
 * A message from the public site: either the Contact form or an Admissions
 * enquiry/application. Stored in one inbox and distinguished by `type`.
 */
const submissionSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["contact", "admission"],
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, default: "" },
    subject: { type: String, default: "" },
    message: { type: String, required: true },

    // Admission-specific optional fields
    gradeApplyingFor: { type: String, default: "" },
    studentName: { type: String, default: "" },

    status: {
      type: String,
      enum: ["new", "read", "archived"],
      default: "new",
      index: true,
    },
  },
  { timestamps: true }
);

export type Submission = InferSchemaType<typeof submissionSchema>;
export type SubmissionDoc = HydratedDocument<Submission>;
export const SubmissionModel = model<Submission>("Submission", submissionSchema);
