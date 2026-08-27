import { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import { Menu, X, Globe, Phone, Mail, MapPin, GraduationCap, ChevronDown } from "lucide-react";
import { FaFacebookF, FaInstagram, FaYoutube, FaXTwitter, FaTiktok, FaLinkedinIn, FaWhatsapp } from "react-icons/fa6";
import { Link, useRouter } from "../lib/router";
import { useLang } from "../context/LanguageContext";
import { useSettings } from "../context/SettingsContext";
import { Container } from "../components/ui/Layout";
import { AnnouncementBar } from "../components/AnnouncementBar";
import { AdmissionAssistant } from "../components/AdmissionAssistant";
import { ThemeToggle } from "../components/ThemeToggle";
import { BackToTop } from "../components/BackToTop";
import { ScrollProgress } from "../components/ScrollProgress";
import { MobileActionBar } from "../components/MobileActionBar";
import { InterstitialAd } from "../components/InterstitialAd";
import { RichText } from "../components/RichText";
import { assetUrl } from "../lib/api";
import logo from "../assets/images/logo.png";

const DEFAULT_NAVIGATION = [
  { label: "Home", labelNe: "गृह", url: "/", children: [] },
  { label: "About", labelNe: "हाम्रो बारेमा", children: [
    { label: "About", labelNe: "हाम्रो बारेमा", url: "/about" }, { label: "Committee", labelNe: "समिति", url: "/committee" }, { label: "Faculty", labelNe: "शिक्षक", url: "/faculty" },
  ] },
  { label: "Academic", labelNe: "शैक्षिक", children: [
    { label: "Academic", labelNe: "शैक्षिक", url: "/academic" }, { label: "Syllabus", labelNe: "पाठ्यक्रम", url: "/syllabus" },
  ] },
  { label: "Admissions", labelNe: "भर्ना", url: "/admissions", children: [] },
  { label: "Media", labelNe: "मिडिया", children: [
    { label: "Gallery", labelNe: "ग्यालरी", url: "/gallery" }, { label: "Notice Board", labelNe: "सूचना पाटी", url: "/notices" }, { label: "News & Events", labelNe: "खबर र कार्यक्रम", url: "/events" },
  ] },
  { label: "Contact", labelNe: "सम्पर्क", url: "/contact", children: [] },
];

const SOCIAL_ICONS = {
  facebook: FaFacebookF, instagram: FaInstagram, youtube: FaYoutube,
  twitter: FaXTwitter, tiktok: FaTiktok, linkedin: FaLinkedinIn, whatsapp: FaWhatsapp,
};

export function PublicLayout({ children }) {
  const { t, toggleLang, lang, pickLang } = useLang();
  const { path } = useRouter();
  const { settings } = useSettings();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setScrolled(window.scrollY > 28));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", update); };
  }, []);

  const socials = Object.entries(settings.socials || {}).filter(([, url]) => url);
  const contact = settings.contact || {};
  const cPhone = contact.phone || t("contact.phone");
  const cEmail = contact.email || t("contact.email");
  const cAddress = pickLang(contact, "address") || t("contact.address");
  const cHours = pickLang(contact, "hours") || t("contact.hours");
  const ne = lang === "ne";
  const isActive = (to) => (to === "/" ? path === "/" : path.startsWith(to));
  const navigation = settings.navigation?.length ? settings.navigation : DEFAULT_NAVIGATION;
  const branding = settings.branding || {};
  const brandLogo = branding.logoUrl ? assetUrl(branding.logoUrl) : logo;
  const brandLogoHeight = Math.min(96, Math.max(40, Number(branding.logoHeight) || 64));
  const brandName = pickLang(branding, "schoolName");
  const brandTagline = pickLang(branding, "tagline");

  const LangBtn = (
    <LangButton onClick={toggleLang} aria-label="Toggle language">
      <Globe size={15} /> {t("common.langToggle")}
    </LangButton>
  );

  return (
    <Shell>
      <a href="#main-content" className="skip-link">Skip to content</a>
      <ScrollProgress />

      {/* Announcement / top bar */}
      <AnnouncementBar />

      {/* Utility bar */}
      <TopBar className="no-print">
        <Container>
          <TopRow>
            <TopInfo>
              <a href={`tel:${cPhone}`}><Phone size={13} /> {cPhone}</a>
              <a href={`mailto:${cEmail}`}><Mail size={13} /> {cEmail}</a>
            </TopInfo>
            <TopRight>
              {socials.length > 0 && (
                <TopSocials>
                  {socials.map(([name, url]) => {
                    const Icon = SOCIAL_ICONS[name];
                    return Icon ? <a key={name} href={url} target="_blank" rel="noopener noreferrer" aria-label={name}><Icon /></a> : null;
                  })}
                </TopSocials>
              )}
              <ThemeToggle variant="onDark" />
              {LangBtn}
            </TopRight>
          </TopRow>
        </Container>
      </TopBar>

      {/* Main header */}
      <Header $scrolled={scrolled}>
        <Container>
          <HeaderRow $logoHeight={brandLogoHeight} $scrolled={scrolled}>
            <Brand to="/" onClick={() => setMenuOpen(false)} $scrolled={scrolled}>
              <LogoRing $height={brandLogoHeight} $ring={branding.showLogoRing} $scrolled={scrolled}><img src={brandLogo} alt="" /></LogoRing>
              <BrandText $ne={ne}>
                {brandName ? <BrandName html={brandName} /> : <strong lang={ne ? "ne" : undefined}>{t("common.schoolName")}</strong>}
                {brandTagline ? <BrandTagline html={brandTagline} /> : <span>{ne ? "लालगढ, धनुषा" : "Lalgadh, Dhanusha · Est. 2029 BS"}</span>}
              </BrandText>
            </Brand>

            <RightCluster>
              <Nav $open={menuOpen}>
                {navigation.map((item, index) =>
                  item.children?.length ? (
                    <Drop key={`${item.label}-${index}`}>
                      <DropBtn type="button" aria-haspopup="menu">
                        {pickLang(item, "label")} <ChevronDown size={15} />
                      </DropBtn>
                      <DropMenu role="menu">
                        {item.children.map((child, childIndex) => (
                          <DropLink role="menuitem" key={`${child.label}-${childIndex}`}
                            {...(child.external ? { as: "a", href: child.url, target: "_blank", rel: "noopener noreferrer" } : { to: child.url })}
                            $active={!child.external && isActive(child.url)} onClick={() => setMenuOpen(false)}>
                            {pickLang(child, "label")}
                          </DropLink>
                        ))}
                      </DropMenu>
                    </Drop>
                  ) : (
                    <NavLink key={`${item.label}-${index}`}
                      {...(item.external ? { as: "a", href: item.url, target: "_blank", rel: "noopener noreferrer" } : { to: item.url })}
                      $active={!item.external && isActive(item.url)} onClick={() => setMenuOpen(false)}>
                      {pickLang(item, "label")}
                    </NavLink>
                  )
                )}
                {settings.donationEnabled && (
                  <NavLink to="/donation" $active={isActive("/donation")} onClick={() => setMenuOpen(false)}>
                    {t("nav.donation")}
                  </NavLink>
                )}
                <MobileLang onClick={() => { toggleLang(); }}>
                  <Globe size={16} /> {t("common.langToggle")}
                </MobileLang>
                <MobileTheme><ThemeToggle variant="surface" withLabel /></MobileTheme>
              </Nav>
              <ApplyBtn to="/admissions"><GraduationCap size={16} /> {t("nav.applyNow")}</ApplyBtn>
              <Hamburger onClick={() => setMenuOpen((o) => !o)} aria-label="Menu" aria-expanded={menuOpen}>
                {menuOpen ? <X size={22} /> : <Menu size={22} />}
              </Hamburger>
            </RightCluster>
          </HeaderRow>
        </Container>
      </Header>

      <Main id="main-content">
        <PageFade key={path}>{children}</PageFade>
      </Main>

      {/* Footer */}
      <Footer>
        <FooterTop>
          <Container>
            <FooterGrid>
              <FCol>
                <FBrand>
                  <img src={logo} alt="" width={44} height={44} />
                  <strong lang={ne ? "ne" : undefined}>{t("common.schoolName")}</strong>
                </FBrand>
                <FooterTag>{t("footer.tagline")}</FooterTag>
                {socials.length > 0 && (
                  <Socials>
                    {socials.map(([name, url]) => {
                      const Icon = SOCIAL_ICONS[name];
                      return Icon ? <a key={name} href={url} target="_blank" rel="noopener noreferrer" aria-label={name}><Icon /></a> : null;
                    })}
                  </Socials>
                )}
              </FCol>

              <FCol>
                <h4>{t("footer.quickLinks")}</h4>
                <Link to="/about">{t("nav.about")}</Link>
                <Link to="/academic">{t("nav.academic")}</Link>
                <Link to="/syllabus">{t("nav.syllabus")}</Link>
                <Link to="/admissions">{t("nav.admissions")}</Link>
                <Link to="/faculty">{t("nav.faculty")}</Link>
                <Link to="/committee">{t("nav.committee")}</Link>
              </FCol>

              <FCol>
                <h4>{t("nav.notices")}</h4>
                <Link to="/notices">{t("footer.results")}</Link>
                <Link to="/notices">{t("footer.downloads")}</Link>
                <Link to="/events">{t("footer.academicCalendar")}</Link>
                <Link to="/gallery">{t("nav.gallery")}</Link>
                {settings.donationEnabled && <Link to="/donation">{t("nav.donation")}</Link>}
              </FCol>

              <FCol>
                <h4>{t("footer.contactUs")}</h4>
                <FContact><MapPin size={16} /> <span>{cAddress}</span></FContact>
                <FContact><Phone size={16} /> <a href={`tel:${cPhone}`}>{cPhone}</a></FContact>
                <FContact><Mail size={16} /> <a href={`mailto:${cEmail}`}>{cEmail}</a></FContact>
                <FContact><span style={{ opacity: 0.7 }}>{cHours}</span></FContact>
              </FCol>
            </FooterGrid>
          </Container>
        </FooterTop>
        <FooterBarWrap>
          <Container>
            <FooterBar>{t("footer.rights")}</FooterBar>
          </Container>
        </FooterBarWrap>
      </Footer>

      {/* Floating admission assistant + back-to-top + mobile action bar */}
      <AdmissionAssistant />
      <BackToTop />
      <MobileActionBar />
      <InterstitialAd />
    </Shell>
  );
}

const Shell = styled.div`display: flex; flex-direction: column; min-height: 100vh;`;

/* ---------- Utility top bar ---------- */
const TopBar = styled.div`
  background: ${({ theme }) => theme.colors.secondaryDark};
  color: #fff;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  ${({ theme }) => theme.media.tablet(`display: none;`)}
`;
const TopRow = styled.div`
  display: flex; align-items: center; justify-content: space-between; height: 38px;
`;
const TopInfo = styled.div`
  display: flex; gap: ${({ theme }) => theme.space[5]};
  a { display: inline-flex; align-items: center; gap: 6px; color: rgba(255,255,255,0.85); }
  a:hover { color: #fff; }
`;
const TopRight = styled.div`display: flex; align-items: center; gap: ${({ theme }) => theme.space[4]};`;
const TopSocials = styled.div`
  display: flex; gap: ${({ theme }) => theme.space[3]};
  a { color: rgba(255,255,255,0.85); display: grid; place-items: center; }
  a:hover { color: #fff; }
`;

/* ---------- Main header ---------- */
const Header = styled.header`
  position: sticky; top: 0; z-index: ${({ theme }) => theme.zIndex.header};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: ${({ theme, $scrolled }) => ($scrolled ? theme.shadows.lg : theme.shadows.sm)};
  border-bottom: 2px solid ${({ theme }) => theme.colors.primary};
  transition: box-shadow ${({ theme }) => theme.transitions.base}, background-color ${({ theme }) => theme.transitions.base};
`;
const HeaderRow = styled.div`
  min-height: ${({ theme, $logoHeight }) => `max(${theme.layout.navHeight}, ${$logoHeight + 16}px)`};
  padding-block: 8px;
  display: flex; align-items: center; justify-content: space-between; gap: ${({ theme }) => theme.space[4]};
  transition: padding ${({ theme }) => theme.transitions.base};
  ${({ $scrolled }) => $scrolled && "padding-block: 4px;"}
  ${({ theme }) => theme.media.mobile(`min-height: ${theme.layout.navHeight}; padding-block: 6px;`)}
`;
const Brand = styled(Link)`display: flex; align-items: center; gap: ${({ theme }) => theme.space[3]}; min-width: 0; transform-origin:left center; transition:transform ${({theme})=>theme.transitions.base}; ${({$scrolled})=>$scrolled&&"transform:scale(.94);"}`;
const LogoRing = styled.div`
  height: ${({ $height }) => `${$height}px`}; width: max-content; max-width: 150px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center; padding: ${({ $ring }) => ($ring ? "4px" : "0")};
  border-radius: ${({ $ring, theme }) => ($ring ? theme.radii.pill : "0")};
  background: ${({ $ring, theme }) => ($ring ? theme.colors.primarySoft : "transparent")};
  border: 1px solid ${({ $ring, theme }) => ($ring ? theme.colors.primary : "transparent")};
  img { display: block; width: auto; height: 100%; max-width: 100%; max-height: 100%; object-fit: contain; object-position: center; border-radius: ${({ $ring, theme }) => ($ring ? theme.radii.pill : "0")}; }
  ${({ theme }) => theme.media.mobile(`height: 54px; max-width: 78px;`)}
  transition: transform ${({ theme }) => theme.transitions.base};
  ${({ $scrolled }) => $scrolled && "transform: scale(.92);"}
`;
const BrandText = styled.div`
  display: flex; flex-direction: column; line-height: 1.2; min-width: 0;
  strong {
    font-family: ${({ theme }) => theme.fonts.heading};
    color: ${({ theme }) => theme.colors.primary};
    font-size: ${({ theme }) => theme.fontSizes.lg};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    overflow-wrap: anywhere;
  }
  span { color: ${({ theme }) => theme.colors.textMuted}; font-size: ${({ theme }) => theme.fontSizes.xs}; }
  ${({ theme }) => theme.media.mobile(`strong { font-size: 0.92rem; } span { display: none; }`)}
`;
const BrandName = styled(RichText)`
  min-width: 0; max-height: 2.5rem; overflow: hidden; color: ${({ theme }) => theme.colors.primary};
  line-height: 1.15; white-space: nowrap; text-overflow: ellipsis;
  &, p, div, h2, h3, h4 { display: inline; margin: 0; line-height: inherit; }
  * { max-width: 100%; }
`;
const BrandTagline = styled(RichText)`
  min-width: 0; max-height: 1.5rem; overflow: hidden; color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.fontSizes.xs}; line-height: 1.2; white-space: nowrap; text-overflow: ellipsis;
  &, p, div, h2, h3, h4 { display: inline; margin: 0; line-height: inherit; }
  ${({ theme }) => theme.media.mobile(`display: none;`)}
`;

const RightCluster = styled.div`
  display: flex; align-items: center; justify-content: flex-end; gap: clamp(10px, 1.2vw, ${({ theme }) => theme.space[4]});
  min-width: 0; flex-shrink: 1;
`;

const Nav = styled.nav`
  display: flex; align-items: center; gap: clamp(10px, 1.2vw, ${({ theme }) => theme.space[4]});
  flex-wrap: nowrap; justify-content: flex-end; white-space: nowrap;

  ${({ theme, $open }) => theme.media.laptop(`
    position: fixed; inset: auto 0 auto 0; top: calc(${theme.layout.navHeight});
    flex-direction: column; align-items: stretch; gap: 0; flex-wrap: nowrap;
    background: ${theme.colors.surface}; padding: 0 1.25rem;
    box-shadow: ${theme.shadows.lg}; border-bottom: 1px solid ${theme.colors.border};
    max-height: ${$open ? "80vh" : "0"}; overflow: hidden; transition: max-height ${theme.transitions.slow};
    ${$open ? "padding-block: 0.5rem 1.25rem;" : ""}
  `)}
`;
const NavLink = styled(Link)`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme, $active }) => ($active ? theme.fontWeights.bold : theme.fontWeights.medium)};
  color: ${({ theme, $active }) => ($active ? theme.colors.primary : theme.colors.navInactive)};
  position: relative; padding: 6px 2px; border-bottom: 2px solid transparent;
  transition: color ${({ theme }) => theme.transitions.base}; white-space: nowrap;
  &:hover { color: ${({ theme }) => theme.colors.primary}; }
  &::after { content:""; position:absolute; left:0; right:0; bottom:-2px; height:2px; border-radius:2px; background:${({theme})=>theme.colors.primary}; transform:scaleX(${({$active})=>$active?1:0}); transform-origin:left; transition:transform ${({theme})=>theme.transitions.base}; }
  &:hover::after { transform:scaleX(1); }
  ${({ theme }) => theme.media.laptop(`padding: 0.85rem 0; border-bottom: 1px solid ${theme.colors.border}; width: 100%;`)}
`;
/* Dropdown group */
const Drop = styled.div`
  position: relative;
  ${({ theme }) => theme.media.laptop(`width: 100%;`)}
`;
const DropBtn = styled.button`
  display: inline-flex; align-items: center; gap: 4px;
  font-size: ${({ theme }) => theme.fontSizes.sm}; font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.navInactive};
  padding: 6px 2px; border-bottom: 2px solid transparent; white-space: nowrap;
  transition: color ${({ theme }) => theme.transitions.base};
  svg { transition: transform ${({ theme }) => theme.transitions.base}; }
  &:hover { color: ${({ theme }) => theme.colors.primary}; }
  ${Drop}:hover &, ${Drop}:focus-within & { color: ${({ theme }) => theme.colors.primary}; svg { transform: rotate(180deg); } }
  ${({ theme }) => theme.media.laptop(`padding: 0.85rem 0; width: 100%; justify-content: space-between; border-bottom: 1px solid ${theme.colors.border}; font-weight: 700; color: ${theme.colors.text};`)}
`;
const DropMenu = styled.div`
  position: absolute; top: 100%; left: 0; min-width: 200px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  padding: 6px; display: flex; flex-direction: column;
  z-index: ${({ theme }) => theme.zIndex.dropdown};
  opacity: 0; visibility: hidden; transform: translateY(6px);
  transition: opacity ${({ theme }) => theme.transitions.base}, transform ${({ theme }) => theme.transitions.base}, visibility ${({ theme }) => theme.transitions.base};
  ${Drop}:hover &, ${Drop}:focus-within & { opacity: 1; visibility: visible; transform: none; }
  ${Drop}:hover & > a, ${Drop}:focus-within & > a { opacity:1; transform:none; }
  & > a:nth-child(1){transition-delay:30ms} & > a:nth-child(2){transition-delay:55ms} & > a:nth-child(3){transition-delay:80ms} & > a:nth-child(4){transition-delay:105ms} & > a:nth-child(n+5){transition-delay:130ms}
  ${({ theme }) => theme.media.laptop(`
    position: static; opacity: 1; visibility: visible; transform: none;
    box-shadow: none; border: none; border-radius: 0; padding: 0 0 0 0.75rem; min-width: 0;
  `)}
`;
const DropLink = styled(Link)`
  padding: ${({ theme }) => `${theme.space[2]} ${theme.space[3]}`}; border-radius: ${({ theme }) => theme.radii.sm};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme, $active }) => ($active ? theme.fontWeights.bold : theme.fontWeights.medium)};
  color: ${({ theme, $active }) => ($active ? theme.colors.primary : theme.colors.textBody)};
  white-space: nowrap;
  opacity:0; transform:translateY(5px); transition:opacity ${({theme})=>theme.transitions.base},transform ${({theme})=>theme.transitions.base},background ${({theme})=>theme.transitions.fast},color ${({theme})=>theme.transitions.fast};
  &:hover { background: ${({ theme }) => theme.colors.primarySoft}; color: ${({ theme }) => theme.colors.primary}; }
  ${({ theme }) => theme.media.laptop(`padding: 0.7rem 0; border-radius: 0; border-bottom: 1px dashed ${theme.colors.border}; opacity:1; transform:none; transition-delay:0ms;`)}
`;
const MobileLang = styled.button`
  display: none;
  ${({ theme }) => theme.media.laptop(`display: inline-flex; align-items: center; gap: 6px; color: ${theme.colors.primary}; font-weight: 600; padding: 0.85rem 0;`)}
`;
const MobileTheme = styled.div`
  display: none;
  ${({ theme }) => theme.media.laptop(`display: flex; padding: 0.6rem 0;`)}
`;
const ApplyBtn = styled(Link)`
  display: inline-flex; align-items: center; gap: 6px; flex-shrink: 0;
  background: ${({ theme }) => theme.colors.primary}; color: #fff;
  padding: ${({ theme }) => `${theme.space[2]} ${theme.space[4]}`};
  border-radius: ${({ theme }) => theme.radii.pill}; font-size: ${({ theme }) => theme.fontSizes.sm}; font-weight: 600;
  box-shadow: ${({ theme }) => theme.shadows.sm};
  &:hover { background: ${({ theme }) => theme.colors.primaryDark}; }
  ${({ theme }) => theme.media.laptop(`display: none;`)}
`;
const PortalBtn = styled(Link)`
  display: inline-flex; align-items: center; gap: 6px; flex-shrink: 0;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.secondary};
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  padding: ${({ theme }) => `${theme.space[2]} ${theme.space[4]}`};
  border-radius: ${({ theme }) => theme.radii.pill}; font-size: ${({ theme }) => theme.fontSizes.sm}; font-weight: 600;
  &:hover { background: ${({ theme }) => theme.colors.secondarySoft}; }
  ${({ theme }) => theme.media.laptop(`display: none;`)}
`;
const LangButton = styled.button`
  display: inline-flex; align-items: center; gap: 6px;
  color: #fff; font-size: ${({ theme }) => theme.fontSizes.xs}; font-weight: 600;
  border: 1px solid rgba(255,255,255,0.4); border-radius: ${({ theme }) => theme.radii.pill};
  padding: 3px 12px;
  &:hover { background: rgba(255,255,255,0.15); }
`;
const Hamburger = styled.button`
  display: none; color: ${({ theme }) => theme.colors.primary}; padding: 6px;
  ${({ theme }) => theme.media.laptop(`display: inline-flex;`)}
`;

const Main = styled.main`flex: 1;`;
const pageFade = keyframes`from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; }`;
const PageFade = styled.div`
  animation: ${pageFade} 0.4s ease;
  @media (prefers-reduced-motion: reduce) { animation: none; }
`;

/* ---------- Footer ---------- */
const Footer = styled.footer`background: ${({ theme }) => theme.colors.secondary}; color: #fff;`;
const FooterTop = styled.div`padding-block: ${({ theme }) => theme.space[16]} ${({ theme }) => theme.space[12]};`;
const FooterGrid = styled.div`
  display: grid; grid-template-columns: 1.6fr 1fr 1fr 1.3fr; gap: ${({ theme }) => theme.space[8]};
  ${({ theme }) => theme.media.laptop(`grid-template-columns: 1fr 1fr;`)}
  ${({ theme }) => theme.media.mobile(`grid-template-columns: 1fr; gap: 2rem;`)}
`;
const FCol = styled.div`
  display: flex; flex-direction: column; gap: ${({ theme }) => theme.space[3]};
  h4 { color: #fff; font-size: ${({ theme }) => theme.fontSizes.md}; margin-bottom: ${({ theme }) => theme.space[1]}; }
  a { color: ${({ theme }) => theme.colors.secondaryFaint}; font-size: ${({ theme }) => theme.fontSizes.sm}; }
  a:hover { color: #fff; }
`;
const FBrand = styled.div`
  display: flex; align-items: center; gap: ${({ theme }) => theme.space[3]};
  img { border-radius: ${({ theme }) => theme.radii.pill}; background: #fff; }
  strong { color: #fff; font-family: ${({ theme }) => theme.fonts.heading}; font-size: ${({ theme }) => theme.fontSizes.lg}; }
`;
const FooterTag = styled.p`color: ${({ theme }) => theme.colors.textOnDarkMuted}; font-size: ${({ theme }) => theme.fontSizes.sm}; max-width: 40ch;`;
const Socials = styled.div`
  display: flex; gap: ${({ theme }) => theme.space[2]}; margin-top: ${({ theme }) => theme.space[2]};
  a {
    width: 36px; height: 36px; display: grid; place-items: center; border-radius: ${({ theme }) => theme.radii.pill};
    background: rgba(255,255,255,0.15); color: #fff;
    transition: background ${({ theme }) => theme.transitions.base}, transform ${({ theme }) => theme.transitions.base};
  }
  a:hover { background: #fff; color: ${({ theme }) => theme.colors.secondary}; transform: translateY(-2px); }
`;
const FContact = styled.div`
  display: flex; align-items: flex-start; gap: 8px;
  color: ${({ theme }) => theme.colors.textOnDarkMuted}; font-size: ${({ theme }) => theme.fontSizes.sm};
  svg { flex-shrink: 0; margin-top: 2px; color: ${({ theme }) => theme.colors.secondaryFaint}; }
  a { color: ${({ theme }) => theme.colors.textOnDarkMuted}; } a:hover { color: #fff; }
`;
const FooterBarWrap = styled.div`border-top: 1px solid rgba(255,255,255,0.18); padding-block: ${({ theme }) => theme.space[5]};`;
const FooterBar = styled.div`color: ${({ theme }) => theme.colors.textOnDarkMuted}; font-size: ${({ theme }) => theme.fontSizes.sm}; text-align: center;`;

export default PublicLayout;
