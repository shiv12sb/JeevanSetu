"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const THEME_STORAGE_KEY = "jeevansetu_theme";
const ALLOWED_THEMES = ["light", "dark"];

const ThemeContext = createContext({
  theme: "light",
  setTheme: () => {},
  resolvedTheme: "light",
  isDark: false,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }) {
  // Default is ALWAYS strictly 'light' mode
  const [theme, setThemeState] = useState("light");

  // Helper to apply theme classes and attributes to DOM
  const applyThemeToDOM = (themeToApply) => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const isDark = themeToApply === "dark";

    if (isDark) {
      root.classList.add("dark");
      root.setAttribute("data-theme", "dark");
      root.style.colorScheme = "dark";
    } else {
      root.classList.remove("dark");
      root.setAttribute("data-theme", "light");
      root.style.colorScheme = "light";
    }
  };

  // On mount: Read saved user choice from localStorage (strictly 'light' or 'dark')
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme && ALLOWED_THEMES.includes(savedTheme)) {
        setThemeState(savedTheme);
        applyThemeToDOM(savedTheme);
      } else {
        // Fallback for fresh browser, invalid value, or 'system' -> default to 'light'
        setThemeState("light");
        applyThemeToDOM("light");
        localStorage.setItem(THEME_STORAGE_KEY, "light");
      }
    } catch (e) {
      // Fallback in case localStorage access is restricted
      setThemeState("light");
      applyThemeToDOM("light");
    }
  }, []);

  const setTheme = (newTheme) => {
    // Only 'light' and 'dark' are valid explicit selections
    const validatedTheme = newTheme === "dark" ? "dark" : "light";
    setThemeState(validatedTheme);
    applyThemeToDOM(validatedTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, validatedTheme);
    } catch (e) {
      // ignore
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const isDark = theme === "dark";

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        resolvedTheme: theme,
        isDark,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export default ThemeContext;
