import React from 'react';
import type { ChipProps } from './index';

const VARIANT_CLASSES = {
  primary:   { base: 'bg-primary-container text-on-primary-container', active: 'bg-primary text-on-primary' },
  secondary: { base: 'bg-secondary-container text-on-secondary-container', active: 'bg-secondary text-on-secondary' },
  tertiary:  { base: 'bg-tertiary-container text-on-tertiary-container', active: 'bg-tertiary text-on-tertiary' },
  neutral:   { base: 'bg-surface-container-highest text-on-surface-variant', active: 'bg-primary text-on-primary' },
};

export function Chip({ label, emoji, selected = false, onPress, variant = 'neutral', className }: ChipProps) {
  const styles = VARIANT_CLASSES[variant];

  return (
    <button
      onClick={onPress}
      className={`
        inline-flex items-center gap-1.5 px-5 py-2.5 rounded-chip
        font-body-medium text-sm transition-all active:scale-95
        ${selected ? styles.active : styles.base}
        ${className ?? ''}
      `}
    >
      {emoji && <span className="text-lg">{emoji}</span>}
      {label}
    </button>
  );
}
