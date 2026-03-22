// User utility functions
// Translated from User.swift computed properties

import { Colors } from '../theme/colors';
import { getAvatarColorIndex } from './emoji';

/** Get initials from a user name (e.g. "Alex Kim" → "AK") */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

/** Get deterministic avatar color for a user name */
export function getAvatarColor(name: string): string {
  const index = getAvatarColorIndex(name, Colors.avatarPalette.length);
  return Colors.avatarPalette[index];
}

/** Get member count label (e.g. "5 members", "1 member") */
export function getMemberCountLabel(memberCount: number): string {
  return `${memberCount} member${memberCount === 1 ? '' : 's'}`;
}
