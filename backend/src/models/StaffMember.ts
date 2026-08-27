import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";

const staffMemberSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    nameNe: { type: String, trim: true, default: "" },
    role: { type: String, required: true, trim: true },
    roleNe: { type: String, trim: true, default: "" },
    department: {
      type: String,
      enum: [
        "administration",
        "science",
        "management",
        "humanities",
        "languages",
        "general",
      ],
      default: "general",
      index: true,
    },
    bio: { type: String, default: "" },
    bioNe: { type: String, default: "" },
    email: { type: String, default: "", lowercase: true, trim: true },
    phone: { type: String, default: "" },
    photoUrl: { type: String, default: "" },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export type StaffMember = InferSchemaType<typeof staffMemberSchema>;
export type StaffMemberDoc = HydratedDocument<StaffMember>;
export const StaffMemberModel = model<StaffMember>("StaffMember", staffMemberSchema);
