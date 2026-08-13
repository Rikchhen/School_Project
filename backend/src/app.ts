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

export function createApp(): Application {
  const app = express();

  // Security headers. Allow uploaded images to be embedded by the frontend
  // origin (different port) by relaxing the cross-origin resource policy.
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
    })
  );

  app.use(
    cors({
      origin: env.CLIENT_URL,
      credentials: true,
    })
  );

  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  if (!isProd && !isTest) {
    app.use(morgan("dev"));
  }

  // Serve uploaded files statically.
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
