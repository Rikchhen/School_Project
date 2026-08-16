import type { NextFunction, Request, RequestHandler, Response } from "express";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";
import { verifyToken } from "../utils/jwt";

/**
 * Require a valid JWT in the httpOnly auth cookie. Attaches the decoded payload
 * to `req.admin`.
 */
export const protect: RequestHandler = async (req: Request, _res: Response, next: NextFunction) => {
  const token = req.cookies?.[env.COOKIE_NAME];
  if (!token) return next(ApiError.unauthorized("Authentication required"));

  try {
    const payload = verifyToken(token);
    const { AdminSessionModel } = await import("../models/AdminSession");
    const { AdminModel } = await import("../models/Admin");
    const [session, admin] = await Promise.all([
      AdminSessionModel.findOne({ _id: payload.sid, adminId: payload.id, revokedAt: null, expiresAt: { $gt: new Date() } }),
      AdminModel.findById(payload.id).select("role tokenVersion"),
    ]);
    const idleCutoff = new Date(Date.now() - env.SESSION_IDLE_MINUTES * 60_000);
    if (!session || session.lastSeenAt < idleCutoff || !admin || admin.tokenVersion !== payload.version || admin.role !== payload.role) {
      if (session) { session.revokedAt = new Date(); void session.save(); }
      return next(ApiError.unauthorized("Session has expired or been revoked"));
    }
    req.admin = payload;
    session.lastSeenAt = new Date();
    void session.save();
    next();
  } catch {
    next(ApiError.unauthorized("Invalid or expired session"));
  }
};

/**
 * Require the authenticated user to have one of the given roles.
 * Use after `protect`.
 */
export const requireRole =
  (...roles: Array<"admin" | "editor">): RequestHandler =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.admin) return next(ApiError.unauthorized());
    if (!roles.includes(req.admin.role)) {
      return next(ApiError.forbidden("You do not have permission to do that"));
    }
    next();
  };
