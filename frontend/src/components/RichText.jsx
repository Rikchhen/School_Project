import styled from "styled-components";
import { sanitizeHtml } from "../lib/sanitizeHtml";

/**
 * Render admin-authored rich text (sanitized) on public pages.
 * Overrides the global list reset so bullets/numbers show inside the prose.
 */
export function RichText({ html, className }) {
  return (
    <Prose
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
    />
  );
}

const Prose = styled.div`
  color: ${({ theme }) => theme.colors.textBody};
  line-height: ${({ theme }) => theme.lineHeights.relaxed};

  p { margin-bottom: ${({ theme }) => theme.space[3]}; }
  p:last-child { margin-bottom: 0; }

  strong, b { font-weight: ${({ theme }) => theme.fontWeights.bold}; color: ${({ theme }) => theme.colors.text}; }
  em, i { font-style: italic; }
  u { text-decoration: underline; }
  s, strike { text-decoration: line-through; }

  h2, h3, h4 {
    color: ${({ theme }) => theme.colors.text};
    margin: ${({ theme }) => theme.space[4]} 0 ${({ theme }) => theme.space[2]};
    line-height: ${({ theme }) => theme.lineHeights.snug};
  }
  h2 { font-size: ${({ theme }) => theme.fontSizes["2xl"]}; }
  h3 { font-size: ${({ theme }) => theme.fontSizes.xl}; }
  h4 { font-size: ${({ theme }) => theme.fontSizes.lg}; }

  ul, ol { padding-left: 1.35rem; margin-bottom: ${({ theme }) => theme.space[3]}; }
  ul { list-style: disc; }
  ol { list-style: decimal; }
  li { margin-bottom: ${({ theme }) => theme.space[1]}; }

  a {
    color: ${({ theme }) => theme.colors.secondary};
    text-decoration: underline;
    font-weight: ${({ theme }) => theme.fontWeights.medium};
  }

  blockquote {
    border-left: 3px solid ${({ theme }) => theme.colors.primary};
    padding-left: ${({ theme }) => theme.space[4]};
    margin: ${({ theme }) => theme.space[3]} 0;
    color: ${({ theme }) => theme.colors.textMuted};
    font-style: italic;
  }
`;

export default RichText;
