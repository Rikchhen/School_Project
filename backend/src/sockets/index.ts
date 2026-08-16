import type { Server as HttpServer } from "node:http";
import { Server, type Socket } from "socket.io";
import { env } from "../config/env";
import { verifyToken } from "../utils/jwt";
import { AdminSessionModel } from "../models/AdminSession";

let io: Server | null = null;

/** Minimal cookie-header parser (avoids an extra dependency in socket land). */
function parseCookies(header?: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    if (key) out[key] = decodeURIComponent(val);
  }
  return out;
}

/**
 * Socket.io event names shared with the frontend.
 * Public clients receive `notice:new` / `event:new` to power the live board.
 */
export const SocketEvents = {
  NOTICE_NEW: "notice:new",
  NOTICE_UPDATED: "notice:updated",
  NOTICE_DELETED: "notice:deleted",
  EVENT_NEW: "event:new",
  EVENT_UPDATED: "event:updated",
  EVENT_DELETED: "event:deleted",
  SUBMISSION_NEW: "submission:new",
} as const;

export function initSocket(server: HttpServer): Server {
  io = new Server(server, {
    cors: { origin: env.CLIENT_URL, credentials: true },
  });

  // Optional auth: admins joining the "admin" room get submission alerts.
  // Public visitors connect anonymously and only receive public broadcasts.
  io.on("connection", async (socket: Socket) => {
    try {
      const raw = socket.handshake.headers.cookie;
      if (raw) {
        const parsed = parseCookies(raw);
        const token = parsed[env.COOKIE_NAME];
        if (token) {
          const payload = verifyToken(token);
          const session = await AdminSessionModel.exists({ _id: payload.sid, adminId: payload.id, revokedAt: null, expiresAt: { $gt: new Date() } });
          if (session) socket.join("admins");
        }
      }
    } catch {
      // Not an admin — remain in the default (public) broadcast scope.
    }
  });

  return io;
}

/** Broadcast to every connected client (public board). */
export function emitPublic(event: string, payload: unknown): void {
  io?.emit(event, payload);
}

/** Broadcast only to authenticated admins (e.g. new submissions). */
export function emitAdmins(event: string, payload: unknown): void {
  io?.to("admins").emit(event, payload);
}

export function getIO(): Server | null {
  return io;
}
