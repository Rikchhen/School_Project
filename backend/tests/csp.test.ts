import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app";

describe("content security policy", () => {
  it("allows local blob image previews used by the admin cropper", async () => {
    const response = await request(createApp()).get("/api/health");
    expect(response.headers["content-security-policy"]).toContain("img-src 'self' data: blob: https:");
  });
});
