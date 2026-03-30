import React, { useMemo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { AvatarStack } from '../AvatarStack';
import { RSVPButtons } from '../RSVPButtons';
import { Card } from '../Card';
import { getEventEmoji } from '../../utils/emoji';
import { EventStatusMeta } from '../../types';
import type { EventCardProps } from './index';

export function EventCard({ event, onPress, onRSVP, currentUserId }: EventCardProps) {
  const tilt       = useMemo(() => (Math.random() * 2 - 1) * 1.5, []);
  const goingCount = event.rsvps?.filter((r) => r.status === 'going').length ?? 0;
  const currentRSVP = event.rsvps?.find((r) => r.userId === currentUserId)?.status;
  const emoji      = getEventEmoji(event.title);
  const meta       = EventStatusMeta[event.status];

  return (
    <Pressable onPress={onPress}>
      <Card tilt={tilt} style={{ gap: 16 }}>
        {/* Cover area */}
        <View style={{ height: 128, borderRadius: 14, overflow: 'hidden', backgroundColor: '#E5EFF8', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 48 }}>{emoji}</Text>
          <View style={{ position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 9999 }}>
            <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 11, color: '#3F6377' }}>
              {meta.emoji} {meta.label.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Info */}
        <View style={{ gap: 6 }}>
          <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 20, color: '#131D23' }}>{event.title}</Text>
          {event.date && (
            <Text style={{ fontFamily: 'BeVietnamPro_400Regular', fontSize: 14, color: '#76574E' }}>
              📅 {event.date}{event.time ? ` at ${event.time}` : ''}
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
      </Card>
    </Pressable>
  );
}
