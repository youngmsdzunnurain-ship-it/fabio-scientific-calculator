import React from "react";
import ReactDOM from "react-dom/client";
import { Capacitor } from "@capacitor/core";
import App from "@/App.jsx";
import "@/index.css";

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

if (
  import.meta.env.PROD &&
  !Capacitor.isNativePlatform() &&
  "serviceWorker" in navigator
) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.error("Fabio service worker registration failed:", error);
    });
  });
}
