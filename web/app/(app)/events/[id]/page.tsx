'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { MapPin, Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { AvatarCircle, EventStatusMeta, getEventEmoji, getRsvpUsers } from '@down/common';
import { fetchEventById } from '@down/common';
import type { EventSuggestion } from '@down/common';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import EventRsvpSection from './EventRsvpSection';

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [event, setEvent] = useState<EventSuggestion | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!user || !id) return;

    fetchEventById(supabase, id)
      .then((found) => {
        if (found) setEvent(found);
        else setNotFound(true);
      })
      .catch(() => setNotFound(true));
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
  const meta = EventStatusMeta[event.status];
  const allMembers = event.attendees;
  const goingUsers = getRsvpUsers(event, 'going', allMembers);
  const maybeUsers = getRsvpUsers(event, 'maybe', allMembers);
  const notGoingUsers = getRsvpUsers(event, 'not_going', allMembers);
  const currentRsvp = user
    ? event.rsvps.find((r) => r.userId === user.id)
    : undefined;

  return (
    <div className="flex flex-col gap-6">
      {/* Back */}
      <Link href="/dashboard" className="flex items-center gap-1.5 text-sm text-outline hover:text-on-surface transition-colors w-fit">
        <ArrowLeft size={16} />
        Back
      </Link>

      {/* Hero */}
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-4">
          <span className="text-4xl">{emoji}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-heading font-bold text-on-surface">{event.title}</h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-container text-on-surface">
                {meta.emoji} {meta.label}
              </span>
            </div>
            {event.description && (
              <p className="text-on-surface-variant text-sm mt-1">{event.description}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1.5 text-sm text-on-surface-variant">
          {event.location && (
            <div className="flex items-center gap-2">
              <MapPin size={14} />
              <span>{event.location}</span>
            </div>
          )}
          {(event.date || event.time) && (
            <div className="flex items-center gap-2">
              <Calendar size={14} />
              <span>{[event.date, event.time].filter(Boolean).join(' · ')}</span>
            </div>
          )}
        </div>
      </div>

      {/* RSVP section */}
      <EventRsvpSection eventId={id} currentRsvpStatus={currentRsvp?.status} />

      {/* Attendees */}
      {allMembers.length > 0 && (
        <section>
          <h2 className="text-sm font-heading font-semibold text-on-surface-variant uppercase tracking-wide mb-3">
            Who&apos;s down
          </h2>
          <div className="flex flex-col gap-4">
            {goingUsers.length > 0 && (
              <div>
                <p className="text-xs text-outline mb-2">✅ Going ({goingUsers.length})</p>
                <div className="flex flex-wrap gap-2">
                  {goingUsers.map((u) => (
                    <div key={u.id} className="flex items-center gap-1.5">
                      <AvatarCircle user={u} size="xs" />
                      <span className="text-sm text-on-surface">{u.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {maybeUsers.length > 0 && (
              <div>
                <p className="text-xs text-outline mb-2">🤔 Maybe ({maybeUsers.length})</p>
                <div className="flex flex-wrap gap-2">
                  {maybeUsers.map((u) => (
                    <div key={u.id} className="flex items-center gap-1.5">
                      <AvatarCircle user={u} size="xs" />
                      <span className="text-sm text-on-surface">{u.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {notGoingUsers.length > 0 && (
              <div>
                <p className="text-xs text-outline mb-2">😢 Can&apos;t make it ({notGoingUsers.length})</p>
                <div className="flex flex-wrap gap-2">
                  {notGoingUsers.map((u) => (
                    <div key={u.id} className="flex items-center gap-1.5">
                      <AvatarCircle user={u} size="xs" />
                      <span className="text-sm text-on-surface">{u.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
