import { useCallback, useEffect } from "react";
import styled from "styled-components";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { SmartImage } from "./SmartImage";

/**
 * Accessible image lightbox. Controlled via `index` (null = closed).
 * Supports Esc to close and arrow keys to navigate.
 */
export function Lightbox({ items = [], index, onClose, onNavigate }) {
  const open = index != null && index >= 0 && index < items.length;

  const go = useCallback(
    (delta) => {
      if (!open) return;
      const next = (index + delta + items.length) % items.length;
      onNavigate?.(next);
    },
    [open, index, items.length, onNavigate]
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, go, onClose]);

  if (!open) return null;
  const item = items[index];

  return (
    <Overlay onClick={onClose} role="dialog" aria-modal="true" aria-label={item.title || "Image"}>
      <Close onClick={onClose} aria-label="Close"><X size={24} /></Close>
      {items.length > 1 && (
        <Nav $side="left" onClick={(e) => { e.stopPropagation(); go(-1); }} aria-label="Previous">
          <ChevronLeft size={28} />
        </Nav>
      )}
      <Figure onClick={(e) => e.stopPropagation()}>
        <SmartImage src={item.imageUrl} alt={item.title || ""} height="70vh" fit="contain" />
        {(item.title || item.caption) && (
          <Caption>
            {item.title && <strong>{item.title}</strong>}
            {item.caption && <span>{item.caption}</span>}
          </Caption>
        )}
      </Figure>
      {items.length > 1 && (
        <Nav $side="right" onClick={(e) => { e.stopPropagation(); go(1); }} aria-label="Next">
          <ChevronRight size={28} />
        </Nav>
      )}
    </Overlay>
  );
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: ${({ theme }) => theme.zIndex.modal};
  background: rgba(10, 12, 20, 0.9);
  display: grid;
  place-items: center;
  padding: 3rem 1rem;
`;

const Figure = styled.figure`
  max-width: min(1000px, 92vw);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  img { border-radius: ${({ theme }) => theme.radii.md}; }
`;

const Caption = styled.figcaption`
  color: #fff;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  strong { font-size: 1.05rem; }
  span { color: rgba(255,255,255,0.75); font-size: 0.9rem; }
`;

const Close = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  color: #fff;
  padding: 0.5rem;
  border-radius: ${({ theme }) => theme.radii.pill};
  &:hover { background: rgba(255,255,255,0.15); }
`;

const Nav = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  ${({ $side }) => ($side === "left" ? "left: 1rem;" : "right: 1rem;")}
  color: #fff;
  padding: 0.5rem;
  border-radius: ${({ theme }) => theme.radii.pill};
  &:hover { background: rgba(255,255,255,0.15); }
`;

export default Lightbox;
