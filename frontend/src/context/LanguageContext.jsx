import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { translations } from "../i18n/translations";

const LanguageContext = createContext(null);
const STORAGE_KEY = "adarsha_lang";

/** Resolve a dotted key path ("home.heroTitle") against a nested object. */
function resolve(obj, path) {
  return path.split(".").reduce((acc, part) => (acc == null ? acc : acc[part]), obj);
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    const saved = typeof localStorage !== "undefined" && localStorage.getItem(STORAGE_KEY);
    return saved === "ne" || saved === "en" ? saved : "en";
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* ignore storage errors (private mode) */
    }
    document.documentElement.lang = lang;
  }, [lang]);

  const toggleLang = useCallback(() => {
    setLang((prev) => (prev === "en" ? "ne" : "en"));
  }, []);

  /** Translate a UI key. Falls back to English, then to the key itself. */
  const t = useCallback(
    (key) => {
      const val = resolve(translations[lang], key);
      if (val != null) return val;
      const fallback = resolve(translations.en, key);
      return fallback != null ? fallback : key;
    },
    [lang]
  );

  /**
   * Pick the right field from a bilingual API record.
   * pickLang(notice, "title") -> notice.titleNe (ne) or notice.title (en),
   * gracefully falling back if the localized field is empty.
   */
  const pickLang = useCallback(
    (record, baseField) => {
      if (!record) return "";
      const neField = `${baseField}Ne`;
      if (lang === "ne" && record[neField]) return record[neField];
      return record[baseField] ?? record[neField] ?? "";
    },
    [lang]
  );

  const value = useMemo(
    () => ({ lang, setLang, toggleLang, t, pickLang, isNepali: lang === "ne" }),
    [lang, toggleLang, t, pickLang]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used within a LanguageProvider");
  return ctx;
}

export default LanguageContext;
