import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";
import { SyllabusModel } from "../src/models/Syllabus";

const app = createApp();

describe("Syllabus", () => {
  it("filters published syllabi by stream", async () => {
    await SyllabusModel.create([
      { title: "Physics", grade: "Class 12", subject: "Physics", stream: "science", published: true },
      { title: "Accounts", grade: "Class 12", subject: "Accountancy", stream: "management", published: true },
      { title: "Draft Biology", grade: "Class 11", subject: "Biology", stream: "science", published: false },
    ]);
    const response = await request(app).get("/api/syllabus?published=true&stream=science");
    expect(response.status).toBe(200);
    expect(response.body.items).toHaveLength(1);
    expect(response.body.items[0]).toMatchObject({ title: "Physics", stream: "science", published: true });
  });

  it("can combine grade and stream filters", async () => {
    await SyllabusModel.create([
      { title: "Eleven", grade: "Class 11", subject: "Physics", stream: "science" },
      { title: "Twelve", grade: "Class 12", subject: "Physics", stream: "science" },
    ]);
    const response = await request(app).get("/api/syllabus?stream=science&grade=Class%2012");
    expect(response.body.items.map((item: { title: string }) => item.title)).toEqual(["Twelve"]);
  });
});
