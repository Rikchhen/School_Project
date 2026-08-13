import type { CookieOptions, Request, Response } from "express";
import { AdminModel } from "../models/Admin";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { signToken } from "../utils/jwt";
import { env, isProd } from "../config/env";

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
    sameSite: isProd ? "none" : "lax",
    maxAge: parseExpiryMs(env.JWT_EXPIRES_IN),
    path: "/",
  };
}

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = (req.validated?.body ?? req.body) as {
    email: string;
    password: string;
  };

  const admin = await AdminModel.findOne({ email }).select("+passwordHash");
  if (!admin || !(await admin.comparePassword(password))) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const token = signToken({ id: admin.id, role: admin.role });
  res.cookie(env.COOKIE_NAME, token, cookieOptions());
  res.json({ success: true, admin: admin.toJSON() });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie(env.COOKIE_NAME, { ...cookieOptions(), maxAge: undefined });
  res.json({ success: true, message: "Logged out" });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  if (!req.admin) throw ApiError.unauthorized();
  const admin = await AdminModel.findById(req.admin.id);
  if (!admin) throw ApiError.unauthorized("Account no longer exists");
  res.json({ success: true, admin: admin.toJSON() });
});
