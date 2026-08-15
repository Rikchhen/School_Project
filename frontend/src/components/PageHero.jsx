import styled, { keyframes, css } from "styled-components";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { Link } from "../lib/router";
import { useLang } from "../context/LanguageContext";
import { Container } from "./ui/Layout";
import { Badge } from "./ui/Badge";
import { auroraDrift } from "../styles/animations";

/** Consistent page banner (with breadcrumb) used across inner public pages. */
export function PageHero({ badge, title, subtitle, lang }) {
  const { t } = useLang();

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.09, delayChildren: 0.04 } },
  };
  const item = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 90, damping: 16 } },
  };

  return (
    <Banner>
      {/* Soft, on-brand ambient glow behind the heading */}
      <Glow aria-hidden>
        <Blob $c="primary" style={{ top: "-60%", left: "12%" }} />
        <Blob $c="secondary" style={{ top: "-40%", right: "10%" }} />
      </Glow>
      <Container>
        <Inner as={motion.div} variants={container} initial="hidden" animate="show">
          <Crumbs as={motion.nav} variants={item} aria-label="Breadcrumb">
            <Link to="/">{t("nav.home")}</Link>
            <ChevronRight size={13} aria-hidden />
            <span aria-current="page">{title}</span>
          </Crumbs>
          {badge && (
            <motion.div variants={item}>
              <Badge $tone="secondary">{badge}</Badge>
            </motion.div>
          )}
          <motion.h1 variants={item} lang={lang === "ne" ? "ne" : undefined}>
            {title}
            <Underline aria-hidden />
          </motion.h1>
          {subtitle && <motion.p variants={item}>{subtitle}</motion.p>}
        </Inner>
      </Container>
    </Banner>
  );
}

const Banner = styled.section`
  position: relative;
  overflow: hidden;
  background: ${({ theme }) =>
    theme.mode === "dark"
      ? `linear-gradient(180deg, ${theme.colors.surfaceAlt} 0%, ${theme.colors.bg} 100%)`
      : `linear-gradient(180deg, ${theme.colors.surface} 0%, ${theme.colors.bg} 100%)`};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding-block: ${({ theme }) => theme.space[16]};
  ${({ theme }) => theme.media.tablet(`padding-block: 3rem;`)}
`;
const Glow = styled.div`position: absolute; inset: 0; z-index: 0; overflow: hidden;`;
const Blob = styled.div`
  position: absolute; width: 30vw; height: 30vw; max-width: 380px; max-height: 380px;
  border-radius: 50%; filter: blur(80px);
  opacity: ${({ theme }) => (theme.mode === "dark" ? 0.22 : 0.14)};
  background: ${({ theme, $c }) => theme.colors[$c]};
  animation: ${auroraDrift} 22s ease-in-out infinite;
  &:nth-child(2) { animation-duration: 28s; animation-direction: reverse; }
`;
const Crumbs = styled.nav`
  display: flex; align-items: center; gap: 6px;
  font-size: ${({ theme }) => theme.fontSizes.xs}; color: ${({ theme }) => theme.colors.textMuted};
  a { color: ${({ theme }) => theme.colors.secondary}; font-weight: 600; }
  a:hover { text-decoration: underline; }
  span { color: ${({ theme }) => theme.colors.textBody}; }
  svg { color: ${({ theme }) => theme.colors.textMuted}; }
`;
const draw = keyframes`from { transform: scaleX(0); } to { transform: scaleX(1); }`;
const Underline = styled.span`
  display: block; width: 68px; height: 4px; margin: 14px auto 0;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme }) => theme.gradients.primary};
  transform-origin: center;
  ${css`animation: ${draw} 0.7s cubic-bezier(0.22,1,0.36,1) 0.35s both;`}
`;
const Inner = styled.div`
  position: relative; z-index: 1;
  text-align: center;
  max-width: 760px;
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.space[3]};
  h1 {
    font-size: ${({ theme }) => theme.fontSizes["4xl"]};
    color: ${({ theme }) => theme.colors.text};
    ${({ theme }) => theme.media.tablet(`font-size: 2rem;`)}
  }
  h2 { color: ${({ theme }) => theme.colors.primary}; font-size: ${({ theme }) => theme.fontSizes["2xl"]}; }
  p { color: ${({ theme }) => theme.colors.textBody}; line-height: ${({ theme }) => theme.lineHeights.relaxed}; }
`;

export default PageHero;
