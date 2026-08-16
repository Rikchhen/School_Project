import type { Request } from "express";
import { SecurityAuditModel } from "../models/SecurityAudit";

export async function writeAudit(req: Request, event: string, status: number, metadata: Record<string, unknown> = {}) {
  try {
    await SecurityAuditModel.create({ actorId: req.admin?.id ?? null, event, method: req.method,
      path: req.originalUrl.split("?")[0], status, ip: req.ip,
      userAgent: String(req.get("user-agent") ?? "").slice(0, 500), metadata });
  } catch (error) {
    if (process.env.NODE_ENV !== "test") console.error("Security audit write failed", error);
  }
}
