import type { Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { fileToUrl } from "../middleware/upload";

/**
 * Admin: accept a single file (image or PDF) and return its public URL.
 * The frontend then stores that URL on a notice/staff/gallery record.
 */
export const uploadFile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw ApiError.badRequest("No file provided (field name: 'file')");
  res.status(201).json({
    success: true,
    url: fileToUrl(req.file.filename),
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
  res.status(201).json({
    success: true,
    files: files.map((f) => ({
      url: fileToUrl(f.filename),
      originalName: f.originalname,
      size: f.size,
      mimeType: f.mimetype,
    })),
    urls: files.map((f) => fileToUrl(f.filename)),
  });
});
