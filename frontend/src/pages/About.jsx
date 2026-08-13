import styled from "styled-components";
import { BookOpen, GraduationCap, Target, Eye, Library, FlaskConical, Trees } from "lucide-react";
import { useLang } from "../context/LanguageContext";
import { useSettings } from "../context/SettingsContext";
import { useFetch } from "../lib/useFetch";
import { PageHero } from "../components/PageHero";
import { Container, Section, Grid } from "../components/ui/Layout";
import { Card } from "../components/ui/Card";
import { SmartImage } from "../components/SmartImage";
import { RichText } from "../components/RichText";

const FACILITY_ICONS = { library: Library, lab: FlaskConical, playground: Trees };

export function About() {
  const { t, pickLang } = useLang();
  const { settings } = useSettings();
  const { data } = useFetch("/pages/about");
  const page = data?.page;
  const established = page?.content?.established || t("about.establishedLabel");

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
        </Container>
      </Section>

      <Section $bg="alt">
        <Container>
          <Grid $cols={2}>
            <Card $pad={8} $accent="secondary">
              <IconRound $tone="secondary"><Target size={22} /></IconRound>
              <h3>{t("about.missionTitle")}</h3>
              <Body>{page?.content?.mission || t("about.missionBody")}</Body>
            </Card>
            <Card $pad={8} $accent="primary">
              <IconRound $tone="primary"><Eye size={22} /></IconRound>
              <h3>{t("about.visionTitle")}</h3>
              <Body>{page?.content?.vision || t("about.visionBody")}</Body>
            </Card>
          </Grid>
        </Container>
      </Section>

      <Section>
        <Container>
          <PrincipalCard>
            <Photo><SmartImage src="" alt="Principal" height="220px" /></Photo>
            <div>
              <h3>{t("about.principalTitle")}</h3>
              <Body>{t("home.missionBody")}</Body>
            </div>
          </PrincipalCard>
        </Container>
      </Section>

      <Section $bg="alt">
        <Container>
          <Center>
            <h2>{t("about.facilitiesTitle")}</h2>
            <p>{t("about.facilitiesSubtitle")}</p>
          </Center>
          <Grid $cols={3}>
            {facilities.map((f) => {
              const Icon = f.icon;
              return (
                <Card key={f.title} $hover $pad={6}>
                  <IconRound $tone="secondary"><Icon size={20} /></IconRound>
                  <h4>{f.title}</h4>
                  <Body>{f.desc}</Body>
                </Card>
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
const PrincipalCard = styled(Card)`
  display: grid; grid-template-columns: 260px 1fr; gap: ${({ theme }) => theme.space[8]};
  align-items: center; padding: ${({ theme }) => theme.space[8]};
  border-left: 4px solid ${({ theme }) => theme.colors.secondary};
  h3 { margin-bottom: ${({ theme }) => theme.space[3]}; color: ${({ theme }) => theme.colors.primary}; }
  ${({ theme }) => theme.media.tablet(`grid-template-columns: 1fr;`)}
`;
const Photo = styled.div`
  border-radius: ${({ theme }) => theme.radii.lg}; overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;
const Center = styled.div`
  text-align: center; margin-bottom: ${({ theme }) => theme.space[10]};
  h2 { color: ${({ theme }) => theme.colors.text}; margin-bottom: ${({ theme }) => theme.space[2]}; }
  p { color: ${({ theme }) => theme.colors.textBody}; }
`;

export default About;
