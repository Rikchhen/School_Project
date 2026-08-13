import request from "supertest";
import type { Application } from "express";
import { AdminModel, hashPassword } from "../src/models/Admin";

export async function createTestAdmin(
  email = "admin@test.com",
  password = "Admin@12345",
  role: "admin" | "editor" = "admin"
) {
  return AdminModel.create({
    name: "Test Admin",
    email,
    passwordHash: await hashPassword(password),
    role,
  });
}

/**
 * Log in and return the auth cookie string(s) so subsequent requests can be
 * authenticated with `.set("Cookie", cookie)`.
 */
export async function loginAgent(
  app: Application,
  email = "admin@test.com",
  password = "Admin@12345"
): Promise<string[]> {
  const res = await request(app).post("/api/auth/login").send({ email, password });
  const setCookie = res.headers["set-cookie"];
  return Array.isArray(setCookie) ? setCookie : [setCookie].filter(Boolean) as string[];
}
