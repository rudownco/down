import type { Config } from 'tailwindcss';
import { borderRadius } from '../common/src/theme/tokens';

const c = (name: string) => `rgb(var(--color-${name}) / <alpha-value>)`;

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: c('primary'),
          container: c('primary-container'),
          fixed: c('primary-fixed'),
          'fixed-dim': c('primary-fixed-dim'),
        },
        'on-primary': c('on-primary'),
        'on-primary-container': c('on-primary-container'),
        'on-primary-fixed': c('on-primary-fixed'),

        secondary: {
          DEFAULT: c('secondary'),
          container: c('secondary-container'),
          fixed: c('secondary-fixed'),
          'fixed-dim': c('secondary-fixed-dim'),
        },
        'on-secondary': c('on-secondary'),
        'on-secondary-container': c('on-secondary-container'),

        tertiary: {
          DEFAULT: c('tertiary'),
          container: c('tertiary-container'),
          fixed: c('tertiary-fixed'),
          'fixed-dim': c('tertiary-fixed-dim'),
        },
        'on-tertiary': c('on-tertiary'),
        'on-tertiary-container': c('on-tertiary-container'),

        surface: {
          DEFAULT: c('surface'),
          dim: c('surface-dim'),
          bright: c('surface-bright'),
          tint: c('surface-tint'),
          'container-lowest': c('surface-container-lowest'),
          'container-low': c('surface-container-low'),
          container: c('surface-container'),
          'container-high': c('surface-container-high'),
          'container-highest': c('surface-container-highest'),
        },
        'on-surface': c('on-surface'),
        'on-surface-variant': c('on-surface-variant'),
        'surface-variant': c('surface-variant'),

        outline: {
          DEFAULT: c('outline'),
          variant: c('outline-variant'),
        },

        error: {
          DEFAULT: c('error'),
          container: c('error-container'),
        },
        'on-error': c('on-error'),
        'on-error-container': c('on-error-container'),

        'inverse-surface': c('inverse-surface'),
        'inverse-on-surface': c('inverse-on-surface'),
        'inverse-primary': c('inverse-primary'),

        background: c('background'),
        'on-background': c('on-background'),
        scrim: c('scrim'),

        // Avatar palette — same in light and dark
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

        // Pill accent colors (dark variants handled inline where needed)
        'pill-food':         '#FFEBB7',
        'pill-food-text':    '#76574E',
        'pill-drinks':       '#E2F0D9',
        'pill-drinks-text':  '#3E6842',
        'pill-movie':        '#F3E5F5',
        'pill-movie-text':   '#6A1B9A',
        'pill-outdoor':      '#E0F7FA',
        'pill-outdoor-text': '#006064',
        'pill-games':        '#FFF9C4',
        'pill-games-text':   '#F9A825',
      },
      borderRadius,
      fontFamily: {
        heading: ['var(--font-plus-jakarta)', 'system-ui', 'sans-serif'],
        body:    ['var(--font-be-vietnam)',   'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
