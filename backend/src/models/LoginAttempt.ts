import { Schema, model } from "mongoose";

const loginAttemptSchema = new Schema({
  key: { type: String, required: true, unique: true },
  failures: { type: Number, default: 0 },
  blockedUntil: { type: Date, default: null },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
});
export const LoginAttemptModel = model("LoginAttempt", loginAttemptSchema);
