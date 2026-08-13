import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";
import { createTestAdmin, loginAgent } from "./helpers";
import { NoticeModel } from "../src/models/Notice";

const app = createApp();

const sampleNotice = {
  title: "Exam schedule published",
  body: "The second terminal exam schedule is now available.",
  category: "academic",
  priority: "important",
} as const;

describe("Notices", () => {
  beforeEach(async () => {
    await createTestAdmin();
  });

  it("lists notices publicly (paginated shape)", async () => {
    await NoticeModel.create(sampleNotice);
    const res = await request(app).get("/api/notices");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items.length).toBe(1);
    expect(res.body).toHaveProperty("total", 1);
    expect(res.body).toHaveProperty("pages");
  });

  it("blocks creating a notice without auth", async () => {
    const res = await request(app).post("/api/notices").send(sampleNotice);
    expect(res.status).toBe(401);
  });

  it("validates the body when creating", async () => {
    const cookie = await loginAgent(app);
    const res = await request(app)
      .post("/api/notices")
      .set("Cookie", cookie)
      .send({ title: "x" }); // too short, missing body
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Validation failed");
  });

  it("creates, updates, and deletes a notice when authenticated", async () => {
    const cookie = await loginAgent(app);

    const created = await request(app)
      .post("/api/notices")
      .set("Cookie", cookie)
      .send(sampleNotice);
    expect(created.status).toBe(201);
    const id = created.body.notice._id;
    expect(id).toBeTruthy();

    const updated = await request(app)
      .put(`/api/notices/${id}`)
      .set("Cookie", cookie)
      .send({ priority: "urgent" });
    expect(updated.status).toBe(200);
    expect(updated.body.notice.priority).toBe("urgent");

    const deleted = await request(app)
      .delete(`/api/notices/${id}`)
      .set("Cookie", cookie);
    expect(deleted.status).toBe(200);

    const after = await request(app).get("/api/notices");
    expect(after.body.total).toBe(0);
  });

  it("filters by category", async () => {
    await NoticeModel.create(sampleNotice);
    await NoticeModel.create({ ...sampleNotice, category: "administrative" });
    const res = await request(app).get("/api/notices?category=administrative");
    expect(res.body.total).toBe(1);
    expect(res.body.items[0].category).toBe("administrative");
  });
});
