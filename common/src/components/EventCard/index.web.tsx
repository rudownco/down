import React from 'react';
import { AvatarStack } from '../AvatarStack';
import { RSVPButtons } from '../RSVPButtons';
import { Card } from '../Card';
import { getEventEmoji, EventStatusMeta, getConfirmedTimeOption } from '../../index';
import type { EventCardProps } from './index';

const RSVP_CHIP: Record<string, { emoji: string; label: string; classes: string }> = {
  going:     { emoji: '✅', label: 'Down',    classes: 'bg-[#D8F8E7] text-[#1AA04F]' },
  maybe:     { emoji: '🤔', label: 'Maybe',   classes: 'bg-[#FFEFC7] text-[#D17D04]' },
  not_going: { emoji: '😢', label: 'Flaking', classes: 'bg-[#EEEFF5] text-[#7D859E]' },
};

export function EventCard({ event, onPress, onRSVP, currentUserId }: EventCardProps) {
  const emoji          = getEventEmoji(event.title);
  const meta           = EventStatusMeta[event.status];
  const goingCount     = event.rsvps?.filter((r) => r.status === 'going').length ?? 0;
  const currentRSVP    = event.rsvps?.find((r) => r.userId === currentUserId)?.status;
  const confirmedTime  = getConfirmedTimeOption(event);

  const chipRSVP = currentRSVP ? RSVP_CHIP[currentRSVP] : null;

  const inner = (
    <Card className="hover:shadow-md transition-shadow flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{emoji}</span>
          <div>
            <h3 className="font-heading font-bold text-lg text-on-surface leading-tight">{event.title}</h3>
            {event.description && (
              <p className="text-sm text-on-surface-variant mt-0.5 line-clamp-1">{event.description}</p>
            )}
          </div>
        </div>
        {event.status === 'voting' ? (
          <span className="text-xs font-medium px-2.5 py-0.5 rounded-chip whitespace-nowrap bg-[#FFEFC7] text-[#D17D04]">
            🗳️ Voting
          </span>
        ) : chipRSVP ? (
          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-chip whitespace-nowrap ${chipRSVP.classes}`}>
            {chipRSVP.emoji} {chipRSVP.label}
          </span>
        ) : (
          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-chip whitespace-nowrap ${
            event.status === 'confirmed' ? 'bg-[#D8F8E7] text-[#1AA04F]' : 'bg-[#EEEFF5] text-[#7D859E]'
          }`}>
            {meta.emoji} {meta.label}
          </span>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-col gap-1.5 text-sm text-on-surface-variant">
        {event.location && <span>📍 {event.location}</span>}
        {confirmedTime
          ? <span>📅 {[confirmedTime.date, confirmedTime.time].filter(Boolean).join(' · ')}</span>
          : (event.date || event.time) && <span>📅 {[event.date, event.time].filter(Boolean).join(' · ')}</span>
        }
        {event.attendees?.length > 0 && (
          <div className="flex items-center gap-2">
            <AvatarStack users={event.attendees} maxVisible={5} size="xs" />
            {goingCount > 0 && <span className="text-secondary font-medium italic">{goingCount} are DOWN!</span>}
          </div>
        )}
      </div>

      {/* RSVP */}
      {onRSVP && <RSVPButtons selectedStatus={currentRSVP} onSelect={onRSVP} />}

      {/* Voting CTA */}
      {event.status === 'voting' && !onRSVP && (
        <div className="bg-primary-container/30 rounded-input py-2.5 text-center">
          <span className="font-heading text-sm text-primary">
            🗳️ {event.votingOptions?.length ?? 0} options — vote now
          </span>
        </div>
      )}

      {/* Confirmed CTA */}
      {event.status === 'confirmed' && (
        <div className="bg-[#D8F8E7] rounded-input py-2.5 text-center">
          <span className="font-heading text-sm text-[#1AA04F]">
            {confirmedTime
              ? `✅ Locked in — ${[confirmedTime.date, confirmedTime.time].filter(Boolean).join(' · ')}`
              : '✅ It\'s a go — RSVP now'}
          </span>
        </div>
      )}
    </Card>
  );

  return onPress
    ? <button onClick={onPress} className="w-full text-left">{inner}</button>
    : inner;
}
