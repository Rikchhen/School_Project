import styled, { css, keyframes } from "styled-components";

const fieldShake = keyframes`0%,100%{transform:translateX(0)}30%{transform:translateX(-4px)}60%{transform:translateX(4px)}`;

const fieldStyles = ({ theme }) => css`
  width: 100%;
  font-family: ${theme.fonts.body};
  font-size: ${theme.fontSizes.md};
  color: ${theme.colors.text};
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  padding: ${theme.space[3]} ${theme.space[4]};
  transition: border-color ${theme.transitions.base}, box-shadow ${theme.transitions.base};

  &::placeholder { color: ${theme.colors.textMuted}; }
  &:focus-visible {
    outline: none;
    border-color: ${theme.colors.secondary};
    box-shadow: ${theme.shadows.focus};
  }
  &:disabled { background: ${theme.colors.surfaceAlt}; cursor: not-allowed; }
  &[aria-invalid="true"] { border-color: ${theme.colors.danger}; }
  &[aria-invalid="true"]:not(:focus) { animation: ${fieldShake} 0.28s ease-out both; }
  @media (prefers-reduced-motion: reduce) { animation: none !important; }
`;

export const Input = styled.input`
  ${fieldStyles}
`;

export const Textarea = styled.textarea`
  ${fieldStyles}
  min-height: 130px;
  resize: vertical;
`;

export const Select = styled.select`
  ${fieldStyles}
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.85rem center;
  padding-right: 2.5rem;
`;

export const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[2]};
`;

export const Label = styled.label`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text};

  span[data-req] { color: ${({ theme }) => theme.colors.danger}; margin-left: 2px; }
`;

export const HelpText = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme, $error }) => ($error ? theme.colors.danger : theme.colors.textMuted)};
`;

export default Input;
