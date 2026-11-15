import React, { createContext, useContext, useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { applyAccentTheme, isAccentTheme } from "@/lib/themePalettes";

const AppContext = createContext();

function readAccentTheme() {
  try {
    const saved = window.localStorage.getItem("fabio_accent_theme");
    return isAccentTheme(saved) ? saved : "indigo";
  } catch {
    return "indigo";
  }
}

export function AppProvider({ children }) {
  const [lang, setLang] = useState("en");
  const [theme, setTheme] = useState("light");
  const [angleMode, setAngleMode] = useState("deg");
  const [accentTheme, setAccentTheme] = useState(readAccentTheme);
  const [prefsLoaded, setPrefsLoaded] = useState(false);
  const [prefsId, setPrefsId] = useState(null);

  useEffect(() => {
    loadPreferences();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
    applyAccentTheme(accentTheme, theme);
  }, [theme, lang, accentTheme]);

  async function loadPreferences() {
    try {
      const prefs = await base44.entities.UserPreferences.list();
      if (prefs.length > 0) {
        const p = prefs[0];
        setLang(p.language || "en");
        setTheme(p.theme || "light");
        setAngleMode(p.angle_mode || "deg");
        setPrefsId(p.id);
      }
    } catch {
      // Keep local defaults when the account service is unavailable.
    }
    setPrefsLoaded(true);
  }

  async function savePreferences(updates) {
    const newLang = updates.language ?? lang;
    const newTheme = updates.theme ?? theme;
    const newAngle = updates.angle_mode ?? angleMode;
    const newAccent = updates.accent_theme ?? accentTheme;

    if (updates.language !== undefined) setLang(newLang);
    if (updates.theme !== undefined) setTheme(newTheme);
    if (updates.angle_mode !== undefined) setAngleMode(newAngle);
    if (updates.accent_theme !== undefined && isAccentTheme(newAccent)) {
      setAccentTheme(newAccent);
      try {
        window.localStorage.setItem("fabio_accent_theme", newAccent);
      } catch {
        // The selected accent remains active for this session.
      }
    }

    // Accent colours are device-local and intentionally do not require a
    // Base44 entity schema migration. Existing cloud preferences stay intact.
    if (
      updates.language === undefined &&
      updates.theme === undefined &&
      updates.angle_mode === undefined
    ) {
      return;
    }

    const data = { language: newLang, theme: newTheme, angle_mode: newAngle };
    try {
      if (prefsId) {
        await base44.entities.UserPreferences.update(prefsId, data);
      } else {
        const created = await base44.entities.UserPreferences.create(data);
        setPrefsId(created.id);
      }
    } catch {
      // Keep the chosen preferences active even if cloud sync is unavailable.
    }
  }

  return (
    <AppContext.Provider
      value={{ lang, theme, angleMode, accentTheme, savePreferences, prefsLoaded }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
