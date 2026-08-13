/**
 * Minimal history-based router (the stack intentionally excludes react-router).
 * Provides <RouterProvider>, useRouter(), <Link>, and a <Route>-free switch
 * pattern via useRouter().path. Vite's dev server and `vite preview` both do
 * SPA fallback to index.html, so deep links / refresh work out of the box.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const RouterContext = createContext(null);

function currentPath() {
  return window.location.pathname || "/";
}

export function RouterProvider({ children }) {
  const [path, setPath] = useState(currentPath);

  useEffect(() => {
    const onPop = () => setPath(currentPath());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const navigate = useCallback((to, { replace = false } = {}) => {
    if (to === window.location.pathname) return;
    if (replace) window.history.replaceState({}, "", to);
    else window.history.pushState({}, "", to);
    setPath(to);
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  }, []);

  const value = useMemo(() => ({ path, navigate }), [path, navigate]);
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export function useRouter() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error("useRouter must be used within a RouterProvider");
  return ctx;
}

/** Accessible client-side link. Falls back to normal navigation on modifier-click. */
export function Link({ to, children, onClick, ...rest }) {
  const { navigate, path } = useRouter();
  const isActive = path === to;

  const handleClick = (e) => {
    if (e.defaultPrevented) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    onClick?.(e);
    navigate(to);
  };

  return (
    <a
      href={to}
      onClick={handleClick}
      aria-current={isActive ? "page" : undefined}
      {...rest}
    >
      {children}
    </a>
  );
}

export default RouterProvider;
