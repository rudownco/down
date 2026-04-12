import React, { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme as useNWColorScheme } from "nativewind";
import AsyncStorage from "@react-native-async-storage/async-storage";

type ThemeMode = "light" | "dark" | "system";

interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: "system",
  setMode: () => {},
  isDark: false,
});

const STORAGE_KEY = "theme-mode";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { colorScheme, setColorScheme } = useNWColorScheme();
  const [mode, setModeState] = useState<ThemeMode>("system");

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((v) => {
      if (v === "light" || v === "dark" || v === "system") {
        setModeState(v);
        setColorScheme(v);
      }
    });
  }, []);

  const setMode = (m: ThemeMode) => {
    setModeState(m);
    setColorScheme(m);
    AsyncStorage.setItem(STORAGE_KEY, m);
  };

  return (
    <ThemeContext.Provider
      value={{ mode, setMode, isDark: colorScheme === "dark" }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
