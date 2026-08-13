import { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Link } from "../lib/router";
import { useLang } from "../context/LanguageContext";
import { formatNumber } from "../lib/format";
import { Container } from "./ui/Layout";
import { Button } from "./ui/Button";
import heroImg from "../assets/images/hero.png";

/**
 * Auto-advancing hero banner carousel with a crossfade animation.
 * Slides come from admin Settings; falls back to a single default slide.
 * Pauses on hover/focus and respects prefers-reduced-motion (no auto-advance).
 */
export function HeroCarousel({ slides = [], stats = [] }) {
  const { pickLang, t, lang } = useLang();
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
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  }, []);

  const go = useCallback((n) => setIndex((prev) => (n + list.length) % list.length), [list.length]);

  useEffect(() => {
    if (paused || reduced.current || list.length < 2) return;
    const id = setInterval(() => setIndex((p) => (p + 1) % list.length), 6000);
    return () => clearInterval(id);
  }, [paused, list.length]);

  return (
    <Hero
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      aria-roledescription="carousel"
    >
      {list.map((slide, i) => {
        const title = slide ? pickLang(slide, "title") : t("home.heroTitle");
        const subtitle = slide ? pickLang(slide, "subtitle") : t("home.heroSubtitle");
        const ctaLabel = slide ? pickLang(slide, "ctaLabel") : t("home.ctaAdmissions");
        const ctaLink = slide?.ctaLink || "/admissions";
        return (
          <Slide key={i} $active={i === index} aria-hidden={i !== index}>
            {slide?.videoUrl ? (
              <BgVideo src={slide.videoUrl} autoPlay muted loop playsInline />
            ) : (
              <Bg src={slide?.imageUrl || heroImg} alt="" onError={(e) => { e.currentTarget.src = heroImg; }} />
            )}
            <Fade />
            <Container>
              <Inner>
                <h1>{title}</h1>
                {subtitle && <p>{subtitle}</p>}
                {ctaLabel && (
                  <Button as={Link} to={ctaLink} $variant="primary" $size="lg">
                    {ctaLabel} <ArrowRight size={18} />
                  </Button>
                )}
              </Inner>
            </Container>
          </Slide>
        );
      })}

      {/* Floating stat cards */}
      <HeroStats aria-hidden>
        {heroStats.map((s, i) => (
          <StatCard key={i}>
            <strong>{formatNumber(Number(s.value) || 0, lang)}{s.suffix}</strong>
            <span>{pickLang(s, "label")}</span>
          </StatCard>
        ))}
      </HeroStats>

      {list.length > 1 && (
        <>
          <Arrow $side="left" onClick={() => go(index - 1)} aria-label="Previous slide"><ChevronLeft size={24} /></Arrow>
          <Arrow $side="right" onClick={() => go(index + 1)} aria-label="Next slide"><ChevronRight size={24} /></Arrow>
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
  height: 520px;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.bg};
  ${({ theme }) => theme.media.tablet(`height: 460px;`)}
`;
const Slide = styled.div`
  position: absolute; inset: 0;
  display: flex; align-items: center;
  opacity: ${({ $active }) => ($active ? 1 : 0)};
  transition: opacity 0.8s ease;
  pointer-events: ${({ $active }) => ($active ? "auto" : "none")};
`;
const Bg = styled.img`
  position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.4;
`;
const BgVideo = styled.video`
  position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.45;
`;
const Fade = styled.div`
  position: absolute; inset: 0;
  background: ${({ theme }) => theme.gradients.heroFade};
`;
const Inner = styled.div`
  position: relative; max-width: 620px;
  display: flex; flex-direction: column; gap: ${({ theme }) => theme.space[4]};
  h1 {
    font-size: ${({ theme }) => theme.fontSizes["5xl"]};
    color: ${({ theme }) => theme.colors.primary};
    line-height: ${({ theme }) => theme.lineHeights.tight};
    ${({ theme }) => theme.media.tablet(`font-size: 2.25rem;`)}
  }
  p { color: ${({ theme }) => theme.colors.textBody}; font-size: ${({ theme }) => theme.fontSizes.lg}; max-width: 48ch; }
  a { align-self: flex-start; margin-top: ${({ theme }) => theme.space[2]}; }
`;
const HeroStats = styled.div`
  position: absolute; right: 76px; top: 50%; transform: translateY(-50%);
  display: flex; flex-direction: column; gap: ${({ theme }) => theme.space[3]}; z-index: 3;
  ${({ theme }) => theme.media.desktop(`right: 20px;`)}
  ${({ theme }) => theme.media.laptop(`display: none;`)}
`;
const StatCard = styled.div`
  background: rgba(255,255,255,0.9);
  backdrop-filter: blur(6px);
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-left: 4px solid ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  padding: ${({ theme }) => `${theme.space[3]} ${theme.space[5]}`};
  min-width: 150px;
  strong {
    display: block; font-family: ${({ theme }) => theme.fonts.heading};
    font-size: ${({ theme }) => theme.fontSizes["3xl"]}; color: ${({ theme }) => theme.colors.primary}; line-height: 1;
  }
  span { color: ${({ theme }) => theme.colors.textBody}; font-size: ${({ theme }) => theme.fontSizes.sm}; font-weight: 600; }
`;
const Arrow = styled.button`
  position: absolute; top: 50%; transform: translateY(-50%);
  ${({ $side }) => ($side === "left" ? "left: 16px;" : "right: 16px;")}
  width: 44px; height: 44px; display: grid; place-items: center;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.primary};
  box-shadow: ${({ theme }) => theme.shadows.md};
  z-index: 2;
  &:hover { background: ${({ theme }) => theme.colors.primary}; color: #fff; }
  ${({ theme }) => theme.media.mobile(`display: none;`)}
`;
const Dots = styled.div`
  position: absolute; bottom: 18px; left: 50%; transform: translateX(-50%);
  display: flex; gap: 8px; z-index: 2;
`;
const Dot = styled.button`
  width: ${({ $active }) => ($active ? "26px" : "10px")}; height: 10px;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme, $active }) => ($active ? theme.colors.primary : theme.colors.borderStrong)};
  transition: width ${({ theme }) => theme.transitions.base}, background ${({ theme }) => theme.transitions.base};
`;

export default HeroCarousel;
