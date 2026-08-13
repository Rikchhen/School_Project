import type { Request, Response } from "express";
import { NoticeModel } from "../models/Notice";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { buildPaginated, getPageParams } from "../utils/pagination";
import { emitPublic, SocketEvents } from "../sockets";

export const listNotices = asyncHandler(async (req: Request, res: Response) => {
  const q = (req.validated?.query ?? req.query) as Record<string, string | undefined>;
  const params = getPageParams(q, { limit: 10 });

  const filter: Record<string, unknown> = {};
  if (q.category) filter.category = q.category;
  if (q.published !== undefined) filter.published = q.published === "true";
  if (q.search) filter.$text = { $search: q.search };

  const [items, total] = await Promise.all([
    NoticeModel.find(filter)
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip(params.skip)
      .limit(params.limit),
    NoticeModel.countDocuments(filter),
  ]);

  res.json({ success: true, ...buildPaginated(items, total, params) });
});

export const getNotice = asyncHandler(async (req: Request, res: Response) => {
  const notice = await NoticeModel.findById(req.params.id);
  if (!notice) throw ApiError.notFound("Notice not found");
  res.json({ success: true, notice });
});

export const createNotice = asyncHandler(async (req: Request, res: Response) => {
  const notice = await NoticeModel.create(req.body);
  if (notice.published) {
    emitPublic(SocketEvents.NOTICE_NEW, notice.toJSON());
  }
  res.status(201).json({ success: true, notice });
});

export const updateNotice = asyncHandler(async (req: Request, res: Response) => {
  const notice = await NoticeModel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!notice) throw ApiError.notFound("Notice not found");
  emitPublic(SocketEvents.NOTICE_UPDATED, notice.toJSON());
  res.json({ success: true, notice });
});

export const deleteNotice = asyncHandler(async (req: Request, res: Response) => {
  const notice = await NoticeModel.findByIdAndDelete(req.params.id);
  if (!notice) throw ApiError.notFound("Notice not found");
  emitPublic(SocketEvents.NOTICE_DELETED, { id: notice.id });
  res.json({ success: true, message: "Notice deleted" });
});
