import type { Config } from 'tailwindcss';
import { colors, borderRadius } from '../common/src/theme/tokens';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors,
      borderRadius,
      fontFamily: {
        // Web uses system/Google fonts — same visual feel
        heading: ['var(--font-plus-jakarta)', 'system-ui', 'sans-serif'],
        body:    ['var(--font-be-vietnam)',   'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
