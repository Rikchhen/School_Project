import type { Request, Response } from "express";
import { SubmissionModel } from "../models/Submission";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { buildPaginated, getPageParams } from "../utils/pagination";
import { emitAdmins, SocketEvents } from "../sockets";

/** Public: contact form. */
export const createContact = asyncHandler(async (req: Request, res: Response) => {
  const submission = await SubmissionModel.create({ ...req.body, type: "contact" });
  emitAdmins(SocketEvents.SUBMISSION_NEW, submission.toJSON());
  res
    .status(201)
    .json({ success: true, message: "Thank you — your message has been received." });
});

/** Public: admissions enquiry/application. */
export const createAdmission = asyncHandler(async (req: Request, res: Response) => {
  const submission = await SubmissionModel.create({ ...req.body, type: "admission" });
  emitAdmins(SocketEvents.SUBMISSION_NEW, submission.toJSON());
  res
    .status(201)
    .json({ success: true, message: "Thank you — your enquiry has been received." });
});

/** Admin: inbox list. */
export const listSubmissions = asyncHandler(async (req: Request, res: Response) => {
  const q = (req.validated?.query ?? req.query) as Record<string, string | undefined>;
  const params = getPageParams(q, { limit: 20 });

  const filter: Record<string, unknown> = {};
  if (q.type) filter.type = q.type;
  if (q.status) filter.status = q.status;

  const [items, total] = await Promise.all([
    SubmissionModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(params.skip)
      .limit(params.limit),
    SubmissionModel.countDocuments(filter),
  ]);

  res.json({ success: true, ...buildPaginated(items, total, params) });
});

export const updateSubmission = asyncHandler(async (req: Request, res: Response) => {
  const submission = await SubmissionModel.findByIdAndUpdate(
    req.params.id,
    { status: (req.body as { status: string }).status },
    { new: true }
  );
  if (!submission) throw ApiError.notFound("Submission not found");
  res.json({ success: true, submission });
});

export const deleteSubmission = asyncHandler(async (req: Request, res: Response) => {
  const submission = await SubmissionModel.findByIdAndDelete(req.params.id);
  if (!submission) throw ApiError.notFound("Submission not found");
  res.json({ success: true, message: "Submission deleted" });
});
