let deferredInstallPrompt = null;
let appInstalled = false;
const listeners = new Set();

function notifyListeners() {
  const state = { prompt: deferredInstallPrompt, installed: appInstalled };
  listeners.forEach((listener) => listener(state));
}

export function registerPwaInstallEvents() {
  if (typeof window === "undefined" || window.__fabioPwaEventsRegistered) return;
  window.__fabioPwaEventsRegistered = true;

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    notifyListeners();
  });

  window.addEventListener("appinstalled", () => {
    appInstalled = true;
    deferredInstallPrompt = null;
    notifyListeners();
  });
}

export function getPwaInstallState() {
  return { prompt: deferredInstallPrompt, installed: appInstalled };
}

export function subscribePwaInstall(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function clearPwaInstallPrompt() {
  deferredInstallPrompt = null;
  notifyListeners();
}
