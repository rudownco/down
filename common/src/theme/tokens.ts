// Design tokens — single source of truth for all platforms
// Both RN (tailwind.config.js) and web (tailwind.config.ts) import from here

export const colors = {
  // MD3 Primary
  primary: {
    DEFAULT: '#3F6377',
    container: '#C4E7FF',
    fixed: '#C4E7FF',
    'fixed-dim': '#A7CBE3',
  },
  'on-primary': '#FFFFFF',
  'on-primary-container': '#274B5F',
  'on-primary-fixed': '#001E2D',

  // MD3 Secondary
  secondary: {
    DEFAULT: '#3E6842',
    container: '#BFEFBF',
    fixed: '#BFEFBF',
    'fixed-dim': '#A4D2A4',
  },
  'on-secondary': '#FFFFFF',
  'on-secondary-container': '#264F2C',

  // MD3 Tertiary
  tertiary: {
    DEFAULT: '#76574E',
    container: '#FFDBD0',
    fixed: '#FFDBD0',
    'fixed-dim': '#E6BEB2',
  },
  'on-tertiary': '#FFFFFF',
  'on-tertiary-container': '#5D4037',

  // MD3 Surface system
  surface: {
    DEFAULT: '#F5FAFF',
    dim: '#D1DBE4',
    bright: '#F5FAFF',
    tint: '#3F6377',
    'container-lowest': '#FFFFFF',
    'container-low': '#EBF5FD',
    container: '#E5EFF8',
    'container-high': '#E0E9F2',
    'container-highest': '#DAE4EC',
  },
  'on-surface': '#131D23',
  'on-surface-variant': '#374955',
  'surface-variant': '#DAE4EC',

  // MD3 Outline
  outline: {
    DEFAULT: '#677A86',
    variant: '#B6C9D7',
  },

  // MD3 Error
  error: {
    DEFAULT: '#BA1A1A',
    container: '#FFDAD6',
  },
  'on-error': '#FFFFFF',
  'on-error-container': '#93000A',

  // MD3 Inverse
  'inverse-surface': '#283238',
  'inverse-on-surface': '#E8F2FA',
  'inverse-primary': '#A7CBE3',

  // Background alias
  background: '#F5FAFF',
  'on-background': '#131D23',

  // Scrim
  scrim: '#000000',

  // Status colors
  status: {
    voting:    { fg: '#D17D04', bg: '#FFEFC7' },
    confirmed: { fg: '#1AA04F', bg: '#D8F8E7' },
    pending:   { fg: '#7D859E', bg: '#EEEFF5' },
  },

  // Avatar palette (8 options, deterministic by name)
  avatar: {
    red:    '#FE6B6B',
    teal:   '#4ECDC4',
    sky:    '#45B7D1',
    sage:   '#96CEB4',
    orange: '#FEB64F',
    purple: '#C681F6',
    green:  '#4FC294',
    pink:   '#FE7FA3',
  },

  // Category pill accent colors
  'pill-food':          '#FFEBB7',
  'pill-food-text':     '#76574E',
  'pill-drinks':        '#E2F0D9',
  'pill-drinks-text':   '#3E6842',
  'pill-movie':         '#F3E5F5',
  'pill-movie-text':    '#6A1B9A',
  'pill-outdoor':       '#E0F7FA',
  'pill-outdoor-text':  '#006064',
  'pill-games':         '#FFF9C4',
  'pill-games-text':    '#F9A825',
} as const;

// MD3 Dark theme — surfaces are dark, primaries become lighter tints
export const darkColors = {
  // MD3 Primary (light tints on dark bg)
  primary: {
    DEFAULT: '#A7CBE3',
    container: '#274B5F',
    fixed: '#C4E7FF',
    'fixed-dim': '#A7CBE3',
  },
  'on-primary': '#00344A',
  'on-primary-container': '#C4E7FF',
  'on-primary-fixed': '#001E2D',

  // MD3 Secondary
  secondary: {
    DEFAULT: '#A4D2A4',
    container: '#264F2C',
    fixed: '#BFEFBF',
    'fixed-dim': '#A4D2A4',
  },
  'on-secondary': '#0D3915',
  'on-secondary-container': '#BFEFBF',

  // MD3 Tertiary
  tertiary: {
    DEFAULT: '#E6BEB2',
    container: '#5D4037',
    fixed: '#FFDBD0',
    'fixed-dim': '#E6BEB2',
  },
  'on-tertiary': '#432B22',
  'on-tertiary-container': '#FFDBD0',

  // MD3 Surface system (dark)
  surface: {
    DEFAULT: '#101418',
    dim: '#101418',
    bright: '#363A3E',
    tint: '#A7CBE3',
    'container-lowest': '#0B0F12',
    'container-low': '#1B1F23',
    container: '#1F2327',
    'container-high': '#292D31',
    'container-highest': '#343A3F',
  },
  'on-surface': '#E1E2E5',
  'on-surface-variant': '#BFC8D0',
  'surface-variant': '#3F484F',

  // MD3 Outline
  outline: {
    DEFAULT: '#8A939B',
    variant: '#3F484F',
  },

  // MD3 Error
  error: {
    DEFAULT: '#FFB4AB',
    container: '#93000A',
  },
  'on-error': '#690005',
  'on-error-container': '#FFDAD6',

  // MD3 Inverse
  'inverse-surface': '#E1E2E5',
  'inverse-on-surface': '#2E3236',
  'inverse-primary': '#3F6377',

  // Background alias
  background: '#101418',
  'on-background': '#E1E2E5',

  // Scrim
  scrim: '#000000',

  // Status colors (dark variants)
  status: {
    voting:    { fg: '#FFD54F', bg: '#3E3018' },
    confirmed: { fg: '#66DD8A', bg: '#1A3320' },
    pending:   { fg: '#9EA2B8', bg: '#252730' },
  },

  // Avatar palette (same — vibrant colors work on dark)
  avatar: {
    red:    '#FE6B6B',
    teal:   '#4ECDC4',
    sky:    '#45B7D1',
    sage:   '#96CEB4',
    orange: '#FEB64F',
    purple: '#C681F6',
    green:  '#4FC294',
    pink:   '#FE7FA3',
  },

  // Category pill accent colors (darker bg, lighter text)
  'pill-food':          '#3E3018',
  'pill-food-text':     '#FFDDB5',
  'pill-drinks':        '#1A3320',
  'pill-drinks-text':   '#A4D2A4',
  'pill-movie':         '#2D1B3D',
  'pill-movie-text':    '#D1A3E6',
  'pill-outdoor':       '#0A2C30',
  'pill-outdoor-text':  '#80D8E0',
  'pill-games':         '#3E3818',
  'pill-games-text':    '#FFE082',
} as const;

// Avatar palette as a flat array (for index-based lookup)
export const avatarPalette = [
  colors.avatar.red,
  colors.avatar.teal,
  colors.avatar.sky,
  colors.avatar.sage,
  colors.avatar.orange,
  colors.avatar.purple,
  colors.avatar.green,
  colors.avatar.pink,
] as const;

export const fontFamily = {
  heading:           ['PlusJakartaSans_700Bold'],
  'heading-extrabold': ['PlusJakartaSans_800ExtraBold'],
  'heading-semibold':  ['PlusJakartaSans_600SemiBold'],
  body:              ['BeVietnamPro_400Regular'],
  'body-medium':     ['BeVietnamPro_500Medium'],
  'body-semibold':   ['BeVietnamPro_600SemiBold'],
  label:             ['BeVietnamPro_500Medium'],
} as const;

export const borderRadius = {
  card:     '20px',
  'card-lg': '24px',
  button:   '16px',
  input:    '14px',
  chip:     '9999px',
} as const;
