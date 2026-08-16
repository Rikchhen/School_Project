import type { Request, Response } from "express";
import { SecurityAuditModel } from "../models/SecurityAudit";
import { AdminSessionModel } from "../models/AdminSession";
import { asyncHandler } from "../utils/asyncHandler";

export const listSecurityAudits = asyncHandler(async (req: Request, res: Response) => {
  const limit = Math.min(Number(req.query.limit) || 100, 200);
  const audits = await SecurityAuditModel.find().sort({ createdAt: -1 }).limit(limit).lean();
  res.json({ success: true, audits });
});

export const listSessions = asyncHandler(async (req: Request, res: Response) => {
  const sessions = await AdminSessionModel.find({ adminId: req.admin!.id, revokedAt: null, expiresAt: { $gt: new Date() } })
    .select("userAgent ip createdAt lastSeenAt expiresAt").sort({ createdAt: -1 }).lean();
  res.json({ success: true, sessions });
});
