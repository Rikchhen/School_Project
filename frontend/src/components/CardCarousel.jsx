import { Children, useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function CardCarousel({ children, ariaLabel, itemWidth = "320px", gap = "20px" }) {
  const trackRef = useRef(null);
  const drag = useRef({ active: false, startX: 0, scrollLeft: 0, moved: false });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [progress, setProgress] = useState(0);

  const update = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const max = Math.max(0, track.scrollWidth - track.clientWidth);
    setCanPrev(track.scrollLeft > 2);
    setCanNext(track.scrollLeft < max - 2);
    setProgress(max ? Math.min(1, Math.max(0, track.scrollLeft / max)) : 0);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;
    const frame = requestAnimationFrame(update);
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(update) : null;
    observer?.observe(track);
    return () => { cancelAnimationFrame(frame); observer?.disconnect(); };
  }, [children, update]);

  const scrollPage = (direction) => {
    const track = trackRef.current;
    track?.scrollBy({ left: direction * Math.max(240, track.clientWidth * 0.88), behavior: "smooth" });
  };
  const pointerDown = (event) => {
    if (event.pointerType === "touch") return;
    const track = trackRef.current;
    drag.current = { active: true, startX: event.clientX, scrollLeft: track.scrollLeft, moved: false };
    track.setPointerCapture(event.pointerId);
  };
  const pointerMove = (event) => {
    if (!drag.current.active) return;
    const delta = event.clientX - drag.current.startX;
    if (Math.abs(delta) > 4) drag.current.moved = true;
    trackRef.current.scrollLeft = drag.current.scrollLeft - delta;
  };
  const pointerUp = (event) => {
    drag.current.active = false;
    if (trackRef.current?.hasPointerCapture(event.pointerId)) trackRef.current.releasePointerCapture(event.pointerId);
  };
  const keyDown = (event) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault(); scrollPage(event.key === "ArrowLeft" ? -1 : 1);
    }
  };

  return (
    <Root role="region" aria-label={ariaLabel} style={{ "--carousel-width": itemWidth, "--carousel-gap": gap }}>
      <Track ref={trackRef} tabIndex={0} onScroll={update} onKeyDown={keyDown}
        onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp}
        onClickCapture={(event) => { if (drag.current.moved) { event.preventDefault(); event.stopPropagation(); drag.current.moved = false; } }}>
        {Children.map(children, (child, index) => (
          <Item tabIndex={0} onFocus={(event) => event.currentTarget.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" })} aria-label={`${index + 1} of ${Children.count(children)}`}>
            {child}
          </Item>
        ))}
      </Track>
      <Arrow $side="left" onClick={() => scrollPage(-1)} disabled={!canPrev} aria-label="Previous cards"><ChevronLeft size={21} /></Arrow>
      <Arrow $side="right" onClick={() => scrollPage(1)} disabled={!canNext} aria-label="Next cards"><ChevronRight size={21} /></Arrow>
      <Progress aria-hidden><span style={{ transform: `scaleX(${canNext || canPrev ? Math.max(.08, progress) : 1})` }} /></Progress>
    </Root>
  );
}

const Root = styled.div`position:relative;min-width:0;padding-bottom:${({theme})=>theme.space[4]};`;
const Track = styled.div`
  display:flex;gap:var(--carousel-gap);overflow-x:auto;overflow-y:hidden;scroll-snap-type:x mandatory;scroll-behavior:smooth;
  padding:6px 3px 16px;cursor:grab;touch-action:pan-x;scrollbar-width:none;&::-webkit-scrollbar{display:none}
  &:active{cursor:grabbing}&:focus-visible{outline:2px solid ${({theme})=>theme.colors.secondary};outline-offset:4px;border-radius:${({theme})=>theme.radii.md}}
  @media(prefers-reduced-motion:reduce){scroll-behavior:auto;}
`;
const Item = styled.div`
  flex:0 0 var(--carousel-width);width:var(--carousel-width);scroll-snap-align:start;min-width:0;
  &:focus-visible{outline:2px solid ${({theme})=>theme.colors.secondary};outline-offset:2px;border-radius:${({theme})=>theme.radii.lg}}
  @media(max-width:640px){flex-basis:min(86vw,320px);width:min(86vw,320px)}
`;
const Arrow = styled.button`
  position:absolute;z-index:3;top:145px;${({$side})=>$side==="left"?"left:-18px":"right:-18px"};width:40px;height:40px;display:grid;place-items:center;
  border-radius:50%;background:${({theme})=>theme.colors.surface};color:${({theme})=>theme.colors.primary};border:1px solid ${({theme})=>theme.colors.border};box-shadow:${({theme})=>theme.shadows.md};
  transition:transform .18s ease,opacity .18s ease;&:hover:not(:disabled){transform:scale(1.08)}&:disabled{opacity:0;pointer-events:none}
  @media(max-width:640px){display:none}@media(prefers-reduced-motion:reduce){transition:none}
`;
const Progress = styled.div`height:3px;background:${({theme})=>theme.colors.border};border-radius:${({theme})=>theme.radii.pill};overflow:hidden;span{display:block;width:100%;height:100%;transform-origin:left;background:${({theme})=>theme.gradients.primary};transition:transform .18s ease}@media(prefers-reduced-motion:reduce){span{transition:none}}`;

export default CardCarousel;
