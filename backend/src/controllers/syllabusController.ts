import type { Request, Response } from "express";
import { SyllabusModel } from "../models/Syllabus";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";

export const listSyllabi = asyncHandler(async (req: Request, res: Response) => {
  const published = req.query.published;
  const filter: Record<string, unknown> = published === undefined ? {} : { published: published === "true" };
  if (typeof req.query.stream === "string") filter.stream = req.query.stream;
  if (typeof req.query.grade === "string") filter.grade = req.query.grade;
  const items = await SyllabusModel.find(filter).sort({ order: 1, grade: 1, subject: 1 });
  res.json({ success: true, items });
});
export const createSyllabus = asyncHandler(async (req: Request, res: Response) => {
  const syllabus = await SyllabusModel.create(req.body);
  res.status(201).json({ success: true, syllabus });
});
export const updateSyllabus = asyncHandler(async (req: Request, res: Response) => {
  const syllabus = await SyllabusModel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!syllabus) throw ApiError.notFound("Syllabus not found");
  res.json({ success: true, syllabus });
});
export const deleteSyllabus = asyncHandler(async (req: Request, res: Response) => {
  const syllabus = await SyllabusModel.findByIdAndDelete(req.params.id);
  if (!syllabus) throw ApiError.notFound("Syllabus not found");
  res.json({ success: true, message: "Syllabus deleted" });
});
