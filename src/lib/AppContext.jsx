import React, { createContext, useContext, useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

const AppContext = createContext();

export function AppProvider({ children }) {
  const [lang, setLang] = useState("en");
  const [theme, setTheme] = useState("light");
  const [angleMode, setAngleMode] = useState("deg");
  const [prefsLoaded, setPrefsLoaded] = useState(false);
  const [prefsId, setPrefsId] = useState(null);

  useEffect(() => {
    loadPreferences();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [theme, lang]);

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
    } catch (e) {
      // defaults
    }
    setPrefsLoaded(true);
  }

  async function savePreferences(updates) {
    const newLang = updates.language ?? lang;
    const newTheme = updates.theme ?? theme;
    const newAngle = updates.angle_mode ?? angleMode;

    if (updates.language !== undefined) setLang(newLang);
    if (updates.theme !== undefined) setTheme(newTheme);
    if (updates.angle_mode !== undefined) setAngleMode(newAngle);

    const data = { language: newLang, theme: newTheme, angle_mode: newAngle };
    try {
      if (prefsId) {
        await base44.entities.UserPreferences.update(prefsId, data);
      } else {
        const created = await base44.entities.UserPreferences.create(data);
        setPrefsId(created.id);
      }
    } catch (e) {
      // silent
    }
  }

  return (
    <AppContext.Provider
      value={{ lang, theme, angleMode, savePreferences, prefsLoaded }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
