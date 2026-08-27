import { useEffect, useRef, useState } from "react";
import styled, { css, keyframes } from "styled-components";
import { motion } from "framer-motion";
import {
  Megaphone, ArrowRight, CalendarDays, Users, GraduationCap, Award, BookOpen,
  Clock3, MapPin, Quote, Mail, Phone, FlaskConical, TrendingUp, AlertTriangle, Users2,
  ChevronUp, ChevronDown,
} from "lucide-react";
import { Link } from "../lib/router";
import { useLang } from "../context/LanguageContext";
import { useSettings } from "../context/SettingsContext";
import { useSocketEvent } from "../context/SocketContext";
import { useToast } from "../context/ToastContext";
import { api } from "../lib/api";
import { formatDate, formatNumber } from "../lib/format";
import { Container, Section, Grid } from "../components/ui/Layout";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Skeleton } from "../components/ui/Skeleton";
import { Reveal } from "../components/Reveal";
import { HeroCarousel } from "../components/HeroCarousel";
import { PartnersStrip } from "../components/PartnersStrip";
import { FinalCTA } from "../components/FinalCTA";
import { SmartImage } from "../components/SmartImage";
import { RichText } from "../components/RichText";
import { CardCarousel } from "../components/CardCarousel";
import { htmlToText } from "../lib/sanitizeHtml";

/* ------------------------------------------------------------------ */
/*  Stats (Our School at a Glance)                                    */
/* ------------------------------------------------------------------ */
function useCountUp(target, run) {
  const [n, setN] = useState(0);
  const ref = useRef(0);
  useEffect(() => {
    if (!run) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) { setN(target); return; }
    let raf; const start = performance.now(); const dur = 1200;
    const tick = (tm) => {
      const p = Math.min(1, (tm - start) / dur);
      ref.current = Math.round(target * (1 - Math.pow(1 - p, 3)));
      setN(ref.current);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, run]);
  return n;
}
function StatItem({ icon: Icon, value, suffix, label, run, lang }) {
  const n = useCountUp(value, run);
  return (
    <Stat>
      <Icon size={26} />
      <strong>{formatNumber(n, lang)}{suffix}</strong>
      <span>{label}</span>
    </Stat>
  );
}
const STAT_ICONS = [Users, GraduationCap, BookOpen, Award];
const DEFAULT_STATS = [
  { value: 1200, suffix: "+", label: "Students" },
  { value: 60, suffix: "+", label: "Teachers" },
  { value: 50, suffix: "+", label: "Years of Legacy" },
  { value: 95, suffix: "%", label: "SEE Pass Rate" },
];

/* ------------------------------------------------------------------ */
/*  Courses (Academic)                                                */
/* ------------------------------------------------------------------ */
const COURSE_ICON = { science: FlaskConical, management: TrendingUp, humanities: BookOpen, general: GraduationCap };
const DEFAULT_COURSES = [
  { name: "Science", nameNe: "विज्ञान", category: "science", description: "Physics, Chemistry, Biology & Mathematics for future doctors and engineers." },
  { name: "Management", nameNe: "व्यवस्थापन", category: "management", description: "Accountancy, Economics & Business Studies for tomorrow's leaders." },
  { name: "Humanities", nameNe: "मानविकी", category: "humanities", description: "Sociology, mass-communication & languages for critical thinkers." },
  { name: "General (9–10)", nameNe: "माध्यमिक (९–१०)", category: "general", description: "A strong foundation aligned with the national curriculum for the SEE." },
];

/* ------------------------------------------------------------------ */
/*  Shared bits                                                       */
/* ------------------------------------------------------------------ */
/** Section heading with a scroll-drawn accent underline + optional "View all". */
function Head({ title, subtitle, to, viewAll, color = "primary", icon: Icon }) {
  return (
    <HeadRow>
      <HeadText>
        <H2 $color={color}>
          {Icon && <Icon aria-hidden size={24} />}
          {title}
          <Underline
            as={motion.span} $color={color}
            initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          />
        </H2>
        {subtitle && <Sub>{subtitle}</Sub>}
      </HeadText>
      {to && <ViewAll to={to}>{viewAll} <ArrowRight size={16} /></ViewAll>}
    </HeadRow>
  );
}

/** Thumbnail: real image, or a branded gradient placeholder with an icon + monogram. */
function Media({ src, alt, icon: Icon, monogram, accent = "primary" }) {
  if (src) return <SmartImage src={src} alt={alt || ""} height="100%" fit="cover" />;
  return (
    <Fallback $accent={accent} aria-hidden>
      {Icon && <Icon size={34} />}
      {monogram && <FallbackMono>{monogram}</FallbackMono>}
    </Fallback>
  );
}
const initials = (name = "") => name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "•";

/* ------------------------------------------------------------------ */
/*  Home                                                              */
/* ------------------------------------------------------------------ */
export function Home() {
  const { t, pickLang, lang } = useLang();
  const { settings } = useSettings();
  const statList = settings.stats && settings.stats.length ? settings.stats : DEFAULT_STATS;
  const toast = useToast();

  const [notices, setNotices] = useState(null);
  const [events, setEvents] = useState(null);
  const [freshNoticeId, setFreshNoticeId] = useState(null);
  const [programs, setPrograms] = useState(null);
  const [staff, setStaff] = useState(null);
  const [committee, setCommittee] = useState(null);
  const [aboutPage, setAboutPage] = useState(null);
  const [statsRun, setStatsRun] = useState(false);
  const statsRef = useRef(null);
  const noticesRef = useRef(null);
  const [canNoticeUp, setCanNoticeUp] = useState(false);
  const [canNoticeDown, setCanNoticeDown] = useState(false);

  useEffect(() => {
    const ctrl = new AbortController();
    const g = (path, params) => api.get(path, params, { signal: ctrl.signal });
    g("/notices", { limit: 10, published: "true" }).then((r) => setNotices(r.items)).catch(() => setNotices([]));
    g("/events", { limit: 12, upcoming: "true" }).then((r) => setEvents(r.items)).catch(() => setEvents([]));
    g("/programs", { published: "true" }).then((r) => setPrograms(r.items || [])).catch(() => setPrograms([]));
    g("/staff", { published: "true" }).then((r) => setStaff(r.items || [])).catch(() => setStaff([]));
    g("/committee", { published: "true" }).then((r) => setCommittee(r.items || [])).catch(() => setCommittee([]));
    g("/pages/about").then((r) => setAboutPage(r.page)).catch(() => setAboutPage(null));
    return () => ctrl.abort();
  }, []);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setStatsRun(true); io.disconnect(); } }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useSocketEvent("notice:new", (notice) => {
    setNotices((prev) => [notice, ...(prev || [])].slice(0, 10));
    setFreshNoticeId(notice._id);
    window.setTimeout(() => setFreshNoticeId(null), 4200);
    toast.info(`${t("home.latestNotices")}: ${notice.title}`);
  });
  useSocketEvent("event:new", (event) => {
    setEvents((prev) => [event, ...(prev || [])].slice(0, 3));
    toast.info(`${t("home.upcomingEvents")}: ${event.title}`);
  });

  // Principal message: admin-managed (settings.principal) first, then a staff
  // member whose role is "principal", then the About page as a final fallback.
  const P = settings.principal || {};
  const staffPrincipal = (staff || []).find((s) => /principal|प्रधानाध्यापक/i.test(s.role || s.roleNe || ""));
  const faculty = (staff || []).filter((s) => s._id !== staffPrincipal?._id);
  const principalName = pickLang(P, "name") || (staffPrincipal ? pickLang(staffPrincipal, "name") : t("common.schoolName"));
  const principalMsg = pickLang(P, "message")
    || (staffPrincipal?.bio ? htmlToText(pickLang(staffPrincipal, "bio")) : aboutPage ? htmlToText(pickLang(aboutPage, "body")) : t("home.missionBody"));
  const principalPhoto = P.photoUrl || staffPrincipal?.photoUrl || aboutPage?.content?.imageUrl;
  const chair = (committee || []).find((m) => /chair|अध्यक्ष/i.test(m.role || m.roleNe || ""));
  const committeeMembers = (committee || []).filter((m) => m._id !== chair?._id);
  const courses = programs && programs.length ? programs : DEFAULT_COURSES;
  const updateNoticeControls = () => {
    const track = noticesRef.current;
    if (!track) return;
    const max = Math.max(0, track.scrollHeight - track.clientHeight);
    setCanNoticeUp(track.scrollTop > 2);
    setCanNoticeDown(track.scrollTop < max - 2);
  };
  const slideNotices = (direction) => {
    const track = noticesRef.current;
    if (!track) return;
    track.scrollBy({ top: direction * Math.max(120, track.clientHeight * 0.72), behavior: "smooth" });
  };

  useEffect(() => {
    const frame = requestAnimationFrame(updateNoticeControls);
    const track = noticesRef.current;
    const observer = track && typeof ResizeObserver !== "undefined" ? new ResizeObserver(updateNoticeControls) : null;
    if (track) observer?.observe(track);
    return () => { cancelAnimationFrame(frame); observer?.disconnect(); };
  }, [notices]);

  return (
    <>
      {/* 1 — Hero */}
      <HeroCarousel slides={settings.banners} stats={statList} />

      {/* 2 — Message from Principal */}
      <Section $bg="alt">
        <Container>
          <Reveal direction="scale">
            <PrincipalCard>
              <PrincipalPhoto>
                <Media src={principalPhoto} alt={principalName}
                  icon={GraduationCap} monogram={initials(principalName)} accent="secondary" />
              </PrincipalPhoto>
              <PrincipalBody>
                <Quote size={30} />
                <h3>{t("about.principalTitle")}</h3>
                <PrincipalMessage html={principalMsg} />
                <PName>{principalName}</PName>
                <ReadLink to="/about">{t("home.readAbout")} <ArrowRight size={16} /></ReadLink>
              </PrincipalBody>
            </PrincipalCard>
          </Reveal>
        </Container>
      </Section>

      {/* 3 — Our School at a Glance */}
      <StatsBand ref={statsRef}>
        <Container>
          <StatsHead>{t("stats.title")}</StatsHead>
          <StatsGrid>
            {statList.map((s, i) => (
              <StatItem key={i} icon={STAT_ICONS[i % STAT_ICONS.length]} value={Number(s.value) || 0}
                suffix={s.suffix || ""} label={pickLang(s, "label")} run={statsRun} lang={lang} />
            ))}
          </StatsGrid>
        </Container>
      </StatsBand>

      {/* 4 — Our Courses */}
      <Section>
        <Container>
          <Head title={t("home.coursesTitle")} subtitle={t("home.coursesSubtitle")} to="/academic" viewAll={t("common.viewAll")} icon={BookOpen} />
          <Reveal>
          <CardCarousel ariaLabel={t("home.coursesTitle")} itemWidth="320px">
            {courses.map((c, i) => {
              const Icon = COURSE_ICON[c.category] || GraduationCap;
              const accent = i % 2 === 0 ? "primary" : "secondary";
              return (
                <SlideCard as={Link} key={c._id || c.name} to={`/syllabus?stream=${c.category || "general"}`} $accent={accent} $hover>
                  <SlideMedia $accent={accent}>
                    <Media src={c.imageUrl} alt={pickLang(c, "name")} icon={Icon} monogram={initials(pickLang(c, "name"))} accent={accent} />
                    <MediaShade />
                    <TopBadge><Badge $tone={accent === "primary" ? "danger" : "secondary"}>{c.category || "general"}</Badge></TopBadge>
                  </SlideMedia>
                  <SlideBody><h3>{pickLang(c, "name")}</h3><SlideDescription>{htmlToText(pickLang(c, "description"))}</SlideDescription>
                    <SlideCta $accent={accent}>{t("academics.viewSyllabus")} <ArrowRight size={14} /></SlideCta>
                  </SlideBody>
                </SlideCard>
              );
            })}
          </CardCarousel>
          </Reveal>
        </Container>
      </Section>

      {/* 5 — Upcoming Events */}
      <Section $bg="alt">
        <Container>
          <Head title={t("home.upcomingEvents")} subtitle={t("home.eventsSubtitle")} to="/events" viewAll={t("common.viewAll")} color="secondary" icon={CalendarDays} />
          {events === null ? (
            <CardCarousel ariaLabel={t("home.upcomingEvents")}>{[0, 1, 2, 3].map((i) => <Skeleton key={i} $h="390px" $radius="lg" />)}</CardCarousel>
          ) : events.length === 0 ? (
            <EmptyBox>{t("events.empty")}</EmptyBox>
          ) : (
            <Reveal>
            <CardCarousel ariaLabel={t("home.upcomingEvents")} itemWidth="320px">
              {events.map((e, i) => (
                <SlideCard as={Link} key={e._id} to={`/events/${e._id}`} $accent="secondary" $hover>
                  <SlideMedia $accent="secondary">
                    <Media src={e.imageUrl || e.images?.[0]} alt={pickLang(e, "title")} icon={CalendarDays} monogram={initials(pickLang(e, "title"))} accent="secondary" />
                    <MediaShade /><TopBadge><Badge $tone="secondary">{e.category || "Event"}</Badge></TopBadge>
                    <DateChip><CalendarDays size={13} /> {formatDate(e.startDate, lang)}</DateChip>
                  </SlideMedia>
                  <SlideBody><h3>{pickLang(e, "title")}</h3><SlideDescription>{htmlToText(pickLang(e, "description"))}</SlideDescription>
                    {e.location && <SlideMeta><MapPin size={13} /> {e.location}</SlideMeta>}
                    <SlideCta $accent="secondary">{t("common.viewDetails")} <ArrowRight size={14} /></SlideCta>
                  </SlideBody>
                </SlideCard>
              ))}
            </CardCarousel>
            </Reveal>
          )}
        </Container>
      </Section>

      {/* 6 — Latest Notices */}
      <Section>
        <Container>
          <Head title={t("home.latestNotices")} subtitle={t("home.noticesSubtitle")} to="/notices" viewAll={t("common.viewAll")} />
          {notices === null ? (
            <Stack>{[0, 1, 2].map((i) => <Skeleton key={i} $h="120px" $radius="lg" />)}</Stack>
          ) : notices.length === 0 ? (
            <EmptyBox>{t("notices.empty")}</EmptyBox>
          ) : (
            <NoticeSlider role="region" aria-label={t("home.latestNotices")}>
              <NoticeTrack ref={noticesRef} tabIndex={0} onScroll={updateNoticeControls}
                onKeyDown={(event) => {
                  if (event.key === "ArrowUp" || event.key === "ArrowDown") {
                    event.preventDefault();
                    slideNotices(event.key === "ArrowUp" ? -1 : 1);
                  }
                }}>
              {notices.map((n, i) => {
                const urgent = n.priority === "urgent";
                return (
                  <Reveal key={n._id} direction="right" delay={i * 100}>
                    <NoticeRow to={`/notices/${n._id}`} $accent={urgent ? "primary" : "secondary"} $fresh={freshNoticeId === n._id}>
                      <NoticeThumb>
                        <Media src={n.imageUrl || n.images?.[0]} alt={pickLang(n, "title")} icon={Megaphone} monogram={initials(pickLang(n, "title"))} accent={urgent ? "primary" : "secondary"} />
                      </NoticeThumb>
                      <NoticeCopy>
                        <CardTop>
                          {urgent && <Badge $tone="danger"><AlertTriangle size={12} /> {lang === "ne" ? "जरुरी" : "Urgent"}</Badge>}
                          {freshNoticeId === n._id && <FreshBadge>{lang === "ne" ? "नयाँ" : "New"}</FreshBadge>}
                          <Badge $tone={n.category === "academic" ? "secondary" : "neutral"}>
                            {n.category === "academic" ? t("notices.filterAcademic") : t("notices.filterAdministrative")}
                          </Badge>
                          <Meta><Clock3 size={13} /> {formatDate(n.publishedAt || n.createdAt, lang)}</Meta>
                        </CardTop>
                        <strong>{pickLang(n, "title")}</strong>
                        <Excerpt>{htmlToText(pickLang(n, "body"))}</Excerpt>
                      </NoticeCopy>
                      <NoticeArrow aria-hidden><ArrowRight size={18} /></NoticeArrow>
                    </NoticeRow>
                  </Reveal>
                );
              })}
              </NoticeTrack>
              <NoticeControls>
                <NoticeSlideButton type="button" onClick={() => slideNotices(-1)} disabled={!canNoticeUp} aria-label="Previous notices">
                  <ChevronUp size={21} />
                </NoticeSlideButton>
                <NoticeSlideButton type="button" onClick={() => slideNotices(1)} disabled={!canNoticeDown} aria-label="More notices">
                  <ChevronDown size={21} />
                </NoticeSlideButton>
              </NoticeControls>
            </NoticeSlider>
          )}
        </Container>
      </Section>

      {/* 7 — Faculty */}
      <Section $bg="alt">
        <Container>
          <Head title={t("home.facultyTitle")} subtitle={t("home.facultySubtitle")} to="/faculty" viewAll={t("common.viewAll")} color="secondary" icon={Users} />
          {staff === null ? (
            <CardCarousel ariaLabel={t("home.facultyTitle")} itemWidth="270px">
              {[0, 1, 2, 3].map((i) => <Skeleton key={i} $h="330px" $radius="lg" />)}
            </CardCarousel>
          ) : faculty.length === 0 ? (
            <EmptyBox>{t("admin.noItems")}</EmptyBox>
          ) : (
            <Reveal>
            <CardCarousel ariaLabel={t("home.facultyTitle")} itemWidth="270px">
              {faculty.map((m, i) => (
                  <PersonCard as={Link} key={m._id} to="/faculty">
                    <PersonPhoto>
                      <Media src={m.photoUrl} alt={pickLang(m, "name")} icon={Users} monogram={initials(pickLang(m, "name"))} accent={i % 2 ? "secondary" : "primary"} />
                      <PersonOverlay>
                        {m.email && <span><Mail size={15} /></span>}
                        {m.phone && <span><Phone size={15} /></span>}
                      </PersonOverlay>
                    </PersonPhoto>
                    <PersonInfo>
                      <strong>{pickLang(m, "name")}</strong>
                      <PRole>{pickLang(m, "role")}</PRole>
                    </PersonInfo>
                  </PersonCard>
              ))}
            </CardCarousel>
            </Reveal>
          )}
        </Container>
      </Section>

      {/* 8 — Committee */}
      <Section>
        <Container>
          <Head title={t("home.committeeTitle")} subtitle={t("home.committeeSubtitle")} to="/committee" viewAll={t("common.viewAll")} icon={Users2} />
          {chair && pickLang(chair, "message") && (
            <Reveal direction="left">
              <ChairCard>
                <ChairPhoto>
                  <Media src={chair.photoUrl} alt={pickLang(chair, "name")} icon={Users2} monogram={initials(pickLang(chair, "name"))} accent="primary" />
                </ChairPhoto>
                <div>
                  <Quote size={24} />
                  <p>{htmlToText(pickLang(chair, "message"))}</p>
                  <strong>{pickLang(chair, "name")}</strong>
                  <PRole>{pickLang(chair, "role")}</PRole>
                </div>
              </ChairCard>
            </Reveal>
          )}
          {committee === null ? (
            <CommitteeCarouselWrap $hasChair={Boolean(chair)}>
              <CardCarousel ariaLabel={t("home.committeeTitle")} itemWidth="270px">
                {[0, 1, 2, 3].map((i) => <Skeleton key={i} $h="330px" $radius="lg" />)}
              </CardCarousel>
            </CommitteeCarouselWrap>
          ) : committeeMembers.length === 0 ? (
            <EmptyBox>{t("admin.noItems")}</EmptyBox>
          ) : (
            <CommitteeCarouselWrap $hasChair={Boolean(chair)}>
              <Reveal>
              <CardCarousel ariaLabel={t("home.committeeTitle")} itemWidth="270px">
              {committeeMembers.map((m, i) => (
                  <PersonCard as={Link} key={m._id} to="/committee">
                    <PersonPhoto>
                      <Media src={m.photoUrl} alt={pickLang(m, "name")} icon={Users2} monogram={initials(pickLang(m, "name"))} accent={i % 2 ? "primary" : "secondary"} />
                      <PersonOverlay>
                        {m.email && <span><Mail size={15} /></span>}
                        {m.phone && <span><Phone size={15} /></span>}
                      </PersonOverlay>
                    </PersonPhoto>
                    <PersonInfo>
                      <strong>{pickLang(m, "name")}</strong>
                      <PRole>{pickLang(m, "role")}</PRole>
                    </PersonInfo>
                  </PersonCard>
              ))}
              </CardCarousel>
              </Reveal>
            </CommitteeCarouselWrap>
          )}
        </Container>
      </Section>

      {/* 9 — Affiliations & Partners */}
      <PartnersStrip />

      {/* 10 — Ready to take the next step? */}
      <FinalCTA />
    </>
  );
}

/* ================================================================== */
/*  Styled                                                            */
/* ================================================================== */
const HeadRow = styled.div`
  display: flex; align-items: flex-end; justify-content: space-between; gap: ${({ theme }) => theme.space[4]};
  margin-bottom: ${({ theme }) => theme.space[8]}; flex-wrap: wrap;
`;
const HeadText = styled.div`display: flex; flex-direction: column; gap: ${({ theme }) => theme.space[2]};`;
const H2 = styled.h2`
  position: relative; display: inline-block;
  font-size: ${({ theme }) => theme.fontSizes["4xl"]};
  color: ${({ theme, $color }) => theme.colors[$color] || theme.colors.text};
  > svg { margin-right: 10px; vertical-align: -2px; }
  ${({ theme }) => theme.media.tablet(`font-size: 1.9rem;`)}
`;
const Underline = styled.span`
  display: block; width: 66px; height: 4px; margin-top: 10px;
  border-radius: ${({ theme }) => theme.radii.pill}; transform-origin: left center;
  background: ${({ theme, $color }) => ($color === "secondary" ? theme.gradients.secondary : theme.gradients.primary)};
`;
const Sub = styled.p`color: ${({ theme }) => theme.colors.textMuted}; font-size: ${({ theme }) => theme.fontSizes.md}; max-width: 60ch;`;
const ViewAll = styled(Link)`
  display: inline-flex; align-items: center; gap: 6px; flex-shrink: 0;
  color: ${({ theme }) => theme.colors.secondary}; font-weight: 700; font-size: ${({ theme }) => theme.fontSizes.sm};
  &:hover { gap: 10px; color: ${({ theme }) => theme.colors.primary}; }
`;

const Fallback = styled.div`
  width: 100%; height: 100%; display: grid; place-items: center; gap: 4px; position: relative;
  color: #fff; background: ${({ theme, $accent }) => ($accent === "secondary" ? theme.gradients.secondary : theme.gradients.primary)};
  svg { opacity: 0.9; }
`;
const FallbackMono = styled.span`font-family: ${({ theme }) => theme.fonts.heading}; font-weight: 800; font-size: ${({ theme }) => theme.fontSizes.xl}; letter-spacing: 1px;`;

const Excerpt = styled.p`
  color: ${({ theme }) => theme.colors.textBody}; font-size: ${({ theme }) => theme.fontSizes.sm}; line-height: 1.55;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
`;
const Meta = styled.span`
  display: inline-flex; align-items: center; gap: 4px; color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.fontSizes.xs}; font-weight: 600; min-width: 0;
`;
const ReadMore = styled.span`
  display: inline-flex; align-items: center; gap: 5px; margin-top: auto;
  color: ${({ theme, $accent }) => theme.colors[$accent] || theme.colors.primary};
  font-size: ${({ theme }) => theme.fontSizes.xs}; font-weight: 700; white-space: nowrap;
`;
const CardTop = styled.div`display: flex; align-items: center; gap: 8px; flex-wrap: wrap;`;
const CardBottom = styled.div`margin-top: auto; display: flex; align-items: center; justify-content: space-between; gap: 8px;`;
const EmptyBox = styled.p`
  text-align: center; color: ${({ theme }) => theme.colors.textMuted};
  padding: ${({ theme }) => theme.space[12]}; border: 1px dashed ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
`;
const Stack = styled.div`display: flex; flex-direction: column; gap: ${({ theme }) => theme.space[4]};`;

/* ---- Principal ---- */
const PrincipalCard = styled.div`
  display: grid; grid-template-columns: 260px 1fr; gap: ${({ theme }) => theme.space[8]}; align-items: center;
  background: ${({ theme }) => theme.colors.surface}; border: 1px solid ${({ theme }) => theme.colors.border};
  border-left: 5px solid ${({ theme }) => theme.colors.secondary};
  border-radius: ${({ theme }) => theme.radii.xl}; padding: ${({ theme }) => theme.space[8]}; box-shadow: ${({ theme }) => theme.shadows.md};
  ${({ theme }) => theme.media.tablet(`grid-template-columns: 1fr; text-align: center; padding: 1.75rem;`)}
`;
const PrincipalPhoto = styled.div`
  width: 100%; aspect-ratio: 4 / 5; border-radius: ${({ theme }) => theme.radii.lg}; overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.border};
  ${({ theme }) => theme.media.tablet(`max-width: 240px; margin-inline: auto;`)}
`;
const PrincipalBody = styled.div`
  min-width: 0;
  svg { color: ${({ theme }) => theme.colors.secondary}; margin-bottom: ${({ theme }) => theme.space[2]}; }
  h3 { font-size: ${({ theme }) => theme.fontSizes["2xl"]}; color: ${({ theme }) => theme.colors.primary}; margin-bottom: ${({ theme }) => theme.space[3]}; }
  ${({ theme }) => theme.media.tablet(`svg { margin-inline: auto; }`)}
`;
const PrincipalMessage = styled(RichText)`
  p, ul, ol, blockquote { margin-bottom: ${({ theme }) => theme.space[3]}; }
  > :last-child { margin-bottom: 0; }
  h2, h3, h4 { color: ${({ theme }) => theme.colors.text}; }
`;
const PName = styled.strong`display: block; margin-top: ${({ theme }) => theme.space[4]}; color: ${({ theme }) => theme.colors.text}; font-size: ${({ theme }) => theme.fontSizes.lg};`;
const PRole = styled.span`color: ${({ theme }) => theme.colors.secondary}; font-weight: 600; font-size: ${({ theme }) => theme.fontSizes.sm};`;
const ReadLink = styled(Link)`
  display: inline-flex; align-items: center; gap: 6px; margin-top: ${({ theme }) => theme.space[4]};
  color: ${({ theme }) => theme.colors.primary}; font-weight: 700; font-size: ${({ theme }) => theme.fontSizes.sm};
  &:hover { gap: 10px; }
`;

/* ---- Stats band ---- */
const StatsBand = styled.section`background: ${({ theme }) => theme.gradients.secondary}; color: #fff; padding-block: ${({ theme }) => theme.space[16]};`;
const StatsHead = styled.h2`text-align: center; color: #fff; margin-bottom: ${({ theme }) => theme.space[10]}; font-size: ${({ theme }) => theme.fontSizes["3xl"]};`;
const StatsGrid = styled.div`
  display: grid; grid-template-columns: repeat(4, 1fr); gap: ${({ theme }) => theme.space[6]};
  ${({ theme }) => theme.media.tablet(`grid-template-columns: repeat(2, 1fr);`)}
`;
const Stat = styled.div`
  display: flex; flex-direction: column; align-items: center; gap: 6px; text-align: center;
  svg { color: rgba(255,255,255,0.9); margin-bottom: 4px; }
  strong { font-size: ${({ theme }) => theme.fontSizes["4xl"]}; font-family: ${({ theme }) => theme.fonts.heading}; }
  span { color: rgba(255,255,255,0.85); font-size: ${({ theme }) => theme.fontSizes.sm}; }
`;

/* ---- Shared course/event carousel card ---- */
const SlideCard = styled(Card)`
  width: 100%; height: 390px; padding: 0; overflow: hidden;
  display: flex; flex-direction: column; color: inherit;
  border-top: 4px solid ${({ theme, $accent }) => theme.colors[$accent] || theme.colors.primary};
  &:hover img, &:hover ${Fallback} { transform: scale(1.06); }
  &:focus-visible { outline: none; box-shadow: ${({ theme }) => theme.shadows.focus}; }
`;
const SlideMedia = styled.div`
  position: relative; flex: 0 0 170px; height: 170px; overflow: hidden;
  background: ${({ theme, $accent }) => ($accent === "secondary" ? theme.gradients.secondary : theme.gradients.primary)};
  & > img, & > ${Fallback} { width: 100%; height: 100%; transition: transform ${({ theme }) => theme.transitions.slow}; }
  & > img { object-fit: cover; }
  @media (prefers-reduced-motion: reduce) { & > img, & > ${Fallback} { transition: none; } }
`;
const MediaShade = styled.div`position:absolute;inset:0;pointer-events:none;background:linear-gradient(180deg,rgba(0,0,0,.03) 42%,rgba(0,0,0,.42) 100%);`;
const TopBadge = styled.div`position:absolute;top:12px;left:12px;z-index:1;text-transform:capitalize;`;
const SlideBody = styled.div`
  min-height: 0; flex: 1; display: flex; flex-direction: column; gap: 9px;
  padding: ${({ theme }) => theme.space[5]};
  h3 { color: ${({ theme }) => theme.colors.text}; font-size: ${({ theme }) => theme.fontSizes.lg}; line-height: 1.28;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
`;
const SlideDescription = styled.p`
  color: ${({ theme }) => theme.colors.textBody}; font-size: ${({ theme }) => theme.fontSizes.sm}; line-height: 1.55;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
`;
const SlideMeta = styled.span`
  display: inline-flex; align-items: center; gap: 5px; min-width: 0;
  color: ${({ theme }) => theme.colors.textMuted}; font-size: ${({ theme }) => theme.fontSizes.xs};
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
`;
const SlideCta = styled.span`
  display: inline-flex; align-items: center; gap: 5px; margin-top: auto;
  color: ${({ theme, $accent }) => theme.colors[$accent] || theme.colors.primary};
  font-size: ${({ theme }) => theme.fontSizes.sm}; font-weight: 700;
  svg{transition:transform ${({theme})=>theme.transitions.base}}
  ${SlideCard}:hover & svg{transform:translateX(4px)}
`;

/* ---- Course cards ---- */
const CourseCard = styled(Link)`
  display: flex; flex-direction: column; overflow: hidden; height: 100%;
  background: ${({ theme }) => theme.colors.surface}; border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg}; box-shadow: ${({ theme }) => theme.shadows.sm};
  transition: transform ${({ theme }) => theme.transitions.slow}, box-shadow ${({ theme }) => theme.transitions.slow}, border-color ${({ theme }) => theme.transitions.base};
  &:hover { transform: translateY(-6px); box-shadow: ${({ theme }) => theme.shadows.xl}; border-color: ${({ theme, $accent }) => theme.colors[$accent]}; }
  &:focus-visible { outline: none; box-shadow: ${({ theme }) => theme.shadows.focus}; }
`;
const CourseBanner = styled.div`
  position: relative; aspect-ratio: 16 / 9; display: grid; place-items: center; color: #fff; overflow: hidden;
  background: ${({ theme, $accent }) => ($accent === "secondary" ? theme.gradients.secondary : theme.gradients.primary)};
  svg { transition: transform ${({ theme }) => theme.transitions.slow}; }
  img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: transform ${({ theme }) => theme.transitions.slow}; }
  ${CourseCard}:hover & svg { transform: scale(1.15) rotate(-4deg); }
  ${CourseCard}:hover & img { transform: scale(1.08); }
`;
const CourseScrim = styled.div`position: absolute; inset: 0; pointer-events: none; background: linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(0,0,0,0.4) 100%);`;
const CourseMono = styled.span`position: absolute; right: 12px; bottom: 8px; z-index: 1; font-family: ${({ theme }) => theme.fonts.heading}; font-weight: 800; font-size: ${({ theme }) => theme.fontSizes.xl}; opacity: 0.45;`;
const CourseBody = styled.div`
  padding: ${({ theme }) => theme.space[5]}; display: flex; flex-direction: column; gap: ${({ theme }) => theme.space[2]}; flex: 1;
  h3 { color: ${({ theme }) => theme.colors.text}; font-size: ${({ theme }) => theme.fontSizes.lg}; }
`;

/* ---- Media cards (events) ---- */
const MediaCard = styled(Link)`
  display: flex; flex-direction: column; overflow: hidden; height: 100%;
  background: ${({ theme }) => theme.colors.surface}; border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg}; box-shadow: ${({ theme }) => theme.shadows.sm};
  transition: transform ${({ theme }) => theme.transitions.slow}, box-shadow ${({ theme }) => theme.transitions.slow}, border-color ${({ theme }) => theme.transitions.base};
  &:hover { transform: translateY(-6px); box-shadow: ${({ theme }) => theme.shadows.xl}; border-color: ${({ theme, $accent }) => theme.colors[$accent]}; }
  &:focus-visible { outline: none; box-shadow: ${({ theme }) => theme.shadows.focus}; }
`;
const Thumb = styled.div`
  position: relative; width: 100%; padding-top: ${({ $ratio }) => $ratio || "56%"}; overflow: hidden;
  background: ${({ theme }) => theme.colors.surfaceAlt};
  & > img, & > ${Fallback} {
    position: absolute; inset: 0; width: 100%; height: 100%;
    transition: transform ${({ theme }) => theme.transitions.slow};
  }
  ${MediaCard}:hover & > img, ${MediaCard}:hover & > ${Fallback} { transform: scale(1.06); }
`;
const Scrim = styled.div`
  position: absolute; inset: 0; pointer-events: none;
  background: linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(0,0,0,0.42) 100%);
`;
const BadgeTL = styled.div`position: absolute; top: 12px; left: 12px; inset: auto auto auto 12px;`;
const DateChip = styled.div`
  position: absolute; inset: auto 12px 12px auto; display: inline-flex; align-items: center; gap: 5px;
  background: rgba(255,255,255,0.92); color: ${({ theme }) => theme.colors.primary};
  padding: 4px 10px; border-radius: ${({ theme }) => theme.radii.pill}; font-size: ${({ theme }) => theme.fontSizes.xs}; font-weight: 700;
`;
const MediaBody = styled.div`
  padding: ${({ theme }) => theme.space[5]}; display: flex; flex-direction: column; gap: ${({ theme }) => theme.space[2]}; flex: 1;
  h3 { color: ${({ theme }) => theme.colors.text}; font-size: ${({ theme }) => theme.fontSizes.lg}; line-height: 1.3;
       display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
`;

/* ---- Notice rows ---- */
const NoticeSlider = styled.div`
  display: grid; grid-template-columns: minmax(0, 1fr) 44px; gap: ${({ theme }) => theme.space[3]}; align-items: center;
  ${({ theme }) => theme.media.mobile(`grid-template-columns: 1fr;`)}
`;
const NoticeTrack = styled.div`
  max-height: 392px; overflow-y: auto; overflow-x: hidden; display: flex; flex-direction: column;
  gap: ${({ theme }) => theme.space[4]}; padding: 3px 8px 3px 3px;
  scroll-snap-type: y mandatory; scroll-behavior: smooth; scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
  > * { flex: 0 0 auto; scroll-snap-align: start; }
  &:focus-visible { outline: 2px solid ${({ theme }) => theme.colors.secondary}; outline-offset: 4px; border-radius: ${({ theme }) => theme.radii.md}; }
  @media (prefers-reduced-motion: reduce) { scroll-behavior: auto; }
`;
const NoticeControls = styled.div`
  display: flex; flex-direction: column; gap: ${({ theme }) => theme.space[3]};
  ${({ theme }) => theme.media.mobile(`flex-direction: row; justify-content: center;`)}
`;
const NoticeSlideButton = styled.button`
  width: 42px; height: 42px; display: grid; place-items: center; border-radius: 50%;
  color: ${({ theme }) => theme.colors.primary}; background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border}; box-shadow: ${({ theme }) => theme.shadows.sm};
  transition: transform ${({ theme }) => theme.transitions.fast}, opacity ${({ theme }) => theme.transitions.fast};
  &:hover:not(:disabled) { transform: scale(1.08); box-shadow: ${({ theme }) => theme.shadows.md}; }
  &:disabled { opacity: .3; cursor: not-allowed; }
  &:focus-visible { outline: 2px solid ${({ theme }) => theme.colors.secondary}; outline-offset: 2px; }
  @media (prefers-reduced-motion: reduce) { transition: none; }
`;
const noticeArrive = keyframes`0%{opacity:.55;transform:translateX(-8px)}100%{opacity:1;transform:none}`;
const NoticeRow = styled(Link)`
  display: grid; grid-template-columns: 120px minmax(0, 1fr) auto; align-items: center; gap: ${({ theme }) => theme.space[5]};
  background: ${({ theme }) => theme.colors.surface}; border: 1px solid ${({ theme }) => theme.colors.border};
  border-left: 4px solid ${({ theme, $accent }) => theme.colors[$accent]};
  border-radius: ${({ theme }) => theme.radii.lg}; padding: ${({ theme }) => theme.space[4]}; overflow: hidden;
  transition: transform ${({ theme }) => theme.transitions.base}, box-shadow ${({ theme }) => theme.transitions.base};
  &:hover { transform: translateX(6px); box-shadow: ${({ theme }) => theme.shadows.md}; }
  &:focus-visible { outline: none; box-shadow: ${({ theme }) => theme.shadows.focus}; }
  strong { color: ${({ theme }) => theme.colors.text}; font-size: ${({ theme }) => theme.fontSizes.md}; }
  ${({$fresh})=>$fresh&&css`animation:${noticeArrive} 1.1s ease-out both;`}
  ${({ theme }) => theme.media.mobile(`grid-template-columns: 84px minmax(0,1fr); & > *:last-child { display: none; }`)}
`;
const freshPulse = keyframes`0%,100%{transform:scale(1)}45%{transform:scale(1.08)}`;
const FreshBadge = styled.span`display:inline-flex;align-items:center;padding:3px 8px;border-radius:${({theme})=>theme.radii.pill};background:${({theme})=>theme.colors.primary};color:#fff;font-size:${({theme})=>theme.fontSizes.xs};font-weight:800;animation:${freshPulse} .75s ease-out 2;`;
const NoticeThumb = styled.div`
  width: 120px; height: 84px; border-radius: ${({ theme }) => theme.radii.md}; overflow: hidden; flex-shrink: 0;
  ${({ theme }) => theme.media.mobile(`width: 84px; height: 84px;`)}
`;
const NoticeCopy = styled.div`min-width: 0; display: flex; flex-direction: column; gap: 6px;`;
const NoticeArrow = styled.span`
  display: grid; place-items: center; width: 40px; height: 40px; border-radius: ${({ theme }) => theme.radii.pill};
  color: ${({ theme }) => theme.colors.primary}; background: ${({ theme }) => theme.colors.primarySoft};
  transition: transform ${({ theme }) => theme.transitions.base};
  ${NoticeRow}:hover & { transform: translateX(3px); }
`;

/* ---- People (faculty + committee) ---- */
const PersonCard = styled.div`
  display: flex; flex-direction: column; overflow: hidden; width: 100%; height: 330px;
  background: ${({ theme }) => theme.colors.surface}; border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg}; box-shadow: ${({ theme }) => theme.shadows.sm};
  transition: transform ${({ theme }) => theme.transitions.slow}, box-shadow ${({ theme }) => theme.transitions.slow};
  &:hover { transform: translateY(-6px); box-shadow: ${({ theme }) => theme.shadows.xl}; }
  &:focus-visible { outline: none; box-shadow: ${({ theme }) => theme.shadows.focus}; }
`;
const PersonPhoto = styled.div`
  position: relative; width: 100%; aspect-ratio: 1 / 1; overflow: hidden; background: ${({ theme }) => theme.colors.surfaceAlt};
  & > img, & > ${Fallback} { position: absolute; inset: 0; transition: transform ${({ theme }) => theme.transitions.slow}; }
  /* Show the whole uploaded photo (no harsh crop) — letterboxed on the card bg. */
  & > img { object-fit: contain; }
  ${PersonCard}:hover & > img, ${PersonCard}:hover & > ${Fallback} { transform: scale(1.06); }
`;
const PersonOverlay = styled.div`
  position: absolute; inset: auto 0 0 0; display: flex; gap: 8px; justify-content: center; padding: 10px;
  background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.45) 100%);
  transform: translateY(100%); transition: transform ${({ theme }) => theme.transitions.base};
  ${PersonCard}:hover & { transform: none; }
  span { width: 32px; height: 32px; display: grid; place-items: center; border-radius: ${({ theme }) => theme.radii.pill};
    background: rgba(255,255,255,0.92); color: ${({ theme }) => theme.colors.secondary}; }
  @media (prefers-reduced-motion: reduce) { transform: none; }
`;
const PersonInfo = styled.div`
  padding: ${({ theme }) => theme.space[4]}; text-align: center; display: flex; flex-direction: column; gap: 2px;
  strong { color: ${({ theme }) => theme.colors.text}; font-size: ${({ theme }) => theme.fontSizes.md}; }
`;
const CommitteeCarouselWrap = styled.div`
  margin-top: ${({ $hasChair }) => ($hasChair ? "1.5rem" : "0")};
`;

/* ---- Committee chair quote ---- */
const ChairCard = styled.div`
  display: grid; grid-template-columns: 200px 1fr; gap: ${({ theme }) => theme.space[8]}; align-items: center;
  background: ${({ theme }) => theme.colors.surfaceAlt}; border: 1px solid ${({ theme }) => theme.colors.border};
  border-left: 5px solid ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.radii.xl}; padding: ${({ theme }) => theme.space[8]};
  svg { color: ${({ theme }) => theme.colors.primary}; margin-bottom: ${({ theme }) => theme.space[2]}; }
  p { color: ${({ theme }) => theme.colors.textBody}; font-style: italic; line-height: ${({ theme }) => theme.lineHeights.relaxed};
      margin-bottom: ${({ theme }) => theme.space[3]}; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; }
  strong { display: block; color: ${({ theme }) => theme.colors.text}; }
  ${({ theme }) => theme.media.tablet(`grid-template-columns: 1fr; text-align: center; svg { margin-inline: auto; }`)}
`;
const ChairPhoto = styled.div`
  width: 100%; aspect-ratio: 1 / 1; border-radius: ${({ theme }) => theme.radii.lg}; overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.border};
  ${({ theme }) => theme.media.tablet(`max-width: 180px; margin-inline: auto;`)}
`;

export default Home;
