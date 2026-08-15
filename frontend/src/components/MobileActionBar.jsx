import styled from "styled-components";
import { GraduationCap, Phone, MessageSquare } from "lucide-react";
import { Link } from "../lib/router";
import { useLang } from "../context/LanguageContext";
import { useSettings } from "../context/SettingsContext";

/**
 * App-like sticky action bar on phones (Apply / Call / Enquire).
 * Hidden on tablet and up. Marked no-print.
 */
export function MobileActionBar() {
  const { t } = useLang();
  const { settings } = useSettings();
  const phone = settings.contact?.phone || t("contact.phone");

  return (
    <Bar className="no-print" aria-label="Quick actions">
      <Action as={Link} to="/admissions">
        <GraduationCap size={18} /> <span>{t("nav.applyNow")}</span>
      </Action>
      <Action as="a" href={`tel:${phone}`}>
        <Phone size={18} /> <span>{t("contact.title")}</span>
      </Action>
      <Action as={Link} to="/contact">
        <MessageSquare size={18} /> <span>{t("nav.enquire")}</span>
      </Action>
    </Bar>
  );
}

const Bar = styled.nav`
  display: none;
  ${({ theme }) => theme.media.tablet(`
    display: grid; grid-template-columns: repeat(3, 1fr);
    position: fixed; left: 0; right: 0; bottom: 0; z-index: ${theme.zIndex.header};
    background: ${theme.colors.surface};
    border-top: 1px solid ${theme.colors.border};
    box-shadow: 0 -4px 12px rgba(0,0,0,0.08);
    padding-bottom: env(safe-area-inset-bottom, 0);
  `)}
`;
const Action = styled(Link)`
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px;
  padding: 9px 4px; color: ${({ theme }) => theme.colors.text};
  font-size: 0.72rem; font-weight: 600;
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  &:last-child { border-right: none; }
  &:active { background: ${({ theme }) => theme.colors.surfaceAlt}; }
  svg { color: ${({ theme }) => theme.colors.primary}; }
  span { white-space: nowrap; }
`;

export default MobileActionBar;
