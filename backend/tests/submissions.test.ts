import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";
import { createTestAdmin, loginAgent } from "./helpers";

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
