// Resolved hex palette for native props (Ionicons color, ActivityIndicator color,
// TextInput placeholderTextColor, etc.) that can't accept Tailwind className.
//
// For everything else — backgrounds, text, borders — prefer Tailwind utility
// classes (`bg-surface`, `text-on-surface`) so dark mode swaps automatically
// via the CSS variables in down/global.css.

import { useTheme } from "../context/ThemeContext";

export interface ResolvedColors {
  primary: string;
  primaryContainer: string;
  onPrimary: string;
  onPrimaryContainer: string;
  secondary: string;
  tertiary: string;
  surface: string;
  surfaceContainerLowest: string;
  onSurface: string;
  onSurfaceVariant: string;
  outline: string;
  outlineVariant: string;
  error: string;
  onError: string;
}

const lightColors: ResolvedColors = {
  primary: "#3F6377",
  primaryContainer: "#C4E7FF",
  onPrimary: "#FFFFFF",
  onPrimaryContainer: "#274B5F",
  secondary: "#3E6842",
  tertiary: "#76574E",
  surface: "#F5FAFF",
  surfaceContainerLowest: "#FFFFFF",
  onSurface: "#131D23",
  onSurfaceVariant: "#374955",
  outline: "#677A86",
  outlineVariant: "#B6C9D7",
  error: "#BA1A1A",
  onError: "#FFFFFF",
};

const darkColors: ResolvedColors = {
  primary: "#A7CBE3",
  primaryContainer: "#274B5F",
  onPrimary: "#00344A",
  onPrimaryContainer: "#C4E7FF",
  secondary: "#A4D2A4",
  tertiary: "#E6BEB2",
  surface: "#101418",
  surfaceContainerLowest: "#0B0F12",
  onSurface: "#E1E2E5",
  onSurfaceVariant: "#BFC8D0",
  outline: "#8A939B",
  outlineVariant: "#3F484F",
  error: "#FFB4AB",
  onError: "#690005",
};

export function useThemeColors(): ResolvedColors {
  const { isDark } = useTheme();
  return isDark ? darkColors : lightColors;
}
