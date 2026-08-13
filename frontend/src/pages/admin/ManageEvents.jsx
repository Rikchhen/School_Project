import { ResourceManager } from "../../components/admin/ResourceManager";
import { Badge } from "../../components/ui/Badge";

const config = {
  title: "Events",
  endpoint: "/events",
  defaults: { category: "general", featured: false, published: true, titleNe: "", descriptionNe: "", location: "", imageUrl: "", images: [] },
  columns: [
    { key: "title", label: "Title", render: (r) => <strong>{r.title}</strong> },
    { key: "category", label: "Category", render: (r) => <Badge $tone="secondary">{r.category}</Badge> },
    { key: "startDate", label: "Date", render: (r) => new Date(r.startDate).toLocaleDateString() },
    { key: "featured", label: "Featured", render: (r) => (r.featured ? "★" : "—") },
    { key: "published", label: "Live", render: (r) => (r.published ? "✓" : "—") },
  ],
  fields: [
    { name: "title", label: "Title (English)", type: "text", required: true, full: true },
    { name: "titleNe", label: "Title (Nepali)", type: "text", full: true },
    { name: "description", label: "Description (English)", type: "richtext", required: true, full: true },
    { name: "descriptionNe", label: "Description (Nepali)", type: "richtext", full: true },
    { name: "category", label: "Category", type: "select", options: ["general", "academic", "sports", "cultural", "notice"] },
    { name: "startDate", label: "Start date", type: "date", required: true },
    { name: "endDate", label: "End date", type: "date" },
    { name: "location", label: "Location", type: "text" },
    { name: "imageUrl", label: "Cover image", type: "image" },
    { name: "images", label: "More images", type: "images", full: true },
    { name: "featured", label: "Featured event", type: "checkbox" },
    { name: "published", label: "Published (broadcast live)", type: "checkbox" },
  ],
};

export function ManageEvents() {
  return <ResourceManager config={config} />;
}
export default ManageEvents;
