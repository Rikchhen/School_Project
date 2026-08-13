import styled, { css } from "styled-components";

const tones = {
  neutral: css`
    background: ${({ theme }) => theme.colors.surfaceAlt};
    color: ${({ theme }) => theme.colors.textMuted};
  `,
  primary: css`
    background: ${({ theme }) => theme.colors.primarySoft};
    color: ${({ theme }) => theme.colors.primary};
  `,
  secondary: css`
    background: ${({ theme }) => theme.colors.secondarySoft};
    color: ${({ theme }) => theme.colors.secondary};
  `,
  success: css`
    background: ${({ theme }) => theme.colors.successSoft};
    color: ${({ theme }) => theme.colors.success};
  `,
  warning: css`
    background: ${({ theme }) => theme.colors.warningSoft};
    color: ${({ theme }) => theme.colors.warning};
  `,
  danger: css`
    background: ${({ theme }) => theme.colors.dangerSoft};
    color: ${({ theme }) => theme.colors.danger};
  `,
  solidPrimary: css`
    background: ${({ theme }) => theme.colors.primary};
    color: #fff;
  `,
  solidSecondary: css`
    background: ${({ theme }) => theme.colors.secondary};
    color: #fff;
  `,
};

export const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.space[1]};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  line-height: 1;
  padding: ${({ theme }) => `${theme.space[1]} ${theme.space[3]}`};
  border-radius: ${({ theme }) => theme.radii.pill};
  white-space: nowrap;
  ${({ $tone = "neutral" }) => tones[$tone] || tones.neutral}
`;

export default Badge;
