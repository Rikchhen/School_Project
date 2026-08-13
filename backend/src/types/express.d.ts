import type { JwtPayload } from "../utils/jwt";

declare global {
  namespace Express {
    interface Request {
      /** Set by the auth middleware once a valid JWT cookie is verified. */
      admin?: JwtPayload;
      /** Set by the validate middleware: parsed & typed body/query/params. */
      validated?: {
        body?: unknown;
        query?: unknown;
        params?: unknown;
      };
    }
  }
}

export {};
