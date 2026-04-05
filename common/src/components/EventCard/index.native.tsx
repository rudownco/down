import React, { useMemo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { AvatarStack } from '../AvatarStack';
import { RSVPButtons } from '../RSVPButtons';
import { Card } from '../Card';
import { getEventEmoji } from '../../utils/emoji';
import { EventStatusMeta } from '../../types';
import { getConfirmedTimeOption } from '../../utils/event';
import type { EventCardProps } from './index';

const RSVP_CHIP: Record<string, { emoji: string; label: string; bg: string; color: string }> = {
  going:     { emoji: '✅', label: 'Down',    bg: '#D8F8E7', color: '#1AA04F' },
  maybe:     { emoji: '🤔', label: 'Maybe',   bg: '#FFEFC7', color: '#D17D04' },
  not_going: { emoji: '😢', label: 'Flaking', bg: '#EEEFF5', color: '#7D859E' },
};

export function EventCard({ event, onPress, onRSVP, currentUserId }: EventCardProps) {
  const tilt          = useMemo(() => (Math.random() * 2 - 1) * 1.5, []);
  const goingCount    = event.rsvps?.filter((r) => r.status === 'going').length ?? 0;
  const currentRSVP   = event.rsvps?.find((r) => r.userId === currentUserId)?.status;
  const emoji         = getEventEmoji(event.title);
  const meta          = EventStatusMeta[event.status];
  const confirmedTime = getConfirmedTimeOption(event);
  const chipRSVP      = currentRSVP ? RSVP_CHIP[currentRSVP] : null;

  let chipBg: string;
  let chipColor: string;
  let chipLabel: string;

  if (event.status === 'voting') {
    chipBg    = '#FFEFC7';
    chipColor = '#D17D04';
    chipLabel = '🗳️ VOTING';
  } else if (chipRSVP) {
    chipBg    = chipRSVP.bg;
    chipColor = chipRSVP.color;
    chipLabel = `${chipRSVP.emoji} ${chipRSVP.label.toUpperCase()}`;
  } else {
    chipBg    = event.status === 'confirmed' ? '#D8F8E7' : 'rgba(255,255,255,0.9)';
    chipColor = event.status === 'confirmed' ? '#1AA04F' : '#3F6377';
    chipLabel = `${meta.emoji} ${meta.label.toUpperCase()}`;
  }

  const displayDate = confirmedTime
    ? `📅 ${confirmedTime.date}${confirmedTime.time ? ` at ${confirmedTime.time}` : ''}`
    : event.date
      ? `📅 ${event.date}${event.time ? ` at ${event.time}` : ''}`
      : null;

  return (
    <Pressable onPress={onPress}>
      <Card tilt={tilt} style={{ gap: 16 }}>
        {/* Cover area */}
        <View style={{ height: 128, borderRadius: 14, overflow: 'hidden', backgroundColor: '#E5EFF8', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 48 }}>{emoji}</Text>
          <View style={{ position: 'absolute', top: 12, right: 12, backgroundColor: chipBg, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 9999 }}>
            <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 11, color: chipColor }}>
              {chipLabel}
            </Text>
          </View>
        </View>

        {/* Info */}
        <View style={{ gap: 6 }}>
          <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 20, color: '#131D23' }}>{event.title}</Text>
          {displayDate && (
            <Text style={{ fontFamily: 'BeVietnamPro_400Regular', fontSize: 14, color: '#76574E' }}>
              {displayDate}
            </Text>
          )}
          {event.location && (
            <Text style={{ fontFamily: 'BeVietnamPro_400Regular', fontSize: 14, color: '#76574E' }}>
              📍 {event.location}
            </Text>
          )}
        </View>

        {/* Attendees */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          {event.attendees?.length > 0 && (
            <AvatarStack users={event.attendees} maxVisible={3} size="sm" borderColor="#FFFFFF" />
          )}
          {goingCount > 0 && (
            <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13, color: '#3E6842', fontStyle: 'italic' }}>
              {goingCount} are DOWN!
            </Text>
          )}
        </View>

        {/* RSVP */}
        {onRSVP && (
          <RSVPButtons selectedStatus={currentRSVP} onSelect={onRSVP} />
        )}

        {/* Voting CTA */}
        {event.status === 'voting' && !onRSVP && (
          <View style={{ backgroundColor: '#EBF5FD', borderRadius: 14, paddingVertical: 10, alignItems: 'center' }}>
            <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13, color: '#3F6377' }}>
              🗳️ {event.votingOptions?.length ?? 0} options — tap to vote
            </Text>
          </View>
        )}

        {/* Confirmed CTA */}
        {event.status === 'confirmed' && (
          <View style={{ backgroundColor: '#D8F8E7', borderRadius: 14, paddingVertical: 10, alignItems: 'center' }}>
            <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13, color: '#1AA04F' }}>
              {confirmedTime
                ? `✅ Locked in — ${confirmedTime.date}${confirmedTime.time ? ` · ${confirmedTime.time}` : ''}`
                : "✅ It's a go — RSVP now"}
            </Text>
          </View>
        )}
      </Card>
    </Pressable>
  );
}
