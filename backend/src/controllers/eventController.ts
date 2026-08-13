import type { Request, Response } from "express";
import { EventModel } from "../models/Event";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { buildPaginated, getPageParams } from "../utils/pagination";
import { emitPublic, SocketEvents } from "../sockets";

export const listEvents = asyncHandler(async (req: Request, res: Response) => {
  const q = (req.validated?.query ?? req.query) as Record<string, string | undefined>;
  const params = getPageParams(q, { limit: 12 });

  const filter: Record<string, unknown> = {};
  if (q.category) filter.category = q.category;
  if (q.featured !== undefined) filter.featured = q.featured === "true";
  if (q.upcoming === "true") filter.startDate = { $gte: new Date() };

  const [items, total] = await Promise.all([
    EventModel.find(filter)
      .sort({ startDate: q.upcoming === "true" ? 1 : -1 })
      .skip(params.skip)
      .limit(params.limit),
    EventModel.countDocuments(filter),
  ]);

  res.json({ success: true, ...buildPaginated(items, total, params) });
});

export const getEvent = asyncHandler(async (req: Request, res: Response) => {
  const event = await EventModel.findById(req.params.id);
  if (!event) throw ApiError.notFound("Event not found");
  res.json({ success: true, event });
});

export const createEvent = asyncHandler(async (req: Request, res: Response) => {
  const event = await EventModel.create(req.body);
  if (event.published) {
    emitPublic(SocketEvents.EVENT_NEW, event.toJSON());
  }
  res.status(201).json({ success: true, event });
});

export const updateEvent = asyncHandler(async (req: Request, res: Response) => {
  const event = await EventModel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!event) throw ApiError.notFound("Event not found");
  emitPublic(SocketEvents.EVENT_UPDATED, event.toJSON());
  res.json({ success: true, event });
});

export const deleteEvent = asyncHandler(async (req: Request, res: Response) => {
  const event = await EventModel.findByIdAndDelete(req.params.id);
  if (!event) throw ApiError.notFound("Event not found");
  emitPublic(SocketEvents.EVENT_DELETED, { id: event.id });
  res.json({ success: true, message: "Event deleted" });
});
