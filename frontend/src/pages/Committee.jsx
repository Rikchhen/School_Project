import styled from "styled-components";
import { Phone, Mail, Quote } from "lucide-react";
import { useLang } from "../context/LanguageContext";
import { useFetch } from "../lib/useFetch";
import { PageHero } from "../components/PageHero";
import { Container, Section, Grid } from "../components/ui/Layout";
import { Card } from "../components/ui/Card";
import { SkeletonCard } from "../components/ui/Skeleton";
import { SmartImage } from "../components/SmartImage";
import { FetchError } from "../components/FetchError";
import { Reveal } from "../components/Reveal";

export function Committee() {
  const { t, pickLang, lang } = useLang();
  const { data, loading, error, refetch } = useFetch("/committee?published=true");
  const members = data?.items || [];
  const chair = members.find((m) => /chair/i.test(m.role)) || members[0];

  return (
    <>
      <PageHero title={t("committee.title")} subtitle={t("committee.subtitle")} lang={lang} />

      <Section $bg="alt">
        <Container>
          {chair && (pickLang(chair, "message")) && (
            <Reveal>
              <MessageCard>
                <Photo><SmartImage src={chair.photoUrl} alt={pickLang(chair, "name")} height="180px" /></Photo>
                <div>
                  <Quote size={28} />
                  <p>{pickLang(chair, "message")}</p>
                  <strong>{pickLang(chair, "name")}</strong>
                  <span>{pickLang(chair, "role")}</span>
                </div>
              </MessageCard>
            </Reveal>
          )}

          {error ? (
            <FetchError onRetry={refetch} />
          ) : loading ? (
            <Grid $cols={3} style={{ marginTop: "2.5rem" }}>{[0, 1, 2].map((i) => <SkeletonCard key={i} />)}</Grid>
          ) : members.length === 0 ? (
            <Empty>{t("admin.noItems")}</Empty>
          ) : (
            <Grid $cols={3} style={{ marginTop: "2.5rem" }}>
              {members.map((m, i) => (
                <Reveal key={m._id} delay={i * 60}>
                  <MemberCard $hover $pad={0}>
                    <MPhoto><SmartImage src={m.photoUrl} alt={pickLang(m, "name")} height="240px" /></MPhoto>
                    <Info>
                      <h3>{pickLang(m, "name")}</h3>
                      <Role>{pickLang(m, "role")}</Role>
                      <Contacts>
                        {m.email && <a href={`mailto:${m.email}`} aria-label="Email"><Mail size={15} /></a>}
                        {m.phone && <a href={`tel:${m.phone}`} aria-label="Phone"><Phone size={15} /></a>}
                      </Contacts>
                    </Info>
                  </MemberCard>
                </Reveal>
              ))}
            </Grid>
          )}
        </Container>
      </Section>
    </>
  );
}

const MessageCard = styled(Card)`
  display: grid; grid-template-columns: 220px 1fr; gap: ${({ theme }) => theme.space[8]}; align-items: center;
  padding: ${({ theme }) => theme.space[8]};
  border-left: 4px solid ${({ theme }) => theme.colors.primary};
  svg { color: ${({ theme }) => theme.colors.primary}; margin-bottom: ${({ theme }) => theme.space[2]}; }
  p { color: ${({ theme }) => theme.colors.textBody}; font-style: italic; line-height: ${({ theme }) => theme.lineHeights.relaxed}; margin-bottom: ${({ theme }) => theme.space[3]}; }
  strong { display: block; color: ${({ theme }) => theme.colors.text}; }
  span { color: ${({ theme }) => theme.colors.primary}; font-size: ${({ theme }) => theme.fontSizes.sm}; }
  ${({ theme }) => theme.media.tablet(`grid-template-columns: 1fr;`)}
`;
const Photo = styled.div`border-radius: ${({ theme }) => theme.radii.lg}; overflow: hidden; border: 1px solid ${({ theme }) => theme.colors.border};`;
const MemberCard = styled(Card)`overflow: hidden;`;
const MPhoto = styled.div`background: ${({ theme }) => theme.colors.surfaceAlt};`;
const Info = styled.div`
  padding: ${({ theme }) => theme.space[5]}; display: flex; flex-direction: column; gap: 6px; align-items: flex-start;
  h3 { color: ${({ theme }) => theme.colors.text}; font-size: ${({ theme }) => theme.fontSizes.lg}; }
`;
const Role = styled.span`color: ${({ theme }) => theme.colors.primary}; font-weight: 600; font-size: ${({ theme }) => theme.fontSizes.sm};`;
const Contacts = styled.div`
  display: flex; gap: ${({ theme }) => theme.space[2]}; margin-top: 4px;
  a { width: 34px; height: 34px; display: grid; place-items: center; border-radius: ${({ theme }) => theme.radii.pill};
      background: ${({ theme }) => theme.colors.secondarySoft}; color: ${({ theme }) => theme.colors.secondary}; }
  a:hover { background: ${({ theme }) => theme.colors.secondary}; color: #fff; }
`;
const Empty = styled.p`text-align: center; color: ${({ theme }) => theme.colors.textMuted}; padding: ${({ theme }) => theme.space[16]};`;

export default Committee;
