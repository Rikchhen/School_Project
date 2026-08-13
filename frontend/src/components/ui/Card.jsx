import styled from "styled-components";

export const Card = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  padding: ${({ theme, $pad }) => theme.space[$pad ?? 6]};
  transition: box-shadow ${({ theme }) => theme.transitions.base},
    transform ${({ theme }) => theme.transitions.base};

  ${({ $hover, theme }) =>
    $hover &&
    `&:hover { box-shadow: ${theme.shadows.lg}; transform: translateY(-2px); }`}

  ${({ $accent, theme }) =>
    $accent &&
    `border-left: 4px solid ${theme.colors[$accent] || $accent};`}
`;

export default Card;
