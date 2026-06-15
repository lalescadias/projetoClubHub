const DEFAULT_THEME_COLOR = "#1D4635";

function normalizeHex(color: string) {
  return /^#[0-9A-Fa-f]{6}$/.test(color) ? color : DEFAULT_THEME_COLOR;
}

function mix(color: string, target: string, amount: number) {
  const source = normalizeHex(color).slice(1);
  const destination = target.slice(1);
  const channels = [0, 2, 4].map((offset) => {
    const start = Number.parseInt(source.slice(offset, offset + 2), 16);
    const end = Number.parseInt(destination.slice(offset, offset + 2), 16);
    return Math.round(start + (end - start) * amount)
      .toString(16)
      .padStart(2, "0");
  });
  return `#${channels.join("")}`;
}

export function applyClubTheme(themeColor?: string) {
  const primary = normalizeHex(themeColor ?? DEFAULT_THEME_COLOR);
  const root = document.documentElement;

  root.style.setProperty("--club-950", mix(primary, "#000000", 0.58));
  root.style.setProperty("--club-900", mix(primary, "#000000", 0.35));
  root.style.setProperty("--club-800", primary);
  root.style.setProperty("--club-600", mix(primary, "#FFFFFF", 0.18));
  root.style.setProperty("--club-500", mix(primary, "#FFFFFF", 0.3));
  root.style.setProperty("--club-100", mix(primary, "#FFFFFF", 0.88));
}
