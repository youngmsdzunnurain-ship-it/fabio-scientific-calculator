export const accentThemes = [
  { id: "indigo", name: "Indigo", swatch: "#6366f1", light: ["235 65% 55%", "235 65% 95%", "235 65% 40%"], dark: ["235 70% 65%", "235 30% 20%", "235 70% 80%"] },
  { id: "blue", name: "Blue", swatch: "#2563eb", light: ["221 83% 53%", "221 85% 95%", "221 83% 38%"], dark: ["217 91% 68%", "221 45% 20%", "217 90% 82%"] },
  { id: "sky", name: "Sky", swatch: "#0ea5e9", light: ["199 89% 48%", "199 85% 94%", "199 89% 35%"], dark: ["199 92% 62%", "199 45% 20%", "199 90% 82%"] },
  { id: "red", name: "Red", swatch: "#dc2626", light: ["0 84% 45%", "0 80% 95%", "0 84% 35%"], dark: ["0 75% 62%", "0 40% 20%", "0 75% 82%"] },
  { id: "teal", name: "Teal", swatch: "#0d9488", light: ["175 84% 32%", "175 65% 93%", "175 84% 27%"], dark: ["172 75% 52%", "172 40% 19%", "172 75% 78%"] },
  { id: "emerald", name: "Emerald", swatch: "#10b981", light: ["160 84% 35%", "160 70% 93%", "160 84% 27%"], dark: ["158 75% 55%", "158 38% 19%", "158 75% 80%"] },
  { id: "green", name: "Green", swatch: "#16a34a", light: ["142 71% 35%", "142 60% 93%", "142 71% 27%"], dark: ["142 65% 55%", "142 35% 19%", "142 65% 80%"] },
  { id: "lime", name: "Lime", swatch: "#65a30d", light: ["84 81% 32%", "84 65% 93%", "84 81% 25%"], dark: ["84 65% 55%", "84 35% 19%", "84 65% 80%"] },
  { id: "amber", name: "Amber", swatch: "#d97706", light: ["32 95% 44%", "32 90% 94%", "32 95% 32%"], dark: ["38 90% 60%", "38 45% 19%", "38 90% 82%"] },
  { id: "orange", name: "Orange", swatch: "#ea580c", light: ["21 90% 48%", "21 85% 94%", "21 90% 35%"], dark: ["24 95% 62%", "24 45% 20%", "24 95% 82%"] },
  { id: "rose", name: "Rose", swatch: "#e11d48", light: ["347 77% 48%", "347 80% 95%", "347 77% 36%"], dark: ["346 80% 65%", "346 40% 20%", "346 80% 82%"] },
  { id: "pink", name: "Pink", swatch: "#db2777", light: ["330 81% 48%", "330 75% 95%", "330 81% 36%"], dark: ["330 78% 65%", "330 38% 20%", "330 78% 82%"] },
];

export function isAccentTheme(value) {
  return accentThemes.some((theme) => theme.id === value);
}

function hslToRgb(hue, saturation, lightness) {
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const hueSection = hue / 60;
  const secondary = chroma * (1 - Math.abs((hueSection % 2) - 1));
  const offset = lightness - chroma / 2;
  let rgb;

  if (hueSection < 1) rgb = [chroma, secondary, 0];
  else if (hueSection < 2) rgb = [secondary, chroma, 0];
  else if (hueSection < 3) rgb = [0, chroma, secondary];
  else if (hueSection < 4) rgb = [0, secondary, chroma];
  else if (hueSection < 5) rgb = [secondary, 0, chroma];
  else rgb = [chroma, 0, secondary];

  return rgb.map((channel) => channel + offset);
}

function relativeLuminance(rgb) {
  const linear = rgb.map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  );
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

export function getPrimaryForeground(primaryHsl) {
  const [hue, saturation, lightness] = primaryHsl.match(/[\d.]+/g).map(Number);
  const backgroundLuminance = relativeLuminance(
    hslToRgb(hue, saturation / 100, lightness / 100)
  );
  const darkLuminance = 0;
  const whiteContrast = 1.05 / (backgroundLuminance + 0.05);
  const darkContrast = (backgroundLuminance + 0.05) / (darkLuminance + 0.05);
  return whiteContrast >= darkContrast ? "0 0% 100%" : "0 0% 0%";
}

export function applyAccentTheme(themeId, mode = "light") {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const selected = accentThemes.find((theme) => theme.id === themeId) || accentThemes[0];
  const [primary, accent, accentForeground] = selected[mode === "dark" ? "dark" : "light"];

  root.dataset.accent = selected.id;
  root.style.setProperty("--primary", primary);
  root.style.setProperty("--primary-foreground", getPrimaryForeground(primary));
  root.style.setProperty("--ring", primary);
  root.style.setProperty("--accent", accent);
  root.style.setProperty("--accent-foreground", accentForeground);
}
