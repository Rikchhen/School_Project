import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  *, *::before, *::after { box-sizing: border-box; }

  * { margin: 0; }

  html { -webkit-text-size-adjust: 100%; scroll-behavior: smooth; }

  body {
    font-family: ${({ theme }) => theme.fonts.body};
    font-size: ${({ theme }) => theme.fontSizes.md};
    line-height: ${({ theme }) => theme.lineHeights.normal};
    color: ${({ theme }) => theme.colors.text};
    background: ${({ theme }) => theme.colors.bg};
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
    min-height: 100vh;
  }

  h1, h2, h3, h4, h5 {
    font-family: ${({ theme }) => theme.fonts.heading};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    line-height: ${({ theme }) => theme.lineHeights.tight};
    color: ${({ theme }) => theme.colors.text};
  }

  /* Nepali text (marked with lang="ne") uses the Devanagari stack */
  [lang="ne"] { font-family: ${({ theme }) => theme.fonts.nepali}; }

  a { color: inherit; text-decoration: none; }

  img, picture, svg, video { display: block; max-width: 100%; }

  button, input, textarea, select { font: inherit; color: inherit; }

  button { cursor: pointer; background: none; border: none; }

  ul, ol { list-style: none; padding: 0; }

  /* Accessible focus ring for keyboard users */
  :focus-visible {
    outline: none;
    box-shadow: ${({ theme }) => theme.shadows.focus};
    border-radius: ${({ theme }) => theme.radii.sm};
  }

  /* Respect reduced-motion preferences */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.001ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.001ms !important;
      scroll-behavior: auto !important;
    }
  }

  /* Thin, on-brand scrollbar */
  ::selection { background: ${({ theme }) => theme.colors.primary}; color: #fff; }
`;

export default GlobalStyle;
