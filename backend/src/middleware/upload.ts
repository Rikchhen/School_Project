import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import multer from "multer";
import type { RequestHandler } from "express";
import { ApiError } from "../utils/ApiError";
import { env, isTest } from "../config/env";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

export const UPLOAD_DIR = path.resolve(process.cwd(), "uploads");
export const PRIVATE_DONATION_DIR = path.resolve(process.cwd(), "private-uploads", "donations");

// Ensure the uploads directory exists at startup.
fs.mkdirSync(UPLOAD_DIR, { recursive: true });
fs.mkdirSync(PRIVATE_DONATION_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = crypto.randomBytes(16).toString("hex");
    cb(null, `${Date.now()}-${base}${ext}`);
  },
});

const donationStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, PRIVATE_DONATION_DIR),
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

const ALLOWED_EXTENSIONS: Record<string, Set<string>> = {
  "image/jpeg": new Set([".jpg", ".jpeg"]),
  "image/png": new Set([".png"]),
  "image/webp": new Set([".webp"]),
  "image/gif": new Set([".gif"]),
  "application/pdf": new Set([".pdf"]),
  "video/mp4": new Set([".mp4"]),
  "video/webm": new Set([".webm"]),
  "video/ogg": new Set([".ogv", ".ogg"]),
  "video/quicktime": new Set([".mov"]),
};

const DONATION_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
]);

function validateDeclaredType(file: Express.Multer.File, allowedTypes = ALLOWED): ApiError | null {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowedTypes.has(file.mimetype)) {
    return new ApiError(400, `Unsupported file type: ${file.mimetype}`);
  }
  if (!ALLOWED_EXTENSIONS[file.mimetype]?.has(ext)) {
    return new ApiError(400, `File extension ${ext || "(none)"} does not match ${file.mimetype}`);
  }
  return null;
}

function fileFilter(allowedTypes = ALLOWED): multer.Options["fileFilter"] {
  return (_req, file, cb) => {
    const error = validateDeclaredType(file, allowedTypes);
    if (error) return cb(error);
    cb(null, true);
  };
}

export const upload = multer({
  storage,
  limits: { fileSize: 80 * 1024 * 1024 }, // 80 MB (allow short hero videos)
  fileFilter: fileFilter(),
});

/** Donation identity documents are kept outside the public static directory. */
export const donationUpload = multer({
  storage: donationStorage,
  limits: { fileSize: 80 * 1024 * 1024 },
  fileFilter: fileFilter(DONATION_TYPES),
});

function hasPrefix(bytes: Buffer, signature: number[]): boolean {
  return signature.every((value, index) => bytes[index] === value);
}

function matchesMagicBytes(file: Express.Multer.File, bytes: Buffer): boolean {
  switch (file.mimetype) {
    case "image/jpeg":
      return hasPrefix(bytes, [0xff, 0xd8, 0xff]);
    case "image/png":
      return hasPrefix(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    case "image/gif":
      return bytes.subarray(0, 6).toString("ascii") === "GIF87a" || bytes.subarray(0, 6).toString("ascii") === "GIF89a";
    case "image/webp":
      return bytes.subarray(0, 4).toString("ascii") === "RIFF" && bytes.subarray(8, 12).toString("ascii") === "WEBP";
    case "application/pdf":
      return bytes.subarray(0, 5).toString("ascii") === "%PDF-";
    case "video/mp4":
    case "video/quicktime":
      return bytes.subarray(4, 8).toString("ascii") === "ftyp";
    case "video/webm":
      return hasPrefix(bytes, [0x1a, 0x45, 0xdf, 0xa3]);
    case "video/ogg":
      return bytes.subarray(0, 4).toString("ascii") === "OggS";
    default:
      return false;
  }
}

/** Verify content signatures after Multer writes files, deleting any spoofed upload. */
export const verifyFileSignatures: RequestHandler = async (req, _res, next) => {
  const files = [
    ...(req.file ? [req.file] : []),
    ...(Array.isArray(req.files) ? req.files : []),
  ];

  try {
    for (const file of files) {
      const handle = await fs.promises.open(file.path, "r");
      const bytes = Buffer.alloc(16);
      try {
        await handle.read(bytes, 0, bytes.length, 0);
      } finally {
        await handle.close();
      }
      if (!matchesMagicBytes(file, bytes)) {
        throw ApiError.badRequest(`File content does not match ${file.mimetype}`);
      }
    }
    next();
  } catch (error) {
    await Promise.all(files.map((file) => fs.promises.unlink(file.path).catch(() => undefined)));
    next(error);
  }
};

const execFileAsync = promisify(execFile);
export const scanFilesForMalware: RequestHandler = async (req, _res, next) => {
  if (!env.CLAMAV_ENABLED || isTest) return next();
  const files = [...(req.file ? [req.file] : []), ...(Array.isArray(req.files) ? req.files : [])];
  try {
    for (const file of files) await execFileAsync(env.CLAMAV_COMMAND, ["--no-summary", file.path], { timeout: 60_000, windowsHide: true });
    next();
  } catch (error) {
    await Promise.all(files.map((file) => fs.promises.unlink(file.path).catch(() => undefined)));
    next(new ApiError(400, "Upload rejected by malware scanner"));
  }
};

export const encryptDonationDocument: RequestHandler = async (req, _res, next) => {
  if (!req.file) return next();
  try {
    const keyMaterial = env.DONOR_DOCUMENT_KEY || env.JWT_SECRET_TOKEN;
    const key = crypto.createHash("sha256").update(keyMaterial).digest();
    const iv = crypto.randomBytes(12);
    const plaintext = await fs.promises.readFile(req.file.path);
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
    const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
    const encrypted = Buffer.concat([iv, cipher.getAuthTag(), ciphertext]);
    const encryptedPath = `${req.file.path}.enc`;
    await fs.promises.writeFile(encryptedPath, encrypted, { mode: 0o600 });
    await fs.promises.unlink(req.file.path);
    req.file.path = encryptedPath; req.file.filename = `${req.file.filename}.enc`;
    next();
  } catch (error) { next(error); }
};

/** Build the public URL a stored upload is served from. */
export function fileToUrl(filename: string): string {
  return `/uploads/${filename}`;
}
