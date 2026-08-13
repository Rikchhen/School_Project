import { ResourceManager } from "../../components/admin/ResourceManager";
import { Badge } from "../../components/ui/Badge";
import { SmartImage } from "../../components/SmartImage";

const config = {
  title: "Staff",
  endpoint: "/staff",
  defaults: { department: "general", published: true, order: 0, nameNe: "", roleNe: "", bio: "", email: "", phone: "", photoUrl: "" },
  columns: [
    { key: "photoUrl", label: "Photo", render: (r) => (
      <div style={{ width: 44, height: 44, borderRadius: "50%", overflow: "hidden" }}>
        <SmartImage src={r.photoUrl} alt={r.name} height="44px" />
      </div>
    ) },
    { key: "name", label: "Name", render: (r) => <strong>{r.name}</strong> },
    { key: "role", label: "Role" },
    { key: "department", label: "Dept", render: (r) => <Badge $tone="secondary">{r.department}</Badge> },
    { key: "order", label: "Order" },
  ],
  fields: [
    { name: "name", label: "Name (English)", type: "text", required: true },
    { name: "nameNe", label: "Name (Nepali)", type: "text" },
    { name: "role", label: "Role (English)", type: "text", required: true },
    { name: "roleNe", label: "Role (Nepali)", type: "text" },
    { name: "department", label: "Department", type: "select", options: ["general", "administration", "science", "management", "humanities", "languages"] },
    { name: "order", label: "Sort order", type: "number" },
    { name: "email", label: "Email", type: "text" },
    { name: "phone", label: "Phone", type: "text" },
    { name: "bio", label: "Bio", type: "richtext", full: true },
    { name: "photoUrl", label: "Photo", type: "image", full: true },
    { name: "published", label: "Published", type: "checkbox", full: true },
  ],
};

export function ManageStaff() {
  return <ResourceManager config={config} />;
}
export default ManageStaff;
