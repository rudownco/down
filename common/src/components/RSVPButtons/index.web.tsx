'use client';

import React, { useState } from 'react';
import type { RSVPButtonsProps } from './index';
import type { RSVPStatus } from '../../types';

const OPTIONS: { status: RSVPStatus; label: string; emoji: string }[] = [
  { status: 'going',     label: "I'm Down",  emoji: '✅' },
  { status: 'maybe',     label: 'Maybe...',  emoji: '🤔' },
  { status: 'not_going', label: 'Flaking',   emoji: '😢' },
];

export function RSVPButtons({ selectedStatus, onSelect, className }: RSVPButtonsProps) {
  const [selected, setSelected] = useState<RSVPStatus | undefined>(selectedStatus);

  function handleSelect(status: RSVPStatus) {
    setSelected(status);
    onSelect(status);
  }

  return (
    <div className={`flex gap-2 flex-wrap ${className ?? ''}`}>
      {OPTIONS.map(({ status, label, emoji }) => (
        <button
          key={status}
          onClick={() => handleSelect(status)}
          className={`
            flex items-center gap-1.5 px-4 py-2.5 rounded-button text-sm font-medium
            transition-all border
            ${selected === status
              ? 'bg-primary text-on-primary border-primary scale-[1.02] shadow-sm'
              : 'bg-surface-container-lowest text-on-surface border-outline-variant/40 hover:border-primary/40 hover:bg-surface-container-low'
            }
          `}
        >
          <span>{emoji}</span>
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
