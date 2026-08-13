import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";

/**
 * School Management Committee members (distinct from teaching faculty).
 */
const committeeMemberSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    nameNe: { type: String, trim: true, default: "" },
    role: { type: String, required: true, trim: true },
    roleNe: { type: String, trim: true, default: "" },
    message: { type: String, default: "" },
    messageNe: { type: String, default: "" },
    phone: { type: String, default: "" },
    email: { type: String, default: "", lowercase: true, trim: true },
    photoUrl: { type: String, default: "" },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export type CommitteeMember = InferSchemaType<typeof committeeMemberSchema>;
export type CommitteeMemberDoc = HydratedDocument<CommitteeMember>;
export const CommitteeMemberModel = model<CommitteeMember>("CommitteeMember", committeeMemberSchema);
