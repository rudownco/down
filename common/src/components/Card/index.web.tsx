import React from 'react';
import type { CardProps } from './index';

const VARIANT_CLASSES = {
  default: 'bg-surface-container-lowest',
  nested:  'bg-surface-container-low',
  accent:  'bg-tertiary-container',
};

export function Card({ children, variant = 'default', className }: CardProps) {
  // Web cards don't tilt — tilt is a mobile-only aesthetic
  return (
    <div className={`rounded-card border border-outline-variant/20 shadow-sm p-5 ${VARIANT_CLASSES[variant]} ${className ?? ''}`}>
      {children}
    </div>
  );
}
