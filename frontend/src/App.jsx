import { useEffect } from "react";
import styled from "styled-components";
import { useRouter } from "./lib/router";
import { useAuth } from "./context/AuthContext";
import { PublicLayout } from "./layout/PublicLayout";
import { AdminLayout } from "./layout/AdminLayout";

// Public pages
import { Home } from "./pages/Home";
import { About } from "./pages/About";
import { Academics } from "./pages/Academics";
import { Admissions } from "./pages/Admissions";
import { Faculty } from "./pages/Faculty";
import { Gallery } from "./pages/Gallery";
import { Notices } from "./pages/Notices";
import { Events } from "./pages/Events";
import { Contact } from "./pages/Contact";
import { Committee } from "./pages/Committee";
import { Donation } from "./pages/Donation";
import { PageView } from "./pages/PageView";
import { NotFound } from "./pages/NotFound";

// Admin pages
import { AdminLogin } from "./pages/admin/Login";
import { AdminDashboard } from "./pages/admin/Dashboard";
import { ManageNotices } from "./pages/admin/ManageNotices";
import { ManageEvents } from "./pages/admin/ManageEvents";
import { ManageGallery } from "./pages/admin/ManageGallery";
import { ManageStaff } from "./pages/admin/ManageStaff";
import { ManageCommittee } from "./pages/admin/ManageCommittee";
import { ManagePrograms } from "./pages/admin/ManagePrograms";
import { ManagePages } from "./pages/admin/ManagePages";
import { ManageDonation } from "./pages/admin/ManageDonation";
import { ManageSettings } from "./pages/admin/ManageSettings";
import { Inbox } from "./pages/admin/Inbox";

const PUBLIC_ROUTES = {
  "/": Home,
  "/about": About,
  "/academic": Academics,
  "/admissions": Admissions,
  "/faculty": Faculty,
  "/gallery": Gallery,
  "/notices": Notices,
  "/events": Events,
  "/contact": Contact,
  "/committee": Committee,
  "/donation": Donation,
};

const ADMIN_ROUTES = {
  "/admin": AdminDashboard,
  "/admin/notices": ManageNotices,
  "/admin/events": ManageEvents,
  "/admin/gallery": ManageGallery,
  "/admin/staff": ManageStaff,
  "/admin/committee": ManageCommittee,
  "/admin/programs": ManagePrograms,
  "/admin/pages": ManagePages,
  "/admin/donation": ManageDonation,
  "/admin/settings": ManageSettings,
  "/admin/inbox": Inbox,
};

export default function App() {
  const { path } = useRouter();

  if (path.startsWith("/admin")) return <AdminArea path={path} />;

  // Generic viewer for any admin-created page: /page/<slug>
  if (path.startsWith("/page/")) {
    const slug = decodeURIComponent(path.slice("/page/".length));
    return (
      <PublicLayout>
        <PageView slug={slug} />
      </PublicLayout>
    );
  }

  const Page = PUBLIC_ROUTES[path] || NotFound;
  return (
    <PublicLayout>
      <Page />
    </PublicLayout>
  );
}

function AdminArea({ path }) {
  const { isAuthenticated, loading } = useAuth();
  const { navigate } = useRouter();
  const isLoginRoute = path === "/admin/login";

  // Hooks must run unconditionally — guard the redirect by route instead.
  useEffect(() => {
    if (!isLoginRoute && !loading && !isAuthenticated) {
      navigate("/admin/login", { replace: true });
    }
  }, [isLoginRoute, loading, isAuthenticated, navigate]);

  // Login screen is outside the protected shell.
  if (isLoginRoute) return <AdminLogin />;

  if (loading) {
    return <Splash>Loading dashboard…</Splash>;
  }
  if (!isAuthenticated) {
    return <Splash>Redirecting to login…</Splash>;
  }

  const Page = ADMIN_ROUTES[path] || NotFound;
  return (
    <AdminLayout>
      <Page />
    </AdminLayout>
  );
}

const Splash = styled.div`
  min-height: 100vh; display: grid; place-items: center;
  color: ${({ theme }) => theme.colors.textMuted};
  background: ${({ theme }) => theme.colors.surfaceAlt};
`;
