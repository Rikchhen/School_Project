import { ResourceManager } from "../../components/admin/ResourceManager";
import { Badge } from "../../components/ui/Badge";

const config = {
  title: "Notices",
  endpoint: "/notices",
  listParams: {},
  defaults: { category: "general", priority: "normal", published: true, titleNe: "", bodyNe: "", attachmentUrl: "", imageUrl: "", images: [] },
  columns: [
    { key: "title", label: "Title", render: (r) => <strong>{r.title}</strong> },
    { key: "category", label: "Category", render: (r) => <Badge $tone="secondary">{r.category}</Badge> },
    { key: "priority", label: "Priority", render: (r) => (
      <Badge $tone={r.priority === "urgent" ? "danger" : r.priority === "important" ? "warning" : "neutral"}>{r.priority}</Badge>
    ) },
    { key: "published", label: "Live", render: (r) => (r.published ? "✓" : "—") },
    { key: "createdAt", label: "Date", render: (r) => new Date(r.publishedAt || r.createdAt).toLocaleDateString() },
  ],
  fields: [
    { name: "title", label: "Title (English)", type: "text", required: true, full: true },
    { name: "titleNe", label: "Title (Nepali)", type: "text", full: true },
    { name: "body", label: "Body (English)", type: "richtext", required: true, full: true },
    { name: "bodyNe", label: "Body (Nepali)", type: "richtext", full: true },
    { name: "category", label: "Category", type: "select", options: ["general", "academic", "administrative"] },
    { name: "priority", label: "Priority", type: "select", options: ["normal", "important", "urgent"] },
    { name: "attachmentUrl", label: "Attachment (PDF)", type: "pdf", full: true, help: "Optional — adds a Download PDF button on the public notice." },
    { name: "imageUrl", label: "Cover image (PNG/JPG)", type: "image", full: true, help: "Optional — croppable cover image shown on the notice." },
    { name: "images", label: "More images", type: "images", full: true, help: "Optional — attach multiple photos to this notice." },
    { name: "published", label: "Published (broadcast live)", type: "checkbox", full: true },
  ],
};

export function ManageNotices() {
  return <ResourceManager config={config} />;
}
export default ManageNotices;
