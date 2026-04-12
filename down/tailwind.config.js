/** @type {import('tailwindcss').Config} */

// Helper: reference a CSS variable as an rgb() color with opacity support
const v = (name) => `rgb(var(--color-${name}) / <alpha-value>)`;

module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // MD3 Primary
        primary: {
          DEFAULT: v("primary"),
          container: v("primary-container"),
          fixed: v("primary-fixed"),
          "fixed-dim": v("primary-fixed-dim"),
        },
        "on-primary": v("on-primary"),
        "on-primary-container": v("on-primary-container"),
        "on-primary-fixed": v("on-primary-fixed"),

        // MD3 Secondary
        secondary: {
          DEFAULT: v("secondary"),
          container: v("secondary-container"),
          fixed: v("secondary-fixed"),
          "fixed-dim": v("secondary-fixed-dim"),
        },
        "on-secondary": v("on-secondary"),
        "on-secondary-container": v("on-secondary-container"),

        // MD3 Tertiary
        tertiary: {
          DEFAULT: v("tertiary"),
          container: v("tertiary-container"),
          fixed: v("tertiary-fixed"),
          "fixed-dim": v("tertiary-fixed-dim"),
        },
        "on-tertiary": v("on-tertiary"),
        "on-tertiary-container": v("on-tertiary-container"),

        // MD3 Surface system
        surface: {
          DEFAULT: v("surface"),
          dim: v("surface-dim"),
          bright: v("surface-bright"),
          tint: v("surface-tint"),
          "container-lowest": v("surface-container-lowest"),
          "container-low": v("surface-container-low"),
          container: v("surface-container"),
          "container-high": v("surface-container-high"),
          "container-highest": v("surface-container-highest"),
        },
        "on-surface": v("on-surface"),
        "on-surface-variant": v("on-surface-variant"),
        "surface-variant": v("surface-variant"),

        // MD3 Outline
        outline: {
          DEFAULT: v("outline"),
          variant: v("outline-variant"),
        },

        // MD3 Error
        error: {
          DEFAULT: v("error"),
          container: v("error-container"),
        },
        "on-error": v("on-error"),
        "on-error-container": v("on-error-container"),

        // MD3 Inverse
        "inverse-surface": v("inverse-surface"),
        "inverse-on-surface": v("inverse-on-surface"),
        "inverse-primary": v("inverse-primary"),

        // Background alias
        background: v("background"),
        "on-background": v("on-background"),

        // Scrim
        scrim: v("scrim"),

        // Status colors
        status: {
          voting: { fg: v("status-voting-fg"), bg: v("status-voting-bg") },
          confirmed: { fg: v("status-confirmed-fg"), bg: v("status-confirmed-bg") },
          pending: { fg: v("status-pending-fg"), bg: v("status-pending-bg") },
        },

        // Avatar palette (same in light & dark — vibrant colors)
        avatar: {
          red: "#FE6B6B",
          teal: "#4ECDC4",
          sky: "#45B7D1",
          sage: "#96CEB4",
          orange: "#FEB64F",
          purple: "#C681F6",
          green: "#4FC294",
          pink: "#FE7FA3",
        },

        // Category pill accent colors
        "pill-food": v("pill-food"),
        "pill-food-text": v("pill-food-text"),
        "pill-drinks": v("pill-drinks"),
        "pill-drinks-text": v("pill-drinks-text"),
        "pill-movie": v("pill-movie"),
        "pill-movie-text": v("pill-movie-text"),
        "pill-outdoor": v("pill-outdoor"),
        "pill-outdoor-text": v("pill-outdoor-text"),
        "pill-games": v("pill-games"),
        "pill-games-text": v("pill-games-text"),
      },
      fontFamily: {
        heading: ["PlusJakartaSans_700Bold"],
        "heading-extrabold": ["PlusJakartaSans_800ExtraBold"],
        "heading-semibold": ["PlusJakartaSans_600SemiBold"],
        body: ["BeVietnamPro_400Regular"],
        "body-medium": ["BeVietnamPro_500Medium"],
        "body-semibold": ["BeVietnamPro_600SemiBold"],
        label: ["BeVietnamPro_500Medium"],
      },
      borderRadius: {
        card: "20px",
        "card-lg": "24px",
        button: "16px",
        input: "14px",
        chip: "9999px",
      },
    },
  },
  plugins: [],
};
