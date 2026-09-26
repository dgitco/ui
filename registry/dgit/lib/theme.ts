import { useEffect, useState } from "react";

/**
 * Light, dark, or following the system. The choice is kept in localStorage and applied as
 * `<html data-theme="light|dark">`, which dgit.css reads. Put `themeScript` in <head> so the
 * first paint already has the right theme.
 */
export type ThemeChoice = "system" | "light" | "dark";

export const THEME_KEY = "dgit-theme";

/** Inline in <head> (before styles paint): applies a stored choice; "system" leaves it to CSS. */
export const themeScript = `try{var t=localStorage.getItem("${THEME_KEY}");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;

function readChoice(): ThemeChoice {
  try {
    const v = localStorage.getItem(THEME_KEY);
    return v === "light" || v === "dark" ? v : "system";
  } catch {
    return "system";
  }
}

export function applyTheme(choice: ThemeChoice): void {
  const root = document.documentElement;
  if (choice === "system") delete root.dataset.theme;
  else root.dataset.theme = choice;
  try {
    if (choice === "system") localStorage.removeItem(THEME_KEY);
    else localStorage.setItem(THEME_KEY, choice);
  } catch {}
}

export function useTheme(): [ThemeChoice, (next: ThemeChoice) => void] {
  const [choice, setChoice] = useState<ThemeChoice>(() => (typeof window === "undefined" ? "system" : readChoice()));
  useEffect(() => applyTheme(choice), [choice]);
  return [choice, setChoice];
}
