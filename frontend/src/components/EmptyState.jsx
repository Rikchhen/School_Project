import styled from "styled-components";
import { Inbox } from "lucide-react";

/** Friendly empty state (icon + message) for lists with no results. */
export function EmptyState({ icon: Icon = Inbox, message, hint }) {
  return (
    <Wrap>
      <Circle><Icon size={26} aria-hidden /></Circle>
      <p>{message}</p>
      {hint && <small>{hint}</small>}
    </Wrap>
  );
}

const Wrap = styled.div`
  display: flex; flex-direction: column; align-items: center; gap: ${({ theme }) => theme.space[2]};
  text-align: center; padding: ${({ theme }) => theme.space[16]} ${({ theme }) => theme.space[4]};
  color: ${({ theme }) => theme.colors.textMuted};
  p { color: ${({ theme }) => theme.colors.textBody}; font-weight: 600; }
  small { font-size: ${({ theme }) => theme.fontSizes.sm}; }
`;
const Circle = styled.div`
  width: 64px; height: 64px; display: grid; place-items: center; border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme }) => theme.colors.surfaceAlt}; color: ${({ theme }) => theme.colors.secondary};
  margin-bottom: ${({ theme }) => theme.space[2]};
`;

export default EmptyState;
