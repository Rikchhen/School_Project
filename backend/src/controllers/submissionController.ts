import type { Request, Response } from "express";
import { SubmissionModel } from "../models/Submission";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { buildPaginated, getPageParams } from "../utils/pagination";
import { PRIVATE_DONATION_DIR, UPLOAD_DIR } from "../middleware/upload";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import { env } from "../config/env";
import { writeAudit } from "../utils/audit";
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

/**
 * Public: donation verification. The donor uploads an ID/document (image or PDF,
 * field name `document`) with their name + contact BEFORE the payment QRs are
 * revealed on the site. The document lands in the admin inbox for review.
 */
export const createDonation = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw ApiError.badRequest("An ID / document file is required");
  const submission = await SubmissionModel.create({
    ...req.body,
    type: "donation",
    // Store only the server-generated filename. It is never mounted publicly.
    documentUrl: req.file.filename,
    documentName: req.file.originalname,
    documentMime: req.file.mimetype,
    documentEncrypted: true,
    documentExpiresAt: new Date(Date.now() + env.DONOR_RETENTION_DAYS * 86_400_000),
  });
  emitAdmins(SocketEvents.SUBMISSION_NEW, submission.toJSON());
  res
    .status(201)
    .json({ success: true, message: "Verified — you can now proceed to donate." });
});

/** Admin/editor only: stream a donor identity document from private storage. */
export const getDonationDocument = asyncHandler(async (req: Request, res: Response) => {
  const submission = await SubmissionModel.findById(req.params.id);
  if (!submission || submission.type !== "donation" || !submission.documentUrl) {
    throw ApiError.notFound("Donation document not found");
  }

  // New records contain a generated filename. Older records used /uploads/<file>.
  const filename = path.basename(submission.documentUrl);
  const privatePath = path.join(PRIVATE_DONATION_DIR, filename);
  const legacyPath = path.join(UPLOAD_DIR, filename);
  const filePath = fs.existsSync(privatePath) ? privatePath : legacyPath;
  if (!fs.existsSync(filePath)) throw ApiError.notFound("Donation document file not found");

  res.setHeader("Cache-Control", "private, no-store");
  res.setHeader("Content-Type", submission.documentMime || "application/octet-stream");
  res.setHeader("Content-Disposition", `inline; filename="${submission.documentName.replace(/["\r\n]/g, "_")}"`);
  await writeAudit(req, "donor_document.viewed", 200, { submissionId: submission.id });
  if (!submission.documentEncrypted) return res.sendFile(filePath);
  const encrypted = await fs.promises.readFile(filePath);
  if (encrypted.length < 29) throw ApiError.notFound("Donation document file is invalid");
  const key = crypto.createHash("sha256").update(env.DONOR_DOCUMENT_KEY || env.JWT_SECRET_TOKEN).digest();
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, encrypted.subarray(0, 12));
  decipher.setAuthTag(encrypted.subarray(12, 28));
  res.send(Buffer.concat([decipher.update(encrypted.subarray(28)), decipher.final()]));
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
  const body = (req.validated?.body ?? req.body) as {
    status?: string;
    reviewStatus?: "pending" | "approved" | "rejected";
    reviewNote?: string;
  };
  const update: Record<string, unknown> = {};
  if (body.status) update.status = body.status;
  if (body.reviewStatus) {
    update.reviewStatus = body.reviewStatus;
    update.reviewedAt = new Date();
    update.reviewedBy = req.admin!.id;
    update.status = "read";
  }
  if (body.reviewNote !== undefined) update.reviewNote = body.reviewNote;
  const submission = await SubmissionModel.findByIdAndUpdate(
    req.params.id,
    update,
    { returnDocument: "after" }
  );
  if (!submission) throw ApiError.notFound("Submission not found");
  res.json({ success: true, submission });
});

export const deleteSubmission = asyncHandler(async (req: Request, res: Response) => {
  const submission = await SubmissionModel.findByIdAndDelete(req.params.id);
  if (!submission) throw ApiError.notFound("Submission not found");
  if (submission.type === "donation" && submission.documentUrl) {
    const filename = path.basename(submission.documentUrl);
    await Promise.all([PRIVATE_DONATION_DIR, UPLOAD_DIR].map((dir) => fs.promises.unlink(path.join(dir, filename)).catch(() => undefined)));
  }
  res.json({ success: true, message: "Submission deleted" });
});
