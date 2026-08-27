import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [authDisabled, setAuthDisabled] = useState(false);
  const [loading, setLoading] = useState(true);

  // On mount, check for an existing session via the httpOnly cookie.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await api.get("/auth/me");
        if (active) {
          setAdmin(res.admin);
          setAuthDisabled(!!res.authDisabled);
        }
      } catch {
        if (active) setAdmin(null);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email, password, twoFactorCode) => {
    const res = await api.post("/auth/login", { email, password, ...(twoFactorCode ? { twoFactorCode } : {}) });
    if (res.requiresTwoFactor) return res;
    setAdmin(res.admin);
    return res;
  }, []);

  const logout = useCallback(async () => {
    if (authDisabled) return;
    try {
      await api.post("/auth/logout");
    } finally {
      setAdmin(null);
    }
  }, [authDisabled]);

  const value = useMemo(
    () => ({ admin, loading, isAuthenticated: !!admin, authDisabled, login, logout }),
    [admin, loading, authDisabled, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

export default AuthContext;
