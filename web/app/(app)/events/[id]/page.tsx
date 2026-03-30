'use client';

import { notFound } from 'next/navigation';
import { MapPin, Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { RSVPButtons } from '@/components/RSVPButtons';
import { AvatarCircle } from '@/components/AvatarCircle';
import { Badge } from '@/components/ui/badge';
import {
  MockEvents,
  EventStatusMeta,
  getEventEmoji,
  getRsvpUsers,
  allUsers,
  currentUser,
} from '@down/common';
import type { RSVPStatus, EventStatus } from '@down/common';
import { use } from 'react';

const allEvents = Object.values(MockEvents);

interface Props {
  params: Promise<{ id: string }>;
}

export default function EventDetailPage({ params }: Props) {
  const { id } = use(params);
  const event  = allEvents.find((e) => e.id === id);
  if (!event) notFound();

  const emoji = getEventEmoji(event.title);
  const meta  = EventStatusMeta[event.status];

  const goingUsers    = getRsvpUsers(event, 'going',     allUsers);
  const maybeUsers    = getRsvpUsers(event, 'maybe',     allUsers);
  const notGoingUsers = getRsvpUsers(event, 'not_going', allUsers);

  const currentRsvp = event.rsvps.find((r) => r.userId === currentUser.id);

  function handleRsvp(status: RSVPStatus) {
    // Will wire to Supabase once backend is ready
    console.log('RSVP:', status);
  }

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
              <Badge variant={event.status as EventStatus}>
                {meta.emoji} {meta.label}
              </Badge>
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
      <section className="bg-surface-container-low rounded-card p-4">
        <h2 className="text-sm font-heading font-semibold text-on-surface mb-3">
          You pulling up? 👀
        </h2>
        <RSVPButtons
          current={currentRsvp?.status}
          onSelect={handleRsvp}
        />
      </section>

      {/* Attendees */}
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
                    <AvatarCircle name={u.name} size="xs" />
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
                    <AvatarCircle name={u.name} size="xs" />
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
                    <AvatarCircle name={u.name} size="xs" />
                    <span className="text-sm text-on-surface">{u.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
