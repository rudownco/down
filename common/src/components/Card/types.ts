import type { ReactNode } from 'react';

export interface CardProps {
  children: ReactNode;
  tilt?: number;
  variant?: 'default' | 'nested' | 'accent';
  className?: string;
}
