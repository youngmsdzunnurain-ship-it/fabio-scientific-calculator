import React, { useEffect, useState } from "react";
import { Download, CheckCircle2, Smartphone } from "lucide-react";

export default function InstallAppCard() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    setInstalled(standalone);

    function handlePrompt(event) {
      event.preventDefault();
      setInstallPrompt(event);
    }

    function handleInstalled() {
      setInstalled(true);
      setInstallPrompt(null);
    }

    window.addEventListener("beforeinstallprompt", handlePrompt);
    window.addEventListener("appinstalled", handleInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handlePrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  async function handleInstall() {
    if (!installPrompt || installing) return;
    setInstalling(true);
    try {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice?.outcome === "accepted") setInstalled(true);
      setInstallPrompt(null);
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
