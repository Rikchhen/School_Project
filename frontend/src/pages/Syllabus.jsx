import { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  BookOpen, CalendarDays, ChevronDown, Download, ExternalLink, FileText, Grid2X2,
  List, Printer, Search, Sparkles, X, Layers3, LibraryBig, Clock3,
} from "lucide-react";
import { useLang } from "../context/LanguageContext";
import { useFetch } from "../lib/useFetch";
import { assetUrl } from "../lib/api";
import { htmlToText } from "../lib/sanitizeHtml";
import { PageHero } from "../components/PageHero";
import { Container, Section } from "../components/ui/Layout";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input, Select } from "../components/ui/Input";
import { Badge } from "../components/ui/Badge";
import { SkeletonCard } from "../components/ui/Skeleton";
import { SmartImage } from "../components/SmartImage";
import { EmptyState } from "../components/EmptyState";
import { FetchError } from "../components/FetchError";
import { Reveal } from "../components/Reveal";
import { ReadMore } from "../components/ReadMore";

const VIEW_KEY = "adarsha_syllabus_view";
const STREAMS = ["science", "management", "humanities", "general"];
const readQueryFilters = () => {
  const params = new URLSearchParams(window.location.search);
  const requestedStream = params.get("stream") || "all";
  return {
    stream: STREAMS.includes(requestedStream) ? requestedStream : "all",
    grade: params.get("class") || "all",
    subject: params.get("subject") || "all",
  };
};
const gradeNumber = (value) => Number(String(value).match(/\d+/)?.[0]) || 999;
const byGrade = (a, b) => gradeNumber(a) - gradeNumber(b) || String(a).localeCompare(String(b));
const isNew = (date) => Date.now() - new Date(date).getTime() <= 30 * 86400000;

function relativeDate(date, lang) {
  if (!date) return "—";
  const days = Math.round((new Date(date).getTime() - Date.now()) / 86400000);
  if (Math.abs(days) < 1) return lang === "ne" ? "आज" : "today";
  if (typeof Intl.RelativeTimeFormat === "function") return new Intl.RelativeTimeFormat(lang === "ne" ? "ne" : "en", { numeric: "auto" }).format(days, "day");
  return new Date(date).toLocaleDateString();
}

function useCountUp(value, active) {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(reduced ? value : 0);
  useEffect(() => {
    if (!active || reduced) { if (active) setShown(value); return; }
    let frame; const start = performance.now();
    const tick = (now) => {
      const progress = Math.min(1, (now - start) / 700);
      setShown(Math.round(value * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, active, reduced]);
  return shown;
}

function Stat({ icon: Icon, value, label, active }) {
  const count = useCountUp(value, active);
  return <StatCard><Icon size={22} /><strong>{count}</strong><span>{label}</span></StatCard>;
}

export function Syllabus() {
  const { t, pickLang, lang } = useLang();
  const { data, loading, error, refetch } = useFetch("/syllabus?published=true");
  const items = data?.items || [];
  const reduced = useReducedMotion();
  const statsRef = useRef(null);
  const [statsActive, setStatsActive] = useState(false);
  const [query, setQuery] = useState("");
  const initialFilters = useRef(readQueryFilters()).current;
  const [grade, setGrade] = useState(initialFilters.grade);
  const [subject, setSubject] = useState(initialFilters.subject);
  const [stream, setStream] = useState(initialFilters.stream);
  const [year, setYear] = useState("all");
  const [sort, setSort] = useState("newest");
  const [view, setView] = useState(() => localStorage.getItem(VIEW_KEY) || "grid");
  const [closed, setClosed] = useState({});
  const [viewer, setViewer] = useState(null);
  const [activeGrade, setActiveGrade] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const libraryRef = useRef(null);
  const deepLinkScrolled = useRef(false);

  const grades = useMemo(() => [...new Set(items.map((x) => x.grade).filter(Boolean))].sort(byGrade), [items]);
  const subjects = useMemo(() => [...new Set(items.map((x) => x.subject).filter(Boolean))].sort(), [items]);
  const years = useMemo(() => [...new Set(items.map((x) => x.academicYear).filter(Boolean))].sort().reverse(), [items]);
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    const result = items.filter((x) => {
      const haystack = [pickLang(x, "title"), x.subject, x.grade].join(" ").toLowerCase();
      return (!term || haystack.includes(term)) && (grade === "all" || x.grade === grade)
        && (subject === "all" || x.subject === subject) && (stream === "all" || (x.stream || "general") === stream)
        && (year === "all" || x.academicYear === year);
    });
    return result.sort((a, b) => {
      if (sort === "class") return byGrade(a.grade, b.grade) || a.subject.localeCompare(b.subject);
      if (sort === "title") return pickLang(a, "title").localeCompare(pickLang(b, "title"));
      if (sort === "featured") return Number(b.featured) - Number(a.featured) || new Date(b.updatedAt) - new Date(a.updatedAt);
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
  }, [items, query, grade, subject, stream, year, sort, pickLang]);
  const groups = useMemo(() => grades.map((name) => ({ name, items: filtered.filter((x) => x.grade === name) })).filter((g) => g.items.length), [filtered, grades]);
  const spotlight = useMemo(() => {
    const featured = items.filter((x) => x.featured);
    return (featured.length ? featured : [...items].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))).slice(0, 3);
  }, [items]);
  const lastUpdated = items.reduce((latest, x) => !latest || new Date(x.updatedAt) > new Date(latest) ? x.updatedAt : latest, "");
  const filtersActive = Boolean(query || grade !== "all" || subject !== "all" || stream !== "all" || year !== "all");

  useEffect(() => { localStorage.setItem(VIEW_KEY, view); }, [view]);
  useEffect(() => {
    const syncFromUrl = () => {
      const next = readQueryFilters();
      setStream(next.stream); setGrade(next.grade); setSubject(next.subject);
    };
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, []);
  useEffect(() => {
    if (!loading && initialFilters.stream !== "all" && !deepLinkScrolled.current) {
      deepLinkScrolled.current = true;
      requestAnimationFrame(() => libraryRef.current?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" }));
    }
  }, [loading, initialFilters.stream, reduced]);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && setStatsActive(true), { threshold: .25 });
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 360);
    onScroll(); window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((x) => x.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (visible) setActiveGrade(visible.target.dataset.grade);
    }, { rootMargin: "-25% 0px -60%", threshold: 0 });
    document.querySelectorAll("[data-grade-section]").forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [groups]);

  const clear = () => {
    setQuery(""); setGrade("all"); setSubject("all"); setStream("all"); setYear("all");
    window.history.replaceState({}, "", "/syllabus");
  };
  const jump = (name) => document.getElementById(`grade-${encodeURIComponent(name)}`)?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });

  return <>
    <PageHero title={t("syllabus.title")} subtitle={t("syllabus.subtitle")} />
    <StatsBand ref={statsRef}>
      <Container><StatsGrid>
        <Stat icon={FileText} value={items.length} label={t("syllabus.stats.total")} active={statsActive} />
        <Stat icon={Layers3} value={grades.length} label={t("syllabus.stats.classes")} active={statsActive} />
        <Stat icon={LibraryBig} value={subjects.length} label={t("syllabus.stats.subjects")} active={statsActive} />
        <UpdatedStat><Clock3 size={22} /><strong>{lastUpdated ? relativeDate(lastUpdated, lang) : "—"}</strong><span>{t("syllabus.stats.updated")}</span></UpdatedStat>
      </StatsGrid></Container>
    </StatsBand>

    {!loading && spotlight.length > 0 && <Section><Container>
      <SectionHead><div><Eyebrow><Sparkles size={15} /> {t("syllabus.featured")}</Eyebrow><h2>{t("syllabus.latestTitle")}</h2></div></SectionHead>
      <SpotGrid>{spotlight.map((item, index) => <Reveal key={item._id} delay={index * 70}><SpotCard>
        <Cover item={item} large />
        <SpotCopy>{isNew(item.updatedAt) && <Badge $tone="danger">{t("syllabus.newBadge")}</Badge>}<small>{item.grade} · {item.subject}</small>
          <h3>{pickLang(item, "title")}</h3><p>{htmlToText(pickLang(item, "description"))}</p>
          <Button $variant="primary" $size="sm" disabled={!item.fileUrl} onClick={() => item.fileUrl && setViewer(item)}><BookOpen size={15} /> {item.fileUrl ? t("syllabus.read") : t("syllabus.comingSoon")}</Button>
        </SpotCopy>
      </SpotCard></Reveal>)}</SpotGrid>
    </Container></Section>}

    <Toolbar $shadow={scrolled}><Container><ToolInner>
      <SearchBox><Search size={18} /><Input aria-label={t("syllabus.search")} value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("syllabus.searchPlaceholder")} /></SearchBox>
      <FilterSelect aria-label={t("syllabus.subject")} value={subject} onChange={(e) => setSubject(e.target.value)}><option value="all">{t("syllabus.allSubjects")}</option>{subjects.map((x) => <option key={x}>{x}</option>)}</FilterSelect>
      <FilterSelect aria-label={t("syllabus.stream")} value={stream} onChange={(e) => setStream(e.target.value)}><option value="all">{t("syllabus.allStreams")}</option>{STREAMS.map((x) => <option key={x} value={x}>{t(`syllabus.streams.${x}`)}</option>)}</FilterSelect>
      <FilterSelect aria-label={t("syllabus.year")} value={year} onChange={(e) => setYear(e.target.value)}><option value="all">{t("syllabus.allYears")}</option>{years.map((x) => <option key={x}>{x}</option>)}</FilterSelect>
      <FilterSelect aria-label={t("syllabus.sortBy")} value={sort} onChange={(e) => setSort(e.target.value)}>
        <option value="newest">{t("syllabus.sortNewest")}</option><option value="class">{t("syllabus.sortClass")}</option><option value="title">{t("syllabus.sortTitle")}</option><option value="featured">{t("syllabus.sortFeatured")}</option>
      </FilterSelect>
      <ViewToggle aria-label={t("syllabus.viewMode")}><ViewBtn $active={view === "grid"} onClick={() => setView("grid")} title={t("syllabus.viewGrid")}><Grid2X2 size={17} /></ViewBtn><ViewBtn $active={view === "list"} onClick={() => setView("list")} title={t("syllabus.viewList")}><List size={18} /></ViewBtn></ViewToggle>
    </ToolInner>
    <GradeChips><GradeChip $active={grade === "all"} onClick={() => setGrade("all")}>{t("common.all")}</GradeChip>{grades.map((x) => <GradeChip key={x} $active={grade === x} onClick={() => setGrade(x)}>{x}</GradeChip>)}</GradeChips>
    <Summary><span>{filtered.length} {t("syllabus.results")}{stream !== "all" && <ActiveStream>{t("syllabus.stream")}: {t(`syllabus.streams.${stream}`)}</ActiveStream>}</span>{filtersActive && <button onClick={clear}>{t("syllabus.clearFilters")}</button>}</Summary>
    </Container></Toolbar>

    <Section $bg="alt" ref={libraryRef}><Container>
      {error ? <FetchError onRetry={refetch} message={t("syllabus.loadError")} /> : loading ? <LoadingGrid>{[0,1,2,3,4,5].map((x) => <SkeletonCard key={x} />)}</LoadingGrid>
        : items.length === 0 ? <EmptyState icon={FileText} message={t("syllabus.empty")} hint={t("syllabus.emptyHint")} />
        : filtered.length === 0 ? <EmptyState icon={Search} message={t("syllabus.noMatches")} hint={t("syllabus.noMatchesHint")} />
        : <LibraryLayout>
          <Toc><strong>{t("syllabus.jumpToClass")}</strong>{groups.map((g) => <button key={g.name} aria-current={activeGrade === g.name ? "true" : undefined} onClick={() => jump(g.name)}>{g.name}<span>{g.items.length}</span></button>)}</Toc>
          <MobileJump aria-label={t("syllabus.jumpToClass")} value="" onChange={(e) => jump(e.target.value)}><option value="" disabled>{t("syllabus.jumpToClass")}</option>{groups.map((g) => <option key={g.name}>{g.name}</option>)}</MobileJump>
          <Groups>{groups.map((group) => <GradeSection key={group.name} id={`grade-${encodeURIComponent(group.name)}`} data-grade={group.name} data-grade-section>
            <GroupHead><div><h2>{group.name}</h2><span>{group.items.length} {t("syllabus.items")}</span></div><Collapse onClick={() => setClosed((old) => ({ ...old, [group.name]: !old[group.name] }))} aria-expanded={!closed[group.name]}><ChevronDown size={20} /></Collapse></GroupHead>
            <AnimatePresence initial={false}>{!closed[group.name] && <motion.div initial={reduced ? false : { opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }} transition={{ duration: reduced ? 0 : .25 }}>
              {view === "grid" ? <CardGrid>{group.items.map((item, i) => <Reveal key={item._id} delay={i * 50}><SyllabusCard item={item} t={t} pickLang={pickLang} lang={lang} onRead={setViewer} /></Reveal>)}</CardGrid>
                : <TableWrap><Table><thead><tr><th>{t("syllabus.class")}</th><th>{t("syllabus.subject")}</th><th>{t("syllabus.name")}</th><th>{t("syllabus.year")}</th><th>{t("syllabus.updated")}</th><th>{t("syllabus.actions")}</th></tr></thead><tbody>{group.items.map((item) => <ListRow key={item._id} item={item} t={t} pickLang={pickLang} lang={lang} onRead={setViewer} />)}</tbody></Table></TableWrap>}
            </motion.div>}</AnimatePresence>
          </GradeSection>)}</Groups>
        </LibraryLayout>}
    </Container></Section>
    <PdfViewer item={viewer} onClose={() => setViewer(null)} t={t} pickLang={pickLang} reduced={reduced} />
  </>;
}

function Cover({ item, large }) {
  return <CoverWrap $large={large}>{item.coverImageUrl ? <SmartImage src={assetUrl(item.coverImageUrl)} alt="" height="100%" fit="cover" /> : <PdfFallback><FileText size={large ? 46 : 36} /><b>PDF</b></PdfFallback>}</CoverWrap>;
}
function Actions({ item, t, onRead, compact }) {
  const url = item.fileUrl && assetUrl(item.fileUrl);
  if (!url) return <Coming>{t("syllabus.comingSoon")}</Coming>;
  return <ActionRow $compact={compact}><ActionButton onClick={() => onRead(item)} title={t("syllabus.read")}><BookOpen size={15} />{!compact && t("syllabus.read")}</ActionButton><ActionLink href={url} download title={t("syllabus.download")}><Download size={15} /></ActionLink><ActionLink href={url} target="_blank" rel="noopener noreferrer" title={t("syllabus.openNew")}><ExternalLink size={15} /></ActionLink></ActionRow>;
}
function SyllabusCard({ item, t, pickLang, lang, onRead }) {
  return <SCard><Cover item={item} /><CardBody><Meta><Badge $tone="secondary">{item.subject}</Badge>{isNew(item.updatedAt) && <Badge $tone="danger">{t("syllabus.newBadge")}</Badge>}</Meta><h3>{pickLang(item, "title")}</h3><SmallMeta><CalendarDays size={14} /> {item.academicYear || "—"}<span>·</span>{t("syllabus.updated")} {relativeDate(item.updatedAt, lang)}</SmallMeta>{pickLang(item, "description") && <Description lines={3}>{htmlToText(pickLang(item, "description"))}</Description>}<Actions item={item} t={t} onRead={onRead} /></CardBody></SCard>;
}
function ListRow({ item, t, pickLang, lang, onRead }) { return <tr><td>{item.grade}</td><td><Badge $tone="secondary">{item.subject}</Badge></td><td><strong>{pickLang(item, "title")}</strong></td><td>{item.academicYear || "—"}</td><td>{relativeDate(item.updatedAt, lang)}</td><td><Actions item={item} t={t} onRead={onRead} compact /></td></tr>; }

function PdfViewer({ item, onClose, t, pickLang, reduced }) {
  const dialog = useRef(null); const iframe = useRef(null);
  useEffect(() => {
    if (!item) return undefined;
    const previous = document.body.style.overflow; document.body.style.overflow = "hidden";
    const focusables = () => [...dialog.current.querySelectorAll('button,a[href]')];
    const keydown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") { const all = focusables(); if (!all.length) return; const first = all[0], last = all.at(-1); if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); } }
    };
    document.addEventListener("keydown", keydown); requestAnimationFrame(() => focusables()[0]?.focus());
    return () => { document.body.style.overflow = previous; document.removeEventListener("keydown", keydown); };
  }, [item, onClose]);
  return <AnimatePresence>{item && <Overlay as={motion.div} initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : .18 }} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
    <Dialog ref={dialog} role="dialog" aria-modal="true" aria-labelledby="pdf-title" as={motion.div} initial={reduced ? false : { opacity: 0, y: 20, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12 }} transition={{ duration: reduced ? 0 : .22 }}>
      <DialogHead><div><h2 id="pdf-title">{pickLang(item, "title")}</h2><p>{item.grade} · {item.subject}</p></div><DialogActions>{item.fileUrl && <><a href={assetUrl(item.fileUrl)} download><Download size={17} /><span>{t("syllabus.download")}</span></a><button onClick={() => { try { iframe.current?.contentWindow?.print(); } catch { window.open(assetUrl(item.fileUrl), "_blank"); } }}><Printer size={17} /><span>{t("syllabus.print")}</span></button><a href={assetUrl(item.fileUrl)} target="_blank" rel="noopener noreferrer"><ExternalLink size={17} /><span>{t("syllabus.openNew")}</span></a></>}<button onClick={onClose} aria-label={t("common.close")}><X size={21} /></button></DialogActions></DialogHead>
      {item.fileUrl ? <iframe ref={iframe} src={assetUrl(item.fileUrl)} title={pickLang(item, "title")} /> : <NoPdf><FileText size={48} /><h3>{t("syllabus.comingSoon")}</h3><p>{htmlToText(pickLang(item, "description"))}</p></NoPdf>}
    </Dialog>
  </Overlay>}</AnimatePresence>;
}

const StatsBand = styled.section`background: ${({ theme }) => theme.gradients.secondary}; padding: ${({ theme }) => theme.space[8]} 0; color:#fff;`;
const StatsGrid = styled.div`display:grid; grid-template-columns:repeat(4,1fr); gap:${({theme})=>theme.space[4]}; ${({theme})=>theme.media.tablet(`grid-template-columns:repeat(2,1fr);`)};`;
const StatCard = styled.div`display:grid; grid-template-columns:auto 1fr; gap:2px 10px; align-items:center; padding:${({theme})=>theme.space[4]}; border:1px solid rgba(255,255,255,.2); border-radius:${({theme})=>theme.radii.lg}; background:rgba(255,255,255,.08); svg{grid-row:1/3} strong{font-size:${({theme})=>theme.fontSizes.xl}} span{font-size:${({theme})=>theme.fontSizes.sm};opacity:.85}`;
const UpdatedStat = styled(StatCard)`strong{font-size:${({theme})=>theme.fontSizes.md}}`;
const SectionHead = styled.div`display:flex;justify-content:space-between;align-items:end;margin-bottom:${({theme})=>theme.space[6]};h2{font-size:${({theme})=>theme.fontSizes["3xl"]}}`;
const Eyebrow = styled.span`display:inline-flex;gap:6px;align-items:center;color:${({theme})=>theme.colors.secondary};font-weight:700;font-size:${({theme})=>theme.fontSizes.sm};margin-bottom:6px`;
const SpotGrid = styled.div`display:grid;grid-template-columns:repeat(3,1fr);gap:${({theme})=>theme.space[5]};${({theme})=>theme.media.tablet(`grid-template-columns:1fr;`)}`;
const SpotCard = styled(Card)`padding:0;overflow:hidden;height:100%;display:flex;flex-direction:column;&:hover img{transform:scale(1.04)}`;
const SpotCopy = styled.div`padding:${({theme})=>theme.space[5]};display:flex;flex-direction:column;align-items:flex-start;gap:8px;flex:1;small{color:${({theme})=>theme.colors.textMuted}}h3{font-size:${({theme})=>theme.fontSizes.xl}}p{color:${({theme})=>theme.colors.textBody};display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}button{margin-top:auto}`;
const CoverWrap = styled.div`height:${({$large})=>$large?"190px":"180px"};overflow:hidden;background:${({theme})=>theme.colors.primarySoft};img{width:100%;height:100%;transition:transform .3s ease}`;
const PdfFallback = styled.div`height:100%;display:grid;place-content:center;justify-items:center;gap:6px;color:${({theme})=>theme.colors.primary};background:linear-gradient(135deg,${({theme})=>theme.colors.primarySoft},${({theme})=>theme.colors.surfaceAlt});b{letter-spacing:2px}`;
const Toolbar = styled.div`position:sticky;top:0;z-index:20;background:${({theme})=>theme.colors.surface};border-block:1px solid ${({theme})=>theme.colors.border};padding:${({theme})=>theme.space[4]} 0;box-shadow:${({$shadow,theme})=>$shadow?theme.shadows.md:"none"};transition:box-shadow .2s ease;@media(prefers-reduced-motion:reduce){transition:none}`;
const ToolInner = styled.div`display:grid;grid-template-columns:minmax(220px,1fr) repeat(4,minmax(115px,auto)) auto;gap:${({theme})=>theme.space[3]};align-items:center;${({theme})=>theme.media.laptop(`grid-template-columns:1fr 1fr;`)}${({theme})=>theme.media.mobile(`grid-template-columns:1fr;`)}`;
const SearchBox = styled.div`position:relative;svg{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:${({theme})=>theme.colors.textMuted}}input{padding-left:40px}`;
const FilterSelect = styled(Select)`min-width:0`;
const ViewToggle = styled.div`display:flex;border:1px solid ${({theme})=>theme.colors.border};border-radius:${({theme})=>theme.radii.md};padding:2px;justify-self:end;${({theme})=>theme.media.mobile(`justify-self:start;`)}`;
const ViewBtn = styled.button`width:38px;height:34px;display:grid;place-items:center;border-radius:${({theme})=>theme.radii.sm};color:${({$active,theme})=>$active?"#fff":theme.colors.textMuted};background:${({$active,theme})=>$active?theme.colors.primary:"transparent"};transition:.18s ease;`;
const GradeChips = styled.div`display:flex;gap:${({theme})=>theme.space[2]};overflow-x:auto;padding-top:${({theme})=>theme.space[3]};scrollbar-width:thin`;
const GradeChip = styled.button`white-space:nowrap;padding:6px 13px;border-radius:${({theme})=>theme.radii.pill};border:1px solid ${({$active,theme})=>$active?theme.colors.primary:theme.colors.border};background:${({$active,theme})=>$active?theme.colors.primary:theme.colors.surface};color:${({$active,theme})=>$active?"#fff":theme.colors.textBody};font-size:${({theme})=>theme.fontSizes.sm};font-weight:600`;
const Summary = styled.div`display:flex;justify-content:space-between;padding-top:${({theme})=>theme.space[3]};font-size:${({theme})=>theme.fontSizes.sm};color:${({theme})=>theme.colors.textMuted};button{color:${({theme})=>theme.colors.primary};font-weight:700}`;
const ActiveStream = styled.b`display:inline-flex;margin-left:10px;padding:3px 9px;border-radius:${({theme})=>theme.radii.pill};background:${({theme})=>theme.colors.primarySoft};color:${({theme})=>theme.colors.primary};`;
const LoadingGrid = styled.div`display:grid;grid-template-columns:repeat(3,1fr);gap:${({theme})=>theme.space[5]};${({theme})=>theme.media.tablet(`grid-template-columns:1fr;`)}`;
const LibraryLayout = styled.div`display:grid;grid-template-columns:190px minmax(0,1fr);gap:${({theme})=>theme.space[8]};align-items:start;${({theme})=>theme.media.tablet(`grid-template-columns:1fr;`)}`;
const Toc = styled.aside`position:sticky;top:230px;display:flex;flex-direction:column;gap:5px;padding:${({theme})=>theme.space[4]};background:${({theme})=>theme.colors.surface};border:1px solid ${({theme})=>theme.colors.border};border-radius:${({theme})=>theme.radii.lg};strong{margin-bottom:5px}button{display:flex;justify-content:space-between;padding:8px;border-radius:${({theme})=>theme.radii.sm};color:${({theme})=>theme.colors.textBody};text-align:left}button:hover{background:${({theme})=>theme.colors.surfaceAlt}}button[aria-current="true"]{background:${({theme})=>theme.colors.primarySoft};color:${({theme})=>theme.colors.primary};font-weight:700}button span{color:${({theme})=>theme.colors.textMuted}}${({theme})=>theme.media.tablet(`display:none;`)}`;
const MobileJump = styled(Select)`display:none;${({theme})=>theme.media.tablet(`display:block;`)}`;
const Groups = styled.div`min-width:0;display:flex;flex-direction:column;gap:${({theme})=>theme.space[8]}`;
const GradeSection = styled.section`scroll-margin-top:240px`;
const GroupHead = styled.div`display:flex;justify-content:space-between;align-items:center;margin-bottom:${({theme})=>theme.space[4]};padding-bottom:${({theme})=>theme.space[3]};border-bottom:2px solid ${({theme})=>theme.colors.border};h2{color:${({theme})=>theme.colors.primary}}span{color:${({theme})=>theme.colors.textMuted};font-size:${({theme})=>theme.fontSizes.sm}}`;
const Collapse = styled.button`width:38px;height:38px;display:grid;place-items:center;border-radius:${({theme})=>theme.radii.pill};background:${({theme})=>theme.colors.primarySoft};color:${({theme})=>theme.colors.primary};&[aria-expanded="false"] svg{transform:rotate(-90deg)}`;
const CardGrid = styled.div`display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:${({theme})=>theme.space[5]};align-items:stretch;${({theme})=>theme.media.laptop(`grid-template-columns:repeat(2,1fr);`)}${({theme})=>theme.media.tablet(`grid-template-columns:1fr;`)}`;
const SCard = styled(Card)`padding:0;overflow:hidden;height:100%;display:flex;flex-direction:column;&:hover{transform:translateY(-5px);box-shadow:${({theme})=>theme.shadows.xl}}&:hover img{transform:scale(1.05)}`;
const CardBody = styled.div`padding:${({theme})=>theme.space[5]};display:flex;flex-direction:column;gap:10px;flex:1;h3{font-size:${({theme})=>theme.fontSizes.lg}}`;
const Meta = styled.div`display:flex;gap:6px;flex-wrap:wrap`;
const SmallMeta = styled.div`display:flex;align-items:center;gap:6px;flex-wrap:wrap;color:${({theme})=>theme.colors.textMuted};font-size:${({theme})=>theme.fontSizes.xs}`;
const Description = styled(ReadMore)`color:${({theme})=>theme.colors.textBody};font-size:${({theme})=>theme.fontSizes.sm}`;
const ActionRow = styled.div`display:flex;gap:7px;align-items:center;margin-top:auto;padding-top:8px`;
const ActionButton = styled.button`display:inline-flex;align-items:center;gap:5px;padding:8px 11px;border-radius:${({theme})=>theme.radii.md};background:${({theme})=>theme.colors.primary};color:#fff;font-weight:700;font-size:${({theme})=>theme.fontSizes.sm}`;
const ActionLink = styled.a`width:36px;height:36px;display:grid;place-items:center;border:1px solid ${({theme})=>theme.colors.border};border-radius:${({theme})=>theme.radii.md};color:${({theme})=>theme.colors.secondary};&:hover{background:${({theme})=>theme.colors.secondary};color:#fff}`;
const Coming = styled.span`margin-top:auto;color:${({theme})=>theme.colors.textMuted};font-size:${({theme})=>theme.fontSizes.sm};font-weight:600`;
const TableWrap = styled.div`overflow-x:auto;background:${({theme})=>theme.colors.surface};border:1px solid ${({theme})=>theme.colors.border};border-radius:${({theme})=>theme.radii.lg}`;
const Table = styled.table`width:100%;border-collapse:collapse;min-width:760px;th,td{padding:13px 15px;text-align:left;border-bottom:1px solid ${({theme})=>theme.colors.border}}th{background:${({theme})=>theme.colors.surfaceAlt};font-size:${({theme})=>theme.fontSizes.xs};text-transform:uppercase;color:${({theme})=>theme.colors.textMuted}}tbody tr:hover{background:${({theme})=>theme.colors.primarySoft}}`;
const Overlay = styled.div`position:fixed;inset:0;z-index:1000;background:rgba(10,18,34,.76);display:grid;place-items:center;padding:18px`;
const Dialog = styled.div`width:min(1200px,100%);height:min(92vh,900px);background:${({theme})=>theme.colors.surface};border-radius:${({theme})=>theme.radii.xl};overflow:hidden;display:flex;flex-direction:column;box-shadow:${({theme})=>theme.shadows.xl};iframe{width:100%;flex:1;border:0;background:#fff}`;
const DialogHead = styled.div`display:flex;justify-content:space-between;gap:16px;align-items:center;padding:14px 18px;border-bottom:1px solid ${({theme})=>theme.colors.border};h2{font-size:${({theme})=>theme.fontSizes.lg}}p{color:${({theme})=>theme.colors.textMuted};font-size:${({theme})=>theme.fontSizes.sm}}`;
const DialogActions = styled.div`display:flex;gap:6px;a,button{display:inline-flex;align-items:center;gap:5px;height:38px;padding:0 10px;border-radius:${({theme})=>theme.radii.md};color:${({theme})=>theme.colors.textBody};background:${({theme})=>theme.colors.surfaceAlt};font-size:${({theme})=>theme.fontSizes.sm}}${({theme})=>theme.media.mobile(`span{display:none;}`)}`;
const NoPdf = styled.div`flex:1;display:grid;place-content:center;justify-items:center;text-align:center;gap:12px;padding:30px;color:${({theme})=>theme.colors.textMuted};p{max-width:60ch}`;

export default Syllabus;
