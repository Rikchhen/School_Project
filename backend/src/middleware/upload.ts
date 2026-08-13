import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import multer from "multer";
import { ApiError } from "../utils/ApiError";

export const UPLOAD_DIR = path.resolve(process.cwd(), "uploads");

// Ensure the uploads directory exists at startup.
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = crypto.randomBytes(16).toString("hex");
    cb(null, `${Date.now()}-${base}${ext}`);
  },
});

const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime",
]);

export const upload = multer({
  storage,
  limits: { fileSize: 80 * 1024 * 1024 }, // 80 MB (allow short hero videos)
  fileFilter: (_req, file, cb) => {
    if (ALLOWED.has(file.mimetype)) return cb(null, true);
    cb(new ApiError(400, `Unsupported file type: ${file.mimetype}`));
  },
});

/** Build the public URL a stored upload is served from. */
export function fileToUrl(filename: string): string {
  return `/uploads/${filename}`;
}
