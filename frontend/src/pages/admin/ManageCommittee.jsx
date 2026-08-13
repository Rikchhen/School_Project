import { ResourceManager } from "../../components/admin/ResourceManager";
import { Badge } from "../../components/ui/Badge";
import { SmartImage } from "../../components/SmartImage";

const config = {
  title: "Committee",
  endpoint: "/committee",
  defaults: { published: true, order: 0, nameNe: "", roleNe: "", message: "", messageNe: "", phone: "", email: "", photoUrl: "" },
  columns: [
    { key: "photoUrl", label: "Photo", render: (r) => (
      <div style={{ width: 44, height: 44, borderRadius: "50%", overflow: "hidden" }}>
        <SmartImage src={r.photoUrl} alt={r.name} height="44px" />
      </div>
    ) },
    { key: "name", label: "Name", render: (r) => <strong>{r.name}</strong> },
    { key: "role", label: "Role", render: (r) => <Badge $tone="secondary">{r.role}</Badge> },
    { key: "order", label: "Order" },
  ],
  fields: [
    { name: "name", label: "Name (English)", type: "text", required: true },
    { name: "nameNe", label: "Name (Nepali)", type: "text" },
    { name: "role", label: "Role (English)", type: "text", required: true },
    { name: "roleNe", label: "Role (Nepali)", type: "text" },
    { name: "order", label: "Sort order", type: "number" },
    { name: "phone", label: "Phone", type: "text" },
    { name: "email", label: "Email", type: "text" },
    { name: "message", label: "Message (English)", type: "richtext", full: true },
    { name: "messageNe", label: "Message (Nepali)", type: "richtext", full: true },
    { name: "photoUrl", label: "Photo", type: "image", full: true },
    { name: "published", label: "Published", type: "checkbox", full: true },
  ],
};

export function ManageCommittee() {
  return <ResourceManager config={config} />;
}
export default ManageCommittee;
