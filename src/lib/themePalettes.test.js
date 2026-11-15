import test from "node:test";
import assert from "node:assert/strict";
import { accentThemes, getPrimaryForeground } from "./themePalettes.js";

function luminanceFromHsl(hsl) {
  const [h, s, l] = hsl.match(/[\d.]+/g).map(Number);
  const c = (1 - Math.abs(2 * (l / 100) - 1)) * (s / 100);
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l / 100 - c / 2;
  let rgb;
  if (h < 60) rgb = [c, x, 0];
  else if (h < 120) rgb = [x, c, 0];
  else if (h < 180) rgb = [0, c, x];
  else if (h < 240) rgb = [0, x, c];
  else if (h < 300) rgb = [x, 0, c];
  else rgb = [c, 0, x];
  const linear = rgb.map((channel) => {
    const value = channel + m;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

test("all twelve palettes provide at least WCAG AA contrast for primary button text", () => {
  assert.equal(accentThemes.length, 12);
  for (const palette of accentThemes) {
    for (const mode of ["light", "dark"]) {
      const foreground = getPrimaryForeground(palette[mode][0]);
      const backgroundLuminance = luminanceFromHsl(palette[mode][0]);
      const foregroundLuminance = foreground === "0 0% 100%" ? 1 : 0;
      const ratio = (Math.max(backgroundLuminance, foregroundLuminance) + 0.05) /
        (Math.min(backgroundLuminance, foregroundLuminance) + 0.05);
      assert.ok(ratio >= 4.5, `${palette.name} ${mode}: ${ratio.toFixed(2)}:1`);
    }
  }
});
