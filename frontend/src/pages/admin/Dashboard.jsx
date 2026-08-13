import { useEffect, useState } from "react";
import styled from "styled-components";
import { Megaphone, CalendarDays, Images, Users, Inbox, ArrowRight } from "lucide-react";
import { Link } from "../../lib/router";
import { api } from "../../lib/api";
import { useLang } from "../../context/LanguageContext";
import { useSocketEvent } from "../../context/SocketContext";
import { useToast } from "../../context/ToastContext";
import { Card } from "../../components/ui/Card";
import { Skeleton } from "../../components/ui/Skeleton";

export function AdminDashboard() {
  const { t } = useLang();
  const toast = useToast();
  const [stats, setStats] = useState(null);

  const loadCount = async (path, params) => {
    try {
      const r = await api.get(path, params);
      return r.total ?? (r.items ? r.items.length : 0);
    } catch {
      return 0;
    }
  };

  useEffect(() => {
    (async () => {
      const [notices, events, gallery, staff, inbox, newMsgs] = await Promise.all([
        loadCount("/notices", { limit: 1 }),
        loadCount("/events", { limit: 1 }),
        loadCount("/gallery", { limit: 1 }),
        loadCount("/staff"),
        loadCount("/submissions", { limit: 1 }),
        loadCount("/submissions", { limit: 1, status: "new" }),
      ]);
      setStats({ notices, events, gallery, staff, inbox, newMsgs });
    })();
  }, []);

  useSocketEvent("submission:new", () => {
    setStats((s) => (s ? { ...s, inbox: s.inbox + 1, newMsgs: s.newMsgs + 1 } : s));
    toast.info("New form submission received");
  });

  const cards = [
    { key: "notices", label: t("admin.manageNotices"), icon: Megaphone, to: "/admin/notices", tone: "primary" },
    { key: "events", label: t("admin.manageEvents"), icon: CalendarDays, to: "/admin/events", tone: "secondary" },
    { key: "gallery", label: t("admin.manageGallery"), icon: Images, to: "/admin/gallery", tone: "secondary" },
    { key: "staff", label: t("admin.manageStaff"), icon: Users, to: "/admin/staff", tone: "secondary" },
    { key: "inbox", label: t("admin.inbox"), icon: Inbox, to: "/admin/inbox", tone: "primary" },
  ];

  return (
    <>
      <h1 style={{ marginBottom: 24 }}>{t("admin.overview")}</h1>
      <Grid>
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <StatCard key={c.key} to={c.to} $hover>
              <IconRound $tone={c.tone}><Icon size={22} /></IconRound>
              <div>
                {stats === null ? <Skeleton $h="2rem" $w="48px" /> : <Value>{stats[c.key]}</Value>}
                <Label>{c.label}</Label>
              </div>
              {c.key === "inbox" && stats?.newMsgs > 0 && <NewDot>{stats.newMsgs} new</NewDot>}
              <Go><ArrowRight size={18} /></Go>
            </StatCard>
          );
        })}
      </Grid>

      <Note>
        Publish a notice or event and it broadcasts live to every open public
        page via socket.io, with a toast confirmation.
      </Note>
    </>
  );
}

const Grid = styled.div`
  display: grid; grid-template-columns: repeat(3, 1fr); gap: ${({ theme }) => theme.space[5]};
  ${({ theme }) => theme.media.laptop(`grid-template-columns: repeat(2, 1fr);`)}
  ${({ theme }) => theme.media.mobile(`grid-template-columns: 1fr;`)}
`;
const StatCard = styled(Link)`
  display: flex; align-items: center; gap: ${({ theme }) => theme.space[4]}; position: relative;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: ${({ theme }) => theme.space[6]};
  transition: box-shadow ${({ theme }) => theme.transitions.base}, transform ${({ theme }) => theme.transitions.base};
  &:hover { box-shadow: ${({ theme }) => theme.shadows.md}; transform: translateY(-2px); }
`;
const IconRound = styled.div`
  width: 52px; height: 52px; flex-shrink: 0; display: grid; place-items: center; border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme, $tone }) => ($tone === "primary" ? theme.colors.primarySoft : theme.colors.secondarySoft)};
  color: ${({ theme, $tone }) => ($tone === "primary" ? theme.colors.primary : theme.colors.secondary)};
`;
const Value = styled.div`font-size: ${({ theme }) => theme.fontSizes["3xl"]}; font-family: ${({ theme }) => theme.fonts.heading}; font-weight: 700; color: ${({ theme }) => theme.colors.text};`;
const Label = styled.div`color: ${({ theme }) => theme.colors.textMuted}; font-size: ${({ theme }) => theme.fontSizes.sm};`;
const Go = styled.span`margin-left: auto; color: ${({ theme }) => theme.colors.textMuted};`;
const NewDot = styled.span`
  position: absolute; top: 12px; right: 40px;
  background: ${({ theme }) => theme.colors.primary}; color: #fff;
  font-size: ${({ theme }) => theme.fontSizes.xs}; font-weight: 700;
  padding: 2px 8px; border-radius: ${({ theme }) => theme.radii.pill};
`;
const Note = styled.p`
  margin-top: ${({ theme }) => theme.space[8]};
  background: ${({ theme }) => theme.colors.secondarySoft}; color: ${({ theme }) => theme.colors.secondaryDark};
  padding: ${({ theme }) => theme.space[4]}; border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

export default AdminDashboard;
