import { useEffect, useRef, useState, Children } from "react";
import styled from "styled-components";

/**
 * Fade/slide content in as it scrolls into view. Respects prefers-reduced-motion
 * (renders immediately, no transform).
 *
 * Props:
 *   direction  "up" | "down" | "left" | "right" | "scale"  (default "up")
 *   delay      ms before the transition starts
 *   y          legacy offset (kept for back-compat; maps to distance for "up")
 *   distance   px travelled on entrance (default 20)
 *   once       disconnect after first reveal (default true)
 *   stagger    when set (ms), direct children animate one-after-another
 */
export function Reveal({
  children,
  direction = "up",
  delay = 0,
  y,
  distance = 20,
  once = true,
  stagger,
  className,
}) {
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
          if (once) io.disconnect();
        } else if (!once) {
          setShown(false);
        }
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once]);

  const dist = y != null ? y : distance;

  if (stagger != null) {
    return (
      <div ref={ref} className={className}>
        {Children.map(children, (child, i) => (
          <Box $shown={shown} $dir={direction} $dist={dist} style={{ transitionDelay: `${delay + i * stagger}ms` }}>
            {child}
          </Box>
        ))}
      </div>
    );
  }

  return (
    <Box ref={ref} className={className} $shown={shown} $dir={direction} $dist={dist} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </Box>
  );
}

/** Resting transform for each direction while hidden. */
function hiddenTransform($dir, d) {
  switch ($dir) {
    case "down": return `translateY(-${d}px)`;
    case "left": return `translateX(${d}px)`;
    case "right": return `translateX(-${d}px)`;
    case "scale": return `scale(0.94)`;
    case "up":
    default: return `translateY(${d}px)`;
  }
}

const Box = styled.div`
  opacity: ${({ $shown }) => ($shown ? 1 : 0)};
  transform: ${({ $shown, $dir, $dist }) => ($shown ? "none" : hiddenTransform($dir, $dist))};
  transition: opacity 0.6s ease, transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
  will-change: opacity, transform;
`;

export default Reveal;
