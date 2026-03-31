'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { getEventEmoji } from '@down/common';
import { fetchGroups, fetchEvents } from '@down/common';
import type { EventSuggestion } from '@down/common';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import VoteOptions from './VoteOptions';

export default function VotePage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [event, setEvent] = useState<EventSuggestion | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!user || !id) return;

    (async () => {
      try {
        const groups = await fetchGroups(supabase);
        for (const group of groups) {
          const events = await fetchEvents(supabase, group.id).catch(() => []);
          const found = events.find((e) => e.id === id);
          if (found) {
            setEvent(found);
            return;
          }
        }
        setNotFound(true);
      } catch {
        setNotFound(true);
      }
    })();
  }, [user, id]);

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <span className="text-4xl">🤷</span>
        <p className="font-heading font-bold text-on-surface">Event not found</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const emoji = getEventEmoji(event.title);

  return (
    <div className="flex flex-col gap-6">
      <Link href={`/events/${id}`} className="flex items-center gap-1.5 text-sm text-outline hover:text-on-surface transition-colors w-fit">
        <ArrowLeft size={16} />
        Back
      </Link>

      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="text-3xl">{emoji}</span>
        <div>
          <h1 className="text-xl font-heading font-bold text-on-surface">{event.title}</h1>
          <p className="text-sm text-outline">Pick your best times 👇</p>
        </div>
      </div>

      {/* Voting options */}
      <VoteOptions
        eventId={id}
        votingOptions={event.votingOptions}
        userId={user?.id}
      />
    </div>
  );
}
