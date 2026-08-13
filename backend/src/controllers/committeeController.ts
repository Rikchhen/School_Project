import type { Request, Response } from "express";
import { CommitteeMemberModel } from "../models/CommitteeMember";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";

export const listCommittee = asyncHandler(async (req: Request, res: Response) => {
  const q = req.query as Record<string, string | undefined>;
  const filter: Record<string, unknown> = {};
  if (q.published !== undefined) filter.published = q.published === "true";
  const items = await CommitteeMemberModel.find(filter).sort({ order: 1, name: 1 });
  res.json({ success: true, items });
});

export const createCommittee = asyncHandler(async (req: Request, res: Response) => {
  const member = await CommitteeMemberModel.create(req.body);
  res.status(201).json({ success: true, member });
});

export const updateCommittee = asyncHandler(async (req: Request, res: Response) => {
  const member = await CommitteeMemberModel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!member) throw ApiError.notFound("Committee member not found");
  res.json({ success: true, member });
});

export const deleteCommittee = asyncHandler(async (req: Request, res: Response) => {
  const member = await CommitteeMemberModel.findByIdAndDelete(req.params.id);
  if (!member) throw ApiError.notFound("Committee member not found");
  res.json({ success: true, message: "Committee member deleted" });
});
