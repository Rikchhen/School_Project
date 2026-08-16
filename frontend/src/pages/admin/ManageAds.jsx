import { useEffect, useState } from "react";
import styled from "styled-components";
import { Save, Megaphone, Trash2 } from "lucide-react";
import { api } from "../../lib/api";
import { useToast } from "../../context/ToastContext";
import { useSettings } from "../../context/SettingsContext";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Field, Label, Input, Textarea, Select } from "../../components/ui/Input";
import { Skeleton } from "../../components/ui/Skeleton";
import { ImageUploader } from "../../components/ImageUploader";
import { useConfirm } from "../../context/ConfirmContext";

const EMPTY = {
  enabled: false,
  imageUrl: "",
  videoUrl: "",
  title: "", titleNe: "",
  body: "", bodyNe: "",
  ctaLabel: "", ctaLabelNe: "",
  ctaLink: "",
  frequency: "session",
};

/** Admin: configure the public interstitial ad / popup (poster + text). */
export function ManageAds() {
  const { confirmRemove } = useConfirm();
  const toast = useToast();
  const { refetch } = useSettings();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/settings").then((r) => {
      const it = r.settings?.interstitial || {};
      setForm({ ...EMPTY, ...it });
    }).catch((e) => toast.error(e.message));
  }, [toast]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      await api.put("/settings", { interstitial: form });
      toast.success("Popup saved");
      refetch();
    } catch (e) {
      toast.error(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (!form) return <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{[0, 1].map((i) => <Skeleton key={i} $h="140px" $radius="lg" />)}</div>;

  return (
    <>
      <Header>
        <div>
          <h1><Megaphone size={24} /> Ad / Popup</h1>
          <Muted>A full-screen popup shown to visitors on the public site. Add a poster image, some text, or both.</Muted>
        </div>
        <Button $variant="primary" onClick={save} disabled={saving}><Save size={18} /> {saving ? "Saving…" : "Save changes"}</Button>
      </Header>

      <Card $pad={6} style={{ marginBottom: 20 }}>
        <ToggleRow>
          <div>
            <h3>Show popup on the website</h3>
            <Muted>Turn this on to display the popup to visitors. Turn off to hide it instantly.</Muted>
          </div>
          <Switch $on={form.enabled} onClick={() => set("enabled", !form.enabled)} aria-pressed={form.enabled}><span /></Switch>
        </ToggleRow>
      </Card>

      <Card $pad={6} style={{ marginBottom: 20 }}>
        <h3>Poster</h3>
        <Muted>Upload a poster image, or a video (video plays instead of the image). Leave both empty to show only text.</Muted>
        <Grid>
          <div>
            <Label>Poster image</Label>
            <ImageUploader value={form.imageUrl} onUploaded={(url) => set("imageUrl", url)} label="Upload poster image" />
            {form.imageUrl && (
              <button type="button" onClick={async () => (await confirmRemove("the poster image")) && set("imageUrl", "")} style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#b1002c", fontSize: 13, fontWeight: 600, marginTop: 8 }}>
                <Trash2 size={14} /> Remove image
              </button>
            )}
          </div>
          <div>
            <Label>Poster video (optional — overrides the image)</Label>
            <ImageUploader value={form.videoUrl} accept="video/*" onUploaded={(url) => set("videoUrl", url)} label="Upload poster video" />
            {form.videoUrl && (
              <button type="button" onClick={async () => (await confirmRemove("the poster video")) && set("videoUrl", "")} style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#b1002c", fontSize: 13, fontWeight: 600, marginTop: 8 }}>
                <Trash2 size={14} /> Remove video
              </button>
            )}
          </div>
        </Grid>
      </Card>

      <Card $pad={6} style={{ marginBottom: 20 }}>
        <h3>Text (optional)</h3>
        <Muted>Shown below the poster. You can use this instead of, or together with, an image.</Muted>
        <Grid>
          <Field><Label>Title (English)</Label><Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Admissions Open 2082" /></Field>
          <Field><Label>Title (Nepali)</Label><Input value={form.titleNe} onChange={(e) => set("titleNe", e.target.value)} /></Field>
          <Field style={{ gridColumn: "1 / -1" }}><Label>Message (English)</Label><Textarea rows={3} value={form.body} onChange={(e) => set("body", e.target.value)} /></Field>
          <Field style={{ gridColumn: "1 / -1" }}><Label>Message (Nepali)</Label><Textarea rows={3} value={form.bodyNe} onChange={(e) => set("bodyNe", e.target.value)} /></Field>
        </Grid>
      </Card>

      <Card $pad={6} style={{ marginBottom: 20 }}>
        <h3>Button & link (optional)</h3>
        <Muted>Add a call-to-action button. If a link is set, clicking the poster also opens it.</Muted>
        <Grid>
          <Field><Label>Button label (English)</Label><Input value={form.ctaLabel} onChange={(e) => set("ctaLabel", e.target.value)} placeholder="Apply now" /></Field>
          <Field><Label>Button label (Nepali)</Label><Input value={form.ctaLabelNe} onChange={(e) => set("ctaLabelNe", e.target.value)} /></Field>
          <Field style={{ gridColumn: "1 / -1" }}>
            <Label>Link</Label>
            <Input value={form.ctaLink} onChange={(e) => set("ctaLink", e.target.value)} placeholder="/admissions or https://…" />
            <small style={{ color: "#6b7280" }}>Internal page (e.g. <code>/admissions</code>) or a full external URL (<code>https://…</code>).</small>
          </Field>
        </Grid>
      </Card>

      <Card $pad={6}>
        <h3>How often to show</h3>
        <Muted>Controls how frequently a visitor sees the popup.</Muted>
        <Field style={{ marginTop: 12, maxWidth: 320 }}>
          <Select value={form.frequency} onChange={(e) => set("frequency", e.target.value)}>
            <option value="session">Once per visit (recommended)</option>
            <option value="daily">Once per day</option>
            <option value="always">Every page load</option>
          </Select>
        </Field>
      </Card>
    </>
  );
}

const Header = styled.div`
  display: flex; align-items: flex-start; justify-content: space-between; gap: ${({ theme }) => theme.space[4]};
  margin-bottom: ${({ theme }) => theme.space[6]}; flex-wrap: wrap;
  h1 { display: flex; align-items: center; gap: 10px; font-size: ${({ theme }) => theme.fontSizes["3xl"]}; }
`;
const Muted = styled.p`color: ${({ theme }) => theme.colors.textMuted}; font-size: ${({ theme }) => theme.fontSizes.sm};`;
const Grid = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: ${({ theme }) => theme.space[4]}; margin-top: ${({ theme }) => theme.space[4]};
  ${({ theme }) => theme.media.mobile(`grid-template-columns: 1fr;`)}
`;
const ToggleRow = styled.div`
  display: flex; align-items: center; justify-content: space-between; gap: ${({ theme }) => theme.space[4]};
  h3 { display: flex; align-items: center; gap: 8px; }
`;
const Switch = styled.button`
  width: 52px; height: 30px; border-radius: ${({ theme }) => theme.radii.pill}; flex-shrink: 0;
  background: ${({ theme, $on }) => ($on ? theme.colors.success : theme.colors.border)};
  position: relative; transition: background ${({ theme }) => theme.transitions.base};
  span { position: absolute; top: 3px; left: ${({ $on }) => ($on ? "25px" : "3px")}; width: 24px; height: 24px; border-radius: 50%; background: #fff; transition: left ${({ theme }) => theme.transitions.base}; }
`;

export default ManageAds;
