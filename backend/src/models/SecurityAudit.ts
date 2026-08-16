import { Schema, model, type InferSchemaType } from "mongoose";

const securityAuditSchema = new Schema(
  {
    actorId: { type: Schema.Types.ObjectId, ref: "Admin", default: null, index: true },
    event: { type: String, required: true, index: true },
    method: { type: String, default: "" },
    path: { type: String, default: "" },
    status: { type: Number, default: 0 },
    ip: { type: String, default: "" },
    userAgent: { type: String, default: "" },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

securityAuditSchema.index({ createdAt: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 });
export type SecurityAudit = InferSchemaType<typeof securityAuditSchema>;
export const SecurityAuditModel = model<SecurityAudit>("SecurityAudit", securityAuditSchema);
