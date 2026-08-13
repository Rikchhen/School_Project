import type { Request, Response } from "express";
import { ProgramModel } from "../models/Program";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";

export const listPrograms = asyncHandler(async (req: Request, res: Response) => {
  const q = req.query as Record<string, string | undefined>;
  const filter: Record<string, unknown> = {};
  if (q.published !== undefined) filter.published = q.published === "true";
  if (q.category) filter.category = q.category;
  const items = await ProgramModel.find(filter).sort({ order: 1, name: 1 });
  res.json({ success: true, items });
});

export const createProgram = asyncHandler(async (req: Request, res: Response) => {
  const program = await ProgramModel.create(req.body);
  res.status(201).json({ success: true, program });
});

export const updateProgram = asyncHandler(async (req: Request, res: Response) => {
  const program = await ProgramModel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!program) throw ApiError.notFound("Program not found");
  res.json({ success: true, program });
});

export const deleteProgram = asyncHandler(async (req: Request, res: Response) => {
  const program = await ProgramModel.findByIdAndDelete(req.params.id);
  if (!program) throw ApiError.notFound("Program not found");
  res.json({ success: true, message: "Program deleted" });
});
