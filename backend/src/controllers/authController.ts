import type { CookieOptions, Request, Response } from "express";
import { AdminModel } from "../models/Admin";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { signToken } from "../utils/jwt";
import { env, isProd } from "../config/env";
import { AdminSessionModel } from "../models/AdminSession";
import { generateTotpSecret, randomToken, sha256, verifyTotp } from "../utils/security";
import { writeAudit } from "../utils/audit";
import crypto from "node:crypto";
import { LoginAttemptModel } from "../models/LoginAttempt";

function parseExpiryMs(expiresIn: string): number {
  const match = /^(\d+)([smhd])?$/.exec(expiresIn.trim());
  if (!match) return 7 * 24 * 60 * 60 * 1000;
  const value = Number(match[1]);
  const unit = match[2] ?? "s";
  const factor = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[unit] ?? 1000;
  return value * factor;
}

function cookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    maxAge: parseExpiryMs(env.JWT_EXPIRES_IN),
    path: "/",
  };
}

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, twoFactorCode } = (req.validated?.body ?? req.body) as {
    email: string;
    password: string;
    twoFactorCode?: string;
  };
  const attemptKey = sha256(`${req.ip}|${email}`);
  const attempts = await LoginAttemptModel.findOne({ key: attemptKey });
  if (attempts?.blockedUntil && attempts.blockedUntil > new Date()) throw new ApiError(429, "Too many failed attempts. Try again later.");

  const admin = await AdminModel.findOne({ email }).select("+passwordHash +twoFactorSecret +recoveryCodeHashes");
  if (!admin || !(await admin.comparePassword(password))) {
    await writeAudit(req, "auth.login_failed", 401, { emailHash: sha256(email) });
    const failures = (attempts?.failures ?? 0) + 1;
    await LoginAttemptModel.findOneAndUpdate({ key: attemptKey }, { failures, blockedUntil: failures >= 5 ? new Date(Date.now() + 30 * 60_000) : null, expiresAt: new Date(Date.now() + 24 * 60 * 60_000) }, { upsert: true, returnDocument: "after" });
    throw ApiError.unauthorized("Invalid email or password");
  }
  if (admin.twoFactorEnabled) {
    if (!twoFactorCode) return res.status(202).json({ success: false, requiresTwoFactor: true, message: "Two-factor code required" });
    const normalized = twoFactorCode.replace(/\s|-/g, "").toUpperCase();
    const recoveryIndex = admin.recoveryCodeHashes.findIndex((hash) => hash === sha256(normalized));
    if (!verifyTotp(admin.twoFactorSecret, normalized) && recoveryIndex < 0) throw ApiError.unauthorized("Invalid two-factor code");
    if (recoveryIndex >= 0) { admin.recoveryCodeHashes.splice(recoveryIndex, 1); await admin.save(); }
  }
  const csrfToken = randomToken();
  await LoginAttemptModel.deleteOne({ key: attemptKey });
  const session = await AdminSessionModel.create({ adminId: admin._id, csrfHash: sha256(csrfToken), userAgent: req.get("user-agent") ?? "", ip: req.ip, expiresAt: new Date(Date.now() + parseExpiryMs(env.JWT_EXPIRES_IN)) });
  const token = signToken({ id: admin.id, role: admin.role, sid: session.id, version: admin.tokenVersion });
  res.cookie(env.COOKIE_NAME, token, cookieOptions());
  res.setHeader("X-CSRF-Token", csrfToken);
  await writeAudit(req, "auth.login_success", 200, { adminId: admin.id });
  res.json({ success: true, admin: admin.toJSON(), csrfToken });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  if (req.admin?.sid) await AdminSessionModel.findByIdAndUpdate(req.admin.sid, { revokedAt: new Date() });
  res.clearCookie(env.COOKIE_NAME, { ...cookieOptions(), maxAge: undefined });
  res.json({ success: true, message: "Logged out" });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  if (!req.admin) throw ApiError.unauthorized();
  const admin = await AdminModel.findById(req.admin.id);
  if (!admin) throw ApiError.unauthorized("Account no longer exists");
  const csrfToken = randomToken();
  await AdminSessionModel.findByIdAndUpdate(req.admin.sid, { csrfHash: sha256(csrfToken) });
  res.setHeader("X-CSRF-Token", csrfToken);
  res.json({ success: true, admin: admin.toJSON(), csrfToken });
});

export const logoutAll = asyncHandler(async (req: Request, res: Response) => {
  await AdminSessionModel.updateMany({ adminId: req.admin!.id, revokedAt: null }, { revokedAt: new Date() });
  await writeAudit(req, "auth.logout_all", 200); res.json({ success: true });
});

export const beginTwoFactor = asyncHandler(async (req: Request, res: Response) => {
  const secret = generateTotpSecret();
  const admin = await AdminModel.findByIdAndUpdate(req.admin!.id, { twoFactorPendingSecret: secret }, { returnDocument: "after" });
  if (!admin) throw ApiError.notFound("Admin not found");
  const issuer = encodeURIComponent("Adarsha School Admin");
  res.json({ success: true, secret, otpauthUrl: `otpauth://totp/${issuer}:${encodeURIComponent(admin.email)}?secret=${secret}&issuer=${issuer}` });
});

export const confirmTwoFactor = asyncHandler(async (req: Request, res: Response) => {
  const admin = await AdminModel.findById(req.admin!.id).select("+twoFactorPendingSecret +recoveryCodeHashes");
  const code = String(req.body.code ?? "");
  if (!admin?.twoFactorPendingSecret || !verifyTotp(admin.twoFactorPendingSecret, code)) throw ApiError.badRequest("Invalid authenticator code");
  const codes = Array.from({ length: 8 }, () => crypto.randomBytes(5).toString("hex").toUpperCase());
  admin.twoFactorSecret = admin.twoFactorPendingSecret; admin.twoFactorPendingSecret = ""; admin.twoFactorEnabled = true; admin.recoveryCodeHashes = codes.map(sha256); await admin.save();
  await writeAudit(req, "auth.2fa_enabled", 200); res.json({ success: true, recoveryCodes: codes });
});

export const disableTwoFactor = asyncHandler(async (req: Request, res: Response) => {
  const admin = await AdminModel.findById(req.admin!.id).select("+passwordHash");
  if (!admin || !(await admin.comparePassword(String(req.body.password ?? "")))) throw ApiError.unauthorized("Invalid password");
  admin.twoFactorEnabled = false; admin.twoFactorSecret = ""; admin.twoFactorPendingSecret = ""; admin.recoveryCodeHashes = []; admin.tokenVersion += 1; await admin.save();
  await AdminSessionModel.updateMany({ adminId: admin._id }, { revokedAt: new Date() });
  await writeAudit(req, "auth.2fa_disabled", 200); res.json({ success: true });
});
