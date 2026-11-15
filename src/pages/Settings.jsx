import React, { useState, useEffect } from "react";
import { useAppContext } from "@/lib/AppContext";
import { t } from "@/lib/i18n";
import { base44 } from "@/api/base44Client";
import {
  Sun,
  Moon,
  Globe,
  User,
  LogOut,
  ChevronRight,
  Calculator,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const { lang, theme, angleMode, savePreferences } = useAppContext();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth
      .me()
      .then(setUser)
      .catch(() => {});
  }, []);

  function handleLogout() {
    base44.auth.logout("/login");
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] px-4 pt-5 pb-4">
      <h1 className="text-xl font-heading font-bold mb-6">
        {t("settings", lang)}
      </h1>

      {/* Profile card */}
      {user && (
        <div className="bg-card rounded-2xl border border-border/50 p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User size={22} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-heading font-semibold text-sm truncate">
                {user.full_name || user.email}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Preferences */}
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-2 px-1">
        {t("preferences", lang)}
      </p>
      <div className="bg-card rounded-2xl border border-border/50 divide-y divide-border/50 mb-6">
        {/* Language */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Globe size={18} className="text-muted-foreground" />
            <span className="text-sm font-medium">{t("language", lang)}</span>
          </div>
          <div className="flex gap-1 bg-muted rounded-lg p-0.5">
            <button
              onClick={() => savePreferences({ language: "en" })}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                lang === "en"
                  ? "bg-card shadow-sm text-foreground"
                  : "text-muted-foreground"
              }`}>
              EN
            </button>
            <button
              onClick={() => savePreferences({ language: "ar" })}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                lang === "ar"
                  ? "bg-card shadow-sm text-foreground"
                  : "text-muted-foreground"
              }`}>
              عربي
            </button>
          </div>
        </div>

        {/* Theme */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            {theme === "dark" ? (
              <Moon size={18} className="text-muted-foreground" />
            ) : (
              <Sun size={18} className="text-muted-foreground" />
            )}
            <span className="text-sm font-medium">{t("theme", lang)}</span>
          </div>
          <div className="flex gap-1 bg-muted rounded-lg p-0.5">
            <button
              onClick={() => savePreferences({ theme: "light" })}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                theme === "light"
                  ? "bg-card shadow-sm text-foreground"
                  : "text-muted-foreground"
              }`}>
              {t("lightMode", lang)}
            </button>
            <button
              onClick={() => savePreferences({ theme: "dark" })}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                theme === "dark"
                  ? "bg-card shadow-sm text-foreground"
                  : "text-muted-foreground"
              }`}>
              {t("darkMode", lang)}
            </button>
          </div>
        </div>

        {/* Angle Mode */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Calculator size={18} className="text-muted-foreground" />
            <span className="text-sm font-medium">{t("angleMode", lang)}</span>
          </div>
          <div className="flex gap-1 bg-muted rounded-lg p-0.5">
            <button
              onClick={() => savePreferences({ angle_mode: "deg" })}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                angleMode === "deg"
                  ? "bg-card shadow-sm text-foreground"
                  : "text-muted-foreground"
              }`}>
              {t("degrees", lang)}
            </button>
            <button
              onClick={() => savePreferences({ angle_mode: "rad" })}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                angleMode === "rad"
                  ? "bg-card shadow-sm text-foreground"
                  : "text-muted-foreground"
              }`}>
              {t("radians", lang)}
            </button>
          </div>
        </div>
      </div>

      {/* About */}
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-2 px-1">
        {t("about", lang)}
      </p>
      <div className="bg-card rounded-2xl border border-border/50 p-4 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {t("version", lang)}
          </span>
          <span className="text-sm font-mono text-muted-foreground">1.0.0</span>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 p-4 bg-card rounded-2xl border border-destructive/20 hover:bg-destructive/5 transition-colors">
        <LogOut size={18} className="text-destructive" />
        <span className="text-sm font-medium text-destructive">
          {t("logout", lang)}
        </span>
      </button>
    </div>
  );
}
