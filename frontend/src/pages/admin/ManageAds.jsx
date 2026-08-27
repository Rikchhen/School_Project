import { useEffect, useState } from "react";
import styled from "styled-components";
import { Save, Megaphone, Trash2, Plus, ChevronUp, ChevronDown } from "lucide-react";
import { api } from "../../lib/api";
import { useToast } from "../../context/ToastContext";
import { useSettings } from "../../context/SettingsContext";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Field, Label, Input, Textarea, Select } from "../../components/ui/Input";
import { Skeleton } from "../../components/ui/Skeleton";
import { ImageUploader } from "../../components/ImageUploader";
import { useConfirm } from "../../context/ConfirmContext";

const EMPTY_SLIDE = {
  imageUrl: "", videoUrl: "",
  title: "", titleNe: "", body: "", bodyNe: "",
  ctaLabel: "", ctaLabelNe: "", ctaLink: "",
};
const hasContent = (s) => !!(s && (s.imageUrl || s.videoUrl || s.title || s.titleNe || s.body || s.bodyNe));

/** Admin: configure the public interstitial popup — a swipeable slide carousel. */
export function ManageAds() {
  const { confirmRemove } = useConfirm();
  const toast = useToast();
  const { refetch } = useSettings();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/settings").then((r) => {
      const it = r.settings?.interstitial || {};
      // Prefer the slides array; otherwise migrate legacy single-slide fields.
      let slides = Array.isArray(it.slides) ? it.slides.map((s) => ({ ...EMPTY_SLIDE, ...s })) : [];
      if (!slides.length) {
        const legacy = { ...EMPTY_SLIDE, imageUrl: it.imageUrl || "", videoUrl: it.videoUrl || "", title: it.title || "", titleNe: it.titleNe || "", body: it.body || "", bodyNe: it.bodyNe || "", ctaLabel: it.ctaLabel || "", ctaLabelNe: it.ctaLabelNe || "", ctaLink: it.ctaLink || "" };
        if (hasContent(legacy)) slides = [legacy];
      }
      setForm({
        enabled: !!it.enabled,
        autoAdvance: it.autoAdvance !== false,
        frequency: it.frequency || "session",
        slides,
      });
    }).catch((e) => toast.error(e.message));
  }, [toast]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setSlide = (i, k, v) => setForm((f) => ({ ...f, slides: f.slides.map((s, idx) => (idx === i ? { ...s, [k]: v } : s)) }));
  const addSlide = () => setForm((f) => ({ ...f, slides: [...f.slides, { ...EMPTY_SLIDE }] }));
  const removeSlide = async (i) => {
    if (!(await confirmRemove(`slide ${i + 1}`))) return;
    setForm((f) => ({ ...f, slides: f.slides.filter((_, idx) => idx !== i) }));
  };
  const moveSlide = (i, dir) => setForm((f) => {
    const j = i + dir;
    if (j < 0 || j >= f.slides.length) return f;
    const next = [...f.slides];
    [next[i], next[j]] = [next[j], next[i]];
    return { ...f, slides: next };
  });

  const save = async () => {
    setSaving(true);
    try {
      // Send slides + clear the legacy single-slide fields so they can't conflict.
      await api.put("/settings", {
        interstitial: {
          enabled: form.enabled, autoAdvance: form.autoAdvance, frequency: form.frequency,
          slides: form.slides,
          imageUrl: "", videoUrl: "", title: "", titleNe: "", body: "", bodyNe: "", ctaLabel: "", ctaLabelNe: "", ctaLink: "",
        },
      });
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
          <Muted>A full-screen popup shown to visitors. Add one or more slides — visitors swipe between them.</Muted>
        </div>
        <Button $variant="primary" onClick={save} disabled={saving}><Save size={18} /> {saving ? "Saving…" : "Save changes"}</Button>
      </Header>

      <Card $pad={6} style={{ marginBottom: 20 }}>
        <ToggleRow>
          <div>
            <h3>Show popup on the website</h3>
            <Muted>Turn on to display the popup. Turn off to hide it instantly.</Muted>
          </div>
          <Switch $on={form.enabled} onClick={() => set("enabled", !form.enabled)} aria-pressed={form.enabled}><span /></Switch>
        </ToggleRow>
      </Card>

      <Card $pad={6} style={{ marginBottom: 20 }}>
        <SpaceBetween>
          <div><h3>Slides</h3><Muted>Each slide is one screen of the carousel — a poster image or video, plus optional text and a button.</Muted></div>
          <Button $variant="outline" $size="sm" onClick={addSlide}><Plus size={16} /> Add slide</Button>
        </SpaceBetween>

        {form.slides.length === 0 && <Muted style={{ marginTop: 12 }}>No slides yet — click “Add slide”.</Muted>}

        {form.slides.map((sl, i) => (
          <SlideCard key={i}>
            <SlideHead>
              <strong>Slide {i + 1}</strong>
              <Actions>
                <IconBtn onClick={() => moveSlide(i, -1)} disabled={i === 0} aria-label="Move up"><ChevronUp size={16} /></IconBtn>
                <IconBtn onClick={() => moveSlide(i, 1)} disabled={i === form.slides.length - 1} aria-label="Move down"><ChevronDown size={16} /></IconBtn>
                <IconBtn $danger onClick={() => removeSlide(i)} aria-label="Remove slide"><Trash2 size={16} /></IconBtn>
              </Actions>
            </SlideHead>

            <Grid>
              <div>
                <Label>Poster image</Label>
                <ImageUploader value={sl.imageUrl} onUploaded={(url) => setSlide(i, "imageUrl", url)} label="Upload image" />
              </div>
              <div>
                <Label>Poster video (overrides image)</Label>
                <ImageUploader value={sl.videoUrl} accept="video/*" onUploaded={(url) => setSlide(i, "videoUrl", url)} label="Upload video" />
              </div>
            </Grid>

            <Grid>
              <Field><Label>Title (English)</Label><Input value={sl.title} onChange={(e) => setSlide(i, "title", e.target.value)} placeholder="e.g. Admissions Open" /></Field>
              <Field><Label>Title (Nepali)</Label><Input value={sl.titleNe} onChange={(e) => setSlide(i, "titleNe", e.target.value)} /></Field>
              <Field style={{ gridColumn: "1 / -1" }}><Label>Message (English)</Label><Textarea rows={2} value={sl.body} onChange={(e) => setSlide(i, "body", e.target.value)} /></Field>
              <Field style={{ gridColumn: "1 / -1" }}><Label>Message (Nepali)</Label><Textarea rows={2} value={sl.bodyNe} onChange={(e) => setSlide(i, "bodyNe", e.target.value)} /></Field>
              <Field><Label>Button label (English)</Label><Input value={sl.ctaLabel} onChange={(e) => setSlide(i, "ctaLabel", e.target.value)} placeholder="Apply now" /></Field>
              <Field><Label>Button label (Nepali)</Label><Input value={sl.ctaLabelNe} onChange={(e) => setSlide(i, "ctaLabelNe", e.target.value)} /></Field>
              <Field style={{ gridColumn: "1 / -1" }}>
                <Label>Button link</Label>
                <Input value={sl.ctaLink} onChange={(e) => setSlide(i, "ctaLink", e.target.value)} placeholder="/admissions or https://…" />
              </Field>
            </Grid>
          </SlideCard>
        ))}
      </Card>

      <Card $pad={6} style={{ marginBottom: 20 }}>
        <ToggleRow>
          <div>
            <h3>Auto-advance slides</h3>
            <Muted>Automatically move to the next slide every few seconds (pauses on hover/drag). Only matters with 2+ slides.</Muted>
          </div>
          <Switch $on={form.autoAdvance} onClick={() => set("autoAdvance", !form.autoAdvance)} aria-pressed={form.autoAdvance}><span /></Switch>
        </ToggleRow>
      </Card>

      <Card $pad={6}>
        <h3>How often to show</h3>
        <Muted>How frequently a visitor sees the popup.</Muted>
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
const SpaceBetween = styled.div`display: flex; align-items: center; justify-content: space-between; gap: ${({ theme }) => theme.space[4]}; flex-wrap: wrap;`;
const SlideCard = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border}; border-left: 4px solid ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.radii.md}; padding: ${({ theme }) => theme.space[4]}; margin-top: ${({ theme }) => theme.space[4]};
`;
const SlideHead = styled.div`display: flex; align-items: center; justify-content: space-between;`;
const Actions = styled.div`display: flex; gap: 6px;`;
const IconBtn = styled.button`
  width: 32px; height: 32px; display: grid; place-items: center; border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme, $danger }) => ($danger ? theme.colors.danger : theme.colors.secondary)};
  background: ${({ theme, $danger }) => ($danger ? theme.colors.dangerSoft : theme.colors.secondarySoft)};
  &:disabled { opacity: 0.4; cursor: not-allowed; }
`;
const Switch = styled.button`
  width: 52px; height: 30px; border-radius: ${({ theme }) => theme.radii.pill}; flex-shrink: 0;
  background: ${({ theme, $on }) => ($on ? theme.colors.success : theme.colors.border)};
  position: relative; transition: background ${({ theme }) => theme.transitions.base};
  span { position: absolute; top: 3px; left: ${({ $on }) => ($on ? "25px" : "3px")}; width: 24px; height: 24px; border-radius: 50%; background: #fff; transition: left ${({ theme }) => theme.transitions.base}; }
`;

export default ManageAds;
