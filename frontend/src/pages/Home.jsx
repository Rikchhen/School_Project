import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { Megaphone, ArrowRight, Lightbulb, CalendarDays, Users, GraduationCap, Award, BookOpen } from "lucide-react";
import { Link } from "../lib/router";
import { useLang } from "../context/LanguageContext";
import { useSettings } from "../context/SettingsContext";
import { useSocketEvent } from "../context/SocketContext";
import { useToast } from "../context/ToastContext";
import { api } from "../lib/api";
import { formatDate, formatNumber } from "../lib/format";
import { Container, Section } from "../components/ui/Layout";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Skeleton } from "../components/ui/Skeleton";
import { RichText } from "../components/RichText";
import { Reveal } from "../components/Reveal";
import { HeroCarousel } from "../components/HeroCarousel";
import { PartnersStrip } from "../components/PartnersStrip";
import { FinalCTA } from "../components/FinalCTA";

/** Small count-up animation for the stats row. */
function useCountUp(target, run) {
  const [n, setN] = useState(0);
  const ref = useRef(0);
  useEffect(() => {
    if (!run) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) { setN(target); return; }
    let raf;
    const start = performance.now();
    const dur = 1200;
    const tick = (t) => {
      const p = Math.min(1, (t - start) / dur);
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

export function Home() {
  const { t, pickLang, lang } = useLang();
  const { settings } = useSettings();
  const statList = settings.stats && settings.stats.length ? settings.stats : DEFAULT_STATS;
  const toast = useToast();
  const [notices, setNotices] = useState(null);
  const [events, setEvents] = useState(null);
  const [mission, setMission] = useState(null);
  const [statsRun, setStatsRun] = useState(false);
  const statsRef = useRef(null);

  useEffect(() => {
    const ctrl = new AbortController();
    api.get("/notices", { limit: 3, published: "true" }, { signal: ctrl.signal })
      .then((r) => setNotices(r.items)).catch(() => setNotices([]));
    api.get("/events", { limit: 3, upcoming: "true" }, { signal: ctrl.signal })
      .then((r) => setEvents(r.items)).catch(() => setEvents([]));
    api.get("/pages/home-mission", undefined, { signal: ctrl.signal })
      .then((r) => setMission(r.page)).catch(() => setMission(null));
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
    setNotices((prev) => [notice, ...(prev || [])].slice(0, 3));
    toast.info(`${t("home.latestNotices")}: ${notice.title}`);
  });
  useSocketEvent("event:new", (event) => {
    setEvents((prev) => [event, ...(prev || [])].slice(0, 3));
    toast.info(`${t("home.upcomingEvents")}: ${event.title}`);
  });

  return (
    <>
      <HeroCarousel slides={settings.banners} stats={statList} />

      <Section $bg="alt">
        <Container>
          <Reveal>
            <MissionCard $accent="secondary">
              <IconCircle><Lightbulb size={26} /></IconCircle>
              <div>
                <h3>{mission ? pickLang(mission, "title") || t("home.missionTitle") : t("home.missionTitle")}</h3>
                {mission && pickLang(mission, "body")
                  ? <RichText html={pickLang(mission, "body")} />
                  : <p>{t("home.missionBody")}</p>}
                <ReadLink to="/about">{t("home.readAbout")} <ArrowRight size={16} /></ReadLink>
              </div>
              {mission?.content?.imageUrl && (
                <MissionImage>
                  <img src={mission.content.imageUrl} alt={t("home.missionTitle")} />
                </MissionImage>
              )}
            </MissionCard>
          </Reveal>
        </Container>
      </Section>

      <StatsBand ref={statsRef}>
        <Container>
          <StatsHead>{t("stats.title")}</StatsHead>
          <StatsGrid>
            {statList.map((s, i) => (
              <StatItem
                key={i}
                icon={STAT_ICONS[i % STAT_ICONS.length]}
                value={Number(s.value) || 0}
                suffix={s.suffix || ""}
                label={pickLang(s, "label")}
                run={statsRun}
                lang={lang}
              />
            ))}
          </StatsGrid>
        </Container>
      </StatsBand>

      <Section>
        <Container>
          <TwoCol>
            <div>
              <ColHead>
                <h3><Megaphone size={20} /> {t("home.latestNotices")}</h3>
                <Link to="/notices">{t("common.viewAll")} →</Link>
              </ColHead>
              {notices === null ? (
                <Stack>{[0, 1, 2].map((i) => <Skeleton key={i} $h="76px" $radius="lg" />)}</Stack>
              ) : notices.length === 0 ? (
                <Empty>{t("notices.empty")}</Empty>
              ) : (
                <Stack>
                  {notices.map((n) => (
                    <MiniCard key={n._id} to={`/notices/${n._id}`} $accent={n.priority === "urgent" ? "primary" : "secondary"}>
                      <Badge $tone={n.priority === "urgent" ? "danger" : "secondary"}>
                        {n.category === "academic" ? t("notices.filterAcademic") : t("notices.filterAdministrative")}
                      </Badge>
                      <strong>{pickLang(n, "title")}</strong>
                    </MiniCard>
                  ))}
                </Stack>
              )}
            </div>

            <div>
              <ColHead>
                <h3><CalendarDays size={20} /> {t("home.upcomingEvents")}</h3>
                <Link to="/events">{t("common.viewAll")} →</Link>
              </ColHead>
              {events === null ? (
                <Stack>{[0, 1, 2].map((i) => <Skeleton key={i} $h="76px" $radius="lg" />)}</Stack>
              ) : events.length === 0 ? (
                <Empty>{t("events.empty")}</Empty>
              ) : (
                <Stack>
                  {events.map((e) => (
                    <MiniCard key={e._id} to={`/events/${e._id}`} $accent="secondary">
                      <time>{formatDate(e.startDate, lang)}</time>
                      <strong>{pickLang(e, "title")}</strong>
                    </MiniCard>
                  ))}
                </Stack>
              )}
            </div>
          </TwoCol>
        </Container>
      </Section>

      <PartnersStrip />

      <FinalCTA />
    </>
  );
}

const MissionCard = styled(Card)`
  display: flex; gap: ${({ theme }) => theme.space[6]}; align-items: flex-start;
  padding: ${({ theme }) => theme.space[8]};
  h3 { font-size: ${({ theme }) => theme.fontSizes["3xl"]}; margin-bottom: ${({ theme }) => theme.space[3]}; }
  p { color: ${({ theme }) => theme.colors.textBody}; line-height: ${({ theme }) => theme.lineHeights.relaxed}; }
  ${({ theme }) => theme.media.tablet(`flex-direction: column; padding: 1.5rem;`)}
`;
const IconCircle = styled.div`
  flex-shrink: 0; width: 64px; height: 64px; display: grid; place-items: center;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme }) => theme.colors.secondarySoft}; color: ${({ theme }) => theme.colors.secondary};
`;
const MissionImage = styled.div`
  flex-shrink: 0; width: 280px; border-radius: ${({ theme }) => theme.radii.lg}; overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.border};
  img { width: 100%; height: 200px; object-fit: cover; display: block; }
  ${({ theme }) => theme.media.tablet(`width: 100%;`)}
`;
const ReadLink = styled(Link)`
  display: inline-flex; align-items: center; gap: 6px; margin-top: ${({ theme }) => theme.space[4]};
  color: ${({ theme }) => theme.colors.primary}; font-weight: 600; font-size: ${({ theme }) => theme.fontSizes.sm};
  &:hover { gap: 10px; }
`;

const StatsBand = styled.section`
  background: ${({ theme }) => theme.gradients.secondary};
  color: #fff; padding-block: ${({ theme }) => theme.space[16]};
`;
const StatsHead = styled.h2`
  text-align: center; color: #fff; margin-bottom: ${({ theme }) => theme.space[10]};
  font-size: ${({ theme }) => theme.fontSizes["3xl"]};
`;
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

const TwoCol = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: ${({ theme }) => theme.space[10]};
  ${({ theme }) => theme.media.tablet(`grid-template-columns: 1fr; gap: 2.5rem;`)}
`;
const ColHead = styled.div`
  display: flex; align-items: center; justify-content: space-between; margin-bottom: ${({ theme }) => theme.space[5]};
  h3 { display: flex; align-items: center; gap: 8px; color: ${({ theme }) => theme.colors.text}; font-size: ${({ theme }) => theme.fontSizes.xl}; }
  h3 svg { color: ${({ theme }) => theme.colors.primary}; }
  a { color: ${({ theme }) => theme.colors.secondary}; font-size: ${({ theme }) => theme.fontSizes.sm}; font-weight: 600; }
`;
const Stack = styled.div`display: flex; flex-direction: column; gap: ${({ theme }) => theme.space[3]};`;
const MiniCard = styled(Link)`
  display: flex; flex-direction: column; gap: 6px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-left: 4px solid ${({ theme, $accent }) => theme.colors[$accent]};
  border-radius: ${({ theme }) => theme.radii.lg}; padding: ${({ theme }) => theme.space[4]};
  transition: box-shadow ${({ theme }) => theme.transitions.base}, transform ${({ theme }) => theme.transitions.base};
  &:hover { box-shadow: ${({ theme }) => theme.shadows.md}; transform: translateX(3px); }
  strong { color: ${({ theme }) => theme.colors.text}; font-weight: 600; }
  time { color: ${({ theme }) => theme.colors.secondary}; font-size: ${({ theme }) => theme.fontSizes.xs}; font-weight: 600; }
`;
const Empty = styled.p`color: ${({ theme }) => theme.colors.textMuted}; padding: ${({ theme }) => theme.space[4]};`;

export default Home;
