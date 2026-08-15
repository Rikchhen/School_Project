import styled from "styled-components";

export const Card = styled.div`
  position: relative;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  padding: ${({ theme, $pad }) => theme.space[$pad ?? 6]};
  transition: box-shadow ${({ theme }) => theme.transitions.slow},
    transform ${({ theme }) => theme.transitions.slow},
    border-color ${({ theme }) => theme.transitions.base};

  ${({ $hover, theme }) =>
    $hover &&
    `&:hover {
       box-shadow: ${theme.shadows.xl};
       transform: translateY(-4px);
       border-color: ${theme.colors.primaryLight};
     }`}

  ${({ $accent, theme }) =>
    $accent &&
    `border-left: 4px solid ${theme.colors[$accent] || $accent};`}
`;

export default Card;
