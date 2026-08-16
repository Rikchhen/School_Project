import type { ErrorRequestHandler, RequestHandler } from "express";
import { MulterError } from "multer";
import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError";
import { isProd } from "../config/env";

/** 404 fallback for unmatched routes. */
export const notFound: RequestHandler = (req, _res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

/** Central error handler — the last middleware mounted on the app. */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  let statusCode = 500;
  let message = "Something went wrong";
  let details: unknown;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.details;
  } else if (err instanceof MulterError) {
    statusCode = 400;
    message =
      err.code === "LIMIT_FILE_SIZE" ? "File is too large (max 80MB)" : err.message;
  } else if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = "Validation failed";
    details = Object.fromEntries(
      Object.entries(err.errors).map(([k, v]) => [k, v.message])
    );
  } else if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = `Invalid ${err.path}`;
  } else if (
    typeof err === "object" &&
    err !== null &&
    (err as { code?: number }).code === 11000
  ) {
    statusCode = 409;
    message = "A record with that value already exists";
    details = (err as { keyValue?: unknown }).keyValue;
  } else if (err instanceof Error) {
    if (!isProd) message = err.message || message;
  }

  if (statusCode >= 500 && !isProd) {
    // Surface unexpected server errors in dev logs.
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(details !== undefined ? { details } : {}),
  });
};
