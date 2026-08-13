import type { NextFunction, Request, RequestHandler, Response } from "express";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";
import { verifyToken } from "../utils/jwt";

/**
 * Require a valid JWT in the httpOnly auth cookie. Attaches the decoded payload
 * to `req.admin`.
 */
export const protect: RequestHandler = (req: Request, _res: Response, next: NextFunction) => {
  const token = req.cookies?.[env.COOKIE_NAME];
  if (!token) return next(ApiError.unauthorized("Authentication required"));

  try {
    req.admin = verifyToken(token);
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
