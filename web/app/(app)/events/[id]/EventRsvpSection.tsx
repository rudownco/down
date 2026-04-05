'use client';

import { useState } from 'react';
import { RSVPButtons } from '@down/common';
import { supabase } from '@/lib/supabase';
import { submitRSVP } from '@down/common';
import type { RSVPStatus } from '@down/common';

interface Props {
  eventId: string;
  currentRsvpStatus?: RSVPStatus;
}

export default function EventRsvpSection({ eventId, currentRsvpStatus }: Props) {
  const [selected, setSelected] = useState<RSVPStatus | undefined>(currentRsvpStatus);

  async function handleRsvp(status: RSVPStatus) {
    const prev = selected;
    setSelected(status);
    await submitRSVP(supabase, eventId, status).catch(() => setSelected(prev));
  }

  return (
    <section className="bg-surface-container-low rounded-card p-4">
      <h2 className="text-sm font-heading font-semibold text-on-surface mb-3">
        You pulling up? 👀
      </h2>
      <RSVPButtons selectedStatus={selected} onSelect={handleRsvp} />
    </section>
  );
}
