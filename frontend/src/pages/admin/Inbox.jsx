import { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import { Mail, Trash2, Check, Archive, GraduationCap, MessageSquare } from "lucide-react";
import { api } from "../../lib/api";
import { useToast } from "../../context/ToastContext";
import { useLang } from "../../context/LanguageContext";
import { useSocketEvent } from "../../context/SocketContext";
import { Badge } from "../../components/ui/Badge";
import { Skeleton } from "../../components/ui/Skeleton";

const TABS = [
  { key: "all", label: "All" },
  { key: "contact", label: "Contact" },
  { key: "admission", label: "Admissions" },
];

export function Inbox() {
  const toast = useToast();
  const { t } = useLang();
  const [tab, setTab] = useState("all");
  const [items, setItems] = useState(null);

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
    if (!window.confirm(t("admin.confirmDelete"))) return;
    try { await api.del(`/submissions/${row._id}`); setItems((prev) => prev.filter((r) => r._id !== row._id)); toast.success("Deleted"); }
    catch (e) { toast.error(e.message); }
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
                <TypeIcon $type={s.type}>{s.type === "admission" ? <GraduationCap size={16} /> : <MessageSquare size={16} />}</TypeIcon>
                <div>
                  <strong>{s.name}</strong>
                  <a href={`mailto:${s.email}`}>{s.email}</a>
                </div>
                <Meta>
                  <Badge $tone={s.type === "admission" ? "secondary" : "neutral"}>{s.type}</Badge>
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
              <Message>{s.message}</Message>

              <ItemActions>
                {s.status !== "read" && <Ghost onClick={() => setStatus(s, "read")}><Check size={15} /> Mark read</Ghost>}
                {s.status !== "archived" && <Ghost onClick={() => setStatus(s, "archived")}><Archive size={15} /> Archive</Ghost>}
                <Ghost $danger onClick={() => remove(s)}><Trash2 size={15} /> {t("admin.delete")}</Ghost>
              </ItemActions>
            </Item>
          ))}
        </List>
      )}
    </>
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
  background: ${({ theme, $type }) => ($type === "admission" ? theme.colors.secondarySoft : theme.colors.surfaceAlt)};
  color: ${({ theme, $type }) => ($type === "admission" ? theme.colors.secondary : theme.colors.textMuted)};
`;
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
