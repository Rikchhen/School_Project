import styled from "styled-components";
import { useLang } from "../context/LanguageContext";
import { useSettings } from "../context/SettingsContext";
import { Container, Section } from "./ui/Layout";
import { SmartImage } from "./SmartImage";
import { Reveal } from "./Reveal";

/**
 * Affiliations / partner cards. Reads settings.partners; shows the logo AND the
 * name together, in full colour, with alternating brand accents. Cards lift on
 * hover. Falls back gracefully when only a name or only a logo is provided.
 */
export function PartnersStrip() {
  const { t } = useLang();
  const { settings } = useSettings();
  const partners = (settings.partners || []).filter((p) => p.name || p.logoUrl);
  if (partners.length === 0) return null;

  return (
    <Section $pad={16}>
      <Container>
        <Reveal>
          <Head>
            <h2>{t("home.partnersTitle")}</h2>
            <p>{t("home.partnersSubtitle")}</p>
          </Head>
        </Reveal>
        <Row as={Reveal} stagger={80}>
          {partners.map((p, i) => {
            const accent = i % 2 === 0 ? "primary" : "secondary";
            const inner = (
              <>
                {p.logoUrl && (
                  <LogoImg>
                    <SmartImage src={p.logoUrl} alt={p.name} height="72px" fit="contain" />
                  </LogoImg>
                )}
                {p.name && <Name $accent={accent}>{p.name}</Name>}
              </>
            );
            return p.url ? (
              <Card key={i} as="a" href={p.url} target="_blank" rel="noopener noreferrer" title={p.name} $accent={accent}>{inner}</Card>
            ) : (
              <Card key={i} title={p.name} $accent={accent}>{inner}</Card>
            );
          })}
        </Row>
      </Container>
    </Section>
  );
}

const Head = styled.div`
  text-align: center; margin-bottom: ${({ theme }) => theme.space[10]};
  h2 { color: ${({ theme }) => theme.colors.text}; font-size: ${({ theme }) => theme.fontSizes["3xl"]}; }
  p { color: ${({ theme }) => theme.colors.textMuted}; margin-top: 6px; font-size: ${({ theme }) => theme.fontSizes.lg}; }
`;
const Row = styled.div`
  display: flex; flex-wrap: wrap; align-items: stretch; justify-content: center;
  gap: ${({ theme }) => theme.space[6]};
`;
const Card = styled.div`
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: ${({ theme }) => theme.space[3]};
  min-height: 168px; min-width: 210px; max-width: 260px;
  padding: ${({ theme }) => `${theme.space[6]} ${theme.space[6]}`};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-top: 4px solid ${({ theme, $accent }) => theme.colors[$accent]};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  transition: transform ${({ theme }) => theme.transitions.slow},
    box-shadow ${({ theme }) => theme.transitions.slow},
    border-color ${({ theme }) => theme.transitions.base};
  &:hover {
    transform: translateY(-6px);
    box-shadow: ${({ theme }) => theme.shadows.xl};
    border-color: ${({ theme, $accent }) => theme.colors[$accent]};
  }
`;
const LogoImg = styled.div`
  display: grid; place-items: center; min-height: 72px;
  img { max-height: 72px; width: auto; object-fit: contain; } /* full colour, no grayscale */
`;
const Name = styled.span`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-weight: 700; color: ${({ theme, $accent }) => theme.colors[$accent]};
  font-size: ${({ theme }) => theme.fontSizes.md}; text-align: center; line-height: 1.25;
`;

export default PartnersStrip;
