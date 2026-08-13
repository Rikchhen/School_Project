/**
 * Design tokens extracted from the Figma source of truth.
 * Figma file: "Adarsha Rastriya Secondary School" (5 designed frames).
 *
 * NOTHING in a component should hardcode a color, radius, shadow, font or size —
 * always read from this theme via styled-components' `props.theme`.
 */

const colors = {
  // Brand — crimson red (#b1002c) is the primary; royal blue (#335ab4) secondary.
  primary: "#b1002c",
  primaryDark: "#8f0023",
  primaryLight: "#d81b45",
  primarySoft: "#fbe7ec", // tinted background for red chips/date boxes

  secondary: "#335ab4",
  secondaryDark: "#274a99",
  secondaryLight: "#4f74c9",
  secondarySoft: "#e8edfb", // tinted background for blue chips/badges
  secondaryFaint: "#b3c5ff", // footer link colour

  // Surfaces
  bg: "#f8f9fa", // page background / header
  surface: "#ffffff", // cards
  surfaceAlt: "#f2f4f8", // alternating sections

  // Text
  text: "#1a1a2e", // near-black headings/body on light
  textBody: "#4b5563", // muted body copy
  textMuted: "#6b7280", // secondary / meta
  navInactive: "#5c3f3f", // Figma nav inactive link colour
  textOnDark: "#ffffff",
  textOnDarkMuted: "rgba(255,255,255,0.8)",

  // Lines & states
  border: "#e5e7eb",
  borderStrong: "#916f6e", // Figma outline-button border
  success: "#1a7f4b",
  successSoft: "#e3f5ec",
  warning: "#b7791f",
  warningSoft: "#fdf3e0",
  danger: "#b1002c",
  dangerSoft: "#fbe7ec",
  info: "#335ab4",
  infoSoft: "#e8edfb",

  overlay: "rgba(17, 24, 39, 0.6)",
};

const gradients = {
  // Hero: light surface fading to transparent over the photo (Figma 1:7)
  heroFade:
    "linear-gradient(90deg, #f8f9fa 0%, rgba(248,249,250,0.85) 35%, rgba(248,249,250,0) 100%)",
  primary: "linear-gradient(135deg, #b1002c 0%, #d81b45 100%)",
  secondary: "linear-gradient(135deg, #335ab4 0%, #4f74c9 100%)",
  brandBanner: "linear-gradient(135deg, #b1002c 0%, #8f0023 100%)",
};

const fonts = {
  heading: `'Plus Jakarta Sans', 'Segoe UI', system-ui, sans-serif`,
  body: `'Inter', 'Segoe UI', system-ui, sans-serif`,
  // Devanagari for Nepali text — stacked after Latin fonts.
  nepali: `'Noto Sans Devanagari', 'Inter', system-ui, sans-serif`,
};

const fontSizes = {
  xs: "0.75rem", // 12
  sm: "0.875rem", // 14 — nav / buttons / meta
  md: "1rem", // 16 — body
  lg: "1.125rem", // 18
  xl: "1.25rem", // 20
  "2xl": "1.5rem", // 24 — brand / card titles
  "3xl": "1.875rem", // 30
  "4xl": "2.25rem", // 36 — section titles
  "5xl": "3rem", // 48 — hero
};

const fontWeights = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
};

const lineHeights = {
  tight: 1.15,
  snug: 1.3,
  normal: 1.5,
  relaxed: 1.65,
};

// 4px base spacing scale
const space = {
  0: "0",
  1: "0.25rem",
  2: "0.5rem",
  3: "0.75rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  8: "2rem",
  10: "2.5rem",
  12: "3rem",
  16: "4rem",
  20: "5rem", // section vertical padding (Figma py-80)
  24: "6rem",
};

const radii = {
  sm: "6px",
  md: "10px",
  lg: "16px",
  xl: "24px",
  pill: "9999px",
};

const shadows = {
  xs: "0 1px 1px rgba(0,0,0,0.05)", // header
  sm: "0 1px 3px rgba(0,0,0,0.08)",
  md: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)", // buttons/cards (Figma)
  lg: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)",
  xl: "0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
  focus: "0 0 0 3px rgba(51,90,180,0.35)", // accessible focus ring
};

const layout = {
  maxWidth: "1200px",
  navHeight: "80px",
  sidebarWidth: "260px",
  pagePadding: "1.5rem",
};

const breakpoints = {
  mobile: "480px",
  tablet: "768px",
  laptop: "1024px",
  desktop: "1280px",
};

// Convenience media-query helpers: theme.media.tablet`...`
const media = {
  mobile: (styles) => `@media (max-width: ${breakpoints.mobile}) { ${styles} }`,
  tablet: (styles) => `@media (max-width: ${breakpoints.tablet}) { ${styles} }`,
  laptop: (styles) => `@media (max-width: ${breakpoints.laptop}) { ${styles} }`,
  desktop: (styles) => `@media (max-width: ${breakpoints.desktop}) { ${styles} }`,
};

const transitions = {
  base: "180ms ease",
  slow: "300ms ease",
};

const zIndex = {
  base: 1,
  header: 100,
  dropdown: 200,
  overlay: 900,
  modal: 1000,
  toast: 1100,
  cropper: 1200,
};

export const theme = {
  colors,
  gradients,
  fonts,
  fontSizes,
  fontWeights,
  lineHeights,
  space,
  radii,
  shadows,
  layout,
  breakpoints,
  media,
  transitions,
  zIndex,
};

export default theme;
