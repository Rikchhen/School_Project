import type { Request, Response } from "express";
import { getOrCreateSettings, SettingsModel } from "../models/Settings";
import { asyncHandler } from "../utils/asyncHandler";

/** Public: read site settings (socials, donation toggle, banners). */
export const getSettings = asyncHandler(async (_req: Request, res: Response) => {
  const settings = await getOrCreateSettings();
  res.json({ success: true, settings });
});

/** Admin: update settings (partial). */
export const updateSettings = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as Record<string, unknown>;
  const current = await getOrCreateSettings();

  if (body.socials) {
    current.set("socials", { ...(current.socials as object), ...(body.socials as object) });
  }
  if (typeof body.donationEnabled === "boolean") {
    current.donationEnabled = body.donationEnabled;
  }
  if (typeof body.heroOpacity === "number") {
    current.heroOpacity = body.heroOpacity;
  }
  if (Array.isArray(body.banners)) {
    current.banners = body.banners as never;
  }
  if (body.interstitial) {
    current.set("interstitial", {
      ...(current.interstitial as object),
      ...(body.interstitial as object),
    });
  }
  if (body.announcement) {
    current.set("announcement", {
      ...(current.announcement as object),
      ...(body.announcement as object),
    });
  }
  if (Array.isArray(body.partners)) {
    current.partners = body.partners as never;
  }
  if (Array.isArray(body.stats)) {
    current.stats = body.stats as never;
  }
  if (Array.isArray(body.facilities)) {
    current.facilities = body.facilities as never;
  }
  if (body.contact) {
    current.set("contact", { ...(current.contact as object), ...(body.contact as object) });
  }
  await current.save();
  res.json({ success: true, settings: current });
});

export { SettingsModel };
