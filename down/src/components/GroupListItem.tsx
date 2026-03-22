// Group list card for dashboard
// Translated from ios/down/Components/GroupListItem.swift

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DownGroup } from '../types';
import { Colors } from '../theme/colors';
import { Spacing, Radius, AvatarSize } from '../theme/spacing';
import { Typography } from '../theme/typography';
import { getGroupEmoji } from '../utils/emoji';
import { getMemberCountLabel } from '../utils/user';
import { AvatarStack } from './AvatarStack';

interface Props {
  group: DownGroup;
}

export function GroupListItem({ group }: Props) {
  const emoji = getGroupEmoji(group.name);
  const memberCount = group.memberCount ?? group.members.length;

  return (
    <View style={styles.container}>
      {/* Emoji badge */}
      <View style={styles.emojiBadge}>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {group.name}
        </Text>
        <View style={styles.memberRow}>
          <AvatarStack
            users={group.members}
            maxVisible={3}
            size={AvatarSize.xs}
            borderColor={Colors.appBackground}
          />
          <Text style={styles.memberCount}>{getMemberCountLabel(memberCount)}</Text>
        </View>
      </View>

      {/* Right: activity + unread */}
      <View style={styles.right}>
        {group.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{group.unreadCount}</Text>
          </View>
        )}
        <Text style={styles.activity}>{group.lastActivity}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: Radius.xxl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  emojiBadge: {
    width: 56,
    height: 56,
    borderRadius: Radius.lg,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 28,
  },
  info: {
    flex: 1,
    gap: Spacing.xxs,
  },
  name: {
    ...Typography.headline,
    color: Colors.textOnBlue,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  memberCount: {
    ...Typography.caption,
    color: Colors.textOnBlueMuted,
  },
  right: {
    alignItems: 'flex-end',
    gap: Spacing.xs,
  },
  unreadBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999,
  },
  unreadText: {
    ...Typography.caption2,
    color: Colors.appBackground,
  },
  activity: {
    ...Typography.caption,
    color: Colors.textOnBlueFaint,
  },
});
