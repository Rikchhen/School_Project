import styled from "styled-components";
import { BookOpen, GraduationCap, Target, Eye, Library, FlaskConical, Trees, Quote } from "lucide-react";
import { useLang } from "../context/LanguageContext";
import { useSettings } from "../context/SettingsContext";
import { useFetch } from "../lib/useFetch";
import { PageHero } from "../components/PageHero";
import { Container, Section, Grid } from "../components/ui/Layout";
import { Card } from "../components/ui/Card";
import { SmartImage } from "../components/SmartImage";
import { RichText } from "../components/RichText";
import { Reveal } from "../components/Reveal";

const FACILITY_ICONS = { library: Library, lab: FlaskConical, playground: Trees };
const initials = (name = "") => name.trim().split(/\s+/).slice(0, 2).map((word) => word[0]).join("").toUpperCase() || "•";

export function About() {
  const { t, pickLang } = useLang();
  const { settings } = useSettings();
  const { data } = useFetch("/pages/about");
  const page = data?.page;
  const established = page?.content?.established || t("about.establishedLabel");
  const principal = settings.principal || {};
  const principalName = pickLang(principal, "name");
  const principalMessage = pickLang(principal, "message") || t("home.missionBody");

  const facilities = settings.facilities && settings.facilities.length
    ? settings.facilities.map((f) => ({
        icon: FACILITY_ICONS[f.icon] || Library,
        title: pickLang(f, "title"),
        desc: pickLang(f, "desc"),
      }))
    : [
        { icon: Library, title: t("about.facilityLibrary"), desc: t("about.facilityLibraryDesc") },
        { icon: FlaskConical, title: t("about.facilityLab"), desc: t("about.facilityLabDesc") },
        { icon: Trees, title: t("about.facilityPlayground"), desc: t("about.facilityPlaygroundDesc") },
      ];

  return (
    <>
      <PageHero title={t("about.title")} subtitle={t("about.subtitle")} />

      <Section>
        <Container>
          <Reveal>
            <HistoryRow>
              <Card $pad={8}>
                <IconTitle><BookOpen size={22} /> {t("about.historyTitle")}</IconTitle>
                {page?.content?.imageUrl && (
                  <HistoryImage>
                    <SmartImage src={page.content.imageUrl} alt={t("about.historyTitle")} height="240px" />
                  </HistoryImage>
                )}
                {page ? <RichText html={pickLang(page, "body")} /> : <Body>{t("about.subtitle")}</Body>}
              </Card>
              <EstablishedCard>
                <GraduationCap size={30} />
                <span>{t("about.establishedLabel")}</span>
                <strong>{established}</strong>
                <em>{t("about.legacy")}</em>
              </EstablishedCard>
            </HistoryRow>
          </Reveal>
        </Container>
      </Section>

      <Section $bg="alt">
        <Container>
          <Grid $cols={2}>
            <Reveal direction="right">
              <Card $pad={8} $accent="secondary" $hover>
                <IconRound $tone="secondary"><Target size={22} /></IconRound>
                <h3>{t("about.missionTitle")}</h3>
                <Body>{page?.content?.mission || t("about.missionBody")}</Body>
              </Card>
            </Reveal>
            <Reveal direction="left" delay={90}>
              <Card $pad={8} $accent="primary" $hover>
                <IconRound $tone="primary"><Eye size={22} /></IconRound>
                <h3>{t("about.visionTitle")}</h3>
                <Body>{page?.content?.vision || t("about.visionBody")}</Body>
              </Card>
            </Reveal>
          </Grid>
        </Container>
      </Section>

      <Section>
        <Container>
          <Reveal direction="scale">
            <PrincipalCard>
              <PrincipalPhoto>
                {principal.photoUrl ? (
                  <SmartImage src={principal.photoUrl} alt={principalName || t("home.principalRole")} height="100%" fit="cover" />
                ) : (
                  <PrincipalFallback aria-hidden>
                    <GraduationCap size={34} />
                    <FallbackInitials>{initials(principalName)}</FallbackInitials>
                  </PrincipalFallback>
                )}
              </PrincipalPhoto>
              <PrincipalBody>
                <Quote size={30} />
                <h3>{t("about.principalTitle")}</h3>
                <PrincipalMessage html={principalMessage} />
                {principalName && <PrincipalName>{principalName}</PrincipalName>}
              </PrincipalBody>
            </PrincipalCard>
          </Reveal>
        </Container>
      </Section>

      <Section $bg="alt">
        <Container>
          <Reveal>
            <Center>
              <h2>{t("about.facilitiesTitle")}</h2>
              <p>{t("about.facilitiesSubtitle")}</p>
            </Center>
          </Reveal>
          <Grid $cols={3}>
            {facilities.map((f, i) => {
              const Icon = f.icon;
              return (
                <Reveal key={f.title} delay={i * 90}>
                  <Card $hover $pad={6}>
                    <IconRound $tone="secondary"><Icon size={20} /></IconRound>
                    <h4>{f.title}</h4>
                    <Body>{f.desc}</Body>
                  </Card>
                </Reveal>
              );
            })}
          </Grid>
        </Container>
      </Section>
    </>
  );
}

const HistoryRow = styled.div`
  display: grid; grid-template-columns: 2fr 1fr; gap: ${({ theme }) => theme.space[6]};
  ${({ theme }) => theme.media.tablet(`grid-template-columns: 1fr;`)}
`;
const IconTitle = styled.h3`
  display: flex; align-items: center; gap: 10px;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.space[4]};
  svg { color: ${({ theme }) => theme.colors.primary}; }
`;
const HistoryImage = styled.div`
  border-radius: ${({ theme }) => theme.radii.lg};
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.border};
  margin-bottom: ${({ theme }) => theme.space[5]};
`;
const Body = styled.p`
  color: ${({ theme }) => theme.colors.textBody};
  line-height: ${({ theme }) => theme.lineHeights.relaxed};
`;
const EstablishedCard = styled.div`
  background: ${({ theme }) => theme.colors.primarySoft};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: ${({ theme }) => theme.space[8]};
  text-align: center;
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  color: ${({ theme }) => theme.colors.primary};
  span { font-weight: 600; }
  strong { font-size: ${({ theme }) => theme.fontSizes["3xl"]}; font-family: ${({ theme }) => theme.fonts.heading}; }
  em { color: ${({ theme }) => theme.colors.textBody}; font-style: normal; font-size: ${({ theme }) => theme.fontSizes.sm}; }
`;
const IconRound = styled.div`
  width: 48px; height: 48px; display: grid; place-items: center;
  border-radius: ${({ theme }) => theme.radii.pill};
  margin-bottom: ${({ theme }) => theme.space[4]};
  background: ${({ theme, $tone }) => ($tone === "primary" ? theme.colors.primarySoft : theme.colors.secondarySoft)};
  color: ${({ theme, $tone }) => ($tone === "primary" ? theme.colors.primary : theme.colors.secondary)};
`;
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
const PrincipalFallback = styled.div`
  width: 100%; height: 100%; display: grid; place-items: center; gap: 4px; position: relative;
  color: #fff; background: ${({ theme }) => theme.gradients.secondary};
  svg { opacity: 0.9; }
`;
const FallbackInitials = styled.span`
  font-family: ${({ theme }) => theme.fonts.heading}; font-weight: 800;
  font-size: ${({ theme }) => theme.fontSizes.xl}; letter-spacing: 1px;
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
const PrincipalName = styled.strong`
  display: block;
  margin-top: ${({ theme }) => theme.space[4]};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.lg};
`;
const Center = styled.div`
  text-align: center; margin-bottom: ${({ theme }) => theme.space[10]};
  h2 { color: ${({ theme }) => theme.colors.text}; margin-bottom: ${({ theme }) => theme.space[2]}; }
  p { color: ${({ theme }) => theme.colors.textBody}; }
`;

export default About;
