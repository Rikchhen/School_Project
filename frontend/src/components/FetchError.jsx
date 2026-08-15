import styled from "styled-components";
import { AlertCircle, RotateCw } from "lucide-react";
import { Button } from "./ui/Button";

/** Friendly error state with a retry button, for failed data loads. */
export function FetchError({ onRetry, message = "Couldn't load this content. Please check your connection." }) {
  return (
    <Wrap role="alert">
      <AlertCircle size={30} aria-hidden />
      <p>{message}</p>
      {onRetry && (
        <Button $variant="outline" $size="sm" onClick={onRetry}>
          <RotateCw size={15} /> Try again
        </Button>
      )}
    </Wrap>
  );
}

const Wrap = styled.div`
  display: flex; flex-direction: column; align-items: center; gap: ${({ theme }) => theme.space[3]};
  text-align: center; padding: ${({ theme }) => theme.space[16]} ${({ theme }) => theme.space[4]};
  color: ${({ theme }) => theme.colors.textMuted};
  svg { color: ${({ theme }) => theme.colors.danger}; }
`;

export default FetchError;
