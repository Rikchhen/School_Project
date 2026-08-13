import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";
import { createTestAdmin, loginAgent } from "./helpers";

const app = createApp();

describe("Auth", () => {
  beforeEach(async () => {
    await createTestAdmin();
  });

  it("rejects invalid credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@test.com", password: "wrong" });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("rejects malformed body via zod", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "not-an-email" });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Validation failed");
  });

  it("logs in and sets an httpOnly cookie", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@test.com", password: "Admin@12345" });
    expect(res.status).toBe(200);
    expect(res.body.admin.email).toBe("admin@test.com");
    expect(res.body.admin.passwordHash).toBeUndefined();

    const cookie = res.headers["set-cookie"][0];
    expect(cookie).toMatch(/adarsha_token=/);
    expect(cookie.toLowerCase()).toContain("httponly");
  });

  it("returns the current admin from /me when authenticated", async () => {
    const cookie = await loginAgent(app);
    const res = await request(app).get("/api/auth/me").set("Cookie", cookie);
    expect(res.status).toBe(200);
    expect(res.body.admin.email).toBe("admin@test.com");
  });

  it("blocks /me without a cookie", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });
});
