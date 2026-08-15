import { useEffect, lazy, Suspense } from "react";
import styled from "styled-components";
import { useRouter } from "./lib/router";
import { useAuth } from "./context/AuthContext";
import { applyRouteMeta } from "./lib/seo";
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
import { NoticeDetail } from "./pages/NoticeDetail";
import { EventDetail } from "./pages/EventDetail";
import { NotFound } from "./pages/NotFound";

// Admin pages — lazy-loaded so the public bundle stays lean.
const AdminLogin = lazy(() => import("./pages/admin/Login").then((m) => ({ default: m.AdminLogin })));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard").then((m) => ({ default: m.AdminDashboard })));
const ManageNotices = lazy(() => import("./pages/admin/ManageNotices").then((m) => ({ default: m.ManageNotices })));
const ManageEvents = lazy(() => import("./pages/admin/ManageEvents").then((m) => ({ default: m.ManageEvents })));
const ManageGallery = lazy(() => import("./pages/admin/ManageGallery").then((m) => ({ default: m.ManageGallery })));
const ManageStaff = lazy(() => import("./pages/admin/ManageStaff").then((m) => ({ default: m.ManageStaff })));
const ManageCommittee = lazy(() => import("./pages/admin/ManageCommittee").then((m) => ({ default: m.ManageCommittee })));
const ManagePrograms = lazy(() => import("./pages/admin/ManagePrograms").then((m) => ({ default: m.ManagePrograms })));
const ManagePages = lazy(() => import("./pages/admin/ManagePages").then((m) => ({ default: m.ManagePages })));
const ManageDonation = lazy(() => import("./pages/admin/ManageDonation").then((m) => ({ default: m.ManageDonation })));
const ManageSettings = lazy(() => import("./pages/admin/ManageSettings").then((m) => ({ default: m.ManageSettings })));
const Inbox = lazy(() => import("./pages/admin/Inbox").then((m) => ({ default: m.Inbox })));

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

  // Update document title + meta/OG tags on every navigation.
  useEffect(() => { applyRouteMeta(path); }, [path]);

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

  // Detail pages: /notices/:id and /events/:id
  if (path.startsWith("/notices/")) {
    const id = decodeURIComponent(path.slice("/notices/".length));
    return <PublicLayout><NoticeDetail id={id} /></PublicLayout>;
  }
  if (path.startsWith("/events/")) {
    const id = decodeURIComponent(path.slice("/events/".length));
    return <PublicLayout><EventDetail id={id} /></PublicLayout>;
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
  if (isLoginRoute) {
    return (
      <Suspense fallback={<Splash>Loading…</Splash>}>
        <AdminLogin />
      </Suspense>
    );
  }

  if (loading) {
    return <Splash>Loading dashboard…</Splash>;
  }
  if (!isAuthenticated) {
    return <Splash>Redirecting to login…</Splash>;
  }

  const Page = ADMIN_ROUTES[path] || NotFound;
  return (
    <AdminLayout>
      <Suspense fallback={<Splash>Loading…</Splash>}>
        <Page />
      </Suspense>
    </AdminLayout>
  );
}

const Splash = styled.div`
  min-height: 100vh; display: grid; place-items: center;
  color: ${({ theme }) => theme.colors.textMuted};
  background: ${({ theme }) => theme.colors.surfaceAlt};
`;
