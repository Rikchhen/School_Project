import { useEffect, useState } from "react";
import styled from "styled-components";
import { Plus, Trash2, Save, Heart, ShieldCheck, ArrowUp, ArrowDown, CornerDownRight } from "lucide-react";
import { api } from "../../lib/api";
import { useToast } from "../../context/ToastContext";
import { useSettings } from "../../context/SettingsContext";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Field, Label, Input, Select, Textarea } from "../../components/ui/Input";
import { PasswordInput } from "../../components/ui/PasswordInput";
import { Skeleton } from "../../components/ui/Skeleton";
import { ImageUploader } from "../../components/ImageUploader";
import { MultiImageUploader } from "../../components/MultiImageUploader";
import { RichTextEditor } from "../../components/admin/RichTextEditor";
import { useAuth } from "../../context/AuthContext";
import { useConfirm } from "../../context/ConfirmContext";
import { Link } from "../../lib/router";

const SOCIAL_FIELDS = ["facebook", "instagram", "youtube", "twitter", "tiktok", "linkedin", "whatsapp"];
const BUILTIN_DESTINATIONS = ["/", "/about", "/academic", "/syllabus", "/admissions", "/gallery", "/notices", "/events", "/committee", "/faculty", "/contact", "/donation"].map((url) => ({ url, label: `Built-in · ${url}` }));
const DEFAULT_NAVIGATION = [
  { label: "Home", labelNe: "गृह", url: "/", external: false, children: [] },
  { label: "About", labelNe: "हाम्रो बारेमा", url: "", external: false, children: [
    { label: "About", labelNe: "हाम्रो बारेमा", url: "/about", external: false },
    { label: "Committee", labelNe: "समिति", url: "/committee", external: false },
    { label: "Faculty", labelNe: "शिक्षक", url: "/faculty", external: false },
  ] },
  { label: "Academic", labelNe: "शैक्षिक", url: "", external: false, children: [
    { label: "Academic", labelNe: "शैक्षिक", url: "/academic", external: false },
    { label: "Syllabus", labelNe: "पाठ्यक्रम", url: "/syllabus", external: false },
  ] },
  { label: "Admissions", labelNe: "भर्ना", url: "/admissions", external: false, children: [] },
  { label: "Media", labelNe: "मिडिया", url: "", external: false, children: [
    { label: "Gallery", labelNe: "ग्यालरी", url: "/gallery", external: false },
    { label: "Notice Board", labelNe: "सूचना पाटी", url: "/notices", external: false },
    { label: "News & Events", labelNe: "खबर र कार्यक्रम", url: "/events", external: false },
  ] },
  { label: "Contact", labelNe: "सम्पर्क", url: "/contact", external: false, children: [] },
];

function DestinationPicker({ value, onChange, destinations }) {
  return (
    <DestinationGrid>
      <Select value={destinations.some((item) => item.url === value) ? value : ""} onChange={(e) => e.target.value && onChange(e.target.value)}>
        <option value="">Choose an existing page…</option>
        {destinations.map((item) => <option key={item.url} value={item.url}>{item.label}</option>)}
      </Select>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder="Or type /page/slug or https://example.com" />
    </DestinationGrid>
  );
}

export function ManageSettings() {
  const { confirmRemove } = useConfirm();
  const toast = useToast();
  const { refetch } = useSettings();
  const { admin, logout } = useAuth();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [twoFactorSetup, setTwoFactorSetup] = useState(null);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState([]);
  const [disablePassword, setDisablePassword] = useState("");
  const [pageDestinations, setPageDestinations] = useState([]);
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwSaving, setPwSaving] = useState(false);

  const changePassword = async () => {
    if (pw.newPassword.length < 8) return toast.error("New password must be at least 8 characters");
    if (pw.newPassword !== pw.confirmPassword) return toast.error("New passwords do not match");
    setPwSaving(true);
    try {
      await api.post("/auth/change-password", { currentPassword: pw.currentPassword, newPassword: pw.newPassword });
      setPw({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Password updated successfully");
    } catch (e) { toast.error(e.message || "Could not change password"); }
    finally { setPwSaving(false); }
  };

  const startTwoFactor = async () => { try { setTwoFactorSetup(await api.post("/auth/2fa/setup")); } catch (e) { toast.error(e.message); } };
  const confirmTwoFactor = async () => { try { const r = await api.post("/auth/2fa/confirm", { code: twoFactorCode }); setRecoveryCodes(r.recoveryCodes); setTwoFactorSetup(null); toast.success("Two-factor authentication enabled"); } catch (e) { toast.error(e.message); } };
  const disableTwoFactor = async () => { try { await api.post("/auth/2fa/disable", { password: disablePassword }); toast.success("Two-factor authentication disabled; please sign in again"); await logout(); } catch (e) { toast.error(e.message); } };
  const logoutEverywhere = async () => { try { await api.post("/auth/logout-all"); await logout(); } catch (e) { toast.error(e.message); } };

  useEffect(() => {
    api.get("/settings").then((r) => {
      const s = r.settings || {};
      const a = s.announcement || {};
      const branding = s.branding || {};
      setForm({
        socials: { ...Object.fromEntries(SOCIAL_FIELDS.map((k) => [k, s.socials?.[k] || ""])) },
        donationEnabled: !!s.donationEnabled,
        heroOpacity: typeof s.heroOpacity === "number" ? s.heroOpacity : 1,
        branding: {
          logoUrl: branding.logoUrl || "", logoHeight: branding.logoHeight ?? 64,
          showLogoRing: !!branding.showLogoRing, schoolName: branding.schoolName || "",
          schoolNameNe: branding.schoolNameNe || "", tagline: branding.tagline || "", taglineNe: branding.taglineNe || "",
        },
        principal: {
          name: "", nameNe: "", role: "", roleNe: "", photoUrl: "", message: "", messageNe: "",
          ...(s.principal || {}),
        },
        banners: (s.banners || []).map((b) => ({ ...b })),
        announcement: {
          enabled: !!a.enabled, text: a.text || "", textNe: a.textNe || "",
          link: a.link || "", linkLabel: a.linkLabel || "", linkLabelNe: a.linkLabelNe || "",
        },
        partners: (s.partners || []).map((p) => ({ name: p.name || "", logoUrl: p.logoUrl || "", url: p.url || "" })),
        navigation: (s.navigation?.length ? s.navigation : DEFAULT_NAVIGATION).map((item) => ({
          label: item.label || "", labelNe: item.labelNe || "", url: item.url || "", external: !!item.external,
          children: (item.children || []).map((child) => ({ label: child.label || "", labelNe: child.labelNe || "", url: child.url || "", external: !!child.external })),
        })),
        stats: (s.stats || []).map((x) => ({ value: x.value ?? 0, suffix: x.suffix || "", label: x.label || "", labelNe: x.labelNe || "" })),
        contact: {
          address: "", addressNe: "", phone: "", email: "", hours: "", hoursNe: "", mapUrl: "",
          ...(s.contact || {}),
        },
        facilities: (s.facilities || []).map((x) => ({ icon: x.icon || "library", title: x.title || "", titleNe: x.titleNe || "", desc: x.desc || "", descNe: x.descNe || "" })),
      });
    }).catch((e) => toast.error(e.message));
  }, [toast]);
  useEffect(() => {
    api.get("/pages").then((r) => setPageDestinations((r.items || []).map((page) => ({
      url: `/page/${page.slug}`, label: `Created page · ${page.title || page.slug}`,
    })))).catch(() => setPageDestinations([]));
  }, []);
  useEffect(() => {
    if (!form || !window.location.hash) return;
    const frame = requestAnimationFrame(() => document.getElementById(window.location.hash.slice(1))?.scrollIntoView({ block: "start" }));
    return () => cancelAnimationFrame(frame);
  }, [form]);

  const setSocial = (k, v) => setForm((f) => ({ ...f, socials: { ...f.socials, [k]: v } }));
  const setBranding = (k, v) => setForm((f) => ({ ...f, branding: { ...f.branding, [k]: v } }));
  const setPrincipal = (k, v) => setForm((f) => ({ ...f, principal: { ...f.principal, [k]: v } }));
  const setAnn = (k, v) => setForm((f) => ({ ...f, announcement: { ...f.announcement, [k]: v } }));
  const setPartner = (i, k, v) => setForm((f) => ({ ...f, partners: f.partners.map((p, idx) => (idx === i ? { ...p, [k]: v } : p)) }));
  const addPartner = () => setForm((f) => ({ ...f, partners: [...f.partners, { name: "", logoUrl: "", url: "" }] }));
  const removePartner = async (i) => (await confirmRemove(`partner “${form.partners[i]?.name || i + 1}”`)) && setForm((f) => ({ ...f, partners: f.partners.filter((_, idx) => idx !== i) }));
  const setNav = (i, key, value) => setForm((f) => ({ ...f, navigation: f.navigation.map((item, index) => index === i ? { ...item, [key]: value } : item) }));
  const addNav = () => setForm((f) => ({ ...f, navigation: [...f.navigation, { label: "", labelNe: "", url: "", external: false, children: [] }] }));
  const removeNav = async (i) => (await confirmRemove(`navigation item “${form.navigation[i]?.label || i + 1}”`)) && setForm((f) => ({ ...f, navigation: f.navigation.filter((_, index) => index !== i) }));
  const moveNav = (i, direction) => setForm((f) => {
    const target = i + direction; if (target < 0 || target >= f.navigation.length) return f;
    const navigation = [...f.navigation]; [navigation[i], navigation[target]] = [navigation[target], navigation[i]];
    return { ...f, navigation };
  });
  const addChild = (i) => setForm((f) => ({ ...f, navigation: f.navigation.map((item, index) => index === i ? { ...item, children: [...item.children, { label: "", labelNe: "", url: "", external: false }] } : item) }));
  const setChild = (i, j, key, value) => setForm((f) => ({ ...f, navigation: f.navigation.map((item, index) => index === i ? { ...item, children: item.children.map((child, childIndex) => childIndex === j ? { ...child, [key]: value } : child) } : item) }));
  const removeChild = async (i, j) => (await confirmRemove(`submenu item “${form.navigation[i]?.children[j]?.label || j + 1}”`)) && setForm((f) => ({ ...f, navigation: f.navigation.map((item, index) => index === i ? { ...item, children: item.children.filter((_, childIndex) => childIndex !== j) } : item) }));
  const moveChild = (i, j, direction) => setForm((f) => ({ ...f, navigation: f.navigation.map((item, index) => {
    if (index !== i) return item; const target = j + direction; if (target < 0 || target >= item.children.length) return item;
    const children = [...item.children]; [children[j], children[target]] = [children[target], children[j]]; return { ...item, children };
  }) }));
  const setContact = (k, v) => setForm((f) => ({ ...f, contact: { ...f.contact, [k]: v } }));
  const setStat = (i, k, v) => setForm((f) => ({ ...f, stats: f.stats.map((s, idx) => (idx === i ? { ...s, [k]: v } : s)) }));
  const addStat = () => setForm((f) => ({ ...f, stats: [...f.stats, { value: 0, suffix: "+", label: "", labelNe: "" }] }));
  const removeStat = async (i) => (await confirmRemove(`stat “${form.stats[i]?.label || i + 1}”`)) && setForm((f) => ({ ...f, stats: f.stats.filter((_, idx) => idx !== i) }));
  const setFacility = (i, k, v) => setForm((f) => ({ ...f, facilities: f.facilities.map((x, idx) => (idx === i ? { ...x, [k]: v } : x)) }));
  const addFacility = () => setForm((f) => ({ ...f, facilities: [...f.facilities, { icon: "library", title: "", titleNe: "", desc: "", descNe: "" }] }));
  const removeFacility = async (i) => (await confirmRemove(`facility “${form.facilities[i]?.title || i + 1}”`)) && setForm((f) => ({ ...f, facilities: f.facilities.filter((_, idx) => idx !== i) }));
  const setBanner = (i, k, v) => setForm((f) => ({ ...f, banners: f.banners.map((b, idx) => (idx === i ? { ...b, [k]: v } : b)) }));
  const addBanner = () => setForm((f) => ({ ...f, banners: [...f.banners, { imageUrl: "", title: "", titleNe: "", subtitle: "", subtitleNe: "", ctaLabel: "", ctaLabelNe: "", ctaLink: "", order: f.banners.length + 1 }] }));
  const removeBanner = async (i) => (await confirmRemove(`banner ${i + 1}`)) && setForm((f) => ({ ...f, banners: f.banners.filter((_, idx) => idx !== i) }));

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
        <h3><ShieldCheck size={18} /> Account security</h3>
        <Muted>Protect this administrator account with an authenticator app and revoke active sessions.</Muted>

        <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #e5e7eb" }}>
          <strong style={{ display: "block", marginBottom: 4 }}>Change password</strong>
          <Muted>Update the password you use to sign in to the admin panel.</Muted>
          <SocialGrid style={{ marginTop: 12 }}>
            <Field style={{ gridColumn: "1 / -1" }}><Label>Current password</Label><PasswordInput autoComplete="current-password" value={pw.currentPassword} onChange={(e) => setPw((p) => ({ ...p, currentPassword: e.target.value }))} /></Field>
            <Field><Label>New password</Label><PasswordInput autoComplete="new-password" value={pw.newPassword} onChange={(e) => setPw((p) => ({ ...p, newPassword: e.target.value }))} /></Field>
            <Field><Label>Confirm new password</Label><PasswordInput autoComplete="new-password" value={pw.confirmPassword} onChange={(e) => setPw((p) => ({ ...p, confirmPassword: e.target.value }))} /></Field>
          </SocialGrid>
          <Button style={{ marginTop: 12 }} $variant="primary" onClick={changePassword} disabled={pwSaving || !pw.currentPassword || !pw.newPassword}>{pwSaving ? "Updating…" : "Update password"}</Button>
        </div>

        {!admin?.twoFactorEnabled && !twoFactorSetup && <Button style={{ marginTop: 14 }} $variant="outline" onClick={startTwoFactor}>Set up two-factor authentication</Button>}
        {twoFactorSetup && <SocialGrid>
          <Field style={{ gridColumn: "1 / -1" }}><Label>Authenticator secret</Label><Input readOnly value={twoFactorSetup.secret} /><Muted>Add this secret to your authenticator app, then enter its six-digit code.</Muted></Field>
          <Field><Label>Six-digit code</Label><Input inputMode="numeric" value={twoFactorCode} onChange={(e) => setTwoFactorCode(e.target.value)} /></Field>
          <Button $variant="primary" onClick={confirmTwoFactor}>Confirm and enable</Button>
        </SocialGrid>}
        {recoveryCodes.length > 0 && <RecoveryBox><strong>Save these one-use recovery codes now:</strong><code>{recoveryCodes.join("\n")}</code></RecoveryBox>}
        {admin?.twoFactorEnabled && <SocialGrid><Field><Label>Current password</Label><PasswordInput value={disablePassword} onChange={(e) => setDisablePassword(e.target.value)} /></Field><Button $variant="outline" onClick={disableTwoFactor}>Disable two-factor authentication</Button></SocialGrid>}
        <Button style={{ marginTop: 14 }} $variant="ghost" onClick={logoutEverywhere}>Log out all devices</Button>
      </Card>

      <Card id="branding" $pad={6} style={{ marginBottom: 20, scrollMarginTop: 84 }}>
        <h3>Header &amp; branding</h3>
        <Muted>These details appear in the public site header. School name and tagline support bold, italic, underline, colour, font family and font size.</Muted>
        <SocialGrid>
          <Field style={{ gridColumn: "1 / -1" }}>
            <Label>School logo</Label>
            <ImageUploader value={form.branding.logoUrl} onUploaded={(url) => setBranding("logoUrl", url)} label="Upload school logo" />
          </Field>
          <Field>
            <Label>Logo height: {form.branding.logoHeight}px</Label>
            <Input type="range" min="40" max="96" step="1" value={form.branding.logoHeight}
              onChange={(e) => setBranding("logoHeight", Number(e.target.value))} />
          </Field>
          <InlineCheck>
            <input type="checkbox" checked={form.branding.showLogoRing}
              onChange={(e) => setBranding("showLogoRing", e.target.checked)} />
            Show circular background behind logo
          </InlineCheck>
          <Field style={{ gridColumn: "1 / -1" }}><Label>School name (English)</Label>
            <RichTextEditor value={form.branding.schoolName} onChange={(html) => setBranding("schoolName", html)} placeholder="Adarsha Rastriya Secondary School" />
          </Field>
          <Field style={{ gridColumn: "1 / -1" }}><Label>School name (Nepali)</Label>
            <RichTextEditor value={form.branding.schoolNameNe} onChange={(html) => setBranding("schoolNameNe", html)} placeholder="विद्यालयको नेपाली नाम" />
          </Field>
          <Field style={{ gridColumn: "1 / -1" }}><Label>Tagline (English)</Label>
            <RichTextEditor value={form.branding.tagline} onChange={(html) => setBranding("tagline", html)} placeholder="Lalgadh, Dhanusha · Est. 2029 BS" />
          </Field>
          <Field style={{ gridColumn: "1 / -1" }}><Label>Tagline (Nepali)</Label>
            <RichTextEditor value={form.branding.taglineNe} onChange={(html) => setBranding("taglineNe", html)} placeholder="लालगढ, धनुषा" />
          </Field>
        </SocialGrid>
      </Card>

      <Card id="principal" $pad={6} style={{ marginBottom: 20, scrollMarginTop: 84 }}>
        <h3>🎓 Message from the Principal</h3>
        <Muted>Shown on the home and About pages. Add the photo, name, role and message — in English and Nepali.</Muted>
        <SocialGrid>
          <Field><Label>Name (English)</Label><Input value={form.principal.name} onChange={(e) => setPrincipal("name", e.target.value)} /></Field>
          <Field><Label>Name (Nepali)</Label><Input value={form.principal.nameNe} onChange={(e) => setPrincipal("nameNe", e.target.value)} /></Field>
          <Field><Label>Role (English)</Label><Input value={form.principal.role} onChange={(e) => setPrincipal("role", e.target.value)} placeholder="Principal" /></Field>
          <Field><Label>Role (Nepali)</Label><Input value={form.principal.roleNe} onChange={(e) => setPrincipal("roleNe", e.target.value)} placeholder="प्रधानाध्यापक" /></Field>
          <Field style={{ gridColumn: "1 / -1" }}>
            <Label>Message (English)</Label>
            <RichTextEditor value={form.principal.message} onChange={(html) => setPrincipal("message", html)} placeholder="Write the principal's message in English…" />
          </Field>
          <Field style={{ gridColumn: "1 / -1" }}>
            <Label>Message (Nepali)</Label>
            <RichTextEditor value={form.principal.messageNe} onChange={(html) => setPrincipal("messageNe", html)} placeholder="नेपालीमा प्रधानाध्यापकको सन्देश लेख्नुहोस्…" />
          </Field>
          <Field style={{ gridColumn: "1 / -1" }}>
            <Label>Photo</Label>
            <ImageUploader value={form.principal.photoUrl} onUploaded={(url) => setPrincipal("photoUrl", url)} label="Upload principal photo" />
          </Field>
        </SocialGrid>
      </Card>

      <Card id="navigation" $pad={6} style={{ marginBottom: 20, scrollMarginTop: 84 }}>
        <SpaceBetween>
          <div><h3>Navigation menu</h3><Muted>Choose any built-in page or any old/new page created in the Pages manager.</Muted></div>
          <NavHeaderActions><Button as={Link} to="/admin/pages" $variant="ghost" $size="sm">Create / edit pages</Button><Button $variant="outline" $size="sm" onClick={addNav}><Plus size={16} /> Add menu item</Button></NavHeaderActions>
        </SpaceBetween>
        {form.navigation.length === 0 && <Muted>No navigation items. Add one to begin building the public menu.</Muted>}
        {form.navigation.map((item, i) => (
          <BannerCard key={i}>
            <BannerHead>
              <strong>Menu item {i + 1}{item.children.length ? " · Dropdown" : ""}</strong>
              <OrderActions>
                <IconBtn onClick={() => moveNav(i, -1)} disabled={i === 0} aria-label="Move up"><ArrowUp size={15} /></IconBtn>
                <IconBtn onClick={() => moveNav(i, 1)} disabled={i === form.navigation.length - 1} aria-label="Move down"><ArrowDown size={15} /></IconBtn>
                <IconBtn $danger onClick={() => removeNav(i)} aria-label="Remove"><Trash2 size={16} /></IconBtn>
              </OrderActions>
            </BannerHead>
            <BannerGrid>
              <Field><Label>Label (English)</Label><Input value={item.label} onChange={(e) => setNav(i, "label", e.target.value)} /></Field>
              <Field><Label>Label (Nepali)</Label><Input value={item.labelNe} onChange={(e) => setNav(i, "labelNe", e.target.value)} /></Field>
              <Field style={{ gridColumn: "1 / -1" }}><Label>Link {item.children.length ? "(ignored while dropdown has children)" : ""}</Label><DestinationPicker destinations={[...BUILTIN_DESTINATIONS, ...pageDestinations]} value={item.url} onChange={(value) => setNav(i, "url", value)} /></Field>
              <InlineCheck><input type="checkbox" checked={item.external} onChange={(e) => setNav(i, "external", e.target.checked)} /> Open in a new tab</InlineCheck>
            </BannerGrid>
            {item.children.map((child, j) => (
              <ChildCard key={j}>
                <ChildHead><strong><CornerDownRight size={15} /> Sub-item {j + 1}</strong><OrderActions>
                  <IconBtn onClick={() => moveChild(i, j, -1)} disabled={j === 0} aria-label="Move sub-item up"><ArrowUp size={14} /></IconBtn>
                  <IconBtn onClick={() => moveChild(i, j, 1)} disabled={j === item.children.length - 1} aria-label="Move sub-item down"><ArrowDown size={14} /></IconBtn>
                  <IconBtn $danger onClick={() => removeChild(i, j)} aria-label="Remove sub-item"><Trash2 size={14} /></IconBtn>
                </OrderActions></ChildHead>
                <BannerGrid>
                  <Field><Label>Label (English)</Label><Input value={child.label} onChange={(e) => setChild(i, j, "label", e.target.value)} /></Field>
                  <Field><Label>Label (Nepali)</Label><Input value={child.labelNe} onChange={(e) => setChild(i, j, "labelNe", e.target.value)} /></Field>
                  <Field style={{ gridColumn: "1 / -1" }}><Label>Link</Label><DestinationPicker destinations={[...BUILTIN_DESTINATIONS, ...pageDestinations]} value={child.url} onChange={(value) => setChild(i, j, "url", value)} /></Field>
                  <InlineCheck><input type="checkbox" checked={child.external} onChange={(e) => setChild(i, j, "external", e.target.checked)} /> Open in a new tab</InlineCheck>
                </BannerGrid>
              </ChildCard>
            ))}
            <Button $variant="ghost" $size="sm" onClick={() => addChild(i)}><Plus size={15} /> Add dropdown item</Button>
          </BannerCard>
        ))}
      </Card>

      <Card id="announcement" $pad={6} style={{ marginBottom: 20, scrollMarginTop: 84 }}>
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

      <Card id="partners" $pad={6} style={{ marginBottom: 20, scrollMarginTop: 84 }}>
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

      <Card id="contact" $pad={6} style={{ marginBottom: 20, scrollMarginTop: 84 }}>
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

      <Card id="stats" $pad={6} style={{ marginBottom: 20, scrollMarginTop: 84 }}>
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

      <Card id="facilities" $pad={6} style={{ marginBottom: 20, scrollMarginTop: 84 }}>
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

      <Card id="socials" $pad={6} style={{ marginBottom: 20, scrollMarginTop: 84 }}>
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

      <Card id="banners" $pad={6} style={{ scrollMarginTop: 84 }}>
        <SpaceBetween>
          <div><h3>Hero banners</h3><Muted>Slides shown in the animated banner on the Home page.</Muted></div>
          <Button $variant="outline" $size="sm" onClick={addBanner}><Plus size={16} /> Add banner</Button>
        </SpaceBetween>

        <OpacityRow>
          <div>
            <Label>Hero image opacity — {Math.round((form.heroOpacity ?? 1) * 100)}%</Label>
            <Muted>How visible the banner photo/video is. 100% = fully clear, lower = faded.</Muted>
          </div>
          <input
            type="range" min="0.2" max="1" step="0.05"
            value={form.heroOpacity ?? 1}
            onChange={(e) => setForm((f) => ({ ...f, heroOpacity: parseFloat(e.target.value) }))}
            style={{ width: 220 }}
            aria-label="Hero image opacity"
          />
        </OpacityRow>

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
                  <button type="button" onClick={async () => (await confirmRemove("this banner video")) && setBanner(i, "videoUrl", "")} style={{ color: "#b1002c", fontSize: 13, fontWeight: 600, marginTop: 6 }}>Remove video</button>
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
const RecoveryBox = styled.div`margin-top: 16px; padding: 16px; border: 1px solid ${({ theme }) => theme.colors.warning}; border-radius: 8px; display: grid; gap: 10px; code { white-space: pre-wrap; }`;
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
const OpacityRow = styled.div`
  display: flex; align-items: center; justify-content: space-between; gap: ${({ theme }) => theme.space[4]};
  border: 1px solid ${({ theme }) => theme.colors.border}; border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.space[4]}; margin-top: ${({ theme }) => theme.space[4]}; flex-wrap: wrap;
  input[type="range"] { accent-color: ${({ theme }) => theme.colors.primary}; }
`;
const IconBtn = styled.button`
  width: 32px; height: 32px; display: grid; place-items: center; border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme, $danger }) => ($danger ? theme.colors.danger : theme.colors.secondary)};
  background: ${({ theme, $danger }) => ($danger ? theme.colors.dangerSoft : theme.colors.secondarySoft)};
`;
const OrderActions = styled.div`display: flex; align-items: center; gap: 5px;`;
const ChildCard = styled.div`border-left: 3px solid ${({ theme }) => theme.colors.secondary}; background: ${({ theme }) => theme.colors.surfaceAlt}; border-radius: ${({ theme }) => theme.radii.md}; padding: ${({ theme }) => theme.space[3]};`;
const ChildHead = styled.div`display: flex; align-items: center; justify-content: space-between; margin-bottom: ${({ theme }) => theme.space[3]}; strong { display: inline-flex; align-items: center; gap: 6px; }`;
const InlineCheck = styled.label`display: inline-flex; align-items: center; gap: 8px; color: ${({ theme }) => theme.colors.textBody}; font-size: ${({ theme }) => theme.fontSizes.sm}; input { accent-color: ${({ theme }) => theme.colors.primary}; }`;
const DestinationGrid = styled.div`display: grid; grid-template-columns: minmax(180px, 0.8fr) minmax(220px, 1.2fr); gap: ${({ theme }) => theme.space[2]}; ${({ theme }) => theme.media.mobile(`grid-template-columns: 1fr;`)}`;
const NavHeaderActions = styled.div`display: flex; gap: ${({ theme }) => theme.space[2]}; flex-wrap: wrap; justify-content: flex-end;`;

export default ManageSettings;
