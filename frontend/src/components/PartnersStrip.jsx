import styled from "styled-components";
import { useLang } from "../context/LanguageContext";
import { useSettings } from "../context/SettingsContext";
import { Container, Section } from "./ui/Layout";
import { SmartImage } from "./SmartImage";
import { Reveal } from "./Reveal";

/**
 * Affiliations / partner logos strip. Reads settings.partners; renders a clean
 * logo (or a tasteful text monogram when no logo image is provided).
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
          <Row>
            {partners.map((p, i) => {
              const inner = p.logoUrl ? (
                <SmartImage src={p.logoUrl} alt={p.name} height="46px" fit="contain" />
              ) : (
                <Mono>{p.name}</Mono>
              );
              return p.url ? (
                <Logo key={i} as="a" href={p.url} target="_blank" rel="noopener noreferrer" title={p.name}>{inner}</Logo>
              ) : (
                <Logo key={i} title={p.name}>{inner}</Logo>
              );
            })}
          </Row>
        </Reveal>
      </Container>
    </Section>
  );
}

const Head = styled.div`
  text-align: center; margin-bottom: ${({ theme }) => theme.space[8]};
  h2 { color: ${({ theme }) => theme.colors.text}; font-size: ${({ theme }) => theme.fontSizes["2xl"]}; }
  p { color: ${({ theme }) => theme.colors.textMuted}; margin-top: 6px; }
`;
const Row = styled.div`
  display: flex; flex-wrap: wrap; align-items: center; justify-content: center;
  gap: ${({ theme }) => theme.space[6]};
`;
const Logo = styled.div`
  height: 70px; min-width: 150px; padding: 0 ${({ theme }) => theme.space[5]};
  display: grid; place-items: center;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  filter: grayscale(1); opacity: 0.75;
  transition: filter ${({ theme }) => theme.transitions.base}, opacity ${({ theme }) => theme.transitions.base}, box-shadow ${({ theme }) => theme.transitions.base};
  &:hover { filter: none; opacity: 1; box-shadow: ${({ theme }) => theme.shadows.sm}; }
`;
const Mono = styled.span`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-weight: 700; color: ${({ theme }) => theme.colors.secondary};
  font-size: ${({ theme }) => theme.fontSizes.md}; text-align: center; line-height: 1.2;
`;

export default PartnersStrip;
