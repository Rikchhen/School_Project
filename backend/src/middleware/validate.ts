import type { NextFunction, Request, RequestHandler, Response } from "express";
import { z, type ZodType } from "zod";
import { ApiError } from "../utils/ApiError";

/**
 * Validate `{ body, query, params }` against a zod schema BEFORE the controller
 * runs. Express 5 makes `req.query`/`req.params` read-only getters, so the
 * parsed/coerced result is stashed on `req.validated` and (for the writable
 * `body`) also assigned back to `req.body`.
 */
export const validate =
  (schema: ZodType): RequestHandler =>
  (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      const flat = z.flattenError(result.error as z.ZodError);
      return next(ApiError.badRequest("Validation failed", flat.fieldErrors));
    }

    const data = result.data as {
      body?: unknown;
      query?: unknown;
      params?: unknown;
    };
    req.validated = data;
    if (data.body !== undefined) req.body = data.body;
    next();
  };
