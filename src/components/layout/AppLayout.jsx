import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  Calculator,
  Clock,
  ScanLine,
  BookMarked,
  Settings,
  Sparkles,
} from "lucide-react";
import BottomNav from "./BottomNav";
import { useAppContext } from "@/lib/AppContext";
import { t } from "@/lib/i18n";

const navItems = [
  { path: "/", icon: Calculator, labelKey: "calculator" },
  { path: "/history", icon: Clock, labelKey: "history" },
  { path: "/scan", icon: ScanLine, labelKey: "scanSolve" },
  { path: "/library", icon: BookMarked, labelKey: "library" },
  { path: "/settings", icon: Settings, labelKey: "settings" },
];

export default function AppLayout() {
  const { lang } = useAppContext();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background md:flex">
      <aside className="hidden md:flex md:sticky md:top-0 md:h-screen md:w-64 md:shrink-0 md:flex-col border-r border-border/60 bg-card/70 p-5">
        <Link to="/" className="flex items-center gap-3 px-2 py-3 mb-8">
          <span className="h-10 w-10 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20">
            <Calculator size={21} />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-bold tracking-tight">FABIO</span>
            <span className="block text-[10px] text-muted-foreground">SCIENTIFIC CALCULATOR</span>
          </span>
        </Link>

        <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          Workspace
        </p>
        <nav className="space-y-1" aria-label="Main navigation">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${active ? "bg-primary text-primary-foreground shadow-md shadow-primary/15" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
                <Icon size={18} />
                {t(item.labelKey, lang)}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-2xl border border-primary/15 bg-primary/5 p-4">
          <Sparkles size={18} className="text-primary mb-2" />
          <p className="text-xs font-semibold">Made for curious minds</p>
          <p className="text-[11px] text-muted-foreground mt-1">Calculate, explore and keep your formulas close.</p>
        </div>
      </aside>

      <div className="min-w-0 flex-1 flex flex-col">
        <header className="hidden md:flex h-16 items-center border-b border-border/50 bg-background/80 px-8">
          <div className="w-full max-w-6xl mx-auto flex items-center justify-between">
            <p className="text-sm font-semibold text-muted-foreground">
              {t(navItems.find((item) => item.path === location.pathname)?.labelKey || "calculator", lang)}
            </p>
            <span className="text-xs text-muted-foreground">Precision in every calculation</span>
          </div>
        </header>
        <main className="flex-1 pb-20 md:pb-8">
          <div className="w-full max-w-6xl mx-auto md:px-8">
            <Outlet />
          </div>
        </main>
        <BottomNav lang={lang} />
      </div>
    </div>
  );
}
