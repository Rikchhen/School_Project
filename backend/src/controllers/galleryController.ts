import type { Request, Response } from "express";
import { GalleryItemModel } from "../models/GalleryItem";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { buildPaginated, getPageParams } from "../utils/pagination";

export const listGallery = asyncHandler(async (req: Request, res: Response) => {
  const q = req.query as Record<string, string | undefined>;
  const params = getPageParams(q, { limit: 24, maxLimit: 100 });

  const filter: Record<string, unknown> = {};
  if (q.album) filter.album = q.album;
  if (q.published !== undefined) filter.published = q.published === "true";

  const [items, total] = await Promise.all([
    GalleryItemModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(params.skip)
      .limit(params.limit),
    GalleryItemModel.countDocuments(filter),
  ]);

  res.json({ success: true, ...buildPaginated(items, total, params) });
});

export const createGalleryItem = asyncHandler(async (req: Request, res: Response) => {
  const item = await GalleryItemModel.create(req.body);
  res.status(201).json({ success: true, item });
});

export const updateGalleryItem = asyncHandler(async (req: Request, res: Response) => {
  const item = await GalleryItemModel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!item) throw ApiError.notFound("Gallery item not found");
  res.json({ success: true, item });
});

export const deleteGalleryItem = asyncHandler(async (req: Request, res: Response) => {
  const item = await GalleryItemModel.findByIdAndDelete(req.params.id);
  if (!item) throw ApiError.notFound("Gallery item not found");
  res.json({ success: true, message: "Gallery item deleted" });
});
