import { useState } from "react";
import styled from "styled-components";
import {
  LayoutDashboard, Megaphone, CalendarDays, Images, Users, Users2, BookOpen,
  FileText, Inbox, LogOut, Menu, X, ExternalLink, Settings as SettingsIcon, HandCoins,
} from "lucide-react";
import { Link, useRouter } from "../lib/router";
import { ThemeToggle } from "../components/ThemeToggle";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LanguageContext";
import { useToast } from "../context/ToastContext";
import logo from "../assets/images/logo.png";

const ITEMS = [
  { to: "/admin", key: "overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/notices", key: "manageNotices", icon: Megaphone },
  { to: "/admin/events", key: "manageEvents", icon: CalendarDays },
  { to: "/admin/gallery", key: "manageGallery", icon: Images },
  { to: "/admin/staff", key: "manageStaff", icon: Users },
  { to: "/admin/committee", key: "manageCommittee", icon: Users2 },
  { to: "/admin/programs", key: "managePrograms", icon: BookOpen },
  { to: "/admin/pages", key: "managePages", icon: FileText },
  { to: "/admin/donation", key: "manageDonation", icon: HandCoins },
  { to: "/admin/settings", key: "settings", icon: SettingsIcon },
  { to: "/admin/inbox", key: "inbox", icon: Inbox },
];

export function AdminLayout({ children }) {
  const { t } = useLang();
  const { path, navigate } = useRouter();
  const { admin, logout } = useAuth();
  const toast = useToast();
  const [open, setOpen] = useState(false);

  const active = (item) =>
    item.exact ? path === item.to : path.startsWith(item.to);

  const handleLogout = async () => {
    await logout();
    toast.info("Signed out");
    navigate("/admin/login");
  };

  return (
    <Shell>
      <Sidebar $open={open}>
        <Brand to="/admin">
          <img src={logo} alt="" width={36} height={36} />
          <span>{t("admin.dashboard")}</span>
        </Brand>
        <NavList>
          {ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavItem key={item.to} to={item.to} $active={active(item)} onClick={() => setOpen(false)}>
                <Icon size={18} /> {t(`admin.${item.key}`)}
              </NavItem>
            );
          })}
        </NavList>
        <SidebarFoot>
          <ViewSite to="/"><ExternalLink size={16} /> View site</ViewSite>
          <LogoutBtn onClick={handleLogout}><LogOut size={16} /> {t("admin.signOut")}</LogoutBtn>
        </SidebarFoot>
      </Sidebar>

      <Content>
        <Topbar>
          <Burger onClick={() => setOpen((o) => !o)} aria-label="Toggle menu">
            {open ? <X size={20} /> : <Menu size={20} />}
          </Burger>
          <TopActions>
            <ThemeToggle variant="surface" />
            <Who>{admin?.name || admin?.email}</Who>
          </TopActions>
        </Topbar>
        <Inner>{children}</Inner>
      </Content>

      {open && <Backdrop onClick={() => setOpen(false)} />}
    </Shell>
  );
}

const Shell = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.surfaceAlt};
`;

const Sidebar = styled.aside`
  width: ${({ theme }) => theme.layout.sidebarWidth};
  background: ${({ theme }) => theme.colors.secondary};
  color: #fff;
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
  flex-shrink: 0;

  ${({ theme, $open }) => theme.media.laptop(`
    position: fixed;
    z-index: ${theme.zIndex.overlay};
    left: ${$open ? "0" : "-100%"};
    transition: left ${theme.transitions.slow};
    box-shadow: ${theme.shadows.xl};
  `)}
`;

const Brand = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space[3]};
  padding: ${({ theme }) => theme.space[6]};
  font-family: ${({ theme }) => theme.fonts.heading};
  font-weight: 700;
  font-size: ${({ theme }) => theme.fontSizes.lg};
  border-bottom: 1px solid rgba(255,255,255,0.15);
  img { border-radius: ${({ theme }) => theme.radii.pill}; background:#fff; }
`;

const NavList = styled.nav`
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.space[3]};
  gap: 2px;
  flex: 1;
`;

const NavItem = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space[3]};
  padding: ${({ theme }) => `${theme.space[3]} ${theme.space[4]}`};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 600;
  color: ${({ $active }) => ($active ? "#fff" : "rgba(255,255,255,0.8)")};
  background: ${({ $active }) => ($active ? "rgba(255,255,255,0.18)" : "transparent")};
  &:hover { background: rgba(255,255,255,0.12); color: #fff; }
`;

const SidebarFoot = styled.div`
  padding: ${({ theme }) => theme.space[4]};
  border-top: 1px solid rgba(255,255,255,0.15);
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[2]};
`;

const ViewSite = styled(Link)`
  display: flex; align-items: center; gap: 8px;
  color: ${({ theme }) => theme.colors.secondaryFaint};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  padding: ${({ theme }) => theme.space[2]};
  &:hover { color: #fff; }
`;

const LogoutBtn = styled.button`
  display: flex; align-items: center; gap: 8px;
  color: #fff;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 600;
  padding: ${({ theme }) => theme.space[2]};
  border-radius: ${({ theme }) => theme.radii.md};
  &:hover { background: rgba(255,255,255,0.12); }
`;

const Content = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
`;

const Topbar = styled.header`
  height: 64px;
  background: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 ${({ theme }) => theme.space[6]};
  position: sticky;
  top: 0;
  z-index: ${({ theme }) => theme.zIndex.header};
`;

const Burger = styled.button`
  display: none;
  color: ${({ theme }) => theme.colors.text};
  ${({ theme }) => theme.media.laptop(`display: inline-flex;`)}
`;

const TopActions = styled.div`
  margin-left: auto; display: flex; align-items: center; gap: ${({ theme }) => theme.space[4]};
`;
const Who = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textMuted};
  font-weight: 600;
`;

const Inner = styled.div`
  padding: ${({ theme }) => theme.space[8]};
  ${({ theme }) => theme.media.tablet(`padding: 1.25rem;`)}
`;

const Backdrop = styled.div`
  display: none;
  ${({ theme }) => theme.media.laptop(`
    display: block;
    position: fixed;
    inset: 0;
    background: ${theme.colors.overlay};
    z-index: ${theme.zIndex.overlay - 1};
  `)}
`;

export default AdminLayout;
