import type { ReactNode } from 'react';

export interface CardProps {
  children: ReactNode;
  tilt?: number;
  variant?: 'default' | 'nested' | 'accent';
  className?: string;
}

// TypeScript fallback — bundler replaces with .native.tsx or .web.tsx at runtime
export { Card } from './index.web';
