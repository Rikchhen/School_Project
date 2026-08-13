import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";

/**
 * Editable page content ("pages/text"). Each document is keyed by a unique
 * `slug` (e.g. "about", "home-mission") and holds arbitrary structured content
 * plus bilingual title fields, so admins can edit site copy without a deploy.
 */
const pageSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    title: { type: String, required: true, trim: true },
    titleNe: { type: String, default: "" },
    body: { type: String, default: "" },
    bodyNe: { type: String, default: "" },
    // Free-form key/value blocks for structured sections (mission, vision, etc.)
    content: { type: Schema.Types.Mixed, default: {} },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export type Page = InferSchemaType<typeof pageSchema>;
export type PageDoc = HydratedDocument<Page>;
export const PageModel = model<Page>("Page", pageSchema);
