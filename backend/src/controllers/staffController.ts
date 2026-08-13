import type { Request, Response } from "express";
import { StaffMemberModel } from "../models/StaffMember";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";

export const listStaff = asyncHandler(async (req: Request, res: Response) => {
  const q = req.query as Record<string, string | undefined>;
  const filter: Record<string, unknown> = {};
  if (q.department) filter.department = q.department;
  if (q.published !== undefined) filter.published = q.published === "true";

  const staff = await StaffMemberModel.find(filter).sort({ order: 1, name: 1 });
  res.json({ success: true, items: staff });
});

export const getStaff = asyncHandler(async (req: Request, res: Response) => {
  const member = await StaffMemberModel.findById(req.params.id);
  if (!member) throw ApiError.notFound("Staff member not found");
  res.json({ success: true, member });
});

export const createStaff = asyncHandler(async (req: Request, res: Response) => {
  const member = await StaffMemberModel.create(req.body);
  res.status(201).json({ success: true, member });
});

export const updateStaff = asyncHandler(async (req: Request, res: Response) => {
  const member = await StaffMemberModel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!member) throw ApiError.notFound("Staff member not found");
  res.json({ success: true, member });
});

export const deleteStaff = asyncHandler(async (req: Request, res: Response) => {
  const member = await StaffMemberModel.findByIdAndDelete(req.params.id);
  if (!member) throw ApiError.notFound("Staff member not found");
  res.json({ success: true, message: "Staff member deleted" });
});
