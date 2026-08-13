import styled from "styled-components";
import { Container } from "./ui/Layout";
import { Badge } from "./ui/Badge";

/** Consistent page banner used across inner public pages. */
export function PageHero({ badge, title, subtitle, lang }) {
  return (
    <Banner>
      <Container>
        <Inner>
          {badge && <Badge $tone="secondary">{badge}</Badge>}
          <h1 lang={lang === "ne" ? "ne" : undefined}>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </Inner>
      </Container>
    </Banner>
  );
}

const Banner = styled.section`
  background: ${({ theme }) => theme.colors.bg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding-block: ${({ theme }) => theme.space[16]};
  ${({ theme }) => theme.media.tablet(`padding-block: 3rem;`)}
`;
const Inner = styled.div`
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
