import React from 'react';
import type { InputProps } from './index';

export function Input({ label, value, onChangeText, placeholder, multiline, numberOfLines, icon, className }: InputProps) {
  const sharedClass = `
    w-full rounded-input border border-outline-variant/40 bg-surface-container-low
    px-4 py-3 text-sm text-on-surface placeholder:text-outline
    focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary
    transition-colors ${icon ? 'pl-10' : ''} ${className ?? ''}
  `;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium text-on-surface-variant uppercase tracking-wide">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline text-base">{icon}</span>
        )}
        {multiline
          ? <textarea rows={numberOfLines ?? 3} value={value} onChange={(e) => onChangeText?.(e.target.value)} placeholder={placeholder} className={sharedClass} />
          : <input  value={value} onChange={(e) => onChangeText?.(e.target.value)} placeholder={placeholder} className={sharedClass} />
        }
      </div>
    </div>
  );
}
