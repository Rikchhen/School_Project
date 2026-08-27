import { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import { ArrowRight, ExternalLink, Plus, Inbox as InboxIcon, Settings2 } from "lucide-react";
import { Link } from "../../lib/router";
import { api } from "../../lib/api";
import { useLang } from "../../context/LanguageContext";
import { useSocketEvent } from "../../context/SocketContext";
import { useToast } from "../../context/ToastContext";
import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";
import { Reveal } from "../../components/Reveal";
import { adminSections } from "../../config/adminSections";

const GROUPS = ["content", "people", "engagement", "site"];
const COUNT_ENDPOINTS = {
  notices: ["/notices", { limit: 1 }], events: ["/events", { limit: 1 }], gallery: ["/gallery", { limit: 1 }],
  staff: ["/staff"], programs: ["/programs"], syllabus: ["/syllabus"], pages: ["/pages"], committee: ["/committee"],
  inbox: ["/submissions", { limit: 1 }], newMsgs: ["/submissions", { limit: 1, status: "new" }],
};
const STAT_KEYS = ["notices", "events", "gallery", "staff", "programs", "syllabus", "inbox"];
const SETTINGS_AREAS = [
  ["branding", "admin.areaBranding"], ["navigation", "admin.areaNavigation"], ["banners", "admin.areaBanners"],
  ["stats", "admin.areaStats"], ["principal", "admin.areaMission"], ["facilities", "admin.areaFacilities"],
  ["partners", "admin.areaPartners"], ["contact", "admin.areaContact"], ["socials", "admin.areaSocials"],
  ["announcement", "admin.areaAnnouncement"], ["ads", "admin.areaAds"],
];

export function AdminDashboard() {
  const { t } = useLang();
  const toast = useToast();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let alive = true;
    Promise.all(Object.entries(COUNT_ENDPOINTS).map(async ([key, [path, params]]) => {
      try {
        const result = await api.get(path, params);
        return [key, result.total ?? (Array.isArray(result.items) ? result.items.length : null)];
      } catch { return [key, null]; }
    })).then((entries) => { if (alive) setStats(Object.fromEntries(entries)); });
    return () => { alive = false; };
  }, []);

  useSocketEvent("submission:new", () => {
    setStats((current) => current ? { ...current,
      inbox: typeof current.inbox === "number" ? current.inbox + 1 : current.inbox,
      newMsgs: typeof current.newMsgs === "number" ? current.newMsgs + 1 : current.newMsgs,
    } : current);
    toast.info(t("admin.newSubmission"));
  });

  return <DashboardRoot>
    <PageHead><div><h1>{t("admin.controlCenter")}</h1><p>{t("admin.controlCenterIntro")}</p></div>
      <Button as="a" href="/" target="_blank" rel="noopener noreferrer" $variant="outline"><ExternalLink size={16} /> {t("admin.viewSite")}</Button>
    </PageHead>

    <StatGrid>{STAT_KEYS.map((key) => {
      const section = adminSections.find((item) => item.countKey === key); const Icon = section.icon;
      return <StatCard key={key} to={section.admin}><IconBox><Icon size={21} /></IconBox><div>
        {stats === null ? <Skeleton $h="1.8rem" $w="48px" /> : <StatValue>{stats[key] ?? "—"}</StatValue>}<span>{t(section.labelKey)}</span>
      </div>{key === "inbox" && stats?.newMsgs > 0 && <NewBadge>{stats.newMsgs} {t("admin.new")}</NewBadge>}</StatCard>;
    })}</StatGrid>

    <Block><SectionHeading>{t("admin.quickActions")}</SectionHeading><QuickRow>
      <Button as={Link} to="/admin/notices" $variant="primary"><Plus size={17} /> {t("admin.addNotice")}</Button>
      <Button as={Link} to="/admin/events" $variant="outline"><Plus size={17} /> {t("admin.addEvent")}</Button>
      <Button as={Link} to="/admin/syllabus" $variant="outline"><Plus size={17} /> {t("admin.addSyllabus")}</Button>
      <Button as={Link} to="/admin/inbox" $variant="ghost"><InboxIcon size={17} /> {t("admin.checkInbox")}</Button>
    </QuickRow></Block>

    <Block><SectionHeading>{t("admin.manageEveryPage")}</SectionHeading><SectionIntro>{t("admin.manageEveryPageIntro")}</SectionIntro>
      {GROUPS.map((group) => <Reveal key={group}><GroupBlock><GroupTitle>{t(`admin.group${group[0].toUpperCase()}${group.slice(1)}`)}</GroupTitle>
        <DirectoryGrid>{adminSections.filter((item) => item.group === group).map((item) => { const Icon = item.icon; return <DirectoryCard key={item.key}>
          <DirectoryTop><IconBox><Icon size={20} /></IconBox><div><h3>{t(item.labelKey)}</h3>{item.countKey && <Count>{stats === null ? "…" : stats[item.countKey] ?? "—"}</Count>}</div></DirectoryTop>
          <p>{t(item.desc)}</p><CardActions><EditLink to={item.admin}>{t("admin.edit")} <ArrowRight size={14} /></EditLink>
          {item.view && <ViewLink href={item.view} target="_blank" rel="noopener noreferrer">{t("admin.view")} <ExternalLink size={13} /></ViewLink>}</CardActions>
        </DirectoryCard>; })}</DirectoryGrid>
      </GroupBlock></Reveal>)}
    </Block>

    <Block><SettingsHead><Settings2 size={22} /><div><SectionHeading>{t("admin.settingsAreas")}</SectionHeading><SectionIntro>{t("admin.settingsAreasIntro")}</SectionIntro></div></SettingsHead>
      <AreaGrid>{SETTINGS_AREAS.map(([id, label]) => <AreaLink key={id} to={id === "ads" ? "/admin/ads" : `/admin/settings#${id}`}>{t(label)} <ArrowRight size={14} /></AreaLink>)}</AreaGrid>
    </Block>
  </DashboardRoot>;
}

const DashboardRoot = styled.div`max-width:1440px;margin:0 auto;`;
const PageHead = styled.div`display:flex;justify-content:space-between;align-items:flex-start;gap:${({theme})=>theme.space[5]};margin-bottom:${({theme})=>theme.space[7]};h1{margin-bottom:6px}p{color:${({theme})=>theme.colors.textMuted}}${({theme})=>theme.media.mobile(`flex-direction:column;`)}`;
const dashboardCardIn=keyframes`from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}`;
const numberIn=keyframes`from{opacity:.2;transform:translateY(5px) scale(.94)}to{opacity:1;transform:none}`;
const StatGrid = styled.div`display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:${({theme})=>theme.space[4]};&>a{animation:${dashboardCardIn} .42s cubic-bezier(.22,1,.36,1) both}&>a:nth-child(2){animation-delay:55ms}&>a:nth-child(3){animation-delay:110ms}&>a:nth-child(4){animation-delay:165ms}&>a:nth-child(5){animation-delay:220ms}&>a:nth-child(6){animation-delay:275ms}&>a:nth-child(7){animation-delay:330ms}${({theme})=>theme.media.laptop(`grid-template-columns:repeat(2,minmax(0,1fr));`)}${({theme})=>theme.media.mobile(`grid-template-columns:1fr;`)}`;
const StatCard = styled(Link)`display:flex;align-items:center;gap:${({theme})=>theme.space[3]};position:relative;background:${({theme})=>theme.colors.surface};border:1px solid ${({theme})=>theme.colors.border};border-radius:${({theme})=>theme.radii.lg};padding:${({theme})=>theme.space[4]};box-shadow:${({theme})=>theme.shadows.sm};transition:transform ${({theme})=>theme.transitions.base},box-shadow ${({theme})=>theme.transitions.base};&:hover{transform:translateY(-3px);box-shadow:${({theme})=>theme.shadows.md}}span{color:${({theme})=>theme.colors.textMuted};font-size:${({theme})=>theme.fontSizes.sm}}@media(prefers-reduced-motion:reduce){transition:none}`;
const IconBox = styled.span`width:42px;height:42px;flex:0 0 42px;display:grid;place-items:center;border-radius:${({theme})=>theme.radii.md};background:${({theme})=>theme.colors.primarySoft};color:${({theme})=>theme.colors.primary};`;
const StatValue = styled.strong`display:block;color:${({theme})=>theme.colors.text};font-size:${({theme})=>theme.fontSizes["2xl"]};font-family:${({theme})=>theme.fonts.heading};animation:${numberIn} .35s ease-out both;`;
const NewBadge = styled.b`position:absolute;right:12px;top:10px;background:${({theme})=>theme.colors.primary};color:#fff;border-radius:${({theme})=>theme.radii.pill};padding:2px 7px;font-size:${({theme})=>theme.fontSizes.xs};`;
const Block = styled.section`margin-top:${({theme})=>theme.space[10]};`;
const SectionHeading = styled.h2`font-size:${({theme})=>theme.fontSizes["2xl"]};color:${({theme})=>theme.colors.text};`;
const SectionIntro = styled.p`color:${({theme})=>theme.colors.textMuted};font-size:${({theme})=>theme.fontSizes.sm};margin-top:4px;`;
const QuickRow = styled.div`display:flex;flex-wrap:wrap;gap:${({theme})=>theme.space[3]};margin-top:${({theme})=>theme.space[4]};`;
const GroupBlock = styled.div`margin-top:${({theme})=>theme.space[7]};`;
const GroupTitle = styled.h3`font-size:${({theme})=>theme.fontSizes.lg};color:${({theme})=>theme.colors.secondary};margin-bottom:${({theme})=>theme.space[3]};`;
const DirectoryGrid = styled.div`display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:${({theme})=>theme.space[4]};${({theme})=>theme.media.laptop(`grid-template-columns:repeat(2,minmax(0,1fr));`)}${({theme})=>theme.media.mobile(`grid-template-columns:1fr;`)}`;
const DirectoryCard = styled.article`display:flex;flex-direction:column;min-height:190px;background:${({theme})=>theme.colors.surface};border:1px solid ${({theme})=>theme.colors.border};border-radius:${({theme})=>theme.radii.lg};padding:${({theme})=>theme.space[5]};transition:transform ${({theme})=>theme.transitions.base},box-shadow ${({theme})=>theme.transitions.base};&:hover{transform:translateY(-3px);box-shadow:${({theme})=>theme.shadows.md}}p{color:${({theme})=>theme.colors.textMuted};font-size:${({theme})=>theme.fontSizes.sm};line-height:1.55;margin-top:${({theme})=>theme.space[3]}}@media(prefers-reduced-motion:reduce){transition:none}`;
const DirectoryTop = styled.div`display:flex;align-items:center;gap:${({theme})=>theme.space[3]};h3{color:${({theme})=>theme.colors.text};font-size:${({theme})=>theme.fontSizes.md}}`;
const Count = styled.span`color:${({theme})=>theme.colors.primary};font-size:${({theme})=>theme.fontSizes.xs};font-weight:700;`;
const CardActions = styled.div`display:flex;align-items:center;gap:${({theme})=>theme.space[4]};margin-top:auto;padding-top:${({theme})=>theme.space[4]};`;
const EditLink = styled(Link)`display:inline-flex;align-items:center;gap:5px;color:${({theme})=>theme.colors.primary};font-size:${({theme})=>theme.fontSizes.sm};font-weight:700;`;
const ViewLink = styled.a`display:inline-flex;align-items:center;gap:5px;color:${({theme})=>theme.colors.secondary};font-size:${({theme})=>theme.fontSizes.sm};font-weight:600;`;
const SettingsHead = styled.div`display:flex;align-items:flex-start;gap:${({theme})=>theme.space[3]};color:${({theme})=>theme.colors.primary};`;
const AreaGrid = styled.div`display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:${({theme})=>theme.space[3]};margin-top:${({theme})=>theme.space[5]};${({theme})=>theme.media.tablet(`grid-template-columns:repeat(2,minmax(0,1fr));`)}${({theme})=>theme.media.mobile(`grid-template-columns:1fr;`)}`;
const AreaLink = styled(Link)`display:flex;justify-content:space-between;align-items:center;gap:8px;padding:${({theme})=>theme.space[4]};background:${({theme})=>theme.colors.surface};border:1px solid ${({theme})=>theme.colors.border};border-radius:${({theme})=>theme.radii.md};color:${({theme})=>theme.colors.text};font-size:${({theme})=>theme.fontSizes.sm};font-weight:600;&:hover{border-color:${({theme})=>theme.colors.primary};color:${({theme})=>theme.colors.primary};}`;

export default AdminDashboard;
