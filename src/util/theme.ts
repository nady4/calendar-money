import { useEffect, useState } from "react";

export type ThemeMode = "dark" | "light";

export interface AccentOption {
  id: string;
  label: string;
  color: string;
}

export const ACCENT_OPTIONS: AccentOption[] = [
  { id: "blue", label: "Blue", color: "#5b8cff" },
  { id: "violet", label: "Violet", color: "#8b5cf6" },
  { id: "pink", label: "Pink", color: "#ec4899" },
  { id: "rose", label: "Rose", color: "#f43f5e" },
  { id: "amber", label: "Amber", color: "#f59e0b" },
  { id: "emerald", label: "Emerald", color: "#10b981" }
];

const THEME_KEY = "calendar-money:theme";
const ACCENT_KEY = "calendar-money:accent";

const ACCENT_DEFAULTS = {
  accent: "#5b8cff",
  accentSoft: "rgba(91, 140, 255, 0.14)"
};

const getStored = <T extends string>(
  key: string,
  fallback: T
): T => {
  if (typeof window === "undefined") return fallback;
  try {
    const v = window.localStorage.getItem(key);
    return (v as T) ?? fallback;
  } catch {
    return fallback;
  }
};

const setStored = (key: string, value: string) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* no-op */
  }
};

const hexToRgba = (hex: string, alpha: number): string => {
  const cleaned = hex.replace("#", "");
  const full =
    cleaned.length === 3
      ? cleaned
          .split("")
          .map((c) => c + c)
          .join("")
      : cleaned;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const isValidHex = (value: string): boolean =>
  /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value);

const isValidMode = (v: string): v is ThemeMode =>
  v === "dark" || v === "light";

const applyAccent = (hex: string) => {
  if (typeof document === "undefined") return;
  if (!isValidHex(hex)) hex = ACCENT_DEFAULTS.accent;
  document.documentElement.style.setProperty("--cm-accent", hex);
  document.documentElement.style.setProperty(
    "--cm-accent-soft",
    hexToRgba(hex, 0.14)
  );
  document.documentElement.style.setProperty(
    "--cm-accent-strong",
    hexToRgba(hex, 0.4)
  );
};

const applyTheme = (mode: ThemeMode) => {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", mode);
};

const useThemeMode = (): [ThemeMode, (mode: ThemeMode) => void] => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const stored = getStored<string>(THEME_KEY, "dark");
    return isValidMode(stored) ? stored : "dark";
  });

  useEffect(() => {
    setStored(THEME_KEY, mode);
    applyTheme(mode);
  }, [mode]);

  return [mode, setMode];
};

const useAccent = (): [AccentOption, (option: AccentOption) => void] => {
  const initial: AccentOption = (() => {
    const storedId = getStored<string>(ACCENT_KEY, "blue");
    return (
      ACCENT_OPTIONS.find((o) => o.id === storedId) ?? ACCENT_OPTIONS[0]
    );
  })();

  const [option, setOption] = useState<AccentOption>(initial);

  useEffect(() => {
    setStored(ACCENT_KEY, option.id);
    applyAccent(option.color);
  }, [option]);

  return [option, setOption];
};

export {
  useThemeMode,
  useAccent,
  applyTheme,
  applyAccent
};
