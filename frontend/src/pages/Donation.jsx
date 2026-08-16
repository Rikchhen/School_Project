import { useState } from "react";
import styled from "styled-components";
import { Landmark, Smartphone, Heart, ShieldCheck, Upload, FileText, X, Lock } from "lucide-react";
import { useLang } from "../context/LanguageContext";
import { useSettings } from "../context/SettingsContext";
import { useToast } from "../context/ToastContext";
import { useFetch } from "../lib/useFetch";
import { api } from "../lib/api";
import { PageHero } from "../components/PageHero";
import { NotFound } from "./NotFound";
import { Container, Section, Grid } from "../components/ui/Layout";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Field, Label, Input } from "../components/ui/Input";
import { RichText } from "../components/RichText";
import { SmartImage } from "../components/SmartImage";
import { Reveal } from "../components/Reveal";
import { useConfirm } from "../context/ConfirmContext";

const EMPTY = { name: "", email: "", phone: "", message: "" };

export function Donation() {
  const { confirmDiscard, confirmRemove } = useConfirm();
  const { t, pickLang, lang } = useLang();
  const { settings, loaded } = useSettings();
  const { data } = useFetch("/pages/donation");
  const page = data?.page;
  const c = page?.content || {};
  const toast = useToast();

  // Donors must verify (name + contact + ID/document) before the payment QRs
  // are revealed. Persisted for the session so a refresh doesn't re-gate.
  const [verified, setVerified] = useState(() => {
    try { return sessionStorage.getItem("donation_verified") === "1"; } catch { return false; }
  });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const closeForm = async () => {
    const hasDraft = file || Object.values(form).some((value) => String(value).trim());
    if (hasDraft && !(await confirmDiscard("Discard this donation verification form and the selected upload?"))) return;
    setOpen(false);
  };
  const removeFile = async () => {
    if (file && await confirmRemove(`selected file “${file.name}”`)) setFile(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!file) { toast.error("Please attach a photo or PDF of your ID / document."); return; }
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("email", form.email);
      fd.append("phone", form.phone);
      fd.append("message", form.message);
      fd.append("document", file);
      await api.post("/submissions/donation", fd);
      try { sessionStorage.setItem("donation_verified", "1"); } catch { /* ignore */ }
      setVerified(true);
      setOpen(false);
      setForm(EMPTY);
      setFile(null);
      toast.success("Verified — you can now proceed to donate.");
    } catch (err) {
      toast.error(err.message || "Submission failed");
    } finally {
      setBusy(false);
    }
  };

  // Avoid a flash before settings load.
  if (!loaded) return null;
  // Respect the admin's hide/unhide toggle — a hidden page fully 404s.
  if (!settings.donationEnabled) return <NotFound />;

  return (
    <>
      <PageHero title={page ? pickLang(page, "title") : t("donation.title")} subtitle={t("donation.subtitle")} lang={lang} />

      <Section $bg="alt">
        <Container>
          <Reveal>
            <Intro>
              {c.imageUrl && <IntroImage><SmartImage src={c.imageUrl} alt={t("donation.title")} height="240px" /></IntroImage>}
              <Heart size={30} />
              {page ? <RichText html={pickLang(page, "body")} /> : <p>{t("donation.subtitle")}</p>}
            </Intro>
          </Reveal>

          {verified ? (
            <>
              <h2 style={{ textAlign: "center", margin: "2.5rem 0 1.5rem" }}>{t("donation.methodsTitle")}</h2>
              <Grid $cols={3}>
                <Reveal>
                  <Method $hover>
                    <IconRound $tone="secondary"><Landmark size={22} /></IconRound>
                    <h3>{t("donation.bank")}</h3>
                    <Row><span>{t("donation.bankName")}</span><b>{c.bankName || "—"}</b></Row>
                    <Row><span>{t("donation.accountName")}</span><b>{c.accountName || "—"}</b></Row>
                    <Row><span>{t("donation.accountNumber")}</span><b>{c.accountNumber || "—"}</b></Row>
                  </Method>
                </Reveal>
                <Reveal delay={80}>
                  <Method $hover>
                    <IconRound $tone="primary"><Smartphone size={22} /></IconRound>
                    <h3>{t("donation.esewa")}</h3>
                    <Row><span>ID</span><b>{c.esewa || "—"}</b></Row>
                    {c.qrEsewa && <QR><SmartImage src={c.qrEsewa} alt="eSewa QR" fit="contain" /></QR>}
                  </Method>
                </Reveal>
                <Reveal delay={160}>
                  <Method $hover>
                    <IconRound $tone="primary"><Smartphone size={22} /></IconRound>
                    <h3>{t("donation.khalti")}</h3>
                    <Row><span>ID</span><b>{c.khalti || "—"}</b></Row>
                    {c.qrKhalti && <QR><SmartImage src={c.qrKhalti} alt="Khalti QR" fit="contain" /></QR>}
                  </Method>
                </Reveal>
              </Grid>
              <Thanks>{t("donation.thanks")}</Thanks>
            </>
          ) : (
            <Reveal>
              <Gate>
                <GateIcon><ShieldCheck size={32} /></GateIcon>
                <h3>Verify to continue</h3>
                <p>
                  To proceed with a donation, please share your name, contact, and a photo or PDF
                  of your ID / supporting document. These details are sent only to the school
                  administration — the payment QR codes are revealed once you submit.
                </p>
                <Button $variant="primary" $size="lg" onClick={() => setOpen(true)}>
                  <Lock size={16} /> Proceed to Donate
                </Button>
              </Gate>
            </Reveal>
          )}
        </Container>
      </Section>

      {open && (
        <Overlay onClick={(event) => event.target === event.currentTarget && !busy && closeForm()}>
          <Panel as="form" onSubmit={submit} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Donor verification">
            <PanelHead>
              <h3><ShieldCheck size={20} /> Donor verification</h3>
              <CloseBtn type="button" onClick={closeForm} aria-label="Close"><X size={20} /></CloseBtn>
            </PanelHead>

            <PanelBody>
              <Field>
                <Label htmlFor="d-name">Full name <span data-req>*</span></Label>
                <Input id="d-name" required value={form.name} onChange={set("name")} />
              </Field>
              <FormRow>
                <Field>
                  <Label htmlFor="d-email">Email <span data-req>*</span></Label>
                  <Input id="d-email" type="email" required value={form.email} onChange={set("email")} />
                </Field>
                <Field>
                  <Label htmlFor="d-phone">Phone</Label>
                  <Input id="d-phone" value={form.phone} onChange={set("phone")} placeholder="+977…" />
                </Field>
              </FormRow>
              <Field>
                <Label>ID / Document (image or PDF) <span data-req>*</span></Label>
                <Drop htmlFor="d-doc" $has={!!file}>
                  {file ? (<><FileText size={18} /> {file.name}</>) : (<><Upload size={18} /> Click to upload your ID / document</>)}
                </Drop>
                <HiddenFile
                  id="d-doc"
                  type="file"
                  accept="image/*,application/pdf"
                  required
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                {file && <RemoveSelected type="button" onClick={removeFile}><X size={15} /> Remove selected file</RemoveSelected>}
                <Hint>Accepted: JPG, PNG, WEBP or PDF · up to 80 MB</Hint>
              </Field>
              <Field>
                <Label htmlFor="d-note">Note (optional)</Label>
                <Input id="d-note" value={form.message} onChange={set("message")} placeholder="e.g. purpose of donation" />
              </Field>
            </PanelBody>

            <PanelFoot>
              <Button type="button" $variant="ghost" onClick={closeForm} disabled={busy}>Cancel</Button>
              <Button type="submit" $variant="primary" disabled={busy}>
                {busy ? "Submitting…" : "Submit & Continue"}
              </Button>
            </PanelFoot>
          </Panel>
        </Overlay>
      )}
    </>
  );
}

const Intro = styled.div`
  background: ${({ theme }) => theme.colors.surface}; border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg}; padding: ${({ theme }) => theme.space[8]};
  text-align: center; max-width: 760px; margin-inline: auto;
  svg { color: ${({ theme }) => theme.colors.primary}; margin-bottom: ${({ theme }) => theme.space[3]}; }
`;
const IntroImage = styled.div`
  border-radius: ${({ theme }) => theme.radii.lg}; overflow: hidden; margin-bottom: ${({ theme }) => theme.space[5]};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;
const Method = styled(Card)`
  display: flex; flex-direction: column; gap: ${({ theme }) => theme.space[2]}; padding: ${({ theme }) => theme.space[6]};
  h3 { color: ${({ theme }) => theme.colors.text}; margin-bottom: ${({ theme }) => theme.space[2]}; }
`;
const IconRound = styled.div`
  width: 48px; height: 48px; display: grid; place-items: center; border-radius: ${({ theme }) => theme.radii.md};
  margin-bottom: ${({ theme }) => theme.space[2]};
  background: ${({ theme, $tone }) => ($tone === "primary" ? theme.colors.primarySoft : theme.colors.secondarySoft)};
  color: ${({ theme, $tone }) => ($tone === "primary" ? theme.colors.primary : theme.colors.secondary)};
`;
const Row = styled.div`
  display: flex; justify-content: space-between; gap: ${({ theme }) => theme.space[3]};
  padding: ${({ theme }) => theme.space[2]} 0; border-bottom: 1px dashed ${({ theme }) => theme.colors.border};
  span { color: ${({ theme }) => theme.colors.textMuted}; font-size: ${({ theme }) => theme.fontSizes.sm}; }
  b { color: ${({ theme }) => theme.colors.text}; }
`;
const QR = styled.div`
  width: 150px; margin-top: ${({ theme }) => theme.space[3]}; border-radius: ${({ theme }) => theme.radii.md};
  overflow: hidden; border: 1px solid ${({ theme }) => theme.colors.border}; background: #fff; padding: 6px;
`;
const Thanks = styled.p`
  text-align: center; margin-top: ${({ theme }) => theme.space[10]};
  color: ${({ theme }) => theme.colors.primary}; font-size: ${({ theme }) => theme.fontSizes.xl}; font-weight: 600;
`;

/* ---------- Verification gate ---------- */
const Gate = styled.div`
  max-width: 620px; margin: ${({ theme }) => theme.space[10]} auto 0;
  text-align: center; display: flex; flex-direction: column; align-items: center; gap: ${({ theme }) => theme.space[4]};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.xl};
  padding: ${({ theme }) => theme.space[12]} ${({ theme }) => theme.space[8]};
  box-shadow: ${({ theme }) => theme.shadows.md};
  h3 { color: ${({ theme }) => theme.colors.text}; font-size: ${({ theme }) => theme.fontSizes["2xl"]}; }
  p { color: ${({ theme }) => theme.colors.textBody}; line-height: ${({ theme }) => theme.lineHeights.relaxed}; }
`;
const GateIcon = styled.div`
  width: 72px; height: 72px; display: grid; place-items: center; border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme }) => theme.colors.secondarySoft}; color: ${({ theme }) => theme.colors.secondary};
`;

/* ---------- Modal ---------- */
const Overlay = styled.div`
  position: fixed; inset: 0; z-index: ${({ theme }) => theme.zIndex.modal};
  background: ${({ theme }) => theme.colors.overlay};
  display: grid; place-items: center; padding: ${({ theme }) => theme.space[4]};
  animation: fadeIn 0.2s ease;
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
`;
const Panel = styled.div`
  width: 100%; max-width: 520px; max-height: 92vh; overflow-y: auto;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.xl};
  display: flex; flex-direction: column;
  animation: pop 0.22s cubic-bezier(0.22,1,0.36,1);
  @keyframes pop { from { opacity: 0; transform: translateY(12px) scale(0.98); } to { opacity: 1; transform: none; } }
`;
const PanelHead = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  padding: ${({ theme }) => theme.space[5]} ${({ theme }) => theme.space[6]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  h3 { display: flex; align-items: center; gap: 8px; color: ${({ theme }) => theme.colors.primary}; font-size: ${({ theme }) => theme.fontSizes.xl}; }
`;
const CloseBtn = styled.button`
  display: grid; place-items: center; width: 34px; height: 34px; border-radius: ${({ theme }) => theme.radii.pill};
  color: ${({ theme }) => theme.colors.textMuted};
  &:hover { background: ${({ theme }) => theme.colors.surfaceAlt}; color: ${({ theme }) => theme.colors.text}; }
`;
const PanelBody = styled.div`
  padding: ${({ theme }) => theme.space[6]};
  display: flex; flex-direction: column; gap: ${({ theme }) => theme.space[4]};
`;
const PanelFoot = styled.div`
  display: flex; justify-content: flex-end; gap: ${({ theme }) => theme.space[3]};
  padding: ${({ theme }) => theme.space[5]} ${({ theme }) => theme.space[6]};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;
const FormRow = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: ${({ theme }) => theme.space[4]};
  ${({ theme }) => theme.media.mobile(`grid-template-columns: 1fr;`)}
`;
const Drop = styled.label`
  display: flex; align-items: center; justify-content: center; gap: 10px;
  padding: ${({ theme }) => theme.space[6]}; cursor: pointer; text-align: center;
  border: 2px dashed ${({ theme, $has }) => ($has ? theme.colors.secondary : theme.colors.border)};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme, $has }) => ($has ? theme.colors.secondarySoft : theme.colors.surfaceAlt)};
  color: ${({ theme, $has }) => ($has ? theme.colors.secondary : theme.colors.textBody)};
  font-size: ${({ theme }) => theme.fontSizes.sm}; font-weight: 600; word-break: break-all;
  transition: border-color ${({ theme }) => theme.transitions.base}, background ${({ theme }) => theme.transitions.base};
  &:hover { border-color: ${({ theme }) => theme.colors.secondary}; }
`;
const HiddenFile = styled.input`
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); border: 0;
`;
const Hint = styled.p`
  color: ${({ theme }) => theme.colors.textMuted}; font-size: ${({ theme }) => theme.fontSizes.xs}; margin-top: 6px;
`;
const RemoveSelected = styled.button`margin-top: 8px; min-height: 40px; display: inline-flex; align-items: center; gap: 7px; color: ${({ theme }) => theme.colors.danger}; font-weight: 600; &:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }`;

export default Donation;
