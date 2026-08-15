import { useState } from "react";
import styled from "styled-components";
import { Send, ClipboardList, FileText, MessageSquare, CheckCircle2 } from "lucide-react";
import { useLang } from "../context/LanguageContext";
import { useToast } from "../context/ToastContext";
import { api } from "../lib/api";
import { PageHero } from "../components/PageHero";
import { Container, Section } from "../components/ui/Layout";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Field, Label, Input, Textarea, HelpText } from "../components/ui/Input";
import { Reveal } from "../components/Reveal";
import { validateFields, required, minLen, email } from "../lib/validate";

const EMPTY = { name: "", email: "", phone: "", studentName: "", gradeApplyingFor: "", message: "" };
const RULES = {
  name: [required("Name"), minLen(2, "Name")],
  email: [required("Email"), email()],
  message: [required("Message"), minLen(5, "Message")],
};

export function Admissions() {
  const { t } = useLang();
  const toast = useToast();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

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
      const res = await api.post("/submissions/admission", form);
      toast.success(res.message || t("admissions.success"));
      setForm(EMPTY);
      setErrors({});
      setDone(true);
    } catch (err) {
      toast.error(err.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { icon: ClipboardList, text: t("admissions.step1") },
    { icon: FileText, text: t("admissions.step2") },
    { icon: MessageSquare, text: t("admissions.step3") },
    { icon: CheckCircle2, text: t("admissions.step4") },
  ];

  return (
    <>
      <PageHero title={t("admissions.title")} titleNe="भर्ना" subtitle={t("admissions.subtitle")} />
      <Section $bg="alt">
        <Container>
          <Layout>
            <Reveal direction="right">
              <h2>{t("admissions.processTitle")}</h2>
              <Steps>
                {steps.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <Step key={i}>
                      <StepIcon>{i + 1}</StepIcon>
                      <div><Icon size={18} /><span>{s.text}</span></div>
                    </Step>
                  );
                })}
              </Steps>
            </Reveal>

            <Reveal direction="left" delay={100}><FormCard as="form" onSubmit={submit}>
              <h3>{t("admissions.formTitle")}</h3>
              {done && <Success><CheckCircle2 size={18} /> {t("admissions.success")}</Success>}
              <Field>
                <Label htmlFor="a-name">{t("admissions.fName")} <span data-req>*</span></Label>
                <Input id="a-name" value={form.name} onChange={update("name")} onBlur={blur("name")} aria-invalid={!!errors.name} aria-describedby="a-name-err" />
                {errors.name && <HelpText id="a-name-err" $error>{errors.name}</HelpText>}
              </Field>
              <Row>
                <Field>
                  <Label htmlFor="a-email">{t("admissions.fEmail")} <span data-req>*</span></Label>
                  <Input id="a-email" type="email" value={form.email} onChange={update("email")} onBlur={blur("email")} aria-invalid={!!errors.email} aria-describedby="a-email-err" />
                  {errors.email && <HelpText id="a-email-err" $error>{errors.email}</HelpText>}
                </Field>
                <Field>
                  <Label htmlFor="a-phone">{t("admissions.fPhone")}</Label>
                  <Input id="a-phone" value={form.phone} onChange={update("phone")} />
                </Field>
              </Row>
              <Row>
                <Field>
                  <Label htmlFor="a-student">{t("admissions.fStudent")}</Label>
                  <Input id="a-student" value={form.studentName} onChange={update("studentName")} />
                </Field>
                <Field>
                  <Label htmlFor="a-grade">{t("admissions.fGrade")}</Label>
                  <Input id="a-grade" value={form.gradeApplyingFor} onChange={update("gradeApplyingFor")} placeholder="e.g. 11" />
                </Field>
              </Row>
              <Field>
                <Label htmlFor="a-msg">{t("admissions.fMessage")} <span data-req>*</span></Label>
                <Textarea id="a-msg" value={form.message} onChange={update("message")} onBlur={blur("message")} aria-invalid={!!errors.message} aria-describedby="a-msg-err" />
                {errors.message && <HelpText id="a-msg-err" $error>{errors.message}</HelpText>}
              </Field>
              <Button type="submit" $variant="primary" $size="lg" disabled={submitting} $fullWidth>
                <Send size={18} /> {submitting ? `${t("common.loading")}…` : t("common.submit")}
              </Button>
            </FormCard></Reveal>
          </Layout>
        </Container>
      </Section>
    </>
  );
}

const Layout = styled.div`
  display: grid; grid-template-columns: 1fr 1.2fr; gap: ${({ theme }) => theme.space[10]};
  align-items: start;
  h2 { color: ${({ theme }) => theme.colors.text}; margin-bottom: ${({ theme }) => theme.space[6]}; }
  ${({ theme }) => theme.media.tablet(`grid-template-columns: 1fr;`)}
`;
const Steps = styled.ol`display: flex; flex-direction: column; gap: ${({ theme }) => theme.space[4]};`;
const Step = styled.li`
  display: flex; align-items: center; gap: ${({ theme }) => theme.space[4]};
  background: ${({ theme }) => theme.colors.surface}; border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg}; padding: ${({ theme }) => theme.space[4]};
  div { display: flex; align-items: center; gap: 10px; color: ${({ theme }) => theme.colors.textBody}; }
  div svg { color: ${({ theme }) => theme.colors.secondary}; }
`;
const StepIcon = styled.span`
  width: 36px; height: 36px; flex-shrink: 0; display: grid; place-items: center;
  border-radius: ${({ theme }) => theme.radii.pill}; background: ${({ theme }) => theme.colors.primary};
  color: #fff; font-weight: 700;
`;
const FormCard = styled(Card)`
  display: flex; flex-direction: column; gap: ${({ theme }) => theme.space[4]}; padding: ${({ theme }) => theme.space[8]};
  h3 { color: ${({ theme }) => theme.colors.primary}; }
`;
const Row = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: ${({ theme }) => theme.space[4]};
  ${({ theme }) => theme.media.mobile(`grid-template-columns: 1fr;`)}
`;
const Success = styled.div`
  display: flex; align-items: center; gap: 8px;
  background: ${({ theme }) => theme.colors.successSoft}; color: ${({ theme }) => theme.colors.success};
  padding: ${({ theme }) => theme.space[3]}; border-radius: ${({ theme }) => theme.radii.md}; font-size: ${({ theme }) => theme.fontSizes.sm};
`;

export default Admissions;
