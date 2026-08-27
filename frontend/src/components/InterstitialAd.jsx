import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { motion, useReducedMotion } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "../lib/router";
import { useLang } from "../context/LanguageContext";
import { useSettings } from "../context/SettingsContext";
import { Button } from "./ui/Button";

/**
 * Full-screen interstitial popup — a swipeable multi-slide carousel. Each slide
 * has its own poster image OR video and optional title/body/CTA (Admin →
 * Ad / Popup); falls back to the legacy single-slide fields. A percentage-based
 * translating track (no pixel measurement) gives arrows, dots, pointer-swipe and
 * auto-advance. Keyboard ←/→/Esc; "Don't show again" keyed to content.
 * Reduced-motion safe (instant, no autoplay).
 */
const SHOW_DELAY_MS = 700;
const AUTO_MS = 5000;
const SWIPE_PX = 45;
const DAY = () => new Date().toISOString().slice(0, 10);

function contentSignature(slides) {
  const raw = slides.map((s) => [s.imageUrl, s.videoUrl, s.title, s.titleNe, s.body, s.bodyNe, s.ctaLabel, s.ctaLink].join("|")).join("~");
  let h = 5381;
  for (let k = 0; k < raw.length; k++) h = ((h << 5) + h + raw.charCodeAt(k)) >>> 0;
  return String(h);
}
function isDismissedForever(sig) { try { return localStorage.getItem("interstitial_dismissed") === sig; } catch { return false; } }
function alreadySeen(freq) {
  try {
    if (freq === "always") return false;
    if (freq === "daily") return localStorage.getItem("interstitial_seen_day") === DAY();
    return sessionStorage.getItem("interstitial_seen") === "1";
  } catch { return false; }
}
function markSeen(freq) {
  try {
    if (freq === "daily") localStorage.setItem("interstitial_seen_day", DAY());
    else if (freq !== "always") sessionStorage.setItem("interstitial_seen", "1");
  } catch { /* ignore */ }
}
const hasContent = (s) => !!(s && (s.imageUrl || s.videoUrl || s.title || s.titleNe || s.body || s.bodyNe));

export function InterstitialAd() {
  const { settings } = useSettings();
  const { pickLang } = useLang();
  const reduce = useReducedMotion();
  const i = useMemo(() => settings.interstitial || {}, [settings.interstitial]);

  const slides = useMemo(() => {
    const list = Array.isArray(i.slides) && i.slides.length
      ? i.slides
      : [{ imageUrl: i.imageUrl, videoUrl: i.videoUrl, title: i.title, titleNe: i.titleNe, body: i.body, bodyNe: i.bodyNe, ctaLabel: i.ctaLabel, ctaLabelNe: i.ctaLabelNe, ctaLink: i.ctaLink }];
    return list.filter(hasContent);
  }, [i]);

  const n = slides.length;
  const active = !!i.enabled && n > 0;
  const sig = useMemo(() => contentSignature(slides), [slides]);

  const [open, setOpen] = useState(false);
  const [dontShow, setDontShow] = useState(false);
  const [paused, setPaused] = useState(false);
  const [index, setIndex] = useState(0);
  const startX = useRef(null);

  const paginate = useCallback((d) => setIndex((k) => (n ? (k + d + n) % n : 0)), [n]);

  const close = useCallback(() => {
    if (dontShow) { try { localStorage.setItem("interstitial_dismissed", sig); } catch { /* ignore */ } }
    markSeen(i.frequency || "session");
    setOpen(false);
  }, [dontShow, sig, i.frequency]);

  useEffect(() => {
    if (!active) return;
    const freq = i.frequency || "session";
    if (isDismissedForever(sig) || alreadySeen(freq)) return;
    const id = setTimeout(() => { setIndex(0); setOpen(true); }, SHOW_DELAY_MS);
    return () => clearTimeout(id);
  }, [active, i.frequency, sig]);

  useEffect(() => {
    if (!open || n < 2 || reduce || paused || i.autoAdvance === false) return;
    const id = setInterval(() => setIndex((k) => (k + 1) % n), AUTO_MS);
    return () => clearInterval(id);
  }, [open, n, reduce, paused, i.autoAdvance]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") paginate(1);
      else if (e.key === "ArrowLeft") paginate(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close, paginate]);

  if (!active || !open) return null;

  // Pointer swipe (works for touch + mouse without a drag-physics library).
  const onPointerDown = (e) => { startX.current = e.clientX; setPaused(true); };
  const endSwipe = (e) => {
    setPaused(false);
    if (startX.current == null) return;
    const dx = e.clientX - startX.current;
    startX.current = null;
    if (dx < -SWIPE_PX) paginate(1);
    else if (dx > SWIPE_PX) paginate(-1);
  };

  const activeTitle = pickLang(slides[index] || {}, "title");

  return (
    <Overlay onMouseDown={(e) => e.target === e.currentTarget && close()}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}
      role="dialog" aria-modal="true" aria-label={activeTitle || "Announcement"}>
      <Panel onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
        initial={{ opacity: 0, y: 18, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}>
        <CloseBtn onClick={close} aria-label="Close"><X size={20} /></CloseBtn>

        <Viewport onPointerDown={onPointerDown} onPointerUp={endSwipe} onPointerLeave={() => { startX.current = null; setPaused(false); }}>
          <Track animate={{ x: `${-index * 100}%` }} transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 320, damping: 34 }}>
            {slides.map((sl, k) => {
              const title = pickLang(sl, "title");
              const body = pickLang(sl, "body");
              const ctaLabel = pickLang(sl, "ctaLabel");
              const isExt = sl.ctaLink && /^https?:\/\//.test(sl.ctaLink);
              const linkProps = sl.ctaLink
                ? (isExt ? { as: "a", href: sl.ctaLink, target: "_blank", rel: "noopener noreferrer" } : { as: Link, to: sl.ctaLink })
                : null;
              const media = sl.videoUrl
                ? <video src={sl.videoUrl} autoPlay muted loop playsInline draggable={false} />
                : sl.imageUrl ? <img src={sl.imageUrl} alt={title || "Poster"} draggable={false} /> : null;
              return (
                <SlideItem key={k} $hasMedia={!!media}>
                  {media}
                  {!!media && <Scrim />}
                  {(title || body || (ctaLabel && sl.ctaLink)) && (
                    <Caption $hasMedia={!!media}>
                      {title && <h2>{title}</h2>}
                      {body && <p>{body}</p>}
                      {ctaLabel && sl.ctaLink && (
                        <Button {...linkProps} $variant="primary" $size="md" onClick={close}>
                          {ctaLabel}
                        </Button>
                      )}
                    </Caption>
                  )}
                </SlideItem>
              );
            })}
          </Track>

          {n > 1 && (
            <>
              <Arrow $side="left" onClick={() => paginate(-1)} aria-label="Previous"><ChevronLeft size={20} /></Arrow>
              <Arrow $side="right" onClick={() => paginate(1)} aria-label="Next"><ChevronRight size={20} /></Arrow>
              <Dots>
                {slides.map((_, k) => (
                  <Dot key={k} $active={k === index} onClick={() => setIndex(k)} aria-label={`Go to slide ${k + 1}`} aria-current={k === index} />
                ))}
              </Dots>
            </>
          )}
        </Viewport>

        <DismissRow>
          <label>
            <input type="checkbox" checked={dontShow} onChange={(e) => setDontShow(e.target.checked)} />
            Don&apos;t show this again
          </label>
        </DismissRow>
      </Panel>
    </Overlay>
  );
}

const Overlay = styled(motion.div)`
  position: fixed; inset: 0; z-index: ${({ theme }) => theme.zIndex.modal};
  background: ${({ theme }) => theme.colors.overlay};
  display: grid; place-items: center; padding: ${({ theme }) => theme.space[4]};
`;
const Panel = styled(motion.div)`
  position: relative; width: min(440px, calc(100vw - 2rem));
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadows.xl};
  overflow: hidden;
`;
const CloseBtn = styled.button`
  position: absolute; top: 10px; right: 10px; z-index: 5;
  display: grid; place-items: center; width: 38px; height: 38px; border-radius: ${({ theme }) => theme.radii.pill};
  background: rgba(0,0,0,0.5); color: #fff; backdrop-filter: blur(4px);
  &:hover { background: rgba(0,0,0,0.72); }
`;
const Viewport = styled.div`
  position: relative; width: 100%; aspect-ratio: 4 / 5; max-height: 68vh; overflow: hidden;
  background: ${({ theme }) => theme.colors.surfaceAlt}; touch-action: pan-y;
`;
const Track = styled(motion.div)`
  display: flex; width: 100%; height: 100%; will-change: transform;
`;
const SlideItem = styled.div`
  position: relative; flex: 0 0 100%; width: 100%; height: 100%;
  display: flex; flex-direction: column; justify-content: flex-end;
  ${({ $hasMedia, theme }) => !$hasMedia && `background: ${theme.gradients.primary}; justify-content: center; text-align: center;`}
  img, video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; user-select: none; -webkit-user-drag: none; pointer-events: none; }
`;
const Scrim = styled.div`
  position: absolute; inset: 0; pointer-events: none;
  background: linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.72) 100%);
`;
const Caption = styled.div`
  position: relative; z-index: 2; padding: ${({ theme }) => theme.space[6]};
  display: flex; flex-direction: column; gap: ${({ theme }) => theme.space[3]};
  ${({ $hasMedia }) => !$hasMedia && `align-items: center;`}
  h2 { font-size: ${({ theme }) => theme.fontSizes["2xl"]}; line-height: 1.2; color: #fff; text-shadow: 0 2px 12px rgba(0,0,0,.45); }
  p { font-size: ${({ theme }) => theme.fontSizes.md}; line-height: 1.5; color: rgba(255,255,255,.94); text-shadow: 0 1px 10px rgba(0,0,0,.45);
      white-space: pre-wrap; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; }
  a, button { align-self: ${({ $hasMedia }) => ($hasMedia ? "flex-start" : "center")}; margin-top: 4px; }
`;
const Arrow = styled.button`
  position: absolute; top: 50%; transform: translateY(-50%); z-index: 4;
  ${({ $side }) => ($side === "left" ? "left: 10px;" : "right: 10px;")}
  display: grid; place-items: center; width: 38px; height: 38px; border-radius: ${({ theme }) => theme.radii.pill};
  background: rgba(255,255,255,0.85); color: ${({ theme }) => theme.colors.primary}; box-shadow: ${({ theme }) => theme.shadows.md};
  &:hover { background: #fff; }
`;
const Dots = styled.div`
  position: absolute; left: 50%; bottom: 12px; transform: translateX(-50%); z-index: 4; display: flex; gap: 7px;
`;
const Dot = styled.button`
  width: ${({ $active }) => ($active ? "22px" : "8px")}; height: 8px; border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ $active }) => ($active ? "#fff" : "rgba(255,255,255,0.55)")}; box-shadow: 0 1px 4px rgba(0,0,0,.3);
  transition: width ${({ theme }) => theme.transitions.base}, background ${({ theme }) => theme.transitions.base};
`;
const DismissRow = styled.div`
  padding: ${({ theme }) => theme.space[3]} ${({ theme }) => theme.space[6]} ${({ theme }) => theme.space[4]};
  display: flex; justify-content: center;
  label { display: inline-flex; align-items: center; gap: 8px; cursor: pointer; color: ${({ theme }) => theme.colors.textMuted}; font-size: ${({ theme }) => theme.fontSizes.sm}; }
  input { width: 16px; height: 16px; accent-color: ${({ theme }) => theme.colors.primary}; cursor: pointer; }
`;

export default InterstitialAd;
