import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";

const eventSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    titleNe: { type: String, trim: true, default: "" },
    description: { type: String, required: true },
    descriptionNe: { type: String, default: "" },
    category: {
      type: String,
      enum: ["academic", "sports", "cultural", "notice", "general"],
      default: "general",
      index: true,
    },
    startDate: { type: Date, required: true, index: true },
    endDate: { type: Date },
    location: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    images: { type: [String], default: [] },
    featured: { type: Boolean, default: false },
    published: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export type Event = InferSchemaType<typeof eventSchema>;
export type EventDoc = HydratedDocument<Event>;
export const EventModel = model<Event>("Event", eventSchema);
