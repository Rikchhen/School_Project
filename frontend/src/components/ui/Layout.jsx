import styled from "styled-components";

/** Centered max-width content wrapper with responsive side padding. */
export const Container = styled.div`
  width: 100%;
  max-width: ${({ theme, $narrow }) => ($narrow ? "820px" : theme.layout.maxWidth)};
  margin-inline: auto;
  padding-inline: ${({ theme }) => theme.space[6]};

  ${({ theme }) => theme.media.tablet(`padding-inline: 1.25rem;`)}
`;

/** Vertical section rhythm (Figma uses ~80px section padding). */
export const Section = styled.section`
  padding-block: ${({ theme, $pad }) => theme.space[$pad ?? 20]};
  background: ${({ theme, $bg }) =>
    $bg === "alt"
      ? theme.colors.surfaceAlt
      : $bg === "white"
        ? theme.colors.surface
        : "transparent"};

  ${({ theme }) => theme.media.tablet(`padding-block: 3rem;`)}
`;

export const SectionHeader = styled.div`
  text-align: ${({ $align }) => $align || "center"};
  max-width: ${({ $align }) => ($align === "left" ? "none" : "720px")};
  margin-inline: ${({ $align }) => ($align === "left" ? "0" : "auto")};
  margin-bottom: ${({ theme }) => theme.space[10]};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[3]};
`;

export const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes["4xl"]};
  color: ${({ theme, $color }) => theme.colors[$color] || theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.extrabold};

  ${({ theme }) => theme.media.tablet(`font-size: 1.75rem;`)}
`;

export const SectionSubtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.textBody};
  line-height: ${({ theme }) => theme.lineHeights.relaxed};
`;

export const Grid = styled.div`
  display: grid;
  gap: ${({ theme, $gap }) => theme.space[$gap ?? 6]};
  grid-template-columns: repeat(${({ $cols }) => $cols || 3}, 1fr);

  ${({ theme, $cols }) =>
    theme.media.laptop(`grid-template-columns: repeat(${Math.min($cols || 3, 2)}, 1fr);`)}
  ${({ theme }) => theme.media.tablet(`grid-template-columns: 1fr;`)}
`;

export default Container;
