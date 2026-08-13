import { useRef, useState } from "react";
import styled from "styled-components";
import { UploadCloud, Loader2 } from "lucide-react";
import { ResourceManager } from "../../components/admin/ResourceManager";
import { Badge } from "../../components/ui/Badge";
import { Select } from "../../components/ui/Input";
import { SmartImage } from "../../components/SmartImage";
import { api } from "../../lib/api";
import { useToast } from "../../context/ToastContext";

const ALBUMS = ["general", "campus", "events", "sports", "academics", "cultural"];

const config = {
  title: "Gallery",
  endpoint: "/gallery",
  defaults: { album: "general", published: true, caption: "", imageUrl: "" },
  columns: [
    { key: "imageUrl", label: "Image", render: (r) => (
      <div style={{ width: 60, borderRadius: 8, overflow: "hidden" }}>
        <SmartImage src={r.imageUrl} alt={r.title} height="44px" />
      </div>
    ) },
    { key: "title", label: "Title", render: (r) => <strong>{r.title}</strong> },
    { key: "album", label: "Album", render: (r) => <Badge $tone="secondary">{r.album}</Badge> },
    { key: "published", label: "Live", render: (r) => (r.published ? "✓" : "—") },
  ],
  fields: [
    { name: "title", label: "Title", type: "text", required: true },
    { name: "album", label: "Album", type: "select", options: ALBUMS },
    { name: "caption", label: "Caption", type: "text", full: true },
    { name: "imageUrl", label: "Image", type: "image", required: true, full: true },
    { name: "published", label: "Published", type: "checkbox", full: true },
  ],
};

/** Bulk-upload many photos into one album, creating a gallery item per file. */
function BulkUpload({ onDone }) {
  const inputRef = useRef(null);
  const [album, setAlbum] = useState("general");
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  const handle = async (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    const form = new FormData();
    files.forEach((f) => form.append("files", f));
    setBusy(true);
    try {
      const res = await api.post("/uploads-file/multiple", form);
      await Promise.all(
        (res.files || []).map((f) =>
          api.post("/gallery", {
            title: (f.originalName || "Photo").replace(/\.[^.]+$/, ""),
            imageUrl: f.url,
            album,
            published: true,
          })
        )
      );
      toast.success(`${(res.files || []).length} photos added to “${album}”`);
      onDone?.();
    } catch (e) {
      toast.error(e.message || "Bulk upload failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Bar>
      <span>Bulk add to album:</span>
      <Select value={album} onChange={(e) => setAlbum(e.target.value)} style={{ width: 180 }}>
        {ALBUMS.map((a) => <option key={a} value={a}>{a}</option>)}
      </Select>
      <BulkBtn type="button" onClick={() => inputRef.current?.click()} disabled={busy}>
        {busy ? <><Loader2 size={18} className="spin" /> Uploading…</> : <><UploadCloud size={18} /> Select photos</>}
      </BulkBtn>
      <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={(e) => { handle(e.target.files); e.target.value = ""; }} />
    </Bar>
  );
}

export function ManageGallery() {
  const [key, setKey] = useState(0);
  return (
    <>
      <BulkUpload onDone={() => setKey((k) => k + 1)} />
      <ResourceManager key={key} config={config} />
    </>
  );
}

const Bar = styled.div`
  display: flex; align-items: center; gap: ${({ theme }) => theme.space[3]}; flex-wrap: wrap;
  background: ${({ theme }) => theme.colors.surface}; border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg}; padding: ${({ theme }) => theme.space[4]};
  margin-bottom: ${({ theme }) => theme.space[5]};
  span { font-weight: 600; font-size: ${({ theme }) => theme.fontSizes.sm}; }
`;
const BulkBtn = styled.button`
  display: inline-flex; align-items: center; gap: 8px; font-weight: 600; font-size: ${({ theme }) => theme.fontSizes.sm};
  background: ${({ theme }) => theme.colors.primary}; color: #fff;
  padding: ${({ theme }) => `${theme.space[2]} ${theme.space[4]}`}; border-radius: ${({ theme }) => theme.radii.pill};
  &:disabled { opacity: 0.7; }
  .spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }
`;

export default ManageGallery;
