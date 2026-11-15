import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Calculator,
  Clock,
  ScanLine,
  BookMarked,
  Settings,
} from "lucide-react";
import { t } from "@/lib/i18n";
import { motion } from "framer-motion";

const navItems = [
  { path: "/", icon: Calculator, labelKey: "calculator" },
  { path: "/history", icon: Clock, labelKey: "history" },
  { path: "/scan", icon: ScanLine, labelKey: "scanSolve" },
  { path: "/library", icon: BookMarked, labelKey: "library" },
  { path: "/settings", icon: Settings, labelKey: "settings" },
];

export default function BottomNav({ lang }) {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-xl border-t border-border/50 safe-area-bottom">
      <div className="flex items-center justify-around max-w-lg mx-auto h-16 px-2">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className="relative flex flex-col items-center justify-center gap-0.5 flex-1 py-1">
              {active && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -top-[1px] w-8 h-0.5 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <Icon
                size={20}
                className={active ? "text-primary" : "text-muted-foreground"}
                strokeWidth={active ? 2.5 : 1.5}
              />
              <span
                className={`text-[10px] font-medium ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}>
                {t(item.labelKey, lang)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
