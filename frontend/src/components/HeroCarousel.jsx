import { useCallback, useEffect, useState } from "react";
import styled, { keyframes, css } from "styled-components";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { useLang } from "../context/LanguageContext";
import { useSettings } from "../context/SettingsContext";
import { formatNumber } from "../lib/format";
import { kenBurns, scrollCue } from "../styles/animations";
import heroImg from "../assets/images/hero.png";

/**
 * Auto-advancing hero banner carousel.
 * - Crossfade between slides (framer AnimatePresence).
 * - Ken Burns zoom on the background photo; image opacity is admin-controlled
 *   (Settings → Hero image opacity), default fully opaque.
 * - Image/video only — no text overlay; floating stat cards idle-float and animate in.
 * Slides come from admin Settings; falls back to a single default slide.
 * Pauses on hover/focus and respects prefers-reduced-motion.
 */
export function HeroCarousel({ slides = [], stats = [] }) {
  const { pickLang, lang } = useLang();
  const { settings } = useSettings();
  const heroOpacity = typeof settings.heroOpacity === "number" ? settings.heroOpacity : 1;
  const reduce = useReducedMotion();
  const heroStats = (stats.length
    ? stats
    : [
        { value: 1200, suffix: "+", label: "Students" },
        { value: 95, suffix: "%", label: "Pass Rate" },
        { value: 50, suffix: "+", label: "Years" },
      ]
  ).slice(0, 3);
  const list = slides.length ? slides : [null]; // null => default slide
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback((n) => setIndex((prev) => (n + list.length) % list.length), [list.length]);

  useEffect(() => {
    if (paused || reduce || list.length < 2) return;
    const id = setInterval(() => setIndex((p) => (p + 1) % list.length), 6000);
    return () => clearInterval(id);
  }, [paused, reduce, list.length]);

  const slide = list[index];

  return (
    <Hero
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      aria-roledescription="carousel"
    >
      {/* Background media crossfade */}
      <AnimatePresence initial={false} mode="popLayout">
        <BgLayer
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: "easeInOut" }}
          aria-hidden
        >
          {slide?.videoUrl ? (
            <BgVideo src={slide.videoUrl} autoPlay muted loop playsInline $opacity={heroOpacity} />
          ) : (
            <Bg $ken={!reduce} $opacity={heroOpacity} src={slide?.imageUrl || heroImg} alt="" onError={(e) => { e.currentTarget.src = heroImg; }} />
          )}
        </BgLayer>
      </AnimatePresence>

      {/* Floating stat cards */}
      <HeroStats aria-hidden>
        {heroStats.map((s, i) => (
          <StatCard
            key={i}
            initial={{ opacity: 0, x: 40, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ delay: 0.5 + i * 0.14, type: "spring", stiffness: 120, damping: 15 }}
            whileHover={{ y: -6, scale: 1.04 }}
            $float={!reduce}
            style={{ animationDelay: `${i * 0.6}s` }}
          >
            <strong>{formatNumber(Number(s.value) || 0, lang)}{s.suffix}</strong>
            <span>{pickLang(s, "label")}</span>
          </StatCard>
        ))}
      </HeroStats>

      {/* Scroll cue (only when no dots occupy the bottom-centre) */}
      {list.length === 1 && (
        <ScrollCue aria-hidden $show={!reduce}>
          <ChevronDown size={22} />
        </ScrollCue>
      )}

      {list.length > 1 && (
        <>
          <Arrow as={motion.button} $side="left" onClick={() => go(index - 1)} aria-label="Previous slide" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }}><ChevronLeft size={24} /></Arrow>
          <Arrow as={motion.button} $side="right" onClick={() => go(index + 1)} aria-label="Next slide" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }}><ChevronRight size={24} /></Arrow>
          <Dots role="tablist">
            {list.map((_, i) => (
              <Dot key={i} $active={i === index} onClick={() => setIndex(i)} aria-label={`Go to slide ${i + 1}`} aria-selected={i === index} />
            ))}
          </Dots>
        </>
      )}
    </Hero>
  );
}

const Hero = styled.section`
  position: relative;
  height: 560px;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.bg};
  ${({ theme }) => theme.media.tablet(`height: 480px;`)}
`;

const BgLayer = styled(motion.div)`position: absolute; inset: 0; z-index: 0;`;
const Bg = styled.img`
  position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;
  opacity: ${({ $opacity }) => ($opacity ?? 1)};
  ${({ $ken }) => $ken && css`animation: ${kenBurns} 24s ease-in-out infinite;`}
  will-change: transform;
`;
const BgVideo = styled.video`
  position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;
  opacity: ${({ $opacity }) => ($opacity ?? 1)};
`;
const HeroStats = styled.div`
  position: absolute; right: 76px; top: 50%; transform: translateY(-50%);
  display: flex; flex-direction: column; gap: ${({ theme }) => theme.space[3]}; z-index: 3;
  ${({ theme }) => theme.media.desktop(`right: 20px;`)}
  ${({ theme }) => theme.media.laptop(`display: none;`)}
`;
const idleFloat = keyframes`0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}`;
const StatCard = styled(motion.div)`
  background: ${({ theme }) => (theme.mode === "dark" ? "rgba(24,31,41,0.82)" : "rgba(255,255,255,0.85)")};
  backdrop-filter: blur(8px) saturate(140%);
  -webkit-backdrop-filter: blur(8px) saturate(140%);
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-left: 4px solid ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  padding: ${({ theme }) => `${theme.space[3]} ${theme.space[5]}`};
  min-width: 150px;
  ${({ $float }) => $float && css`animation: ${idleFloat} 4.5s ease-in-out infinite;`}
  strong {
    display: block; font-family: ${({ theme }) => theme.fonts.heading};
    font-size: ${({ theme }) => theme.fontSizes["3xl"]}; color: ${({ theme }) => theme.colors.primary}; line-height: 1;
  }
  span { color: ${({ theme }) => theme.colors.textBody}; font-size: ${({ theme }) => theme.fontSizes.sm}; font-weight: 600; }
`;

const ScrollCue = styled.div`
  position: absolute; bottom: 16px; left: 50%; transform: translateX(-50%); z-index: 3;
  color: ${({ theme }) => theme.colors.primary}; opacity: 0.85;
  ${({ $show }) => $show && css`animation: ${scrollCue} 1.8s ease-in-out infinite;`}
  ${({ theme }) => theme.media.tablet(`display: none;`)}
`;

const Arrow = styled.button`
  position: absolute; top: 50%; transform: translateY(-50%); z-index: 4;
  ${({ $side }) => ($side === "left" ? "left: 16px;" : "right: 16px;")}
  width: 44px; height: 44px; display: grid; place-items: center;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.primary};
  box-shadow: ${({ theme }) => theme.shadows.md};
  &:hover { background: ${({ theme }) => theme.colors.primary}; color: #fff; }
  ${({ theme }) => theme.media.mobile(`display: none;`)}
`;
const Dots = styled.div`
  position: absolute; bottom: 18px; left: 50%; transform: translateX(-50%);
  display: flex; gap: 8px; z-index: 4;
`;
const Dot = styled.button`
  width: ${({ $active }) => ($active ? "26px" : "10px")}; height: 10px;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme, $active }) => ($active ? theme.colors.primary : theme.colors.borderStrong)};
  transition: width ${({ theme }) => theme.transitions.base}, background ${({ theme }) => theme.transitions.base};
`;

export default HeroCarousel;
