// Runtime CSS variable overrides for dark mode.
//
// Why this exists: NativeWind v4 compiles utility classes like `bg-surface` to
// reference CSS variables (defined in `down/global.css`). On the web, the
// `.dark` class selector in global.css would swap those variables. In React
// Native, NativeWind does not automatically apply the `.dark` selector at
// runtime — the `vars()` API is the documented way to push a different set of
// CSS variables down the tree.
//
// We only need to define the *dark* overrides. Light is the default, sourced
// from the `:root` block in global.css. Apply `darkThemeVars` to a wrapping
// `<View>` whenever `isDark` is true; children inherit the new values via
// CSS variable cascading.
//
// IMPORTANT: keep these values in sync with the `.dark` block in
// `down/global.css`. global.css is the canonical source for web; this file
// is the canonical source for React Native runtime.

import { vars } from 'nativewind';

export const darkThemeVars = vars({
  // MD3 Primary
  '--color-primary': '167 203 227',
  '--color-primary-container': '39 75 95',
  '--color-primary-fixed': '196 231 255',
  '--color-primary-fixed-dim': '167 203 227',
  '--color-on-primary': '0 52 74',
  '--color-on-primary-container': '196 231 255',
  '--color-on-primary-fixed': '0 30 45',

  // MD3 Secondary
  '--color-secondary': '164 210 164',
  '--color-secondary-container': '38 79 44',
  '--color-secondary-fixed': '191 239 191',
  '--color-secondary-fixed-dim': '164 210 164',
  '--color-on-secondary': '13 57 21',
  '--color-on-secondary-container': '191 239 191',

  // MD3 Tertiary
  '--color-tertiary': '230 190 178',
  '--color-tertiary-container': '93 64 55',
  '--color-tertiary-fixed': '255 219 208',
  '--color-tertiary-fixed-dim': '230 190 178',
  '--color-on-tertiary': '67 43 34',
  '--color-on-tertiary-container': '255 219 208',

  // MD3 Surface system
  '--color-surface': '16 20 24',
  '--color-surface-dim': '16 20 24',
  '--color-surface-bright': '54 58 62',
  '--color-surface-tint': '167 203 227',
  '--color-surface-container-lowest': '11 15 18',
  '--color-surface-container-low': '27 31 35',
  '--color-surface-container': '31 35 39',
  '--color-surface-container-high': '41 45 49',
  '--color-surface-container-highest': '52 58 63',
  '--color-on-surface': '225 226 229',
  '--color-on-surface-variant': '191 200 208',
  '--color-surface-variant': '63 72 79',

  // MD3 Outline
  '--color-outline': '138 147 155',
  '--color-outline-variant': '63 72 79',

  // MD3 Error
  '--color-error': '255 180 171',
  '--color-error-container': '147 0 10',
  '--color-on-error': '105 0 5',
  '--color-on-error-container': '255 218 214',

  // MD3 Inverse
  '--color-inverse-surface': '225 226 229',
  '--color-inverse-on-surface': '46 50 54',
  '--color-inverse-primary': '63 99 119',

  // Background
  '--color-background': '16 20 24',
  '--color-on-background': '225 226 229',

  // Scrim
  '--color-scrim': '0 0 0',

  // Status
  '--color-status-voting-fg': '255 213 79',
  '--color-status-voting-bg': '62 48 24',
  '--color-status-confirmed-fg': '102 221 138',
  '--color-status-confirmed-bg': '26 51 32',
  '--color-status-pending-fg': '158 162 184',
  '--color-status-pending-bg': '37 39 48',

  // Category pills
  '--color-pill-food': '62 48 24',
  '--color-pill-food-text': '255 221 181',
  '--color-pill-drinks': '26 51 32',
  '--color-pill-drinks-text': '164 210 164',
  '--color-pill-movie': '45 27 61',
  '--color-pill-movie-text': '209 163 230',
  '--color-pill-outdoor': '10 44 48',
  '--color-pill-outdoor-text': '128 216 224',
  '--color-pill-games': '62 56 24',
  '--color-pill-games-text': '255 224 130',
});
