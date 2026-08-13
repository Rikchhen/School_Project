import { useRef, useState } from "react";
import styled from "styled-components";
import { UploadCloud, Loader2, X } from "lucide-react";
import { api } from "../lib/api";
import { useToast } from "../context/ToastContext";
import { SmartImage } from "./SmartImage";

/**
 * Upload many images at once. `value` is an array of URLs; `onChange` receives
 * the updated array. Uploads via POST /api/uploads-file/multiple.
 */
export function MultiImageUploader({ value = [], onChange, label = "Upload images", max = 12 }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const toast = useToast();
  const urls = Array.isArray(value) ? value : [];

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList || []).slice(0, max);
    if (!files.length) return;
    const form = new FormData();
    files.forEach((f) => form.append("files", f));
    setUploading(true);
    try {
      const res = await api.post("/uploads-file/multiple", form);
      const added = res.urls || [];
      onChange?.([...urls, ...added]);
      toast.success(`${added.length} image${added.length === 1 ? "" : "s"} uploaded`);
    } catch (err) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const removeAt = (i) => onChange?.(urls.filter((_, idx) => idx !== i));

  return (
    <Wrap>
      <Drop type="button" onClick={() => inputRef.current?.click()} disabled={uploading}>
        {uploading ? (<><Loader2 size={18} className="spin" /> Uploading…</>) : (<><UploadCloud size={18} /> {label}</>)}
      </Drop>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }}
      />
      {urls.length > 0 && (
        <Grid>
          {urls.map((u, i) => (
            <Thumb key={`${u}-${i}`}>
              <SmartImage src={u} alt="" height="72px" />
              <Remove type="button" onClick={() => removeAt(i)} aria-label="Remove"><X size={13} /></Remove>
            </Thumb>
          ))}
        </Grid>
      )}
    </Wrap>
  );
}

const Wrap = styled.div`display: flex; flex-direction: column; gap: ${({ theme }) => theme.space[3]};`;
const Drop = styled.button`
  display: inline-flex; align-items: center; gap: ${({ theme }) => theme.space[2]};
  border: 1px dashed ${({ theme }) => theme.colors.borderStrong};
  color: ${({ theme }) => theme.colors.primary};
  background: ${({ theme }) => theme.colors.primarySoft};
  padding: ${({ theme }) => `${theme.space[3]} ${theme.space[4]}`};
  border-radius: ${({ theme }) => theme.radii.md}; font-weight: 600; font-size: ${({ theme }) => theme.fontSizes.sm};
  align-self: flex-start;
  &:disabled { opacity: 0.7; }
  .spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }
`;
const Grid = styled.div`display: grid; grid-template-columns: repeat(auto-fill, minmax(90px, 1fr)); gap: ${({ theme }) => theme.space[2]};`;
const Thumb = styled.div`
  position: relative; border-radius: ${({ theme }) => theme.radii.md}; overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;
const Remove = styled.button`
  position: absolute; top: 3px; right: 3px; width: 20px; height: 20px; display: grid; place-items: center;
  border-radius: ${({ theme }) => theme.radii.pill}; background: rgba(0,0,0,0.6); color: #fff;
  &:hover { background: ${({ theme }) => theme.colors.danger}; }
`;

export default MultiImageUploader;
