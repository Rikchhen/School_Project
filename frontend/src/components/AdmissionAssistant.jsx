import { useState } from "react";
import styled, { keyframes } from "styled-components";
import { MessageCircle, X, Send, GraduationCap, BookOpen, Phone } from "lucide-react";
import { useRouter } from "../lib/router";
import { useLang } from "../context/LanguageContext";
import { useToast } from "../context/ToastContext";
import { api } from "../lib/api";

/**
 * Floating admission-assistant widget. Quick chips route to key pages; a short
 * message is sent to the contact inbox (POST /submissions/contact).
 */
export function AdmissionAssistant() {
  const { t } = useLang();
  const { navigate } = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const [sending, setSending] = useState(false);

  const go = (path) => { setOpen(false); navigate(path); };

  const send = async (e) => {
    e.preventDefault();
    if (!msg.trim()) return;
    setSending(true);
    try {
      await api.post("/submissions/contact", {
        name: "Website Visitor",
        email: "visitor@website.local",
        subject: "Admission Assistant enquiry",
        message: msg.trim(),
      });
      toast.success(t("assistant.sent"));
      setMsg("");
      setOpen(false);
    } catch (err) {
      toast.error(err.message || "Could not send");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {open && (
        <Panel role="dialog" aria-label={t("assistant.title")}>
          <Head>
            <span><GraduationCap size={18} /> {t("assistant.title")}</span>
            <button onClick={() => setOpen(false)} aria-label="Close"><X size={16} /></button>
          </Head>
          <Body>
            <Greeting>{t("assistant.greeting")}</Greeting>
            <Chips>
              <Chip onClick={() => go("/admissions")}><GraduationCap size={14} /> {t("assistant.qAdmission")}</Chip>
              <Chip onClick={() => go("/academic")}><BookOpen size={14} /> {t("assistant.qCourses")}</Chip>
              <Chip onClick={() => go("/contact")}><Phone size={14} /> {t("assistant.qContact")}</Chip>
            </Chips>
          </Body>
          <Form onSubmit={send}>
            <input value={msg} onChange={(e) => setMsg(e.target.value)} placeholder={t("assistant.placeholder")} aria-label={t("assistant.placeholder")} />
            <button type="submit" disabled={sending} aria-label={t("assistant.send")}><Send size={16} /></button>
          </Form>
        </Panel>
      )}
      <Fab className="no-print" onClick={() => setOpen((o) => !o)} aria-label={t("assistant.title")} aria-expanded={open}>
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </Fab>
    </>
  );
}

const pop = keyframes`from{opacity:0;transform:translateY(12px) scale(.98)}to{opacity:1;transform:none}`;

const Fab = styled.button`
  position: fixed; right: 20px; bottom: 20px; z-index: ${({ theme }) => theme.zIndex.toast - 1};
  width: 58px; height: 58px; border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme }) => theme.colors.primary}; color: #fff;
  display: grid; place-items: center; box-shadow: ${({ theme }) => theme.shadows.lg};
  transition: transform ${({ theme }) => theme.transitions.base}, background ${({ theme }) => theme.transitions.base};
  &:hover { transform: translateY(-2px); background: ${({ theme }) => theme.colors.primaryDark}; }
  ${({ theme }) => theme.media.tablet(`display: none;`)} /* the mobile action bar covers this on phones */
`;
const Panel = styled.div`
  position: fixed; right: 20px; bottom: 88px; z-index: ${({ theme }) => theme.zIndex.toast - 1};
  width: min(340px, calc(100vw - 40px));
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg}; box-shadow: ${({ theme }) => theme.shadows.xl};
  overflow: hidden; animation: ${pop} ${({ theme }) => theme.transitions.base};
`;
const Head = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  background: ${({ theme }) => theme.gradients.secondary}; color: #fff;
  padding: ${({ theme }) => `${theme.space[3]} ${theme.space[4]}`};
  span { display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: ${({ theme }) => theme.fontSizes.md}; }
  button { color: rgba(255,255,255,0.85); &:hover { color: #fff; } }
`;
const Body = styled.div`padding: ${({ theme }) => theme.space[4]};`;
const Greeting = styled.p`
  background: ${({ theme }) => theme.colors.surfaceAlt}; color: ${({ theme }) => theme.colors.text};
  padding: ${({ theme }) => theme.space[3]}; border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.fontSizes.sm}; line-height: 1.5;
`;
const Chips = styled.div`display: flex; flex-wrap: wrap; gap: 8px; margin-top: ${({ theme }) => theme.space[3]};`;
const Chip = styled.button`
  display: inline-flex; align-items: center; gap: 6px;
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  color: ${({ theme }) => theme.colors.secondary};
  background: ${({ theme }) => theme.colors.secondarySoft};
  padding: 6px 12px; border-radius: ${({ theme }) => theme.radii.pill};
  font-size: ${({ theme }) => theme.fontSizes.xs}; font-weight: 600;
  &:hover { background: ${({ theme }) => theme.colors.secondary}; color: #fff; }
`;
const Form = styled.form`
  display: flex; gap: 8px; padding: ${({ theme }) => theme.space[3]};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  input {
    flex: 1; border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.radii.pill}; padding: 8px 14px;
    font-size: ${({ theme }) => theme.fontSizes.sm};
    &:focus-visible { outline: none; border-color: ${({ theme }) => theme.colors.secondary}; box-shadow: ${({ theme }) => theme.shadows.focus}; }
  }
  button {
    width: 40px; flex-shrink: 0; display: grid; place-items: center;
    background: ${({ theme }) => theme.colors.primary}; color: #fff; border-radius: ${({ theme }) => theme.radii.pill};
    &:disabled { opacity: 0.6; }
  }
`;

export default AdmissionAssistant;
