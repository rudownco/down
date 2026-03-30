export interface ChipProps {
  label: string;
  emoji?: string;
  selected?: boolean;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'neutral';
  className?: string;
}

// TypeScript fallback — bundler replaces with .native.tsx or .web.tsx at runtime
export { Chip } from './index.web';
