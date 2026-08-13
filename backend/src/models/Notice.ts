import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";

const noticeSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    titleNe: { type: String, trim: true, default: "" },
    body: { type: String, required: true },
    bodyNe: { type: String, default: "" },
    category: {
      type: String,
      enum: ["academic", "administrative", "general"],
      default: "general",
      index: true,
    },
    priority: {
      type: String,
      enum: ["normal", "important", "urgent"],
      default: "normal",
    },
    attachmentUrl: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    images: { type: [String], default: [] },
    published: { type: Boolean, default: true, index: true },
    publishedAt: { type: Date, default: () => new Date() },
  },
  { timestamps: true }
);

noticeSchema.index({ title: "text", body: "text" });

export type Notice = InferSchemaType<typeof noticeSchema>;
export type NoticeDoc = HydratedDocument<Notice>;
export const NoticeModel = model<Notice>("Notice", noticeSchema);
