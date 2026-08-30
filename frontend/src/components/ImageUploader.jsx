import { useRef, useState } from "react";
import styled, { keyframes } from "styled-components";
import { UploadCloud, Loader2, CheckCircle2 } from "lucide-react";
import { api } from "../lib/api";
import { useToast } from "../context/ToastContext";
import { SmartImage } from "./SmartImage";

/**
 * Admin file uploader. Uploads to POST /api/uploads-file and calls
 * onUploaded(url) with the stored public URL. Accepts images, videos and PDFs,
 * and uploads the selected file directly.
 */
export function ImageUploader({ value, onUploaded, accept = "image/*", label = "Upload file", required = false }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [complete, setComplete] = useState(false);
  const toast = useToast();

  const upload = async (file) => {
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    setUploading(true);
    setProgress(1);
    setComplete(false);
    try {
      const res = await api.upload("/uploads-file", form, { onProgress: setProgress });
      setProgress(100);
      setComplete(true);
      onUploaded?.(res.url, res);
      toast.success("File uploaded");
    } catch (err) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
      window.setTimeout(() => setComplete(false), 1800);
    }
  };

  const handleFile = (file) => {
    if (!file) return;
    upload(file);
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
        {complete ? (
          <><CheckCircle2 size={20} className="success" /> Uploaded</>
        ) : uploading ? (
          <><Loader2 size={20} className="spin" /> Uploading… {progress}%</>
        ) : (
          <><UploadCloud size={20} /> {label}</>
        )}
      </Drop>
      {uploading && <Progress aria-label={`Upload progress ${progress}%`}><span style={{ transform: `scaleX(${progress / 100})` }} /></Progress>}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        hidden
        required={required && !value}
        onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = ""; }}
      />
      {required && !value && <RequiredHint role="note">A file is required.</RequiredHint>}

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
  .success { animation: successPop .38s cubic-bezier(.22,1,.36,1) both; color:${({theme})=>theme.colors.success}; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes successPop { from { opacity:0; transform:scale(.65) } to { opacity:1; transform:none } }
`;

const Progress = styled.div`
  height:4px; overflow:hidden; border-radius:${({theme})=>theme.radii.pill}; background:${({theme})=>theme.colors.border};
  span{display:block;width:100%;height:100%;transform-origin:left;background:${({theme})=>theme.gradients.primary};transition:transform .16s linear;}
`;

const Preview = styled.div`
  width: 180px;
  border-radius: ${({ theme }) => theme.radii.md};
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.border};
  animation:${keyframes`from{opacity:0;transform:scale(.97)}to{opacity:1;transform:none}`} .35s ease-out both;
`;

const FileLink = styled.a`
  color: ${({ theme }) => theme.colors.secondary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  word-break: break-all;
  text-decoration: underline;
`;
const RequiredHint = styled.p`margin: 0; color: ${({ theme }) => theme.colors.danger}; font-size: ${({ theme }) => theme.fontSizes.xs};`;

export default ImageUploader;
