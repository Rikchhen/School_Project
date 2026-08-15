import styled, { keyframes } from "styled-components";
import { Sun, Moon } from "lucide-react";
import { useThemeMode } from "../context/ThemeModeContext";

/**
 * Light/dark theme switch. `variant`:
 *  - "onDark"  → for the dark utility bar (white outline).
 *  - "surface" → for light surfaces (admin, mobile menu).
 */
export function ThemeToggle({ variant = "onDark", withLabel = false }) {
  const { isDark, toggle } = useThemeMode();
  const label = isDark ? "Switch to light mode" : "Switch to dark mode";
  return (
    <Btn $variant={variant} onClick={toggle} aria-label={label} title={label}>
      <Icon key={isDark ? "sun" : "moon"}>
        {isDark ? <Sun size={15} /> : <Moon size={15} />}
      </Icon>
      {withLabel && <span>{isDark ? "Light" : "Dark"}</span>}
    </Btn>
  );
}

const spin = keyframes`from { transform: rotate(-90deg) scale(0.6); opacity: 0; } to { transform: none; opacity: 1; }`;

const Btn = styled.button`
  display: inline-flex; align-items: center; gap: 6px;
  border-radius: ${({ theme }) => theme.radii.pill};
  font-size: ${({ theme }) => theme.fontSizes.xs}; font-weight: 600;
  ${({ $variant, theme }) =>
    $variant === "onDark"
      ? `
    color: #fff; border: 1px solid rgba(255,255,255,0.4); padding: 4px 9px;
    &:hover { background: rgba(255,255,255,0.15); }
  `
      : `
    color: ${theme.colors.text}; border: 1px solid ${theme.colors.border};
    background: ${theme.colors.surface}; padding: 6px 10px;
    &:hover { background: ${theme.colors.surfaceAlt}; }
  `}
`;
const Icon = styled.span`
  display: inline-flex;
  animation: ${spin} ${({ theme }) => theme.transitions.base};
  @media (prefers-reduced-motion: reduce) { animation: none; }
`;

export default ThemeToggle;
