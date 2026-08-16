import { Schema, model, type InferSchemaType } from "mongoose";

const adminSessionSchema = new Schema(
  {
    adminId: { type: Schema.Types.ObjectId, ref: "Admin", required: true, index: true },
    csrfHash: { type: String, required: true, select: false },
    userAgent: { type: String, default: "" },
    ip: { type: String, default: "" },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
    revokedAt: { type: Date, default: null },
    lastSeenAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export type AdminSession = InferSchemaType<typeof adminSessionSchema>;
export const AdminSessionModel = model<AdminSession>("AdminSession", adminSessionSchema);
