import React, { createContext, useContext, useEffect, useMemo } from "react";

const ColorModeContext = createContext(null);

/** App is always light; header/sidebar use dark styling via fixed classes (no html.dark). */
export function ColorModeProvider({ children }) {
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    try {
      localStorage.removeItem("colorMode");
    } catch {
      // ignore
    }
  }, []);

  const value = useMemo(
    () => ({
      mode: "light",
      toggleMode() {
        // Theme toggle removed — always light content area.
      },
    }),
    []
  );

  return <ColorModeContext.Provider value={value}>{children}</ColorModeContext.Provider>;
}

export function useColorMode() {
  const ctx = useContext(ColorModeContext);
  if (!ctx) throw new Error("useColorMode must be used within ColorModeProvider");
  return ctx;
}
