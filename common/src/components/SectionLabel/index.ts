export interface SectionLabelProps {
  text: string;
  className?: string;
}

// TypeScript fallback — bundler replaces with .native.tsx or .web.tsx at runtime
export { SectionLabel } from './index.web';
