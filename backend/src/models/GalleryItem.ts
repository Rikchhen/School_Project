import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";

const galleryItemSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    caption: { type: String, default: "" },
    imageUrl: { type: String, required: true },
    album: {
      type: String,
      enum: ["campus", "events", "sports", "academics", "cultural", "general"],
      default: "general",
      index: true,
    },
    published: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export type GalleryItem = InferSchemaType<typeof galleryItemSchema>;
export type GalleryItemDoc = HydratedDocument<GalleryItem>;
export const GalleryItemModel = model<GalleryItem>("GalleryItem", galleryItemSchema);
