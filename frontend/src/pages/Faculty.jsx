import { useState } from "react";
import styled from "styled-components";
import { Mail, Phone } from "lucide-react";
import { useLang } from "../context/LanguageContext";
import { useFetch } from "../lib/useFetch";
import { PageHero } from "../components/PageHero";
import { Container, Section, Grid } from "../components/ui/Layout";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { SkeletonCard } from "../components/ui/Skeleton";
import { SmartImage } from "../components/SmartImage";
import { FetchError } from "../components/FetchError";
import { Reveal } from "../components/Reveal";
import { htmlToText } from "../lib/sanitizeHtml";
import { ReadMore } from "../components/ReadMore";

const DEPTS = ["all", "administration", "science", "management", "humanities", "languages", "general"];

export function Faculty() {
  const { t, pickLang } = useLang();
  const [dept, setDept] = useState("all");
  const { data, loading, error, refetch } = useFetch("/staff?published=true");
  const staff = data?.items || [];
  const filtered = dept === "all" ? staff : staff.filter((s) => s.department === dept);

  return (
    <>
      <PageHero title={t("faculty.title")} subtitle={t("faculty.subtitle")} />
      <Section $bg="alt">
        <Container>
          <Filters>
            {DEPTS.map((d) => (
              <Chip key={d} $active={dept === d} onClick={() => setDept(d)}>
                {d === "all" ? t("faculty.filterAll") : d}
              </Chip>
            ))}
          </Filters>

          {error ? (
            <FetchError onRetry={refetch} />
          ) : loading ? (
            <Grid $cols={4}>{[0, 1, 2, 3].map((i) => <SkeletonCard key={i} />)}</Grid>
          ) : filtered.length === 0 ? (
            <Empty>{t("admin.noItems")}</Empty>
          ) : (
            <StaffGrid as={Reveal} stagger={70} $cols={4}>
              {filtered.map((m) => (
                <StaffCard key={m._id} $hover $pad={0}>
                  <Photo><SmartImage src={m.photoUrl} alt={pickLang(m, "name")} height="220px" fit="contain" /></Photo>
                  <Info>
                    <h3>{pickLang(m, "name")}</h3>
                    <Role>{pickLang(m, "role")}</Role>
                    <Badge $tone="secondary">{m.department}</Badge>
                    {pickLang(m, "bio") && <Bio lines={3}>{htmlToText(pickLang(m, "bio"))}</Bio>}
                    <Contacts>
                      {m.email && <a href={`mailto:${m.email}`} aria-label="Email"><Mail size={15} /></a>}
                      {m.phone && <a href={`tel:${m.phone}`} aria-label="Phone"><Phone size={15} /></a>}
                    </Contacts>
                  </Info>
                </StaffCard>
              ))}
            </StaffGrid>
          )}
        </Container>
      </Section>
    </>
  );
}

const Filters = styled.div`display: flex; flex-wrap: wrap; gap: ${({ theme }) => theme.space[2]}; margin-bottom: ${({ theme }) => theme.space[8]}; justify-content: center;`;
const Chip = styled.button`
  padding: ${({ theme }) => `${theme.space[2]} ${theme.space[4]}`};
  border-radius: ${({ theme }) => theme.radii.pill}; font-size: ${({ theme }) => theme.fontSizes.sm}; font-weight: 600;
  text-transform: capitalize;
  border: 1px solid ${({ theme, $active }) => ($active ? theme.colors.primary : theme.colors.border)};
  background: ${({ theme, $active }) => ($active ? theme.colors.primary : theme.colors.surface)};
  color: ${({ theme, $active }) => ($active ? "#fff" : theme.colors.textBody)};
`;
const StaffGrid = styled(Grid)`align-items: start;`;
const StaffCard = styled(Card)`
  overflow: hidden; width: 100%; height: 540px; display: flex; flex-direction: column;
  &:has([data-expanded="true"]) { height: auto; min-height: 540px; }
  @media (prefers-reduced-motion: reduce) { transition: none; }
  &:hover img { transform:scale(1.045); }
`;
const Photo = styled.div`background: ${({ theme }) => theme.colors.surfaceAlt};overflow:hidden;img{transition:transform ${({theme})=>theme.transitions.slow}}`;
const Info = styled.div`
  padding: ${({ theme }) => theme.space[5]}; display: flex; flex: 1; flex-direction: column; gap: 8px; align-items: flex-start;
  h3 { color: ${({ theme }) => theme.colors.text}; font-size: ${({ theme }) => theme.fontSizes.lg}; min-height: 2.5em; }
`;
const Role = styled.span`color: ${({ theme }) => theme.colors.primary}; font-weight: 600; font-size: ${({ theme }) => theme.fontSizes.sm};`;
const Bio = styled(ReadMore)`
  color: ${({ theme }) => theme.colors.textBody};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  min-height: calc(3 * 1.65em);
`;
const Contacts = styled.div`
  display: flex; gap: ${({ theme }) => theme.space[2]}; margin-top: auto;
  a { width: 34px; height: 34px; display: grid; place-items: center; border-radius: ${({ theme }) => theme.radii.pill};
      background: ${({ theme }) => theme.colors.secondarySoft}; color: ${({ theme }) => theme.colors.secondary}; }
  a:hover { background: ${({ theme }) => theme.colors.secondary}; color: #fff; }
  a { transition:transform ${({theme})=>theme.transitions.fast},background ${({theme})=>theme.transitions.fast},color ${({theme})=>theme.transitions.fast}; }
  a:hover { transform:translateY(-2px) scale(1.05); }
`;
const Empty = styled.p`text-align: center; color: ${({ theme }) => theme.colors.textMuted}; padding: ${({ theme }) => theme.space[16]};`;

export default Faculty;
