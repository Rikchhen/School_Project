import { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import { X } from "lucide-react";
import { Link } from "../lib/router";
import { useLang } from "../context/LanguageContext";
import { useSettings } from "../context/SettingsContext";
import { Button } from "./ui/Button";

/**
 * Full-screen interstitial ad / popup for public visitors. Content (poster
 * image OR video and/or text + optional CTA) and how often it shows are set by
 * the admin in Admin → Ad / Popup. Respects the chosen frequency via web
 * storage, plus a per-visitor "Don't show again" that is keyed to the current
 * content — change the ad and it shows again even to those who dismissed it.
 */
const SHOW_DELAY_MS = 700;
const DAY = () => new Date().toISOString().slice(0, 10);

/** Stable short hash of the ad's content, so a new ad invalidates dismissals. */
function contentSignature(i) {
  const raw = [i.imageUrl, i.videoUrl, i.title, i.titleNe, i.body, i.bodyNe, i.ctaLabel, i.ctaLink].join("|");
  let h = 5381;
  for (let k = 0; k < raw.length; k++) h = ((h << 5) + h + raw.charCodeAt(k)) >>> 0;
  return String(h);
}

function isDismissedForever(sig) {
  try { return localStorage.getItem("interstitial_dismissed") === sig; } catch { return false; }
}
function alreadySeen(freq) {
  try {
    if (freq === "always") return false;
    if (freq === "daily") return localStorage.getItem("interstitial_seen_day") === DAY();
    return sessionStorage.getItem("interstitial_seen") === "1"; // "session"
  } catch {
    return false;
  }
}
function markSeen(freq) {
  try {
    if (freq === "daily") localStorage.setItem("interstitial_seen_day", DAY());
    else if (freq !== "always") sessionStorage.setItem("interstitial_seen", "1");
  } catch {
    /* ignore */
  }
}

export function InterstitialAd() {
  const { settings } = useSettings();
  const { pickLang } = useLang();
  const i = settings.interstitial || {};
  const [open, setOpen] = useState(false);
  const [dontShow, setDontShow] = useState(false);

  const title = pickLang(i, "title");
  const body = pickLang(i, "body");
  const ctaLabel = pickLang(i, "ctaLabel");
  const active = !!i.enabled && !!(i.imageUrl || i.videoUrl || title || body);
  const sig = contentSignature(i);

  useEffect(() => {
    if (!active) return;
    const freq = i.frequency || "session";
    if (isDismissedForever(sig) || alreadySeen(freq)) return;
    const id = setTimeout(() => setOpen(true), SHOW_DELAY_MS);
    return () => clearTimeout(id);
  }, [active, i.frequency, sig]);

  if (!active || !open) return null;

  const close = () => {
    if (dontShow) { try { localStorage.setItem("interstitial_dismissed", sig); } catch { /* ignore */ } }
    markSeen(i.frequency || "session");
    setOpen(false);
  };

  const isExternal = i.ctaLink && /^https?:\/\//.test(i.ctaLink);
  const linkProps = isExternal
    ? { as: "a", href: i.ctaLink, target: "_blank", rel: "noopener noreferrer" }
    : { as: Link, to: i.ctaLink };

  const media = i.videoUrl ? (
    <video src={i.videoUrl} autoPlay muted loop playsInline />
  ) : i.imageUrl ? (
    <img src={i.imageUrl} alt={title || "Poster"} />
  ) : null;

  return (
    <Overlay onClick={close} role="dialog" aria-modal="true" aria-label={title || "Announcement"}>
      <Panel onClick={(e) => e.stopPropagation()}>
        <CloseBtn onClick={close} aria-label="Close"><X size={20} /></CloseBtn>

        {media && (
          i.ctaLink ? (
            <PosterLink {...linkProps} onClick={close}>{media}</PosterLink>
          ) : (
            <Poster>{media}</Poster>
          )
        )}

        {(title || body || (ctaLabel && i.ctaLink)) && (
          <Body>
            {title && <h2>{title}</h2>}
            {body && <p>{body}</p>}
            {ctaLabel && i.ctaLink && (
              <Button {...linkProps} $variant="primary" $size="lg" onClick={close}>
                {ctaLabel}
              </Button>
            )}
          </Body>
        )}

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

const fadeIn = keyframes`from { opacity: 0; } to { opacity: 1; }`;
const pop = keyframes`from { opacity: 0; transform: translateY(16px) scale(0.96); } to { opacity: 1; transform: none; }`;

const Overlay = styled.div`
  position: fixed; inset: 0; z-index: ${({ theme }) => theme.zIndex.modal};
  background: ${({ theme }) => theme.colors.overlay};
  display: grid; place-items: center; padding: ${({ theme }) => theme.space[4]};
  animation: ${fadeIn} 0.25s ease;
`;
const Panel = styled.div`
  position: relative;
  width: 100%; max-width: 460px; max-height: 92vh; overflow: hidden auto;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadows.xl};
  animation: ${pop} 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  @media (prefers-reduced-motion: reduce) { animation: none; }
`;
const CloseBtn = styled.button`
  position: absolute; top: 10px; right: 10px; z-index: 2;
  display: grid; place-items: center; width: 36px; height: 36px; border-radius: ${({ theme }) => theme.radii.pill};
  background: rgba(0,0,0,0.45); color: #fff; backdrop-filter: blur(4px);
  &:hover { background: rgba(0,0,0,0.65); }
`;
const Poster = styled.div`
  img, video { display: block; width: 100%; max-height: 62vh; object-fit: contain; background: ${({ theme }) => theme.colors.surfaceAlt}; }
`;
const PosterLink = styled(Poster)`
  cursor: pointer;
`;
const Body = styled.div`
  padding: ${({ theme }) => theme.space[6]} ${({ theme }) => theme.space[6]} ${({ theme }) => theme.space[3]};
  display: flex; flex-direction: column; gap: ${({ theme }) => theme.space[3]}; text-align: center;
  h2 { color: ${({ theme }) => theme.colors.primary}; font-size: ${({ theme }) => theme.fontSizes["2xl"]}; }
  p { color: ${({ theme }) => theme.colors.textBody}; line-height: ${({ theme }) => theme.lineHeights.relaxed}; white-space: pre-wrap; }
  a, button { align-self: center; margin-top: ${({ theme }) => theme.space[2]}; }
`;
const DismissRow = styled.div`
  padding: ${({ theme }) => theme.space[3]} ${({ theme }) => theme.space[6]} ${({ theme }) => theme.space[5]};
  display: flex; justify-content: center;
  label { display: inline-flex; align-items: center; gap: 8px; cursor: pointer;
    color: ${({ theme }) => theme.colors.textMuted}; font-size: ${({ theme }) => theme.fontSizes.sm}; }
  input { width: 16px; height: 16px; accent-color: ${({ theme }) => theme.colors.primary}; cursor: pointer; }
`;

export default InterstitialAd;
