import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";

/** Academic programs / courses shown on the Academics page (admin-editable). */
const programSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    nameNe: { type: String, trim: true, default: "" },
    category: {
      type: String,
      enum: ["science", "management", "humanities", "general"],
      default: "general",
      index: true,
    },
    description: { type: String, default: "" },
    descriptionNe: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    coreSubjects: { type: [String], default: [] },
    keyAreas: { type: [String], default: [] },
    accent: { type: String, enum: ["primary", "secondary"], default: "primary" },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export type Program = InferSchemaType<typeof programSchema>;
export type ProgramDoc = HydratedDocument<Program>;
export const ProgramModel = model<Program>("Program", programSchema);
