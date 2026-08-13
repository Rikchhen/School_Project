import { useState } from "react";
import styled from "styled-components";
import { Megaphone, ArrowRight, X } from "lucide-react";
import { Link } from "../lib/router";
import { useLang } from "../context/LanguageContext";
import { useSettings } from "../context/SettingsContext";

/**
 * Slim, dismissible announcement/top bar for important notices
 * (e.g. "Admissions open"). Content is admin-editable via Settings.
 */
export function AnnouncementBar() {
  const { settings } = useSettings();
  const { pickLang } = useLang();
  const [closed, setClosed] = useState(false);
  const a = settings.announcement;

  if (!a || !a.enabled || closed) return null;
  const text = pickLang(a, "text");
  if (!text) return null;
  const label = pickLang(a, "linkLabel");

  return (
    <Bar>
      <Inner>
        <Msg>
          <Megaphone size={15} aria-hidden />
          <span>{text}</span>
        </Msg>
        {a.link && label && (
          <Cta as={Link} to={a.link}>
            {label} <ArrowRight size={14} />
          </Cta>
        )}
        <Close onClick={() => setClosed(true)} aria-label="Dismiss announcement">
          <X size={15} />
        </Close>
      </Inner>
    </Bar>
  );
}

const Bar = styled.div`
  background: ${({ theme }) => theme.gradients.brandBanner};
  color: #fff;
`;
const Inner = styled.div`
  max-width: ${({ theme }) => theme.layout.maxWidth};
  margin-inline: auto;
  padding: 7px ${({ theme }) => theme.space[6]};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space[3]};
  ${({ theme }) => theme.media.tablet(`padding-inline: 1rem;`)}
`;
const Msg = styled.div`
  display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  svg { flex-shrink: 0; }
  span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
`;
const Cta = styled(Link)`
  display: inline-flex; align-items: center; gap: 5px; flex-shrink: 0;
  background: rgba(255,255,255,0.16);
  padding: 3px 12px; border-radius: ${({ theme }) => theme.radii.pill};
  font-size: ${({ theme }) => theme.fontSizes.xs}; font-weight: 700;
  &:hover { background: rgba(255,255,255,0.28); }
  ${({ theme }) => theme.media.mobile(`display: none;`)}
`;
const Close = styled.button`
  color: rgba(255,255,255,0.85); display: grid; place-items: center; flex-shrink: 0;
  &:hover { color: #fff; }
`;

export default AnnouncementBar;
