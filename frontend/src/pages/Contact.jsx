import { useState } from "react";
import styled from "styled-components";
import { Send, MapPin, Phone, Mail, Clock } from "lucide-react";
import { useLang } from "../context/LanguageContext";
import { useSettings } from "../context/SettingsContext";
import { useToast } from "../context/ToastContext";
import { api } from "../lib/api";
import { PageHero } from "../components/PageHero";
import { Container, Section } from "../components/ui/Layout";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Field, Label, Input, Textarea, HelpText } from "../components/ui/Input";
import { Reveal } from "../components/Reveal";
import { validateFields, required, minLen, email } from "../lib/validate";

const EMPTY = { name: "", email: "", phone: "", subject: "", message: "" };
const RULES = {
  name: [required("Name"), minLen(2, "Name")],
  email: [required("Email"), email()],
  message: [required("Message"), minLen(5, "Message")],
};

export function Contact() {
  const { t, pickLang } = useLang();
  const { settings } = useSettings();
  const c = settings.contact || {};
  const toast = useToast();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const update = (k) => (e) => {
    const value = e.target.value;
    setForm((f) => ({ ...f, [k]: value }));
    if (errors[k]) setErrors((prev) => ({ ...prev, [k]: undefined }));
  };
  const blur = (k) => () => setErrors((prev) => ({ ...prev, ...validateFields(form, { [k]: RULES[k] || [] }) }));

  const submit = async (e) => {
    e.preventDefault();
    const found = validateFields(form, RULES);
    if (Object.keys(found).length) { setErrors(found); return; }
    setSubmitting(true);
    try {
      const res = await api.post("/submissions/contact", form);
      toast.success(res.message || t("contact.success"));
      setForm(EMPTY);
      setErrors({});
    } catch (err) {
      toast.error(err.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const info = [
    { icon: MapPin, label: pickLang(c, "address") || t("contact.address") },
    { icon: Phone, label: c.phone || t("contact.phone") },
    { icon: Mail, label: c.email || t("contact.email") },
    { icon: Clock, label: pickLang(c, "hours") || t("contact.hours") },
  ];

  return (
    <>
      <PageHero title={t("contact.title")} titleNe="सम्पर्क गर्नुहोस्" subtitle={t("contact.subtitle")} />
      <Section $bg="alt">
        <Container>
          <Layout>
            <Reveal direction="right"><InfoCol>
              <h2>{t("contact.infoTitle")}</h2>
              {info.map((it, i) => {
                const Icon = it.icon;
                return (
                  <InfoRow key={i}>
                    <span><Icon size={18} /></span>
                    <p>{it.label}</p>
                  </InfoRow>
                );
              })}
              {c.mapUrl ? (
                <MapFrame
                  src={c.mapUrl}
                  title="School location map"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              ) : (
                <MapEmbed aria-hidden>
                  <MapPin size={22} /> {pickLang(c, "address") || t("contact.address")}
                </MapEmbed>
              )}
            </InfoCol></Reveal>

            <Reveal direction="left" delay={100}><FormCard as="form" onSubmit={submit}>
              <h3>{t("contact.formTitle")}</h3>
              <Row>
                <Field>
                  <Label htmlFor="c-name">{t("contact.fName")} <span data-req>*</span></Label>
                  <Input id="c-name" value={form.name} onChange={update("name")} onBlur={blur("name")} aria-invalid={!!errors.name} aria-describedby="c-name-err" />
                  {errors.name && <HelpText id="c-name-err" $error>{errors.name}</HelpText>}
                </Field>
                <Field>
                  <Label htmlFor="c-email">{t("contact.fEmail")} <span data-req>*</span></Label>
                  <Input id="c-email" type="email" value={form.email} onChange={update("email")} onBlur={blur("email")} aria-invalid={!!errors.email} aria-describedby="c-email-err" />
                  {errors.email && <HelpText id="c-email-err" $error>{errors.email}</HelpText>}
                </Field>
              </Row>
              <Row>
                <Field>
                  <Label htmlFor="c-phone">{t("contact.fPhone")}</Label>
                  <Input id="c-phone" value={form.phone} onChange={update("phone")} />
                </Field>
                <Field>
                  <Label htmlFor="c-subject">{t("contact.fSubject")}</Label>
                  <Input id="c-subject" value={form.subject} onChange={update("subject")} />
                </Field>
              </Row>
              <Field>
                <Label htmlFor="c-msg">{t("contact.fMessage")} <span data-req>*</span></Label>
                <Textarea id="c-msg" value={form.message} onChange={update("message")} onBlur={blur("message")} aria-invalid={!!errors.message} aria-describedby="c-msg-err" />
                {errors.message && <HelpText id="c-msg-err" $error>{errors.message}</HelpText>}
              </Field>
              <Button type="submit" $variant="primary" $size="lg" disabled={submitting} $fullWidth>
                <Send size={18} /> {submitting ? `${t("common.loading")}…` : t("common.send")}
              </Button>
            </FormCard></Reveal>
          </Layout>
        </Container>
      </Section>
    </>
  );
}

const Layout = styled.div`
  display: grid; grid-template-columns: 1fr 1.3fr; gap: ${({ theme }) => theme.space[10]}; align-items: start;
  ${({ theme }) => theme.media.tablet(`grid-template-columns: 1fr;`)}
`;
const InfoCol = styled.div`
  display: flex; flex-direction: column; gap: ${({ theme }) => theme.space[4]};
  h2 { color: ${({ theme }) => theme.colors.text}; margin-bottom: ${({ theme }) => theme.space[2]}; }
`;
const InfoRow = styled.div`
  display: flex; align-items: center; gap: ${({ theme }) => theme.space[3]};
  span { width: 42px; height: 42px; flex-shrink: 0; display: grid; place-items: center; border-radius: ${({ theme }) => theme.radii.pill};
         background: ${({ theme }) => theme.colors.primarySoft}; color: ${({ theme }) => theme.colors.primary}; }
  p { color: ${({ theme }) => theme.colors.textBody}; }
`;
const MapFrame = styled.iframe`
  width: 100%; min-height: 220px; border: 0;
  margin-top: ${({ theme }) => theme.space[4]};
  border-radius: ${({ theme }) => theme.radii.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;
const MapEmbed = styled.div`
  margin-top: ${({ theme }) => theme.space[4]};
  min-height: 180px; border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.secondarySoft};
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;
  color: ${({ theme }) => theme.colors.secondary}; text-align: center; padding: ${({ theme }) => theme.space[4]};
  border: 1px dashed ${({ theme }) => theme.colors.secondary};
`;
const FormCard = styled(Card)`
  display: flex; flex-direction: column; gap: ${({ theme }) => theme.space[4]}; padding: ${({ theme }) => theme.space[8]};
  h3 { color: ${({ theme }) => theme.colors.primary}; }
`;
const Row = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: ${({ theme }) => theme.space[4]};
  ${({ theme }) => theme.media.mobile(`grid-template-columns: 1fr;`)}
`;

export default Contact;
