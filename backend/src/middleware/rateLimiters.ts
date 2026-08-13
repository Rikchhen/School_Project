import { rateLimit } from "express-rate-limit";
import { isTest } from "../config/env";

// Disable limiting in tests so suites aren't throttled.
const skip = () => isTest;

/** Tight limit on login to slow credential-stuffing. */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { success: false, message: "Too many attempts. Please try again later." },
  skip,
});

/** Limit public form spam. */
export const formLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many submissions from this address. Please try again later.",
  },
  skip,
});
