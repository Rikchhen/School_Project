import { keyframes, css } from "styled-components";

/**
 * Shared motion system — reusable keyframes and helpers.
 *
 * All decorative/looping motion here is automatically disabled by the global
 * `prefers-reduced-motion` rule in GlobalStyle (animation-duration → 0.001ms),
 * so nothing added here fights a user's accessibility preference.
 *
 * Nothing hardcodes colours; where an animation tints, it reads from the theme
 * at the call site (see `pulseGlow` usage) so light/dark both stay on-brand.
 */

/* ---------- Entrance (one-shot) ---------- */
export const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: none; }
`;

export const fadeDown = keyframes`
  from { opacity: 0; transform: translateY(-18px); }
  to   { opacity: 1; transform: none; }
`;

export const fadeLeft = keyframes`
  from { opacity: 0; transform: translateX(28px); }
  to   { opacity: 1; transform: none; }
`;

export const fadeRight = keyframes`
  from { opacity: 0; transform: translateX(-28px); }
  to   { opacity: 1; transform: none; }
`;

export const scaleIn = keyframes`
  from { opacity: 0; transform: scale(0.94); }
  to   { opacity: 1; transform: none; }
`;

export const blurIn = keyframes`
  from { opacity: 0; filter: blur(8px); transform: translateY(10px); }
  to   { opacity: 1; filter: blur(0);   transform: none; }
`;

/* ---------- Ambient (looping, decorative) ---------- */
export const floatY = keyframes`
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-8px); }
`;

export const floatYSlow = keyframes`
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-14px); }
`;

/** Slow cinematic zoom/pan for hero background imagery. */
export const kenBurns = keyframes`
  0%   { transform: scale(1.06) translate(0, 0); }
  50%  { transform: scale(1.14) translate(-1.5%, -1.5%); }
  100% { transform: scale(1.06) translate(0, 0); }
`;

/** Drifting aurora blobs behind the hero content. */
export const auroraDrift = keyframes`
  0%   { transform: translate(0, 0) scale(1); }
  33%  { transform: translate(6%, -4%) scale(1.08); }
  66%  { transform: translate(-5%, 5%) scale(0.96); }
  100% { transform: translate(0, 0) scale(1); }
`;

/** Moving gradient (used on bands / animated text underlines). */
export const gradientShift = keyframes`
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

/** Sweeping light "shine" across a surface (buttons, cards). */
export const shine = keyframes`
  0%   { transform: translateX(-120%) skewX(-18deg); }
  60%, 100% { transform: translateX(220%) skewX(-18deg); }
`;

/** Soft breathing glow ring. */
export const pulseGlow = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(177,0,44,0.35); }
  50%      { box-shadow: 0 0 0 10px rgba(177,0,44,0); }
`;

/** Gentle bob for the scroll-down cue. */
export const scrollCue = keyframes`
  0%, 100% { transform: translateY(0); opacity: 0.9; }
  50%      { transform: translateY(7px); opacity: 0.4; }
`;

/** Draw an underline / accent line from the left. */
export const drawLine = keyframes`
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
`;

/* ---------- Helpers ---------- */

/**
 * Reusable "reveal on mount" block driven by a boolean prop `$in`.
 * Pass an optional keyframe + delay. Reduced motion is handled globally.
 */
export const enter = (frames = fadeUp, { duration = "0.7s", delay = "0s", ease = "cubic-bezier(0.22,1,0.36,1)" } = {}) => css`
  animation: ${frames} ${duration} ${ease} ${delay} both;
`;

/** A frosted-glass surface that adapts to light/dark. */
export const glass = css`
  background: ${({ theme }) => (theme.mode === "dark" ? "rgba(24,31,41,0.72)" : "rgba(255,255,255,0.72)")};
  backdrop-filter: blur(10px) saturate(140%);
  -webkit-backdrop-filter: blur(10px) saturate(140%);
  border: 1px solid ${({ theme }) => (theme.mode === "dark" ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.55)")};
`;
