import { ResourceManager } from "../../components/admin/ResourceManager";
import { Badge } from "../../components/ui/Badge";

const config = {
  title: "Syllabus",
  endpoint: "/syllabus",
  defaults: { titleNe: "", grade: "", subject: "", stream: "general", description: "", descriptionNe: "", fileUrl: "", coverImageUrl: "", academicYear: "", order: 0, featured: false, published: true },
  columns: [
    { key: "title", label: "Title", render: (r) => <strong>{r.title}</strong> },
    { key: "grade", label: "Class", render: (r) => <Badge $tone="secondary">{r.grade}</Badge> },
    { key: "subject", label: "Subject" }, { key: "academicYear", label: "Year" },
    { key: "stream", label: "Stream", render: (r) => <Badge $tone="secondary">{r.stream || "general"}</Badge> },
    { key: "published", label: "Live", render: (r) => r.published ? "✓" : "—" },
  ],
  fields: [
    { name: "title", label: "Title (English)", type: "text", required: true },
    { name: "titleNe", label: "Title (Nepali)", type: "text" },
    { name: "grade", label: "Class / Grade", type: "text", required: true },
    { name: "subject", label: "Subject", type: "text", required: true },
    { name: "stream", label: "Program stream", type: "select", options: [{ value: "science", label: "Science" }, { value: "management", label: "Management" }, { value: "humanities", label: "Humanities" }, { value: "general", label: "General" }] },
    { name: "academicYear", label: "Academic year", type: "text" },
    { name: "order", label: "Sort order", type: "number" },
    { name: "description", label: "Description (English)", type: "richtext", full: true },
    { name: "descriptionNe", label: "Description (Nepali)", type: "richtext", full: true },
    { name: "fileUrl", label: "Syllabus PDF", type: "pdf", full: true },
    { name: "coverImageUrl", label: "Cover image", type: "image", full: true },
    { name: "featured", label: "Featured", type: "checkbox" },
    { name: "published", label: "Published", type: "checkbox" },
  ],
};
export function ManageSyllabus() { return <ResourceManager config={config} />; }
export default ManageSyllabus;
