"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export const THEME_STORAGE_KEY = "jeevansetu_theme";
export const ALLOWED_THEMES = ["light", "dark"];

const ThemeContext = createContext({
  theme: "dark",
  toggleTheme: () => {},
  setThemeState: () => {},
});

export function ThemeProvider({ children }) {
  // Default is strictly Dark Mode ('dark') for modern glassmorphism aesthetic
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (ALLOWED_THEMES.includes(savedTheme)) {
        setTheme(savedTheme);
        applyThemeClass(savedTheme);
      } else {
        setTheme("dark");
        applyThemeClass("dark");
        localStorage.setItem(THEME_STORAGE_KEY, "dark");
      }
    } catch (e) {
      // ignore in ssr
      applyThemeClass("dark");
    }
  }, []);

  const applyThemeClass = (targetTheme) => {
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      if (targetTheme === "dark") {
        root.classList.add("dark");
        root.setAttribute("data-theme", "dark");
        root.style.colorScheme = "dark";
      } else {
        root.classList.remove("dark");
        root.setAttribute("data-theme", "light");
        root.style.colorScheme = "light";
      }
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    applyThemeClass(nextTheme);
    try {
      localStorage.setItem("jeevansetu_theme", nextTheme);
    } catch (e) {
      // ignore
    }
  };

  const setThemeState = (newTheme) => {
    if (newTheme === "light" || newTheme === "dark") {
      setTheme(newTheme);
      applyThemeClass(newTheme);
      try {
        localStorage.setItem("jeevansetu_theme", newTheme);
      } catch (e) {
        // ignore
      }
    }
  };

  const isDark = theme === "dark";

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, setThemeState }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export default ThemeContext;
