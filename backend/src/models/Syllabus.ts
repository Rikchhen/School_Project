import { Schema, model, type InferSchemaType } from "mongoose";

const syllabusSchema = new Schema({
  title: { type: String, required: true, trim: true },
  titleNe: { type: String, default: "", trim: true },
  grade: { type: String, required: true, trim: true, index: true },
  subject: { type: String, required: true, trim: true, index: true },
  stream: { type: String, enum: ["science", "management", "humanities", "general"], default: "general", index: true },
  description: { type: String, default: "" },
  descriptionNe: { type: String, default: "" },
  fileUrl: { type: String, default: "" },
  coverImageUrl: { type: String, default: "" },
  academicYear: { type: String, default: "" },
  order: { type: Number, default: 0 },
  featured: { type: Boolean, default: false, index: true },
  published: { type: Boolean, default: true, index: true },
}, { timestamps: true });

export type Syllabus = InferSchemaType<typeof syllabusSchema>;
export const SyllabusModel = model<Syllabus>("Syllabus", syllabusSchema);
