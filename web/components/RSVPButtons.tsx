'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { RSVPStatus } from '@down/common';

const options: { status: RSVPStatus; label: string; emoji: string }[] = [
  { status: 'going',     label: "I'm Down",  emoji: '✅' },
  { status: 'maybe',     label: 'Maybe...',  emoji: '🤔' },
  { status: 'not_going', label: 'Flaking',   emoji: '😢' },
];

interface RSVPButtonsProps {
  current?: RSVPStatus | null;
  onSelect: (status: RSVPStatus) => void;
  disabled?: boolean;
}

export function RSVPButtons({ current, onSelect, disabled }: RSVPButtonsProps) {
  const [selected, setSelected] = useState<RSVPStatus | null>(current ?? null);

  function handleSelect(status: RSVPStatus) {
    setSelected(status);
    onSelect(status);
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {options.map(({ status, label, emoji }) => (
        <button
          key={status}
          disabled={disabled}
          onClick={() => handleSelect(status)}
          className={cn(
            'flex items-center gap-1.5 px-4 py-2.5 rounded-button text-sm font-medium transition-all border',
            selected === status
              ? 'bg-primary text-on-primary border-primary shadow-sm scale-[1.02]'
              : 'bg-surface-container-lowest text-on-surface border-outline-variant/40 hover:border-primary/40 hover:bg-surface-container-low'
          )}
        >
          <span>{emoji}</span>
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
