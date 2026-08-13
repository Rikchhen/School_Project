import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env";

export interface JwtPayload {
  id: string;
  role: "admin" | "editor";
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET_TOKEN, {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
  });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET_TOKEN) as JwtPayload;
}
