import { useEffect, useRef, useState } from "react";
import styled from "styled-components";

/**
 * Fade/slide content in as it scrolls into view. Respects prefers-reduced-motion
 * (renders immediately, no transform).
 */
export function Reveal({ children, delay = 0, y = 16, className }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Box ref={ref} className={className} $shown={shown} $y={y} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </Box>
  );
}

const Box = styled.div`
  opacity: ${({ $shown }) => ($shown ? 1 : 0)};
  transform: translateY(${({ $shown, $y }) => ($shown ? 0 : $y)}px);
  transition: opacity 0.6s ease, transform 0.6s ease;
`;

export default Reveal;
