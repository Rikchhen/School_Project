import { useState } from "react";
import styled from "styled-components";
import { Send, CheckCircle2 } from "lucide-react";
import { useLang } from "../context/LanguageContext";
import { useToast } from "../context/ToastContext";
import { api } from "../lib/api";
import { Container, Section } from "./ui/Layout";
import { Reveal } from "./Reveal";

const EMPTY = { name: "", email: "", phone: "", message: "" };

/** Conversion-focused bottom CTA block with a compact enquiry form. */
export function FinalCTA() {
  const { t } = useLang();
  const toast = useToast();
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post("/submissions/admission", { ...form, message: form.message || "Quick enquiry from homepage." });
      toast.success(t("home.qSuccess"));
      setForm(EMPTY);
      setDone(true);
    } catch (err) {
      toast.error(err.message || "Could not send");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Section>
      <Container>
        <Reveal>
          <Panel>
            <Left>
              <h2>{t("home.finalCtaTitle")}</h2>
              <p>{t("home.finalCtaBody")}</p>
            </Left>
            <FormCard onSubmit={submit}>
              {done && <Ok><CheckCircle2 size={16} /> {t("home.qSuccess")}</Ok>}
              <Row>
                <input required placeholder={t("home.qName")} value={form.name} onChange={set("name")} aria-label={t("home.qName")} />
                <input required type="email" placeholder={t("home.qEmail")} value={form.email} onChange={set("email")} aria-label={t("home.qEmail")} />
              </Row>
              <input placeholder={t("home.qPhone")} value={form.phone} onChange={set("phone")} aria-label={t("home.qPhone")} />
              <textarea rows={2} placeholder={t("home.qMessage")} value={form.message} onChange={set("message")} aria-label={t("home.qMessage")} />
              <Submit type="submit" disabled={busy}>
                <Send size={17} /> {busy ? `${t("common.loading")}…` : t("home.qSend")}
              </Submit>
            </FormCard>
          </Panel>
        </Reveal>
      </Container>
    </Section>
  );
}

const Panel = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: ${({ theme }) => theme.space[10]}; align-items: center;
  background: ${({ theme }) => theme.gradients.brandBanner}; color: #fff;
  border-radius: ${({ theme }) => theme.radii.xl};
  padding: ${({ theme }) => theme.space[12]};
  ${({ theme }) => theme.media.tablet(`grid-template-columns: 1fr; gap: 2rem; padding: 2rem;`)}
`;
const Left = styled.div`
  h2 { color: #fff; font-size: ${({ theme }) => theme.fontSizes["4xl"]}; margin-bottom: ${({ theme }) => theme.space[3]};
    ${({ theme }) => theme.media.tablet(`font-size: 1.9rem;`)} }
  p { color: rgba(255,255,255,0.9); line-height: ${({ theme }) => theme.lineHeights.relaxed}; }
`;
const FormCard = styled.form`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.lg}; padding: ${({ theme }) => theme.space[6]};
  display: flex; flex-direction: column; gap: ${({ theme }) => theme.space[3]}; box-shadow: ${({ theme }) => theme.shadows.lg};
  input, textarea {
    width: 100%; border: 1px solid ${({ theme }) => theme.colors.border}; border-radius: ${({ theme }) => theme.radii.md};
    padding: ${({ theme }) => `${theme.space[3]} ${theme.space[4]}`}; font-size: ${({ theme }) => theme.fontSizes.sm};
    font-family: ${({ theme }) => theme.fonts.body}; color: ${({ theme }) => theme.colors.text}; resize: vertical;
    &:focus-visible { outline: none; border-color: ${({ theme }) => theme.colors.secondary}; box-shadow: ${({ theme }) => theme.shadows.focus}; }
  }
`;
const Row = styled.div`display: grid; grid-template-columns: 1fr 1fr; gap: ${({ theme }) => theme.space[3]}; ${({ theme }) => theme.media.mobile(`grid-template-columns: 1fr;`)}`;
const Submit = styled.button`
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  background: ${({ theme }) => theme.colors.primary}; color: #fff; font-weight: 700;
  padding: ${({ theme }) => theme.space[3]}; border-radius: ${({ theme }) => theme.radii.pill};
  &:hover:not(:disabled) { background: ${({ theme }) => theme.colors.primaryDark}; }
  &:disabled { opacity: 0.7; }
`;
const Ok = styled.div`
  display: flex; align-items: center; gap: 8px; color: ${({ theme }) => theme.colors.success};
  background: ${({ theme }) => theme.colors.successSoft}; padding: ${({ theme }) => theme.space[2]} ${({ theme }) => theme.space[3]};
  border-radius: ${({ theme }) => theme.radii.md}; font-size: ${({ theme }) => theme.fontSizes.sm};
`;

export default FinalCTA;
