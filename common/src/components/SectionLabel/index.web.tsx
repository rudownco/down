import React from 'react';
import type { SectionLabelProps } from './index';

export function SectionLabel({ text, className }: SectionLabelProps) {
  return (
    <p className={`text-xs font-medium text-on-surface-variant tracking-widest uppercase ${className ?? ''}`}>
      {text}
    </p>
  );
}
