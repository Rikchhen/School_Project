import { useRef, useState } from "react";
import styled from "styled-components";
import { UploadCloud, Loader2 } from "lucide-react";
import { api } from "../lib/api";
import { useToast } from "../context/ToastContext";
import { SmartImage } from "./SmartImage";
import { ImageCropper } from "./admin/ImageCropper";

/**
 * Admin file uploader. Uploads to POST /api/uploads-file and calls
 * onUploaded(url) with the stored public URL. Accepts images and PDFs.
 * When an image is selected, a crop dialog opens before upload.
 */
export function ImageUploader({ value, onUploaded, accept = "image/*", label = "Upload file" }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [cropFile, setCropFile] = useState(null); // image awaiting crop
  const toast = useToast();

  const upload = async (file) => {
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    setUploading(true);
    try {
      const res = await api.post("/uploads-file", form);
      onUploaded?.(res.url, res);
      toast.success("File uploaded");
    } catch (err) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleFile = (file) => {
    if (!file) return;
    // Images go through the cropper first; PDFs upload directly.
    if (file.type && file.type.startsWith("image/")) {
      setCropFile(file);
    } else {
      upload(file);
    }
  };

  const isVideo = value && /\.(mp4|webm|ogg|mov)$/i.test(value);
  const isImage = value && !isVideo && !value.toLowerCase().endsWith(".pdf");

  return (
    <Wrap>
      <Drop
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? (
          <><Loader2 size={20} className="spin" /> Uploading…</>
        ) : (
          <><UploadCloud size={20} /> {label}</>
        )}
      </Drop>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        hidden
        onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = ""; }}
      />

      {cropFile && (
        <ImageCropper
          file={cropFile}
          onCancel={() => setCropFile(null)}
          onCropped={(croppedFile) => { setCropFile(null); upload(croppedFile); }}
        />
      )}

      {value ? (
        isVideo ? (
          <Preview as="video" src={value} controls muted />
        ) : isImage ? (
          <Preview><SmartImage src={value} alt="Preview" height="120px" fit="cover" /></Preview>
        ) : (
          <FileLink href={value} target="_blank" rel="noreferrer">{value}</FileLink>
        )
      ) : null}
    </Wrap>
  );
}

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[3]};
`;

const Drop = styled.button`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.space[2]};
  border: 1px dashed ${({ theme }) => theme.colors.borderStrong};
  color: ${({ theme }) => theme.colors.primary};
  background: ${({ theme }) => theme.colors.primarySoft};
  padding: ${({ theme }) => `${theme.space[3]} ${theme.space[4]}`};
  border-radius: ${({ theme }) => theme.radii.md};
  font-weight: 600;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  &:disabled { opacity: 0.7; }
  .spin { animation: spin 1s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
`;

const Preview = styled.div`
  width: 180px;
  border-radius: ${({ theme }) => theme.radii.md};
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const FileLink = styled.a`
  color: ${({ theme }) => theme.colors.secondary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  word-break: break-all;
  text-decoration: underline;
`;

export default ImageUploader;
