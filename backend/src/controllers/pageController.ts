import type { Request, Response } from "express";
import { PageModel } from "../models/Page";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";

export const listPages = asyncHandler(async (_req: Request, res: Response) => {
  const pages = await PageModel.find().sort({ slug: 1 });
  res.json({ success: true, items: pages });
});

export const getPageBySlug = asyncHandler(async (req: Request, res: Response) => {
  const page = await PageModel.findOne({ slug: String(req.params.slug).toLowerCase() });
  if (!page) throw ApiError.notFound("Page not found");
  res.json({ success: true, page });
});

/** Create or update a page by slug (admin). */
export const upsertPage = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as { slug: string } & Record<string, unknown>;
  const page = await PageModel.findOneAndUpdate(
    { slug: body.slug.toLowerCase() },
    body,
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );
  res.json({ success: true, page });
});

export const deletePage = asyncHandler(async (req: Request, res: Response) => {
  const page = await PageModel.findOneAndDelete({ slug: String(req.params.slug).toLowerCase() });
  if (!page) throw ApiError.notFound("Page not found");
  res.json({ success: true, message: "Page deleted" });
});
