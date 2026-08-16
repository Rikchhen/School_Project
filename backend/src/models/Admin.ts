import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";
import bcrypt from "bcryptjs";

const adminSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["admin", "editor"], default: "admin" },
    tokenVersion: { type: Number, default: 0 },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String, default: "", select: false },
    twoFactorPendingSecret: { type: String, default: "", select: false },
    recoveryCodeHashes: { type: [String], default: [], select: false },
  },
  { timestamps: true }
);

// Never leak the password hash through JSON serialization.
adminSchema.set("toJSON", {
  transform: (_doc, ret: Record<string, unknown>) => {
    delete ret.passwordHash;
    delete ret.twoFactorSecret;
    delete ret.twoFactorPendingSecret;
    delete ret.recoveryCodeHashes;
    delete ret.__v;
    return ret;
  },
});

adminSchema.methods.comparePassword = function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, (this as AdminDoc).passwordHash);
};

export type Admin = InferSchemaType<typeof adminSchema> & {
  comparePassword(candidate: string): Promise<boolean>;
};
export type AdminDoc = HydratedDocument<Admin>;

export async function hashPassword(plain: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
}

export const AdminModel = model<Admin>("Admin", adminSchema);
