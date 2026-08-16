import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";
import { createTestAdmin, loginAgent } from "./helpers";
import { PRIVATE_DONATION_DIR } from "../src/middleware/upload";
import fs from "node:fs";
import path from "node:path";

const app = createApp();

describe("Submissions", () => {
  beforeEach(async () => {
    await createTestAdmin();
  });

  it("accepts a valid public contact submission", async () => {
    const res = await request(app).post("/api/submissions/contact").send({
      name: "Ram Bahadur",
      email: "ram@example.com",
      message: "I would like more information about admissions.",
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it("rejects an invalid contact submission", async () => {
    const res = await request(app)
      .post("/api/submissions/contact")
      .send({ name: "R", email: "bad", message: "hi" });
    expect(res.status).toBe(400);
  });

  it("keeps the inbox private", async () => {
    const res = await request(app).get("/api/submissions");
    expect(res.status).toBe(401);
  });

  it("keeps donor documents private and lets an admin retrieve them", async () => {
    // Minimal PNG signature is sufficient for upload signature validation.
    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0, 0, 0, 0, 0]);
    const created = await request(app)
      .post("/api/submissions/donation")
      .field("name", "Donor Person")
      .field("email", "donor@example.com")
      .attach("document", png, { filename: "identity.png", contentType: "image/png" });
    expect(created.status).toBe(201);

    const cookie = await loginAgent(app);
    const list = await request(app).get("/api/submissions?type=donation").set("Cookie", cookie);
    const donation = list.body.items[0];
    expect(donation.documentUrl).not.toContain("/uploads/");

    const denied = await request(app).get(`/api/submissions/${donation._id}/document`);
    expect(denied.status).toBe(401);

    const allowed = await request(app)
      .get(`/api/submissions/${donation._id}/document`)
      .set("Cookie", cookie);
    expect(allowed.status).toBe(200);
    expect(allowed.headers["cache-control"]).toBe("private, no-store");

    await fs.promises.unlink(path.join(PRIVATE_DONATION_DIR, donation.documentUrl));
  });

  it("rejects a file whose bytes do not match its declared image type", async () => {
    const res = await request(app)
      .post("/api/submissions/donation")
      .field("name", "Donor Person")
      .field("email", "donor@example.com")
      .attach("document", Buffer.from("not an image"), { filename: "identity.png", contentType: "image/png" });
    expect(res.status).toBe(400);
  });

  it("lets an admin read and update the inbox", async () => {
    await request(app).post("/api/submissions/admission").send({
      name: "Sita Kumari",
      email: "sita@example.com",
      studentName: "Gita Kumari",
      gradeApplyingFor: "11",
      message: "Applying for Grade 11 Science.",
    });

    const cookie = await loginAgent(app);
    const list = await request(app).get("/api/submissions").set("Cookie", cookie);
    expect(list.status).toBe(200);
    expect(list.body.total).toBe(1);
    expect(list.body.items[0].type).toBe("admission");

    const id = list.body.items[0]._id;
    const patched = await request(app)
      .patch(`/api/submissions/${id}`)
      .set("Cookie", cookie)
      .send({ status: "read" });
    expect(patched.status).toBe(200);
    expect(patched.body.submission.status).toBe("read");
  });
});
