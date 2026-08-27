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
    /* Long words / URLs / emails must wrap rather than push the layout wide on
       narrow phones. */
    overflow-wrap: break-word;
    transition: background-color 0.3s ease, color 0.3s ease;
  }

  h1, h2, h3, h4, h5 {
    font-family: ${({ theme }) => theme.fonts.heading};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    line-height: ${({ theme }) => theme.lineHeights.tight};
    letter-spacing: -0.02em; /* Poppins headings read cleaner slightly tightened */
    color: ${({ theme }) => theme.colors.text};
  }
  /* Nepali headings: serif tracking doesn't suit Devanagari — reset it */
  h1[lang="ne"], h2[lang="ne"], h3[lang="ne"], h4[lang="ne"], h5[lang="ne"] { letter-spacing: normal; }

  /* Nepali text (marked with lang="ne") uses the Devanagari stack with a
     slightly taller line-height so the script breathes */
  [lang="ne"] { font-family: ${({ theme }) => theme.fonts.nepali}; line-height: 1.75; }

  a { color: inherit; text-decoration: none; }

  img, picture, svg, video, iframe { display: block; max-width: 100%; }

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

  /* Skip-to-content link — visible only when focused */
  .skip-link {
    position: fixed; top: 8px; left: 8px; z-index: ${({ theme }) => theme.zIndex.toast + 1};
    background: ${({ theme }) => theme.colors.primary}; color: #fff;
    padding: 10px 16px; border-radius: ${({ theme }) => theme.radii.md};
    font-weight: 600; transform: translateY(-150%); transition: transform 0.2s ease;
  }
  .skip-link:focus { transform: translateY(0); }

  /* Print: show only the content, dark text on white, no chrome */
  @media print {
    header, footer, .no-print { display: none !important; }
    body { background: #fff; color: #000; }
    a { color: #000; text-decoration: none; }
    main { padding: 0 !important; }
    * { box-shadow: none !important; }
  }
`;

export default GlobalStyle;
