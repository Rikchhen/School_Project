import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";

const SettingsContext = createContext(null);

const DEFAULTS = { socials: {}, donationEnabled: false, banners: [] };

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(null);

  const refetch = useCallback(async () => {
    try {
      const res = await api.get("/settings");
      setSettings(res.settings || DEFAULTS);
    } catch {
      setSettings(DEFAULTS);
    }
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  // Re-fetch when the tab regains focus so admin changes (e.g. hiding the
  // donation page) show up on an already-open public tab without a manual reload.
  useEffect(() => {
    const onFocus = () => refetch();
    const onVisible = () => { if (!document.hidden) refetch(); };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refetch]);

  const value = useMemo(
    () => ({ settings: settings || DEFAULTS, loaded: settings != null, refetch }),
    [settings, refetch]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within a SettingsProvider");
  return ctx;
}

export default SettingsContext;
