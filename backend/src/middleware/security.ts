import type { RequestHandler } from "express";
import { env, isTest } from "../config/env";
import { ApiError } from "../utils/ApiError";
import { AdminSessionModel } from "../models/AdminSession";
import { safeEqualHash } from "../utils/security";
import { writeAudit } from "../utils/audit";
import { verifyToken } from "../utils/jwt";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const PUBLIC_MUTATIONS = new Set(["/api/auth/login", "/api/submissions/contact", "/api/submissions/admission", "/api/submissions/donation"]);

export const rejectDangerousKeys: RequestHandler = (req, _res, next) => {
  const visit = (value: unknown): boolean => {
    if (!value || typeof value !== "object") return false;
    if (Array.isArray(value)) return value.some(visit);
    return Object.entries(value as Record<string, unknown>).some(([key, child]) => key.startsWith("$") || key.includes(".") || visit(child));
  };
  if (visit(req.body) || visit(req.params) || visit(req.query)) return next(ApiError.badRequest("Unsafe request key"));
  next();
};

export const csrfProtection: RequestHandler = async (req, _res, next) => {
  if (SAFE_METHODS.has(req.method) || PUBLIC_MUTATIONS.has(req.path) || isTest) return next();
  if (!req.cookies?.[env.COOKIE_NAME]) return next();
  const origin = req.get("origin");
  if (origin && origin !== env.CLIENT_URL && origin !== `${req.protocol}://${req.get("host")}`) return next(ApiError.forbidden("Untrusted request origin"));
  const csrfToken = req.get("x-csrf-token") ?? "";
  if (!csrfToken) return next(ApiError.forbidden("CSRF token required"));
  let sessionId: string;
  try { sessionId = verifyToken(req.cookies[env.COOKIE_NAME]).sid; }
  catch { return next(ApiError.unauthorized("Invalid or expired session")); }
  const session = await AdminSessionModel.findById(sessionId).select("+csrfHash");
  if (!session || !safeEqualHash(csrfToken, session.csrfHash)) return next(ApiError.forbidden("Invalid CSRF token"));
  next();
};

export const auditAdminMutation: RequestHandler = (req, res, next) => {
  if (SAFE_METHODS.has(req.method)) return next();
  res.on("finish", () => { if (req.admin) void writeAudit(req, "admin.mutation", res.statusCode); });
  next();
};

export const botProtection: RequestHandler = (req, _res, next) => {
  if (isTest) return next();
  const body = req.body as Record<string, unknown>;
  if (String(body.website ?? "").trim()) return next(ApiError.badRequest("Submission rejected"));
  const startedAt = Number(body.formStartedAt);
  const age = Date.now() - startedAt;
  if (!Number.isFinite(startedAt) || age < 1_500 || age > 86_400_000) return next(ApiError.badRequest("Please reload the form and try again"));
  delete body.website;
  delete body.formStartedAt;
  next();
};
