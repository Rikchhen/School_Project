import { useEffect, useState } from "react";
import styled from "styled-components";
import { Save, Eye, EyeOff, Landmark, Smartphone, Image as ImageIcon } from "lucide-react";
import { api } from "../../lib/api";
import { useToast } from "../../context/ToastContext";
import { useSettings } from "../../context/SettingsContext";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Field, Label, Input } from "../../components/ui/Input";
import { Skeleton } from "../../components/ui/Skeleton";
import { ImageUploader } from "../../components/ImageUploader";
import { RichTextEditor } from "../../components/admin/RichTextEditor";

export function ManageDonation() {
  const toast = useToast();
  const { refetch } = useSettings();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get("/settings").catch(() => ({ settings: {} })),
      api.get("/pages/donation").catch(() => ({ page: null })),
    ]).then(([s, p]) => {
      const c = p.page?.content || {};
      setForm({
        enabled: !!s.settings?.donationEnabled,
        title: p.page?.title || "Support Our School",
        titleNe: p.page?.titleNe || "",
        body: p.page?.body || "",
        bodyNe: p.page?.bodyNe || "",
        bankName: c.bankName || "",
        accountName: c.accountName || "",
        accountNumber: c.accountNumber || "",
        esewa: c.esewa || "",
        khalti: c.khalti || "",
        qrEsewa: c.qrEsewa || "",
        qrKhalti: c.qrKhalti || "",
        imageUrl: c.imageUrl || "",
      });
    });
  }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // Hide/unhide takes effect immediately (no need to press "Save changes").
  const toggleVisibility = async () => {
    const next = !form.enabled;
    setForm((f) => ({ ...f, enabled: next }));
    try {
      await api.put("/settings", { donationEnabled: next });
      refetch();
      toast.success(next ? "Donation page is now visible" : "Donation page is now hidden");
    } catch (e) {
      toast.error(e.message || "Could not update visibility");
      setForm((f) => ({ ...f, enabled: !next })); // revert on failure
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.put("/settings", { donationEnabled: form.enabled });
      await api.put("/pages", {
        slug: "donation",
        title: form.title,
        titleNe: form.titleNe,
        body: form.body,
        bodyNe: form.bodyNe,
        published: true,
        content: {
          bankName: form.bankName,
          accountName: form.accountName,
          accountNumber: form.accountNumber,
          esewa: form.esewa,
          khalti: form.khalti,
          qrEsewa: form.qrEsewa,
          qrKhalti: form.qrKhalti,
          imageUrl: form.imageUrl,
        },
      });
      toast.success("Donation page saved");
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
        <h1>Donation Page</h1>
        <Button $variant="primary" onClick={save} disabled={saving}><Save size={18} /> {saving ? "Saving…" : "Save changes"}</Button>
      </Header>

      <VisibilityCard $on={form.enabled}>
        <div>
          <h3>{form.enabled ? <Eye size={18} /> : <EyeOff size={18} />} Page visibility</h3>
          <p>{form.enabled ? "The Donation page is LIVE and shown in the site menu." : "The Donation page is HIDDEN from visitors."}</p>
        </div>
        <Button $variant={form.enabled ? "subtleDanger" : "primary"} onClick={toggleVisibility}>
          {form.enabled ? <><EyeOff size={16} /> Hide page</> : <><Eye size={16} /> Unhide page</>}
        </Button>
      </VisibilityCard>

      <Card $pad={6} style={{ marginBottom: 20 }}>
        <h3>Heading & intro</h3>
        <Grid>
          <Field><Label>Title (English)</Label><Input value={form.title} onChange={(e) => set("title", e.target.value)} /></Field>
          <Field><Label>Title (Nepali)</Label><Input value={form.titleNe} onChange={(e) => set("titleNe", e.target.value)} /></Field>
        </Grid>
        <Field style={{ marginTop: 16 }}><Label>Intro text (English)</Label><RichTextEditor value={form.body} onChange={(html) => set("body", html)} /></Field>
        <Field style={{ marginTop: 16 }}><Label>Intro text (Nepali)</Label><RichTextEditor value={form.bodyNe} onChange={(html) => set("bodyNe", html)} /></Field>
        <Field style={{ marginTop: 16 }}>
          <Label><ImageIcon size={15} /> Banner image (optional)</Label>
          <ImageUploader value={form.imageUrl} onUploaded={(url) => set("imageUrl", url)} label="Upload banner image" />
        </Field>
      </Card>

      <Card $pad={6} style={{ marginBottom: 20 }}>
        <h3><Landmark size={18} /> Bank details</h3>
        <Grid>
          <Field><Label>Bank name</Label><Input value={form.bankName} onChange={(e) => set("bankName", e.target.value)} /></Field>
          <Field><Label>Account name</Label><Input value={form.accountName} onChange={(e) => set("accountName", e.target.value)} /></Field>
          <Field style={{ gridColumn: "1 / -1" }}><Label>Account number</Label><Input value={form.accountNumber} onChange={(e) => set("accountNumber", e.target.value)} /></Field>
        </Grid>
      </Card>

      <Card $pad={6}>
        <h3><Smartphone size={18} /> Digital wallets & QR codes</h3>
        <Grid>
          <div>
            <Field><Label>eSewa ID</Label><Input value={form.esewa} onChange={(e) => set("esewa", e.target.value)} /></Field>
            <Field style={{ marginTop: 12 }}><Label>eSewa QR image</Label>
              <ImageUploader value={form.qrEsewa} onUploaded={(url) => set("qrEsewa", url)} label="Upload eSewa QR" />
            </Field>
          </div>
          <div>
            <Field><Label>Khalti ID</Label><Input value={form.khalti} onChange={(e) => set("khalti", e.target.value)} /></Field>
            <Field style={{ marginTop: 12 }}><Label>Khalti QR image</Label>
              <ImageUploader value={form.qrKhalti} onUploaded={(url) => set("qrKhalti", url)} label="Upload Khalti QR" />
            </Field>
          </div>
        </Grid>
      </Card>
    </>
  );
}

const Header = styled.div`display: flex; align-items: center; justify-content: space-between; margin-bottom: ${({ theme }) => theme.space[6]}; h1 { font-size: ${({ theme }) => theme.fontSizes["3xl"]}; } h3 { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }`;
const VisibilityCard = styled(Card)`
  display: flex; align-items: center; justify-content: space-between; gap: ${({ theme }) => theme.space[4]};
  margin-bottom: ${({ theme }) => theme.space[5]}; flex-wrap: wrap;
  border-left: 4px solid ${({ theme, $on }) => ($on ? theme.colors.success : theme.colors.borderStrong)};
  h3 { display: flex; align-items: center; gap: 8px; }
  p { color: ${({ theme }) => theme.colors.textMuted}; font-size: ${({ theme }) => theme.fontSizes.sm}; margin-top: 4px; }
`;
const Grid = styled.div`display: grid; grid-template-columns: 1fr 1fr; gap: ${({ theme }) => theme.space[4]}; margin-top: ${({ theme }) => theme.space[4]}; ${({ theme }) => theme.media.mobile(`grid-template-columns: 1fr;`)}`;

export default ManageDonation;
