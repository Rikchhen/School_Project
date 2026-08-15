import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { AlertTriangle, FileText, Download, Eye, Search } from "lucide-react";
import { Link } from "../lib/router";
import { useLang } from "../context/LanguageContext";
import { useSocketEvent } from "../context/SocketContext";
import { useToast } from "../context/ToastContext";
import { api } from "../lib/api";
import { PageHero } from "../components/PageHero";
import { Container, Section } from "../components/ui/Layout";
import { Badge } from "../components/ui/Badge";
import { Skeleton } from "../components/ui/Skeleton";
import { RichText } from "../components/RichText";
import { SmartImage } from "../components/SmartImage";
import { Reveal } from "../components/Reveal";
import { dateParts } from "../lib/format";

const FILTERS = [
  { key: "all", labelKey: "common.all" },
  { key: "academic", labelKey: "notices.filterAcademic" },
  { key: "administrative", labelKey: "notices.filterAdministrative" },
];

/** True if the date is within the last 7 days. */
const isRecent = (d) => Date.now() - new Date(d).getTime() < 7 * 86400000;

export function Notices() {
  const { t, pickLang, lang } = useLang();
  const toast = useToast();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [items, setItems] = useState(null);

  useEffect(() => {
    const ctrl = new AbortController();
    const params = { published: "true", limit: 50 };
    if (filter !== "all") params.category = filter;
    if (search.trim()) params.search = search.trim();
    setItems(null);
    api.get("/notices", params, { signal: ctrl.signal })
      .then((r) => setItems(r.items))
      .catch((e) => { if (e.name !== "AbortError") setItems([]); });
    return () => ctrl.abort();
  }, [filter, search]);

  // Live board: a newly published notice appears without a refresh.
  useSocketEvent("notice:new", (notice) => {
    setItems((prev) => {
      if (!prev) return prev;
      if (filter !== "all" && notice.category !== filter) return prev;
      return [notice, ...prev];
    });
    toast.info(`New notice: ${notice.title}`);
  });

  const list = useMemo(() => items || [], [items]);

  return (
    <>
      <PageHero
        badge={t("notices.badge")}
        title={t("notices.title")}
        subtitle={t("notices.subtitle")}
        lang={lang}
      />

      <Section $bg="alt">
        <Container>
          <Toolbar>
            <Tabs role="tablist">
              {FILTERS.map((f) => (
                <Tab key={f.key} $active={filter === f.key} onClick={() => setFilter(f.key)} role="tab" aria-selected={filter === f.key}>
                  {t(f.labelKey)}
                </Tab>
              ))}
            </Tabs>
            <SearchBox>
              <Search size={16} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("common.search")}
                aria-label={t("common.search")}
              />
            </SearchBox>
          </Toolbar>

          {items === null ? (
            <List>{[0, 1, 2].map((i) => <Skeleton key={i} $h="110px" $radius="lg" />)}</List>
          ) : list.length === 0 ? (
            <EmptyState>{t("notices.empty")}</EmptyState>
          ) : (
            <List as={Reveal} stagger={80}>
              {list.map((n) => {
                const dp = dateParts(n.publishedAt || n.createdAt, lang);
                const gallery = [n.imageUrl, ...(n.images || [])].filter(Boolean);
                return (
                <NoticeRow key={n._id} $urgent={n.priority === "urgent"}>
                  <DateChip $urgent={n.priority === "urgent"}>
                    <strong>{dp.day}</strong>
                    <span>{dp.month}</span>
                    <em>{dp.year}</em>
                  </DateChip>

                  <Body>
                    <Tags>
                      {isRecent(n.publishedAt || n.createdAt) && (
                        <Badge $tone="primary">{lang === "ne" ? "नयाँ" : "NEW"}</Badge>
                      )}
                      {n.priority === "urgent" && (
                        <Badge $tone="danger"><AlertTriangle size={12} /> {lang === "ne" ? "जरुरी" : "Urgent"}</Badge>
                      )}
                      <Badge $tone={n.category === "academic" ? "secondary" : "neutral"}>
                        {n.category === "academic" ? t("notices.filterAcademic") : t("notices.filterAdministrative")}
                      </Badge>
                    </Tags>
                    <TitleLink to={`/notices/${n._id}`} lang={pickLang(n, "title") === n.titleNe ? "ne" : undefined}>
                      {pickLang(n, "title")}
                    </TitleLink>
                    <RichText html={pickLang(n, "body")} />
                    {gallery.length > 0 && (
                      <NoticeImages>
                        {gallery.slice(0, 4).map((src, i) => (
                          <Link key={i} to={`/notices/${n._id}`}><SmartImage src={src} alt="" height="88px" /></Link>
                        ))}
                      </NoticeImages>
                    )}
                  </Body>

                  <Action>
                    <ActionLink as={Link} to={`/notices/${n._id}`}>
                      <Eye size={16} /> {t("common.viewDetails")}
                    </ActionLink>
                    {n.attachmentUrl && (
                      <ActionLink href={n.attachmentUrl} target="_blank" rel="noreferrer">
                        <Download size={16} /> {t("common.downloadPdf")}
                      </ActionLink>
                    )}
                  </Action>
                </NoticeRow>
                );
              })}
            </List>
          )}
        </Container>
      </Section>
    </>
  );
}

const Toolbar = styled.div`
  display: flex; align-items: center; justify-content: space-between; gap: ${({ theme }) => theme.space[4]};
  margin-bottom: ${({ theme }) => theme.space[8]}; flex-wrap: wrap;
`;
const Tabs = styled.div`display: flex; gap: ${({ theme }) => theme.space[2]}; flex-wrap: wrap;`;
const Tab = styled.button`
  padding: ${({ theme }) => `${theme.space[2]} ${theme.space[4]}`};
  border-radius: ${({ theme }) => theme.radii.pill};
  font-size: ${({ theme }) => theme.fontSizes.sm}; font-weight: 600;
  border: 1px solid ${({ theme, $active }) => ($active ? theme.colors.primary : theme.colors.border)};
  background: ${({ theme, $active }) => ($active ? theme.colors.primary : theme.colors.surface)};
  color: ${({ theme, $active }) => ($active ? "#fff" : theme.colors.textBody)};
`;
const SearchBox = styled.div`
  display: flex; align-items: center; gap: 8px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.pill};
  padding: ${({ theme }) => `${theme.space[2]} ${theme.space[4]}`};
  color: ${({ theme }) => theme.colors.textMuted};
  input { border: none; outline: none; background: none; width: 220px; font-size: ${({ theme }) => theme.fontSizes.sm}; }
  ${({ theme }) => theme.media.mobile(`width: 100%; input { width: 100%; }`)}
`;
const List = styled.div`display: flex; flex-direction: column; gap: ${({ theme }) => theme.space[4]};`;
const NoticeRow = styled.article`
  display: grid; grid-template-columns: auto 1fr auto; gap: ${({ theme }) => theme.space[5]};
  align-items: center;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-left: 4px solid ${({ theme, $urgent }) => ($urgent ? theme.colors.primary : theme.colors.secondary)};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: ${({ theme }) => theme.space[5]};
  ${({ theme }) => theme.media.tablet(`grid-template-columns: auto 1fr; & > *:last-child { grid-column: 1 / -1; }`)}
`;
const DateChip = styled.div`
  width: 64px; text-align: center; border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.space[2]};
  background: ${({ theme, $urgent }) => ($urgent ? theme.colors.primarySoft : theme.colors.secondarySoft)};
  color: ${({ theme, $urgent }) => ($urgent ? theme.colors.primary : theme.colors.secondary)};
  display: flex; flex-direction: column; line-height: 1.1;
  strong { font-size: ${({ theme }) => theme.fontSizes.xl}; font-family: ${({ theme }) => theme.fonts.heading}; }
  span { font-size: ${({ theme }) => theme.fontSizes.sm}; text-transform: capitalize; }
  em { font-style: normal; font-size: ${({ theme }) => theme.fontSizes.xs}; opacity: 0.8; }
`;
const Body = styled.div`
  min-width: 0;
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;
const TitleLink = styled(Link)`
  display: inline-block; color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.fonts.heading}; font-weight: 700;
  font-size: ${({ theme }) => theme.fontSizes.lg}; margin: 6px 0;
  &:hover { color: ${({ theme }) => theme.colors.primary}; }
`;
const Tags = styled.div`display: flex; gap: ${({ theme }) => theme.space[2]}; flex-wrap: wrap;`;
const NoticeImages = styled.div`
  display: flex; gap: ${({ theme }) => theme.space[2]}; margin-top: ${({ theme }) => theme.space[3]}; flex-wrap: wrap;
  a { width: 120px; border-radius: ${({ theme }) => theme.radii.md}; overflow: hidden; border: 1px solid ${({ theme }) => theme.colors.border}; }
`;
const Action = styled.div`flex-shrink: 0; display: flex; flex-direction: column; gap: ${({ theme }) => theme.space[2]}; align-items: stretch;`;
const ActionLink = styled.a`
  display: inline-flex; align-items: center; gap: 8px;
  background: ${({ theme }) => theme.colors.surfaceAlt};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
  padding: ${({ theme }) => `${theme.space[2]} ${theme.space[4]}`};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.fontSizes.sm}; font-weight: 600;
  &:hover { background: ${({ theme }) => theme.colors.secondarySoft}; color: ${({ theme }) => theme.colors.secondary}; }
`;
const EmptyState = styled.div`
  text-align: center; color: ${({ theme }) => theme.colors.textMuted};
  padding: ${({ theme }) => theme.space[16]};
`;

export default Notices;
