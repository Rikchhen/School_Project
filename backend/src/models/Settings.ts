import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";

/**
 * Site-wide singleton settings: social links, the donation-page visibility
 * toggle, and the animated hero banners. Exactly one document exists (key: "main").
 */
const bannerSchema = new Schema(
  {
    imageUrl: { type: String, default: "" },
    videoUrl: { type: String, default: "" },
    title: { type: String, default: "" },
    titleNe: { type: String, default: "" },
    subtitle: { type: String, default: "" },
    subtitleNe: { type: String, default: "" },
    ctaLabel: { type: String, default: "" },
    ctaLabelNe: { type: String, default: "" },
    ctaLink: { type: String, default: "" },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const settingsSchema = new Schema(
  {
    key: { type: String, default: "main", unique: true },
    socials: {
      facebook: { type: String, default: "" },
      instagram: { type: String, default: "" },
      youtube: { type: String, default: "" },
      twitter: { type: String, default: "" },
      tiktok: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      whatsapp: { type: String, default: "" },
    },
    donationEnabled: { type: Boolean, default: false },
    // Hero background image/video opacity (0–1). Admin-controlled; 1 = fully clear.
    heroOpacity: { type: Number, default: 1, min: 0, max: 1 },
    banners: { type: [bannerSchema], default: [] },

    // Full-screen interstitial ad / popup shown to public visitors. Admin can
    // set a poster image and/or text, an optional CTA, and how often it shows.
    interstitial: {
      enabled: { type: Boolean, default: false },
      imageUrl: { type: String, default: "" },
      videoUrl: { type: String, default: "" },
      title: { type: String, default: "" },
      titleNe: { type: String, default: "" },
      body: { type: String, default: "" },
      bodyNe: { type: String, default: "" },
      ctaLabel: { type: String, default: "" },
      ctaLabelNe: { type: String, default: "" },
      ctaLink: { type: String, default: "" },
      frequency: {
        type: String,
        enum: ["session", "daily", "always"],
        default: "session",
      },
    },

    // Slim announcement/top bar (admin-editable).
    announcement: {
      enabled: { type: Boolean, default: false },
      text: { type: String, default: "" },
      textNe: { type: String, default: "" },
      link: { type: String, default: "" },
      linkLabel: { type: String, default: "" },
      linkLabelNe: { type: String, default: "" },
    },

    // Editable "at a glance" stats (home stats band + hero cards).
    stats: {
      type: [
        new Schema(
          {
            value: { type: Number, default: 0 },
            suffix: { type: String, default: "" },
            label: { type: String, default: "" },
            labelNe: { type: String, default: "" },
          },
          { _id: false }
        ),
      ],
      default: [],
    },

    // Editable contact details (header top bar, footer, contact page).
    contact: {
      address: { type: String, default: "" },
      addressNe: { type: String, default: "" },
      phone: { type: String, default: "" },
      email: { type: String, default: "" },
      hours: { type: String, default: "" },
      hoursNe: { type: String, default: "" },
      mapUrl: { type: String, default: "" },
    },

    // Editable facilities shown on the About page.
    facilities: {
      type: [
        new Schema(
          {
            icon: { type: String, default: "library" },
            title: { type: String, default: "" },
            titleNe: { type: String, default: "" },
            desc: { type: String, default: "" },
            descNe: { type: String, default: "" },
          },
          { _id: false }
        ),
      ],
      default: [],
    },

    // Affiliations / partner logos.
    partners: {
      type: [
        new Schema(
          {
            name: { type: String, default: "" },
            logoUrl: { type: String, default: "" },
            url: { type: String, default: "" },
          },
          { _id: false }
        ),
      ],
      default: [],
    },
  },
  { timestamps: true }
);

export type Settings = InferSchemaType<typeof settingsSchema>;
export type SettingsDoc = HydratedDocument<Settings>;
export const SettingsModel = model<Settings>("Settings", settingsSchema);

/** Fetch the singleton settings doc, creating it with defaults if missing. */
export async function getOrCreateSettings(): Promise<SettingsDoc> {
  const existing = await SettingsModel.findOne({ key: "main" });
  if (existing) return existing;
  return SettingsModel.create({ key: "main" });
}
