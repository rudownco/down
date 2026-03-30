export interface InputProps {
  label?: string;
  icon?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  numberOfLines?: number;
  className?: string;
}

// TypeScript fallback — bundler replaces with .native.tsx or .web.tsx at runtime
export { Input } from './index.web';
