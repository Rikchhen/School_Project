import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";
import { createTestAdmin, loginAgent } from "./helpers";

const app = createApp();

describe("Settings navigation", () => {
  beforeEach(async () => { await createTestAdmin(); });

  it("persists ordered navigation items and nested children", async () => {
    const cookie = await loginAgent(app);
    const navigation = [
      { label: "Home", labelNe: "गृह", url: "/", external: false, children: [] },
      { label: "Learning", labelNe: "सिकाइ", url: "", external: false, children: [
        { label: "Custom page", labelNe: "विशेष पृष्ठ", url: "/page/custom", external: false },
        { label: "Partner", labelNe: "साझेदार", url: "https://example.com", external: true },
      ] },
    ];
    const updated = await request(app).put("/api/settings").set("Cookie", cookie).send({ navigation });
    expect(updated.status).toBe(200);
    expect(updated.body.settings.navigation).toEqual(navigation);

    const fetched = await request(app).get("/api/settings");
    expect(fetched.status).toBe(200);
    expect(fetched.body.settings.navigation[1].children[1]).toMatchObject({ url: "https://example.com", external: true });
  });

  it("persists partial header branding settings", async () => {
    const cookie = await loginAgent(app);
    const branding = {
      logoUrl: "/uploads/school-logo.png", logoHeight: 72, showLogoRing: false,
      schoolName: '<strong style="color: #b90035; font-size: 24px">Adarsha School</strong>',
      schoolNameNe: "", tagline: '<span style="font-size: 14px">Lalgadh, Dhanusha</span>', taglineNe: "",
    };
    const updated = await request(app).put("/api/settings").set("Cookie", cookie).send({ branding });
    expect(updated.status).toBe(200);
    expect(updated.body.settings.branding).toMatchObject(branding);

    const fetched = await request(app).get("/api/settings");
    expect(fetched.body.settings.branding).toMatchObject(branding);
  });
});
