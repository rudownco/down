import { avatarPalette } from '../theme/tokens';
import { getAvatarColorIndex } from './emoji';

/** Get initials from a user name (e.g. "Alex Kim" → "AK") */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

/** Get deterministic avatar background color for a user name */
export function getAvatarColor(name: string): string {
  const index = getAvatarColorIndex(name, avatarPalette.length);
  return avatarPalette[index];
}

/** Get member count label (e.g. "5 members", "1 member") */
export function getMemberCountLabel(memberCount: number): string {
  return `${memberCount} member${memberCount === 1 ? '' : 's'}`;
}
