import type { NextFunction, Request, RequestHandler, Response } from "express";

/**
 * Wrap an async route handler so any rejected promise is forwarded to Express's
 * error-handling middleware. Keeps controllers free of repetitive try/catch.
 */
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
