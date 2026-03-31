'use client';

import { useEffect, useState } from 'react';
import { EventCard, AvatarCircle, getGreeting } from '@down/common';
import { fetchGroups, fetchEvents } from '@down/common';
import type { DownGroup, EventSuggestion } from '@down/common';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';

export default function DashboardPage() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<DownGroup[]>([]);
  const [events, setEvents] = useState<EventSuggestion[]>([]);
  const greeting = getGreeting();

  const currentUser = user
    ? { id: user.id, name: user.user_metadata?.full_name ?? user.email ?? 'You' }
    : null;

  useEffect(() => {
    if (!user) return;

    fetchGroups(supabase)
      .then((g) => {
        setGroups(g);
        if (g[0]) {
          fetchEvents(supabase, g[0].id)
            .then(setEvents)
            .catch(() => {});
        }
      })
      .catch(() => {});
  }, [user]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-outline font-body">{greeting} 👋</p>
          <h1 className="text-2xl font-heading font-bold text-on-surface mt-0.5">
            What&apos;s the move?
          </h1>
        </div>
        {currentUser && <AvatarCircle user={currentUser} size="md" />}
      </div>

      {/* Squad preview */}
      {groups.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
          {groups.map((g) => (
            <a
              key={g.id}
              href={`/groups/${g.id}`}
              className="flex flex-col items-center gap-1.5 flex-shrink-0"
            >
              <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center text-xl">
                {g.name[0]}
              </div>
              <span className="text-xs text-on-surface-variant font-body truncate max-w-[56px]">
                {g.name.split(' ')[0]}
              </span>
            </a>
          ))}
        </div>
      )}

      {/* Events feed */}
      <section>
        <h2 className="text-sm font-heading font-semibold text-on-surface-variant uppercase tracking-wide mb-3">
          🔥 Active Hangouts
        </h2>
        {events.length === 0 ? (
          <div className="flex flex-col items-center py-12 gap-3">
            <span className="text-3xl">🍃</span>
            <p className="font-heading font-semibold text-on-surface">Nothing planned yet</p>
            <p className="text-sm text-on-surface-variant">Be the one to make it happen 👀</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
