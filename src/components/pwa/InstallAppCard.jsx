import React, { useEffect, useState } from "react";
import { Download, CheckCircle2, Smartphone } from "lucide-react";
import {
  clearPwaInstallPrompt,
  getPwaInstallState,
  subscribePwaInstall,
} from "@/lib/pwaInstall";

export default function InstallAppCard() {
  const [installPrompt, setInstallPrompt] = useState(() => getPwaInstallState().prompt);
  const [installed, setInstalled] = useState(() => getPwaInstallState().installed);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    setInstalled((current) => current || standalone);

    return subscribePwaInstall(({ prompt, installed: appInstalled }) => {
      setInstallPrompt(prompt);
      if (appInstalled) setInstalled(true);
    });
  }, []);

  async function handleInstall() {
    if (!installPrompt || installing) return;
    setInstalling(true);
    try {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      clearPwaInstallPrompt();
      if (choice?.outcome === "accepted") setInstalled(true);
    } finally {
      setInstalling(false);
    }
  }

  return (
    <section className="bg-card rounded-2xl border border-border/50 p-4 mb-6">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          {installed ? <CheckCircle2 size={20} /> : <Smartphone size={20} />}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold">Install Fabio</h2>
          <p className="text-xs text-muted-foreground mt-1">
            {installed
              ? "Fabio is installed on this device."
              : "Add Fabio to your home screen for a focused, app-like experience."}
          </p>
          {installPrompt ? (
            <button
              type="button"
              onClick={handleInstall}
              disabled={installing}
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
              <Download size={14} />
              {installing ? "Opening installer…" : "Install app"}
            </button>
          ) : !installed ? (
            <p className="text-[11px] text-muted-foreground mt-2">
              If your browser supports installation, open its menu and choose “Install app” or “Add to Home Screen”.
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
