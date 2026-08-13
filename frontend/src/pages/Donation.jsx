import styled from "styled-components";
import { Landmark, Smartphone, Heart, HandCoins } from "lucide-react";
import { Link } from "../lib/router";
import { useLang } from "../context/LanguageContext";
import { useSettings } from "../context/SettingsContext";
import { useFetch } from "../lib/useFetch";
import { PageHero } from "../components/PageHero";
import { NotFound } from "./NotFound";
import { Container, Section, Grid } from "../components/ui/Layout";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { RichText } from "../components/RichText";
import { SmartImage } from "../components/SmartImage";
import { Reveal } from "../components/Reveal";

export function Donation() {
  const { t, pickLang, lang } = useLang();
  const { settings, loaded } = useSettings();
  const { data } = useFetch("/pages/donation");
  const page = data?.page;
  const c = page?.content || {};

  // Avoid a flash before settings load.
  if (!loaded) return null;
  // Respect the admin's hide/unhide toggle — a hidden page fully 404s.
  if (!settings.donationEnabled) return <NotFound />;

  return (
    <>
      <PageHero title={page ? pickLang(page, "title") : t("donation.title")} subtitle={t("donation.subtitle")} lang={lang} />

      <Section $bg="alt">
        <Container>
          <Reveal>
            <Intro>
              {c.imageUrl && <IntroImage><SmartImage src={c.imageUrl} alt={t("donation.title")} height="240px" /></IntroImage>}
              <Heart size={30} />
              {page ? <RichText html={pickLang(page, "body")} /> : <p>{t("donation.subtitle")}</p>}
            </Intro>
          </Reveal>

          <h2 style={{ textAlign: "center", margin: "2.5rem 0 1.5rem" }}>{t("donation.methodsTitle")}</h2>
          <Grid $cols={3}>
            <Reveal>
              <Method $hover>
                <IconRound $tone="secondary"><Landmark size={22} /></IconRound>
                <h3>{t("donation.bank")}</h3>
                <Row><span>{t("donation.bankName")}</span><b>{c.bankName || "—"}</b></Row>
                <Row><span>{t("donation.accountName")}</span><b>{c.accountName || "—"}</b></Row>
                <Row><span>{t("donation.accountNumber")}</span><b>{c.accountNumber || "—"}</b></Row>
              </Method>
            </Reveal>
            <Reveal delay={80}>
              <Method $hover>
                <IconRound $tone="primary"><Smartphone size={22} /></IconRound>
                <h3>{t("donation.esewa")}</h3>
                <Row><span>ID</span><b>{c.esewa || "—"}</b></Row>
                {c.qrEsewa && <QR><SmartImage src={c.qrEsewa} alt="eSewa QR" fit="contain" /></QR>}
              </Method>
            </Reveal>
            <Reveal delay={160}>
              <Method $hover>
                <IconRound $tone="primary"><Smartphone size={22} /></IconRound>
                <h3>{t("donation.khalti")}</h3>
                <Row><span>ID</span><b>{c.khalti || "—"}</b></Row>
                {c.qrKhalti && <QR><SmartImage src={c.qrKhalti} alt="Khalti QR" fit="contain" /></QR>}
              </Method>
            </Reveal>
          </Grid>

          <Thanks>{t("donation.thanks")}</Thanks>
        </Container>
      </Section>
    </>
  );
}

const Intro = styled.div`
  background: ${({ theme }) => theme.colors.surface}; border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg}; padding: ${({ theme }) => theme.space[8]};
  text-align: center; max-width: 760px; margin-inline: auto;
  svg { color: ${({ theme }) => theme.colors.primary}; margin-bottom: ${({ theme }) => theme.space[3]}; }
`;
const IntroImage = styled.div`
  border-radius: ${({ theme }) => theme.radii.lg}; overflow: hidden; margin-bottom: ${({ theme }) => theme.space[5]};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;
const Method = styled(Card)`
  display: flex; flex-direction: column; gap: ${({ theme }) => theme.space[2]}; padding: ${({ theme }) => theme.space[6]};
  h3 { color: ${({ theme }) => theme.colors.text}; margin-bottom: ${({ theme }) => theme.space[2]}; }
`;
const IconRound = styled.div`
  width: 48px; height: 48px; display: grid; place-items: center; border-radius: ${({ theme }) => theme.radii.md};
  margin-bottom: ${({ theme }) => theme.space[2]};
  background: ${({ theme, $tone }) => ($tone === "primary" ? theme.colors.primarySoft : theme.colors.secondarySoft)};
  color: ${({ theme, $tone }) => ($tone === "primary" ? theme.colors.primary : theme.colors.secondary)};
`;
const Row = styled.div`
  display: flex; justify-content: space-between; gap: ${({ theme }) => theme.space[3]};
  padding: ${({ theme }) => theme.space[2]} 0; border-bottom: 1px dashed ${({ theme }) => theme.colors.border};
  span { color: ${({ theme }) => theme.colors.textMuted}; font-size: ${({ theme }) => theme.fontSizes.sm}; }
  b { color: ${({ theme }) => theme.colors.text}; }
`;
const QR = styled.div`
  width: 150px; margin-top: ${({ theme }) => theme.space[3]}; border-radius: ${({ theme }) => theme.radii.md};
  overflow: hidden; border: 1px solid ${({ theme }) => theme.colors.border}; background: #fff; padding: 6px;
`;
const Thanks = styled.p`
  text-align: center; margin-top: ${({ theme }) => theme.space[10]};
  color: ${({ theme }) => theme.colors.primary}; font-size: ${({ theme }) => theme.fontSizes.xl}; font-weight: 600;
`;
const Unavailable = styled.div`
  min-height: 50vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: ${({ theme }) => theme.space[4]};
  text-align: center; color: ${({ theme }) => theme.colors.textMuted};
  svg { color: ${({ theme }) => theme.colors.borderStrong}; }
`;

export default Donation;
