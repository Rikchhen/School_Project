import fs from "node:fs/promises";
import type { Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { fileToUrl } from "../middleware/upload";
import { isCloudinaryEnabled, uploadLocalFileToCloudinary } from "../config/cloudinary";

/**
 * Resolve the permanent public URL for an uploaded file. When Cloudinary is
 * configured, the (already signature-verified) temp file is uploaded there and
 * its https URL returned, then the local temp copy is removed. Otherwise the
 * file is served locally from /uploads (unchanged local-dev behaviour).
 */
async function publicUrlFor(file: Express.Multer.File): Promise<string> {
  if (isCloudinaryEnabled()) {
    const url = await uploadLocalFileToCloudinary(file.path, file.mimetype);
    await fs.unlink(file.path).catch(() => undefined);
    return url;
  }
  return fileToUrl(file.filename);
}

/**
 * Admin: accept a single file (image, video or PDF) and return its public URL.
 * The frontend then stores that URL on a notice/staff/gallery/banner record.
 */
export const uploadFile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw ApiError.badRequest("No file provided (field name: 'file')");
  res.status(201).json({
    success: true,
    url: await publicUrlFor(req.file),
    originalName: req.file.originalname,
    size: req.file.size,
    mimeType: req.file.mimetype,
  });
});

/**
 * Admin: accept up to 12 files at once (field name: "files") and return their
 * public URLs — powers multi-image upload in the admin (gallery, banners, …).
 */
export const uploadFiles = asyncHandler(async (req: Request, res: Response) => {
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  if (!files.length) throw ApiError.badRequest("No files provided (field name: 'files')");
  const urls = await Promise.all(files.map((f) => publicUrlFor(f)));
  res.status(201).json({
    success: true,
    files: files.map((f, i) => ({
      url: urls[i],
      originalName: f.originalname,
      size: f.size,
      mimeType: f.mimetype,
    })),
    urls,
  });
});
