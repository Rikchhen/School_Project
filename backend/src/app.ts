import express, { type Application } from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import path from "node:path";

import { env, isProd, isTest } from "./config/env";
import apiRoutes from "./routes";
import { errorHandler, notFound } from "./middleware/errorHandler";
import { UPLOAD_DIR } from "./middleware/upload";
import { SubmissionModel } from "./models/Submission";
import { auditAdminMutation, csrfProtection, rejectDangerousKeys } from "./middleware/security";

export function createApp(): Application {
  const app = express();
  if (env.TRUST_PROXY > 0) app.set("trust proxy", env.TRUST_PROXY);

  // Security headers. Allow uploaded images to be embedded by the frontend
  // origin (different port) by relaxing the cross-origin resource policy.
  // The CSP keeps helmet's safe defaults but additionally permits embedding the
  // Google Maps iframe on the Contact page (frame-src) — without this, the
  // browser shows "This content is blocked".
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
      // Browsers must only cache HTTPS enforcement in production. Local HTTP
      // development remains usable without redirects or an HSTS policy.
      strictTransportSecurity: isProd
        ? { maxAge: 31_536_000, includeSubDomains: true }
        : false,
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "frame-src": ["'self'", "https://www.google.com", "https://maps.google.com"],
          "img-src": ["'self'", "data:", "https:"],
        },
      },
    })
  );

  app.use(
    cors({
      origin: env.CLIENT_URL,
      credentials: true,
      exposedHeaders: ["X-CSRF-Token"],
    })
  );

  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(rejectDangerousKeys);
  app.use(csrfProtection);
  app.use(auditAdminMutation);

  if (!isProd && !isTest) {
    app.use(morgan("dev"));
  }

  // Block legacy donor documents that were historically stored in the public
  // uploads directory. Admins retrieve them through the protected submission
  // document endpoint instead; all other public media remains static.
  app.use("/uploads/:filename", async (req, res, next) => {
    try {
      const documentUrl = `/uploads/${req.params.filename}`;
      const isDonorDocument = await SubmissionModel.exists({ type: "donation", documentUrl });
      if (isDonorDocument) return res.status(404).json({ success: false, message: "Not found" });
      next();
    } catch (error) {
      next(error);
    }
  });

  // Serve non-sensitive uploaded files statically.
  app.use("/uploads", express.static(UPLOAD_DIR));

  // API
  app.use("/api", apiRoutes);

  // Serve the built frontend from the same origin. This lets you run everything
  // from ONE URL (http://localhost:PORT) with no Vite dev server, proxy, or
  // CORS — the most robust way to view the site in any browser.
  // Registered unconditionally so it also works if `frontend/dist` is built
  // AFTER the backend starts (e.g. `vite build --watch` running alongside).
  const clientDist = path.resolve(process.cwd(), "..", "frontend", "dist");
  const indexHtml = path.join(clientDist, "index.html");
  app.use(express.static(clientDist));
  // SPA fallback: send index.html for any non-API/non-upload GET route.
  app.use((req, res, next) => {
    if (req.method !== "GET") return next();
    if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) return next();
    res.sendFile(indexHtml, (err) => {
      // Not built yet (dist missing) → fall through to the JSON 404.
      if (err) next();
    });
  });

  // Fallbacks
  app.use(notFound);
  app.use(errorHandler);

  return app;
}

export default createApp;
