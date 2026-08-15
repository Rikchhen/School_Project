import { useEffect, useState } from "react";
import styled from "styled-components";
import { CalendarDays, MapPin, Search } from "lucide-react";
import { Link } from "../lib/router";
import { useLang } from "../context/LanguageContext";
import { useSocketEvent } from "../context/SocketContext";
import { useToast } from "../context/ToastContext";
import { api } from "../lib/api";
import { PageHero } from "../components/PageHero";
import { Container, Section, Grid } from "../components/ui/Layout";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Skeleton, SkeletonCard } from "../components/ui/Skeleton";
import { SmartImage } from "../components/SmartImage";
import { EmptyState } from "../components/EmptyState";
import { Reveal } from "../components/Reveal";
import { htmlToText } from "../lib/sanitizeHtml";
import { formatDate } from "../lib/format";

const CATEGORY_TONE = {
  sports: "danger", academic: "secondary", cultural: "primary",
  notice: "warning", general: "neutral",
};

export function Events() {
  const { t, pickLang, lang } = useLang();
  const fmt = (date) => formatDate(date, lang);
  const toast = useToast();
  const [featured, setFeatured] = useState(null);
  const [news, setNews] = useState(null);
  const [query, setQuery] = useState("");

  const filteredNews = (news || []).filter((e) => {
    if (!query.trim()) return true;
    const hay = `${pickLang(e, "title")} ${htmlToText(pickLang(e, "description"))}`.toLowerCase();
    return hay.includes(query.trim().toLowerCase());
  });

  useEffect(() => {
    const ctrl = new AbortController();
    api.get("/events", { featured: "true", limit: 6 }, { signal: ctrl.signal })
      .then((r) => setFeatured(r.items)).catch(() => setFeatured([]));
    api.get("/events", { limit: 6 }, { signal: ctrl.signal })
      .then((r) => setNews(r.items)).catch(() => setNews([]));
    return () => ctrl.abort();
  }, []);

  useSocketEvent("event:new", (event) => {
    setNews((prev) => [event, ...(prev || [])]);
    if (event.featured) setFeatured((prev) => [event, ...(prev || [])]);
    toast.info(`New event: ${event.title}`);
  });

  return (
    <>
      <PageHero title={t("events.title")} titleNe="खबर र कार्यक्रम" subtitle={t("events.subtitle")} />

      <Section>
        <Container>
          <Head><CalendarDays size={22} /> <h2>{t("events.featured")}</h2></Head>
          {featured === null ? (
            <Grid $cols={3}>{[0, 1, 2].map((i) => <SkeletonCard key={i} />)}</Grid>
          ) : featured.length === 0 ? (
            <EmptyState message={t("events.empty")} />
          ) : (
            <Reveal>
            <Grid $cols={3}>
              {featured.map((e) => (
                <FeatureCard as={Link} to={`/events/${e._id}`} key={e._id} $hover $pad={0}>
                  <Media>
                    <SmartImage src={e.imageUrl} alt={e.title} height="180px" />
                    <TagOverlay><Badge $tone={CATEGORY_TONE[e.category] || "neutral"}>{e.category}</Badge></TagOverlay>
                  </Media>
                  <CardBody>
                    <time><CalendarDays size={14} /> {fmt(e.startDate)}</time>
                    <h3>{pickLang(e, "title")}</h3>
                    <p>{htmlToText(pickLang(e, "description"))}</p>
                    {e.location && <Loc><MapPin size={14} /> {e.location}</Loc>}
                  </CardBody>
                </FeatureCard>
              ))}
            </Grid>
            </Reveal>
          )}
        </Container>
      </Section>

      <Section $bg="alt">
        <Container>
          <NewsHead>
            <h2>{t("events.latestNews")}</h2>
            <SearchBox>
              <Search size={16} />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("common.search")} aria-label={t("common.search")} />
            </SearchBox>
          </NewsHead>
          {news === null ? (
            <NewsList>{[0, 1, 2].map((i) => <Skeleton key={i} $h="96px" $radius="lg" />)}</NewsList>
          ) : filteredNews.length === 0 ? (
            <EmptyState message={t("events.empty")} />
          ) : (
            <NewsList as={Reveal} stagger={70}>
              {filteredNews.map((e) => (
                <NewsRow as={Link} to={`/events/${e._id}`} key={e._id}>
                  <NewsThumb><SmartImage src={e.imageUrl} alt={e.title} height="80px" /></NewsThumb>
                  <div>
                    <NewsMeta>
                      <Badge $tone={CATEGORY_TONE[e.category] || "neutral"}>{e.category}</Badge>
                      <span>{fmt(e.startDate)}</span>
                    </NewsMeta>
                    <h4>{pickLang(e, "title")}</h4>
                    <p>{htmlToText(pickLang(e, "description"))}</p>
                  </div>
                </NewsRow>
              ))}
            </NewsList>
          )}
        </Container>
      </Section>
    </>
  );
}

const Head = styled.div`
  display: flex; align-items: center; gap: 10px; margin-bottom: ${({ theme }) => theme.space[8]};
  svg { color: ${({ theme }) => theme.colors.primary}; }
  h2 { color: ${({ theme }) => theme.colors.text}; font-size: ${({ theme }) => theme.fontSizes["3xl"]}; }
`;
const NewsHead = styled.div`
  display: flex; align-items: center; justify-content: space-between; gap: ${({ theme }) => theme.space[4]};
  margin-bottom: ${({ theme }) => theme.space[8]}; flex-wrap: wrap;
  h2 { color: ${({ theme }) => theme.colors.text}; font-size: ${({ theme }) => theme.fontSizes["3xl"]}; }
`;
const SearchBox = styled.div`
  display: flex; align-items: center; gap: 8px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.pill};
  padding: ${({ theme }) => `${theme.space[2]} ${theme.space[4]}`};
  color: ${({ theme }) => theme.colors.textMuted};
  input { border: none; outline: none; background: none; width: 200px; font-size: ${({ theme }) => theme.fontSizes.sm}; color: ${({ theme }) => theme.colors.text}; }
  ${({ theme }) => theme.media.mobile(`width: 100%; input { width: 100%; }`)}
`;
const FeatureCard = styled(Card)`overflow: hidden; display: flex; flex-direction: column;`;
const Media = styled.div`position: relative;`;
const TagOverlay = styled.div`position: absolute; top: 12px; right: 12px;`;
const CardBody = styled.div`
  padding: ${({ theme }) => theme.space[5]}; display: flex; flex-direction: column; gap: 8px;
  time { display: flex; align-items: center; gap: 6px; color: ${({ theme }) => theme.colors.secondary}; font-size: ${({ theme }) => theme.fontSizes.xs}; font-weight: 600; }
  h3 { color: ${({ theme }) => theme.colors.text}; font-size: ${({ theme }) => theme.fontSizes.lg}; }
  p { color: ${({ theme }) => theme.colors.textBody}; font-size: ${({ theme }) => theme.fontSizes.sm};
      display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
`;
const Loc = styled.span`display: flex; align-items: center; gap: 6px; color: ${({ theme }) => theme.colors.textMuted}; font-size: ${({ theme }) => theme.fontSizes.xs};`;
const NewsList = styled.div`display: flex; flex-direction: column; gap: ${({ theme }) => theme.space[4]};`;
const NewsRow = styled.article`
  display: grid; grid-template-columns: 120px 1fr; gap: ${({ theme }) => theme.space[4]};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg}; padding: ${({ theme }) => theme.space[4]};
  h4 { color: ${({ theme }) => theme.colors.text}; margin: 6px 0; }
  p { color: ${({ theme }) => theme.colors.textBody}; font-size: ${({ theme }) => theme.fontSizes.sm};
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  ${({ theme }) => theme.media.mobile(`grid-template-columns: 1fr;`)}
`;
const NewsThumb = styled.div`border-radius: ${({ theme }) => theme.radii.md}; overflow: hidden;`;
const NewsMeta = styled.div`display: flex; align-items: center; gap: 10px; span { color: ${({ theme }) => theme.colors.textMuted}; font-size: ${({ theme }) => theme.fontSizes.xs}; }`;
const Empty = styled.p`color: ${({ theme }) => theme.colors.textMuted}; text-align: center; padding: ${({ theme }) => theme.space[10]};`;

export default Events;
