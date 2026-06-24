import { ReactNode } from "react";
import { useThemeMode, useAccent } from "../util/theme";
import { ThemeContext, ThemeContextValue } from "./themeContext";

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [themeMode, setThemeMode] = useThemeMode();
  const [accent, setAccent] = useAccent();

  const value: ThemeContextValue = {
    themeMode,
    setThemeMode,
    accent,
    setAccent
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
