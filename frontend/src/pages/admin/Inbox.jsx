import { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { Mail, Trash2, Check, Archive, GraduationCap, MessageSquare, HandCoins, FileText, ExternalLink, Eye, X, ShieldCheck, ShieldX } from "lucide-react";
import { api } from "../../lib/api";
import { useToast } from "../../context/ToastContext";
import { useLang } from "../../context/LanguageContext";
import { useSocketEvent } from "../../context/SocketContext";
import { Badge } from "../../components/ui/Badge";
import { Skeleton } from "../../components/ui/Skeleton";
import { Field, Label } from "../../components/ui/Input";
import { useConfirm } from "../../context/ConfirmContext";

const TABS = [
  { key: "all", label: "All" },
  { key: "contact", label: "Contact" },
  { key: "admission", label: "Admissions" },
  { key: "donation", label: "Donations" },
];

export function Inbox() {
  const toast = useToast();
  const { t } = useLang();
  const [tab, setTab] = useState("all");
  const [items, setItems] = useState(null);
  const [reviewing, setReviewing] = useState(null);
  const { confirmDelete } = useConfirm();

  const load = useCallback(async () => {
    setItems(null);
    try {
      const params = { limit: 100 };
      if (tab !== "all") params.type = tab;
      const r = await api.get("/submissions", params);
      setItems(r.items || []);
    } catch (e) {
      toast.error(e.message); setItems([]);
    }
  }, [tab, toast]);
  useEffect(() => { load(); }, [load]);

  useSocketEvent("submission:new", (sub) => {
    setItems((prev) => (prev && (tab === "all" || tab === sub.type) ? [sub, ...prev] : prev));
    toast.info(`New ${sub.type} submission from ${sub.name}`);
  });

  const setStatus = async (row, status) => {
    try {
      await api.patch(`/submissions/${row._id}`, { status });
      setItems((prev) => prev.map((r) => (r._id === row._id ? { ...r, status } : r)));
    } catch (e) { toast.error(e.message); }
  };
  const remove = async (row) => {
    if (!(await confirmDelete(`${row.type} submission from “${row.name}”`))) return;
    try { await api.del(`/submissions/${row._id}`); setItems((prev) => prev.filter((r) => r._id !== row._id)); toast.success("Deleted"); }
    catch (e) { toast.error(e.message); }
  };
  const saveReview = async (row, reviewStatus, reviewNote) => {
    try {
      const r = await api.patch(`/submissions/${row._id}`, { reviewStatus, reviewNote });
      setItems((prev) => prev.map((item) => item._id === row._id ? r.submission : item));
      setReviewing(null);
      toast.success(reviewStatus === "approved" ? "Document approved" : "Document rejected");
    } catch (error) {
      toast.error(error.message || "Could not save review");
      throw error;
    }
  };

  return (
    <>
      <Header><h1>{t("admin.inbox")}</h1></Header>
      <Tabs>
        {TABS.map((tb) => (
          <Tab key={tb.key} $active={tab === tb.key} onClick={() => setTab(tb.key)}>{tb.label}</Tab>
        ))}
      </Tabs>

      {items === null ? (
        <List>{[0, 1, 2].map((i) => <Skeleton key={i} $h="120px" $radius="lg" />)}</List>
      ) : items.length === 0 ? (
        <Empty><Mail size={28} /><p>{t("admin.noItems")}</p></Empty>
      ) : (
        <List>
          {items.map((s) => (
            <Item key={s._id} $unread={s.status === "new"}>
              <ItemHead>
                <TypeIcon $type={s.type}>{s.type === "admission" ? <GraduationCap size={16} /> : s.type === "donation" ? <HandCoins size={16} /> : <MessageSquare size={16} />}</TypeIcon>
                <div>
                  <strong>{s.name}</strong>
                  <a href={`mailto:${s.email}`}>{s.email}</a>
                </div>
                <Meta>
                  <Badge $tone={s.type === "admission" ? "secondary" : s.type === "donation" ? "primary" : "neutral"}>{s.type}</Badge>
                  {s.status === "new" && <Badge $tone="danger">new</Badge>}
                  {s.status === "archived" && <Badge $tone="warning">archived</Badge>}
                  <time>{new Date(s.createdAt).toLocaleString()}</time>
                </Meta>
              </ItemHead>

              {(s.subject || s.gradeApplyingFor || s.studentName || s.phone) && (
                <SubMeta>
                  {s.subject && <span>Subject: {s.subject}</span>}
                  {s.studentName && <span>Student: {s.studentName}</span>}
                  {s.gradeApplyingFor && <span>Grade: {s.gradeApplyingFor}</span>}
                  {s.phone && <span>Phone: {s.phone}</span>}
                </SubMeta>
              )}
              {s.message && <Message>{s.message}</Message>}

              {s.documentUrl && (
                <DocumentRow>
                  <DocButton type="button" onClick={() => setReviewing(s)}>
                    <Eye size={16} /> Review upload
                  </DocButton>
                  <DocLink href={`/api/submissions/${s._id}/document`} target="_blank" rel="noreferrer">
                    <FileText size={15} /> {s.documentName || "Open document"} <ExternalLink size={13} />
                  </DocLink>
                  <Badge $tone={s.reviewStatus === "approved" ? "success" : s.reviewStatus === "rejected" ? "danger" : "warning"}>
                    {s.reviewStatus || "pending"}
                  </Badge>
                </DocumentRow>
              )}

              <ItemActions>
                {s.status !== "read" && <Ghost onClick={() => setStatus(s, "read")}><Check size={15} /> Mark read</Ghost>}
                {s.status !== "archived" && <Ghost onClick={() => setStatus(s, "archived")}><Archive size={15} /> Archive</Ghost>}
                <Ghost $danger onClick={() => remove(s)}><Trash2 size={15} /> {t("admin.delete")}</Ghost>
              </ItemActions>
            </Item>
          ))}
        </List>
      )}
      {reviewing && <ReviewDialog submission={reviewing} onClose={() => setReviewing(null)} onSave={saveReview} />}
    </>
  );
}

function ReviewDialog({ submission, onClose, onSave }) {
  const [note, setNote] = useState(submission.reviewNote || "");
  const [busy, setBusy] = useState("");
  const closeRef = useRef(null);
  const url = `/api/submissions/${submission._id}/document`;
  const isImage = submission.documentMime?.startsWith("image/") || /\.(jpe?g|png|webp|gif)$/i.test(submission.documentName || "");

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (event) => { if (event.key === "Escape" && !busy) onClose(); };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = previous; };
  }, [busy, onClose]);

  const submit = async (status) => {
    setBusy(status);
    try { await onSave(submission, status, note); }
    catch { setBusy(""); }
  };

  return (
    <ReviewOverlay role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget && !busy) onClose(); }}>
      <ReviewPanel role="dialog" aria-modal="true" aria-labelledby="review-title" aria-busy={!!busy}>
        <ReviewHead>
          <div><h2 id="review-title">Review uploaded document</h2><p>{submission.name} · {submission.documentName || "Uploaded file"}</p></div>
          <CloseButton ref={closeRef} type="button" onClick={onClose} disabled={!!busy} aria-label="Close document review"><X size={20} /></CloseButton>
        </ReviewHead>
        <PreviewArea>
          {isImage ? <ReviewImage src={url} alt={`Document uploaded by ${submission.name}`} /> : <ReviewFrame src={url} title={`Document uploaded by ${submission.name}`} />}
        </PreviewArea>
        <ReviewDetails>
          <Detail><span>Uploader</span><strong>{submission.name}</strong></Detail>
          <Detail><span>Email</span><strong>{submission.email}</strong></Detail>
          {submission.phone && <Detail><span>Phone</span><strong>{submission.phone}</strong></Detail>}
          <Detail><span>Current review</span><strong>{submission.reviewStatus || "pending"}</strong></Detail>
        </ReviewDetails>
        <Field><Label htmlFor="review-note">Review note (optional)</Label><ReviewTextarea id="review-note" value={note} onChange={(e) => setNote(e.target.value)} maxLength={1000} placeholder="Record why this document was approved or rejected…" /></Field>
        <ReviewActions>
          <DecisionButton type="button" $reject onClick={() => submit("rejected")} disabled={!!busy}><ShieldX size={18} /> {busy === "rejected" ? "Saving…" : "Reject"}</DecisionButton>
          <DecisionButton type="button" onClick={() => submit("approved")} disabled={!!busy}><ShieldCheck size={18} /> {busy === "approved" ? "Saving…" : "Approve"}</DecisionButton>
        </ReviewActions>
      </ReviewPanel>
    </ReviewOverlay>
  );
}

const Header = styled.div`margin-bottom: ${({ theme }) => theme.space[5]}; h1 { font-size: ${({ theme }) => theme.fontSizes["3xl"]}; }`;
const Tabs = styled.div`display: flex; gap: ${({ theme }) => theme.space[2]}; margin-bottom: ${({ theme }) => theme.space[6]};`;
const Tab = styled.button`
  padding: ${({ theme }) => `${theme.space[2]} ${theme.space[4]}`}; border-radius: ${({ theme }) => theme.radii.pill};
  font-weight: 600; font-size: ${({ theme }) => theme.fontSizes.sm};
  border: 1px solid ${({ theme, $active }) => ($active ? theme.colors.primary : theme.colors.border)};
  background: ${({ theme, $active }) => ($active ? theme.colors.primary : theme.colors.surface)};
  color: ${({ theme, $active }) => ($active ? "#fff" : theme.colors.textBody)};
`;
const List = styled.div`display: flex; flex-direction: column; gap: ${({ theme }) => theme.space[4]};`;
const Item = styled.article`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-left: 4px solid ${({ theme, $unread }) => ($unread ? theme.colors.primary : theme.colors.border)};
  border-radius: ${({ theme }) => theme.radii.lg}; padding: ${({ theme }) => theme.space[5]};
  display: flex; flex-direction: column; gap: ${({ theme }) => theme.space[3]};
`;
const ItemHead = styled.div`
  display: flex; align-items: center; gap: ${({ theme }) => theme.space[3]};
  div { display: flex; flex-direction: column; }
  strong { color: ${({ theme }) => theme.colors.text}; }
  a { color: ${({ theme }) => theme.colors.secondary}; font-size: ${({ theme }) => theme.fontSizes.sm}; }
`;
const TypeIcon = styled.div`
  width: 38px; height: 38px; flex-shrink: 0; display: grid; place-items: center; border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme, $type }) => ($type === "admission" ? theme.colors.secondarySoft : $type === "donation" ? theme.colors.primarySoft : theme.colors.surfaceAlt)};
  color: ${({ theme, $type }) => ($type === "admission" ? theme.colors.secondary : $type === "donation" ? theme.colors.primary : theme.colors.textMuted)};
`;
const DocLink = styled.a`
  display: inline-flex; align-items: center; gap: 8px; align-self: flex-start;
  padding: ${({ theme }) => `${theme.space[2]} ${theme.space[3]}`};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.primarySoft};
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.fontSizes.sm}; font-weight: 600;
  svg:last-child { opacity: 0.7; }
  &:hover { text-decoration: underline; }
`;
const DocumentRow = styled.div`display: flex; align-items: center; gap: 10px; flex-wrap: wrap;`;
const DocButton = styled.button`min-height: 44px; display: inline-flex; align-items: center; gap: 8px; padding: 0 14px; border-radius: ${({ theme }) => theme.radii.md}; background: ${({ theme }) => theme.colors.secondary}; color: #fff; font-weight: 700; &:focus-visible { outline: 2px solid ${({ theme }) => theme.colors.secondary}; outline-offset: 2px; }`;
const ReviewOverlay = styled.div`position: fixed; inset: 0; z-index: ${({ theme }) => theme.zIndex.modal}; padding: 20px; display: grid; place-items: center; background: ${({ theme }) => theme.colors.overlay};`;
const ReviewPanel = styled.div`width: min(100%, 980px); max-height: calc(100vh - 40px); overflow-y: auto; background: ${({ theme }) => theme.colors.surface}; border-radius: ${({ theme }) => theme.radii.lg}; box-shadow: ${({ theme }) => theme.shadows.xl}; padding: ${({ theme }) => theme.space[5]}; display: grid; gap: ${({ theme }) => theme.space[4]};`;
const ReviewHead = styled.header`display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; h2 { color: ${({ theme }) => theme.colors.text}; } p { color: ${({ theme }) => theme.colors.textMuted}; overflow-wrap: anywhere; }`;
const CloseButton = styled.button`width: 44px; height: 44px; flex: 0 0 44px; display: grid; place-items: center; border-radius: ${({ theme }) => theme.radii.pill}; color: ${({ theme }) => theme.colors.text}; background: ${({ theme }) => theme.colors.surfaceAlt}; &:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }`;
const PreviewArea = styled.div`min-height: 360px; height: min(58vh, 620px); display: grid; place-items: center; overflow: hidden; border: 1px solid ${({ theme }) => theme.colors.border}; border-radius: ${({ theme }) => theme.radii.md}; background: ${({ theme }) => theme.colors.surfaceAlt}; ${({ theme }) => theme.media.mobile(`min-height: 260px; height: 42vh;`)}`;
const ReviewImage = styled.img`display: block; width: 100%; height: 100%; object-fit: contain;`;
const ReviewFrame = styled.iframe`width: 100%; height: 100%; border: 0; background: #fff;`;
const ReviewDetails = styled.dl`display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin: 0; ${({ theme }) => theme.media.tablet(`grid-template-columns: repeat(2, minmax(0, 1fr));`)} ${({ theme }) => theme.media.mobile(`grid-template-columns: 1fr;`)}`;
const Detail = styled.div`padding: 12px; border-radius: ${({ theme }) => theme.radii.md}; background: ${({ theme }) => theme.colors.surfaceAlt}; display: grid; gap: 4px; span { color: ${({ theme }) => theme.colors.textMuted}; font-size: ${({ theme }) => theme.fontSizes.xs}; } strong { color: ${({ theme }) => theme.colors.text}; overflow-wrap: anywhere; }`;
const ReviewTextarea = styled.textarea`width: 100%; min-height: 88px; resize: vertical; padding: 12px; color: ${({ theme }) => theme.colors.text}; background: ${({ theme }) => theme.colors.surface}; border: 1px solid ${({ theme }) => theme.colors.border}; border-radius: ${({ theme }) => theme.radii.md}; &:focus { outline: 2px solid ${({ theme }) => theme.colors.primary}; outline-offset: 2px; }`;
const ReviewActions = styled.footer`display: flex; justify-content: flex-end; gap: 12px; flex-wrap: wrap;`;
const DecisionButton = styled.button`min-width: 132px; min-height: 46px; display: inline-flex; justify-content: center; align-items: center; gap: 8px; padding: 0 18px; border-radius: ${({ theme }) => theme.radii.md}; color: #fff; background: ${({ theme, $reject }) => $reject ? theme.colors.danger : theme.colors.success}; font-weight: 700; &:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; } &:disabled { opacity: .6; cursor: not-allowed; }`;
const Meta = styled.div`
  margin-left: auto; display: flex; align-items: center; gap: ${({ theme }) => theme.space[2]}; flex-wrap: wrap;
  time { color: ${({ theme }) => theme.colors.textMuted}; font-size: ${({ theme }) => theme.fontSizes.xs}; }
`;
const SubMeta = styled.div`
  display: flex; flex-wrap: wrap; gap: ${({ theme }) => theme.space[4]};
  color: ${({ theme }) => theme.colors.textMuted}; font-size: ${({ theme }) => theme.fontSizes.xs};
`;
const Message = styled.p`color: ${({ theme }) => theme.colors.textBody}; line-height: ${({ theme }) => theme.lineHeights.relaxed}; white-space: pre-wrap;`;
const ItemActions = styled.div`display: flex; gap: ${({ theme }) => theme.space[2]}; flex-wrap: wrap;`;
const Ghost = styled.button`
  display: inline-flex; align-items: center; gap: 6px; font-size: ${({ theme }) => theme.fontSizes.sm}; font-weight: 600;
  padding: ${({ theme }) => `${theme.space[2]} ${theme.space[3]}`}; border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme, $danger }) => ($danger ? theme.colors.danger : theme.colors.secondary)};
  background: ${({ theme, $danger }) => ($danger ? theme.colors.dangerSoft : theme.colors.secondarySoft)};
`;
const Empty = styled.div`text-align: center; padding: ${({ theme }) => theme.space[16]}; color: ${({ theme }) => theme.colors.textMuted}; display: flex; flex-direction: column; align-items: center; gap: 8px;`;

export default Inbox;
