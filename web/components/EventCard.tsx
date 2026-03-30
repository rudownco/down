import Link from 'next/link';
import { MapPin, Calendar, Users } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AvatarStack } from '@/components/AvatarStack';
import { Button } from '@/components/ui/button';
import { getEventEmoji, EventStatusMeta } from '@down/common';
import type { EventSuggestion, EventStatus } from '@down/common';

interface EventCardProps {
  event: EventSuggestion;
  groupId: string;
}

export function EventCard({ event, groupId }: EventCardProps) {
  const emoji  = getEventEmoji(event.title);
  const meta   = EventStatusMeta[event.status];

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{emoji}</span>
            <div>
              <CardTitle>{event.title}</CardTitle>
              {event.description && (
                <p className="text-sm text-on-surface-variant mt-0.5 line-clamp-1">
                  {event.description}
                </p>
              )}
            </div>
          </div>
          <Badge variant={event.status as EventStatus}>
            {meta.emoji} {meta.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex flex-col gap-2 mb-4">
          {event.location && (
            <div className="flex items-center gap-1.5 text-sm text-on-surface-variant">
              <MapPin size={13} />
              <span>{event.location}</span>
            </div>
          )}
          {(event.date || event.time) && (
            <div className="flex items-center gap-1.5 text-sm text-on-surface-variant">
              <Calendar size={13} />
              <span>{[event.date, event.time].filter(Boolean).join(' · ')}</span>
            </div>
          )}
          {event.attendees.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-on-surface-variant">
              <Users size={13} />
              <AvatarStack users={event.attendees} max={5} size="xs" />
              <span>{event.attendees.length} going</span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {event.status === 'voting' && (
            <Link href={`/events/${event.id}/vote`}>
              <Button variant="primary" size="sm">🗳️ Vote on time</Button>
            </Link>
          )}
          <Link href={`/events/${event.id}`}>
            <Button variant="outline" size="sm">RSVP</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
