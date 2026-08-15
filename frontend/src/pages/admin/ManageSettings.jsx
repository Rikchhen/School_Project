import { useEffect, useState } from "react";
import styled from "styled-components";
import { Plus, Trash2, Save, Heart } from "lucide-react";
import { api } from "../../lib/api";
import { useToast } from "../../context/ToastContext";
import { useSettings } from "../../context/SettingsContext";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Field, Label, Input, Select, Textarea } from "../../components/ui/Input";
import { Skeleton } from "../../components/ui/Skeleton";
import { ImageUploader } from "../../components/ImageUploader";
import { MultiImageUploader } from "../../components/MultiImageUploader";

const SOCIAL_FIELDS = ["facebook", "instagram", "youtube", "twitter", "tiktok", "linkedin", "whatsapp"];

export function ManageSettings() {
  const toast = useToast();
  const { refetch } = useSettings();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/settings").then((r) => {
      const s = r.settings || {};
      const a = s.announcement || {};
      setForm({
        socials: { ...Object.fromEntries(SOCIAL_FIELDS.map((k) => [k, s.socials?.[k] || ""])) },
        donationEnabled: !!s.donationEnabled,
        banners: (s.banners || []).map((b) => ({ ...b })),
        announcement: {
          enabled: !!a.enabled, text: a.text || "", textNe: a.textNe || "",
          link: a.link || "", linkLabel: a.linkLabel || "", linkLabelNe: a.linkLabelNe || "",
        },
        partners: (s.partners || []).map((p) => ({ name: p.name || "", logoUrl: p.logoUrl || "", url: p.url || "" })),
        stats: (s.stats || []).map((x) => ({ value: x.value ?? 0, suffix: x.suffix || "", label: x.label || "", labelNe: x.labelNe || "" })),
        contact: {
          address: "", addressNe: "", phone: "", email: "", hours: "", hoursNe: "", mapUrl: "",
          ...(s.contact || {}),
        },
        facilities: (s.facilities || []).map((x) => ({ icon: x.icon || "library", title: x.title || "", titleNe: x.titleNe || "", desc: x.desc || "", descNe: x.descNe || "" })),
      });
    }).catch((e) => toast.error(e.message));
  }, [toast]);

  const setSocial = (k, v) => setForm((f) => ({ ...f, socials: { ...f.socials, [k]: v } }));
  const setAnn = (k, v) => setForm((f) => ({ ...f, announcement: { ...f.announcement, [k]: v } }));
  const setPartner = (i, k, v) => setForm((f) => ({ ...f, partners: f.partners.map((p, idx) => (idx === i ? { ...p, [k]: v } : p)) }));
  const addPartner = () => setForm((f) => ({ ...f, partners: [...f.partners, { name: "", logoUrl: "", url: "" }] }));
  const removePartner = (i) => setForm((f) => ({ ...f, partners: f.partners.filter((_, idx) => idx !== i) }));
  const setContact = (k, v) => setForm((f) => ({ ...f, contact: { ...f.contact, [k]: v } }));
  const setStat = (i, k, v) => setForm((f) => ({ ...f, stats: f.stats.map((s, idx) => (idx === i ? { ...s, [k]: v } : s)) }));
  const addStat = () => setForm((f) => ({ ...f, stats: [...f.stats, { value: 0, suffix: "+", label: "", labelNe: "" }] }));
  const removeStat = (i) => setForm((f) => ({ ...f, stats: f.stats.filter((_, idx) => idx !== i) }));
  const setFacility = (i, k, v) => setForm((f) => ({ ...f, facilities: f.facilities.map((x, idx) => (idx === i ? { ...x, [k]: v } : x)) }));
  const addFacility = () => setForm((f) => ({ ...f, facilities: [...f.facilities, { icon: "library", title: "", titleNe: "", desc: "", descNe: "" }] }));
  const removeFacility = (i) => setForm((f) => ({ ...f, facilities: f.facilities.filter((_, idx) => idx !== i) }));
  const setBanner = (i, k, v) => setForm((f) => ({ ...f, banners: f.banners.map((b, idx) => (idx === i ? { ...b, [k]: v } : b)) }));
  const addBanner = () => setForm((f) => ({ ...f, banners: [...f.banners, { imageUrl: "", title: "", titleNe: "", subtitle: "", subtitleNe: "", ctaLabel: "", ctaLabelNe: "", ctaLink: "", order: f.banners.length + 1 }] }));
  const removeBanner = (i) => setForm((f) => ({ ...f, banners: f.banners.filter((_, idx) => idx !== i) }));

  const save = async () => {
    setSaving(true);
    try {
      await api.put("/settings", form);
      toast.success("Settings saved");
      refetch();
    } catch (e) {
      toast.error(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (!form) return <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{[0, 1, 2].map((i) => <Skeleton key={i} $h="120px" $radius="lg" />)}</div>;

  return (
    <>
      <Header>
        <h1>Settings</h1>
        <Button $variant="primary" onClick={save} disabled={saving}><Save size={18} /> {saving ? "Saving…" : "Save changes"}</Button>
      </Header>

      <Card $pad={6} style={{ marginBottom: 20 }}>
        <ToggleRow>
          <div>
            <h3>📢 Announcement bar</h3>
            <Muted>A slim bar at the very top of the site for important notices.</Muted>
          </div>
          <Switch $on={form.announcement.enabled} onClick={() => setAnn("enabled", !form.announcement.enabled)} aria-pressed={form.announcement.enabled}><span /></Switch>
        </ToggleRow>
        <SocialGrid>
          <Field><Label>Message (English)</Label><Input value={form.announcement.text} onChange={(e) => setAnn("text", e.target.value)} /></Field>
          <Field><Label>Message (Nepali)</Label><Input value={form.announcement.textNe} onChange={(e) => setAnn("textNe", e.target.value)} /></Field>
          <Field><Label>Button label (English)</Label><Input value={form.announcement.linkLabel} onChange={(e) => setAnn("linkLabel", e.target.value)} /></Field>
          <Field><Label>Button label (Nepali)</Label><Input value={form.announcement.linkLabelNe} onChange={(e) => setAnn("linkLabelNe", e.target.value)} /></Field>
          <Field style={{ gridColumn: "1 / -1" }}><Label>Button link</Label><Input value={form.announcement.link} onChange={(e) => setAnn("link", e.target.value)} placeholder="/admissions" /></Field>
        </SocialGrid>
      </Card>

      <Card $pad={6} style={{ marginBottom: 20 }}>
        <SpaceBetween>
          <div><h3>Affiliations & partners</h3><Muted>Logos shown in the “Affiliations & Partners” strip on the home page.</Muted></div>
          <Button $variant="outline" $size="sm" onClick={addPartner}><Plus size={16} /> Add partner</Button>
        </SpaceBetween>
        {form.partners.length === 0 && <Muted style={{ marginTop: 12 }}>No partners yet.</Muted>}
        {form.partners.map((p, i) => (
          <BannerCard key={i}>
            <BannerHead>
              <strong>Partner {i + 1}</strong>
              <IconBtn $danger onClick={() => removePartner(i)} aria-label="Remove"><Trash2 size={16} /></IconBtn>
            </BannerHead>
            <BannerGrid>
              <Field><Label>Name</Label><Input value={p.name} onChange={(e) => setPartner(i, "name", e.target.value)} /></Field>
              <Field><Label>Website link (optional)</Label><Input value={p.url} onChange={(e) => setPartner(i, "url", e.target.value)} placeholder="https://…" /></Field>
            </BannerGrid>
            <Field><Label>Logo image (optional — shows a text name if empty)</Label>
              <ImageUploader value={p.logoUrl} onUploaded={(url) => setPartner(i, "logoUrl", url)} label="Upload logo" />
            </Field>
          </BannerCard>
        ))}
      </Card>

      <Card $pad={6} style={{ marginBottom: 20 }}>
        <h3>Contact information</h3>
        <Muted>Shown in the header bar, footer, and Contact page.</Muted>
        <SocialGrid>
          <Field><Label>Address (English)</Label><Input value={form.contact.address} onChange={(e) => setContact("address", e.target.value)} /></Field>
          <Field><Label>Address (Nepali)</Label><Input value={form.contact.addressNe} onChange={(e) => setContact("addressNe", e.target.value)} /></Field>
          <Field><Label>Phone</Label><Input value={form.contact.phone} onChange={(e) => setContact("phone", e.target.value)} /></Field>
          <Field><Label>Email</Label><Input value={form.contact.email} onChange={(e) => setContact("email", e.target.value)} /></Field>
          <Field><Label>Office hours (English)</Label><Input value={form.contact.hours} onChange={(e) => setContact("hours", e.target.value)} /></Field>
          <Field><Label>Office hours (Nepali)</Label><Input value={form.contact.hoursNe} onChange={(e) => setContact("hoursNe", e.target.value)} /></Field>
          <Field style={{ gridColumn: "1 / -1" }}>
            <Label>Map embed URL (optional)</Label>
            <Input value={form.contact.mapUrl} onChange={(e) => setContact("mapUrl", e.target.value)} placeholder="https://www.google.com/maps/embed?..." />
            <small style={{ color: "#6b7280" }}>Google Maps → Share → Embed a map → copy the <code>src</code> URL from the iframe.</small>
          </Field>
        </SocialGrid>
      </Card>

      <Card $pad={6} style={{ marginBottom: 20 }}>
        <SpaceBetween>
          <div><h3>Home “at a glance” stats</h3><Muted>The count-up numbers on the home page and hero.</Muted></div>
          <Button $variant="outline" $size="sm" onClick={addStat}><Plus size={16} /> Add stat</Button>
        </SpaceBetween>
        {form.stats.map((s, i) => (
          <BannerCard key={i}>
            <BannerHead><strong>Stat {i + 1}</strong><IconBtn $danger onClick={() => removeStat(i)} aria-label="Remove"><Trash2 size={16} /></IconBtn></BannerHead>
            <BannerGrid>
              <Field><Label>Value</Label><Input type="number" value={s.value} onChange={(e) => setStat(i, "value", e.target.value)} /></Field>
              <Field><Label>Suffix (e.g. + or %)</Label><Input value={s.suffix} onChange={(e) => setStat(i, "suffix", e.target.value)} /></Field>
              <Field><Label>Label (English)</Label><Input value={s.label} onChange={(e) => setStat(i, "label", e.target.value)} /></Field>
              <Field><Label>Label (Nepali)</Label><Input value={s.labelNe} onChange={(e) => setStat(i, "labelNe", e.target.value)} /></Field>
            </BannerGrid>
          </BannerCard>
        ))}
      </Card>

      <Card $pad={6} style={{ marginBottom: 20 }}>
        <SpaceBetween>
          <div><h3>Facilities (About page)</h3><Muted>The facility cards shown on the About page.</Muted></div>
          <Button $variant="outline" $size="sm" onClick={addFacility}><Plus size={16} /> Add facility</Button>
        </SpaceBetween>
        {form.facilities.map((x, i) => (
          <BannerCard key={i}>
            <BannerHead><strong>Facility {i + 1}</strong><IconBtn $danger onClick={() => removeFacility(i)} aria-label="Remove"><Trash2 size={16} /></IconBtn></BannerHead>
            <BannerGrid>
              <Field><Label>Icon</Label>
                <Select value={x.icon} onChange={(e) => setFacility(i, "icon", e.target.value)}>
                  <option value="library">Library (book)</option>
                  <option value="lab">Science lab (flask)</option>
                  <option value="playground">Playground (trees)</option>
                </Select>
              </Field>
              <Field><Label>Title (English)</Label><Input value={x.title} onChange={(e) => setFacility(i, "title", e.target.value)} /></Field>
              <Field><Label>Title (Nepali)</Label><Input value={x.titleNe} onChange={(e) => setFacility(i, "titleNe", e.target.value)} /></Field>
              <Field style={{ gridColumn: "1 / -1" }}><Label>Description (English)</Label><Textarea value={x.desc} onChange={(e) => setFacility(i, "desc", e.target.value)} /></Field>
              <Field style={{ gridColumn: "1 / -1" }}><Label>Description (Nepali)</Label><Textarea value={x.descNe} onChange={(e) => setFacility(i, "descNe", e.target.value)} /></Field>
            </BannerGrid>
          </BannerCard>
        ))}
      </Card>

      <Card $pad={6} style={{ marginBottom: 20 }}>
        <h3>Social media links</h3>
        <Muted>Only links you fill in will appear in the site footer.</Muted>
        <SocialGrid>
          {SOCIAL_FIELDS.map((k) => (
            <Field key={k}>
              <Label style={{ textTransform: "capitalize" }}>{k}</Label>
              <Input value={form.socials[k]} onChange={(e) => setSocial(k, e.target.value)} placeholder={`https://…`} />
            </Field>
          ))}
        </SocialGrid>
      </Card>

      <Card $pad={6} style={{ marginBottom: 20 }}>
        <ToggleRow>
          <div>
            <h3><Heart size={18} /> Donation page</h3>
            <Muted>Show or hide the public Donation page and its nav link.</Muted>
          </div>
          <Switch $on={form.donationEnabled} onClick={() => setForm((f) => ({ ...f, donationEnabled: !f.donationEnabled }))} aria-pressed={form.donationEnabled}>
            <span />
          </Switch>
        </ToggleRow>
      </Card>

      <Card $pad={6}>
        <SpaceBetween>
          <div><h3>Hero banners</h3><Muted>Slides shown in the animated banner on the Home page.</Muted></div>
          <Button $variant="outline" $size="sm" onClick={addBanner}><Plus size={16} /> Add banner</Button>
        </SpaceBetween>

        <BulkAdd>
          <Muted style={{ marginBottom: 8 }}>Add several photos at once — each becomes a new slide:</Muted>
          <MultiImageUploader
            value={[]}
            label="Add multiple photos as slides"
            onChange={(urls) =>
              setForm((f) => ({
                ...f,
                banners: [
                  ...f.banners,
                  ...urls.map((u, k) => ({ imageUrl: u, videoUrl: "", title: "", titleNe: "", subtitle: "", subtitleNe: "", ctaLabel: "", ctaLabelNe: "", ctaLink: "", order: f.banners.length + k + 1 })),
                ],
              }))
            }
          />
        </BulkAdd>

        {form.banners.length === 0 && <Muted style={{ marginTop: 16 }}>No banners yet — the default slide will show.</Muted>}

        {form.banners.map((b, i) => (
          <BannerCard key={i}>
            <BannerHead>
              <strong>Banner {i + 1}</strong>
              <IconBtn $danger onClick={() => removeBanner(i)} aria-label="Remove banner"><Trash2 size={16} /></IconBtn>
            </BannerHead>
            <BannerMedia>
              <div>
                <Label>Photo</Label>
                <ImageUploader value={b.imageUrl} onUploaded={(url) => setBanner(i, "imageUrl", url)} label="Upload banner image" />
              </div>
              <div>
                <Label>Background video (optional — overrides photo)</Label>
                <ImageUploader value={b.videoUrl} accept="video/*" onUploaded={(url) => setBanner(i, "videoUrl", url)} label="Upload video" />
                {b.videoUrl && (
                  <button type="button" onClick={() => setBanner(i, "videoUrl", "")} style={{ color: "#b1002c", fontSize: 13, fontWeight: 600, marginTop: 6 }}>Remove video</button>
                )}
              </div>
            </BannerMedia>
            <BannerGrid>
              <Field><Label>Title (English)</Label><Input value={b.title} onChange={(e) => setBanner(i, "title", e.target.value)} /></Field>
              <Field><Label>Title (Nepali)</Label><Input value={b.titleNe} onChange={(e) => setBanner(i, "titleNe", e.target.value)} /></Field>
              <Field><Label>Subtitle (English)</Label><Input value={b.subtitle} onChange={(e) => setBanner(i, "subtitle", e.target.value)} /></Field>
              <Field><Label>Subtitle (Nepali)</Label><Input value={b.subtitleNe} onChange={(e) => setBanner(i, "subtitleNe", e.target.value)} /></Field>
              <Field><Label>Button label (English)</Label><Input value={b.ctaLabel} onChange={(e) => setBanner(i, "ctaLabel", e.target.value)} /></Field>
              <Field><Label>Button label (Nepali)</Label><Input value={b.ctaLabelNe} onChange={(e) => setBanner(i, "ctaLabelNe", e.target.value)} /></Field>
              <Field style={{ gridColumn: "1 / -1" }}><Label>Button link</Label><Input value={b.ctaLink} onChange={(e) => setBanner(i, "ctaLink", e.target.value)} placeholder="/admissions" /></Field>
            </BannerGrid>
          </BannerCard>
        ))}
      </Card>
    </>
  );
}

const Header = styled.div`display: flex; align-items: center; justify-content: space-between; margin-bottom: ${({ theme }) => theme.space[6]}; h1 { font-size: ${({ theme }) => theme.fontSizes["3xl"]}; }`;
const Muted = styled.p`color: ${({ theme }) => theme.colors.textMuted}; font-size: ${({ theme }) => theme.fontSizes.sm};`;
const SocialGrid = styled.div`display: grid; grid-template-columns: 1fr 1fr; gap: ${({ theme }) => theme.space[4]}; margin-top: ${({ theme }) => theme.space[4]}; ${({ theme }) => theme.media.mobile(`grid-template-columns: 1fr;`)}`;
const ToggleRow = styled.div`display: flex; align-items: center; justify-content: space-between; gap: ${({ theme }) => theme.space[4]}; h3 { display: flex; align-items: center; gap: 8px; }`;
const Switch = styled.button`
  width: 52px; height: 30px; border-radius: ${({ theme }) => theme.radii.pill}; flex-shrink: 0;
  background: ${({ theme, $on }) => ($on ? theme.colors.success : theme.colors.border)};
  position: relative; transition: background ${({ theme }) => theme.transitions.base};
  span { position: absolute; top: 3px; left: ${({ $on }) => ($on ? "25px" : "3px")}; width: 24px; height: 24px; border-radius: 50%; background: #fff; transition: left ${({ theme }) => theme.transitions.base}; }
`;
const SpaceBetween = styled.div`display: flex; align-items: center; justify-content: space-between; gap: ${({ theme }) => theme.space[4]}; margin-bottom: ${({ theme }) => theme.space[4]};`;
const BannerCard = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border}; border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.space[4]}; margin-top: ${({ theme }) => theme.space[4]};
  display: flex; flex-direction: column; gap: ${({ theme }) => theme.space[3]};
`;
const BannerHead = styled.div`display: flex; align-items: center; justify-content: space-between;`;
const BannerGrid = styled.div`display: grid; grid-template-columns: 1fr 1fr; gap: ${({ theme }) => theme.space[3]}; ${({ theme }) => theme.media.mobile(`grid-template-columns: 1fr;`)}`;
const BannerMedia = styled.div`display: grid; grid-template-columns: 1fr 1fr; gap: ${({ theme }) => theme.space[4]}; ${({ theme }) => theme.media.mobile(`grid-template-columns: 1fr;`)}`;
const BulkAdd = styled.div`
  border: 1px dashed ${({ theme }) => theme.colors.border}; border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.space[4]}; margin-top: ${({ theme }) => theme.space[4]};
  background: ${({ theme }) => theme.colors.surfaceAlt};
`;
const IconBtn = styled.button`
  width: 32px; height: 32px; display: grid; place-items: center; border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme, $danger }) => ($danger ? theme.colors.danger : theme.colors.secondary)};
  background: ${({ theme, $danger }) => ($danger ? theme.colors.dangerSoft : theme.colors.secondarySoft)};
`;

export default ManageSettings;
