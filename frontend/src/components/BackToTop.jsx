import { useEffect, useState } from "react";
import styled from "styled-components";
import { ArrowUp } from "lucide-react";

/**
 * Floating "back to top" button that fades in after scrolling, plus a slim
 * scroll-progress bar pinned to the top of the viewport.
 */
export function BackToTop() {
  const [progress, setProgress] = useState(0);
  const [show, setShow] = useState(false);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const el = document.documentElement;
        const max = el.scrollHeight - el.clientHeight;
        const y = el.scrollTop || window.scrollY;
        setProgress(max > 0 ? (y / max) * 100 : 0);
        setShow(y > 500);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toTop = () => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <>
      <Progress className="no-print" style={{ transform: `scaleX(${progress / 100})` }} aria-hidden />
      <Btn className="no-print" $show={show} onClick={toTop} aria-label="Back to top" tabIndex={show ? 0 : -1}>
        <ArrowUp size={20} />
      </Btn>
    </>
  );
}

const Progress = styled.div`
  position: fixed; top: 0; left: 0; right: 0; height: 3px;
  transform-origin: left; z-index: ${({ theme }) => theme.zIndex.toast};
  background: ${({ theme }) => theme.colors.primary};
`;
const Btn = styled.button`
  position: fixed; right: 20px; bottom: 88px; z-index: ${({ theme }) => theme.zIndex.toast - 1};
  width: 46px; height: 46px; border-radius: ${({ theme }) => theme.radii.pill};
  display: grid; place-items: center;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.primary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  transition: opacity ${({ theme }) => theme.transitions.base}, transform ${({ theme }) => theme.transitions.base};
  opacity: ${({ $show }) => ($show ? 1 : 0)};
  transform: translateY(${({ $show }) => ($show ? "0" : "12px")});
  pointer-events: ${({ $show }) => ($show ? "auto" : "none")};
  &:hover { transform: translateY(-2px); background: ${({ theme }) => theme.colors.primary}; color: #fff; }
  ${({ theme }) => theme.media.tablet(`bottom: 74px;`)} /* sit above the mobile action bar */
`;

export default BackToTop;
