import { ResourceManager } from "../../components/admin/ResourceManager";
import { Badge } from "../../components/ui/Badge";

const config = {
  title: "Programs",
  endpoint: "/programs",
  defaults: { category: "general", accent: "primary", order: 0, published: true, nameNe: "", descriptionNe: "", imageUrl: "", coreSubjects: [], keyAreas: [] },
  columns: [
    { key: "name", label: "Program", render: (r) => <strong>{r.name}</strong> },
    { key: "category", label: "Category", render: (r) => <Badge $tone="secondary">{r.category}</Badge> },
    { key: "order", label: "Order" },
    { key: "published", label: "Live", render: (r) => (r.published ? "✓" : "—") },
  ],
  fields: [
    { name: "name", label: "Name (English)", type: "text", required: true },
    { name: "nameNe", label: "Name (Nepali)", type: "text" },
    { name: "category", label: "Category", type: "select", options: ["science", "management", "humanities", "general"] },
    { name: "accent", label: "Accent colour", type: "select", options: [{ value: "primary", label: "Crimson" }, { value: "secondary", label: "Blue" }] },
    { name: "order", label: "Sort order", type: "number" },
    { name: "description", label: "Description (English)", type: "richtext", full: true },
    { name: "descriptionNe", label: "Description (Nepali)", type: "richtext", full: true },
    { name: "imageUrl", label: "Cover image", type: "image", full: true },
    { name: "coreSubjects", label: "Core subjects", type: "csv", full: true, help: "Shown as chips. Comma-separated." },
    { name: "keyAreas", label: "Key areas", type: "csv", full: true, help: "Shown as a bullet list. Comma-separated." },
    { name: "published", label: "Published", type: "checkbox", full: true },
  ],
};

export function ManagePrograms() {
  return <ResourceManager config={config} />;
}
export default ManagePrograms;
