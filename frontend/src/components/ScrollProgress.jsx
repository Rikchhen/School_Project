import { motion, useScroll, useSpring } from "framer-motion";
import styled from "styled-components";

/**
 * Thin brand-gradient bar pinned to the very top that tracks reading progress.
 * Uses a spring so it eases rather than jumps. Reduced motion is handled by
 * MotionConfig (the spring resolves instantly) — the bar still reflects position.
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });
  return <Bar aria-hidden style={{ scaleX }} />;
}

const Bar = styled(motion.div)`
  position: fixed; top: 0; left: 0; right: 0; height: 3px;
  transform-origin: 0 50%;
  background: ${({ theme }) => theme.gradients.primary};
  z-index: ${({ theme }) => theme.zIndex.toast + 2};
  pointer-events: none;
`;

export default ScrollProgress;
