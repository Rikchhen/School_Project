import styled, { keyframes } from "styled-components";

const shimmer = keyframes`
  0% { background-position: -400px 0; }
  100% { background-position: 400px 0; }
`;

export const Skeleton = styled.div`
  border-radius: ${({ theme, $radius }) => theme.radii[$radius] || theme.radii.md};
  width: ${({ $w }) => $w || "100%"};
  height: ${({ $h }) => $h || "1rem"};
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.surfaceAlt} 25%,
    ${({ theme }) => theme.colors.border} 37%,
    ${({ theme }) => theme.colors.surfaceAlt} 63%
  );
  background-size: 800px 100%;
  animation: ${shimmer} 1.4s ease-in-out infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    background: ${({ theme }) => theme.colors.surfaceAlt};
  }
`;

/** A card-shaped skeleton block, handy for grid placeholders. */
export function SkeletonCard() {
  return (
    <div
      style={{
        border: "1px solid var(--sk-border, #e5e7eb)",
        borderRadius: 16,
        padding: 24,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        background: "#fff",
      }}
    >
      <Skeleton $h="140px" $radius="md" />
      <Skeleton $h="1.25rem" $w="70%" />
      <Skeleton $h="0.9rem" />
      <Skeleton $h="0.9rem" $w="85%" />
    </div>
  );
}

export default Skeleton;
