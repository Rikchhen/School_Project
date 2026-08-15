import styled, { css } from "styled-components";

const variants = {
  primary: css`
    background: ${({ theme }) => theme.colors.primary};
    color: #fff;
    box-shadow: ${({ theme }) => theme.shadows.md};
    &:hover:not(:disabled) { background: ${({ theme }) => theme.colors.primaryDark}; }
  `,
  secondary: css`
    background: ${({ theme }) => theme.colors.secondary};
    color: #fff;
    box-shadow: ${({ theme }) => theme.shadows.md};
    &:hover:not(:disabled) { background: ${({ theme }) => theme.colors.secondaryDark}; }
  `,
  outline: css`
    background: ${({ theme }) => theme.colors.surface};
    color: ${({ theme }) => theme.colors.primary};
    border: 1px solid ${({ theme }) => theme.colors.borderStrong};
    &:hover:not(:disabled) { background: ${({ theme }) => theme.colors.primarySoft}; }
  `,
  ghost: css`
    background: transparent;
    color: ${({ theme }) => theme.colors.text};
    &:hover:not(:disabled) { background: ${({ theme }) => theme.colors.surfaceAlt}; }
  `,
  danger: css`
    background: ${({ theme }) => theme.colors.danger};
    color: #fff;
    &:hover:not(:disabled) { background: ${({ theme }) => theme.colors.primaryDark}; }
  `,
  subtleDanger: css`
    background: ${({ theme }) => theme.colors.dangerSoft};
    color: ${({ theme }) => theme.colors.danger};
    &:hover:not(:disabled) { background: #f7d2da; }
  `,
};

const sizes = {
  sm: css`
    padding: ${({ theme }) => `${theme.space[2]} ${theme.space[3]}`};
    font-size: ${({ theme }) => theme.fontSizes.sm};
  `,
  md: css`
    padding: ${({ theme }) => `${theme.space[3]} ${theme.space[5]}`};
    font-size: ${({ theme }) => theme.fontSizes.sm};
  `,
  lg: css`
    padding: ${({ theme }) => `${theme.space[4]} ${theme.space[6]}`};
    font-size: ${({ theme }) => theme.fontSizes.md};
  `,
};

export const Button = styled.button`
  position: relative;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.space[2]};
  font-family: ${({ theme }) => theme.fonts.body};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  letter-spacing: 0.28px;
  line-height: 1.25;
  border-radius: ${({ theme, $rounded }) => ($rounded === "md" ? theme.radii.md : theme.radii.pill)};
  transition: background ${({ theme }) => theme.transitions.base},
    transform ${({ theme }) => theme.transitions.base},
    box-shadow ${({ theme }) => theme.transitions.base},
    filter ${({ theme }) => theme.transitions.base};
  white-space: nowrap;
  width: ${({ $fullWidth }) => ($fullWidth ? "100%" : "auto")};

  ${({ $variant = "primary" }) => variants[$variant] || variants.primary}
  ${({ $size = "md" }) => sizes[$size] || sizes.md}

  /* subtle lift + brighten on hover */
  &:hover:not(:disabled) { transform: translateY(-2px); box-shadow: ${({ theme }) => theme.shadows.lg}; }
  &:active:not(:disabled) { transform: translateY(0); }
  &:disabled { opacity: 0.6; cursor: not-allowed; }

  /* light sweep across the surface on hover */
  &::after {
    content: ""; position: absolute; top: 0; left: 0; width: 45%; height: 100%;
    background: linear-gradient(100deg, transparent, rgba(255,255,255,0.35), transparent);
    transform: translateX(-160%) skewX(-18deg); pointer-events: none;
    transition: transform 0.6s ease;
  }
  &:hover:not(:disabled)::after { transform: translateX(300%) skewX(-18deg); }
  @media (prefers-reduced-motion: reduce) { &::after { display: none; } }

  svg { flex-shrink: 0; }
`;

export default Button;
