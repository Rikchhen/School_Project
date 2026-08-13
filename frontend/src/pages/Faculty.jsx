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
import { htmlToText } from "../lib/sanitizeHtml";

const DEPTS = ["all", "administration", "science", "management", "humanities", "languages", "general"];

export function Faculty() {
  const { t, pickLang } = useLang();
  const [dept, setDept] = useState("all");
  const { data, loading } = useFetch("/staff?published=true");
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

          {loading ? (
            <Grid $cols={4}>{[0, 1, 2, 3].map((i) => <SkeletonCard key={i} />)}</Grid>
          ) : filtered.length === 0 ? (
            <Empty>{t("admin.noItems")}</Empty>
          ) : (
            <Grid $cols={4}>
              {filtered.map((m) => (
                <StaffCard key={m._id} $hover $pad={0}>
                  <Photo><SmartImage src={m.photoUrl} alt={m.name} height="220px" /></Photo>
                  <Info>
                    <h3>{pickLang(m, "name")}</h3>
                    <Role>{pickLang(m, "role")}</Role>
                    <Badge $tone="secondary">{m.department}</Badge>
                    {m.bio && <Bio>{htmlToText(m.bio)}</Bio>}
                    <Contacts>
                      {m.email && <a href={`mailto:${m.email}`} aria-label="Email"><Mail size={15} /></a>}
                      {m.phone && <a href={`tel:${m.phone}`} aria-label="Phone"><Phone size={15} /></a>}
                    </Contacts>
                  </Info>
                </StaffCard>
              ))}
            </Grid>
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
const StaffCard = styled(Card)`overflow: hidden;`;
const Photo = styled.div`background: ${({ theme }) => theme.colors.surfaceAlt};`;
const Info = styled.div`
  padding: ${({ theme }) => theme.space[5]}; display: flex; flex-direction: column; gap: 8px; align-items: flex-start;
  h3 { color: ${({ theme }) => theme.colors.text}; font-size: ${({ theme }) => theme.fontSizes.lg}; }
`;
const Role = styled.span`color: ${({ theme }) => theme.colors.primary}; font-weight: 600; font-size: ${({ theme }) => theme.fontSizes.sm};`;
const Bio = styled.p`color: ${({ theme }) => theme.colors.textBody}; font-size: ${({ theme }) => theme.fontSizes.sm};`;
const Contacts = styled.div`
  display: flex; gap: ${({ theme }) => theme.space[2]}; margin-top: 4px;
  a { width: 34px; height: 34px; display: grid; place-items: center; border-radius: ${({ theme }) => theme.radii.pill};
      background: ${({ theme }) => theme.colors.secondarySoft}; color: ${({ theme }) => theme.colors.secondary}; }
  a:hover { background: ${({ theme }) => theme.colors.secondary}; color: #fff; }
`;
const Empty = styled.p`text-align: center; color: ${({ theme }) => theme.colors.textMuted}; padding: ${({ theme }) => theme.space[16]};`;

export default Faculty;
