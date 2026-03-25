/** @type {import('tailwindcss').Config} */
module.exports = {
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
          DEFAULT: "#3F6377",
          container: "#C4E7FF",
          fixed: "#C4E7FF",
          "fixed-dim": "#A7CBE3",
        },
        "on-primary": "#FFFFFF",
        "on-primary-container": "#274B5F",
        "on-primary-fixed": "#001E2D",

        // MD3 Secondary
        secondary: {
          DEFAULT: "#3E6842",
          container: "#BFEFBF",
          fixed: "#BFEFBF",
          "fixed-dim": "#A4D2A4",
        },
        "on-secondary": "#FFFFFF",
        "on-secondary-container": "#264F2C",

        // MD3 Tertiary
        tertiary: {
          DEFAULT: "#76574E",
          container: "#FFDBD0",
          fixed: "#FFDBD0",
          "fixed-dim": "#E6BEB2",
        },
        "on-tertiary": "#FFFFFF",
        "on-tertiary-container": "#5D4037",

        // MD3 Surface system
        surface: {
          DEFAULT: "#F5FAFF",
          dim: "#D1DBE4",
          bright: "#F5FAFF",
          tint: "#3F6377",
          "container-lowest": "#FFFFFF",
          "container-low": "#EBF5FD",
          container: "#E5EFF8",
          "container-high": "#E0E9F2",
          "container-highest": "#DAE4EC",
        },
        "on-surface": "#131D23",
        "on-surface-variant": "#374955",
        "surface-variant": "#DAE4EC",

        // MD3 Outline
        outline: {
          DEFAULT: "#677A86",
          variant: "#B6C9D7",
        },

        // MD3 Error
        error: {
          DEFAULT: "#BA1A1A",
          container: "#FFDAD6",
        },
        "on-error": "#FFFFFF",
        "on-error-container": "#93000A",

        // MD3 Inverse
        "inverse-surface": "#283238",
        "inverse-on-surface": "#E8F2FA",
        "inverse-primary": "#A7CBE3",

        // Background alias
        background: "#F5FAFF",
        "on-background": "#131D23",

        // Scrim
        scrim: "#000000",

        // Status colors
        status: {
          voting: { fg: "#D17D04", bg: "#FFEFC7" },
          confirmed: { fg: "#1AA04F", bg: "#D8F8E7" },
          pending: { fg: "#7D859E", bg: "#EEEFF5" },
        },

        // Avatar palette
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

        // Category pill accent colors (from Stitch export2)
        "pill-food": "#FFEBB7",
        "pill-food-text": "#76574E",
        "pill-drinks": "#E2F0D9",
        "pill-drinks-text": "#3E6842",
        "pill-movie": "#F3E5F5",
        "pill-movie-text": "#6A1B9A",
        "pill-outdoor": "#E0F7FA",
        "pill-outdoor-text": "#006064",
        "pill-games": "#FFF9C4",
        "pill-games-text": "#F9A825",
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
