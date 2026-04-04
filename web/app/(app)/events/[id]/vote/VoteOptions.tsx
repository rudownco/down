'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { AvatarStack } from '@down/common';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { submitVotes } from '@down/common';
import type { VotingOption } from '@down/common';

interface Props {
  eventId: string;
  votingOptions: VotingOption[];
}

export default function VoteOptions({ eventId, votingOptions }: Props) {
  const [selected, setSelected] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const maxVotes = Math.max(0, ...votingOptions.map((o) => o.votes));

  function toggleOption(optionId: string) {
    setSelected((prev) =>
      prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId]
    );
  }

  async function handleSubmit() {
    if (selected.length === 0) return;
    setIsSubmitting(true);
    await submitVotes(supabase, eventId, selected).catch(console.error);
    setIsSubmitting(false);
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        {votingOptions.map((option) => {
          const isSelected = selected.includes(option.id);
          const isLeading  = option.votes === maxVotes && maxVotes > 0;
          const barWidth   = maxVotes > 0 ? (option.votes / maxVotes) * 100 : 0;

          return (
            <button
              key={option.id}
              onClick={() => toggleOption(option.id)}
              className={cn(
                'relative w-full text-left p-4 rounded-card border-2 transition-all overflow-hidden',
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-outline-variant/30 bg-surface-container-lowest hover:border-primary/40'
              )}
            >
              <div
                className="absolute inset-0 bg-primary/6 transition-all duration-500"
                style={{ width: `${barWidth}%` }}
              />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="font-heading font-semibold text-on-surface">{option.date}</p>
                  <p className="text-sm text-on-surface-variant">{option.time}</p>
                </div>
                <div className="flex items-center gap-3">
                  <AvatarStack users={option.voters} maxVisible={3} size="xs" />
                  <span className="text-sm font-medium text-on-surface-variant">
                    {option.votes} {option.votes === 1 ? 'vote' : 'votes'}
                  </span>
                  {isLeading && (
                    <span className="text-xs bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-chip font-medium">
                      🔥 Leading
                    </span>
                  )}
                  {isSelected && (
                    <span className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <Check size={14} className="text-on-primary" />
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <Button
        variant="primary"
        size="lg"
        className="w-full"
        disabled={selected.length === 0 || isSubmitting}
        onClick={handleSubmit}
      >
        {selected.length > 0 ? `Cast Vote (${selected.length})` : 'Select at least one time'}
      </Button>
    </>
  );
}
