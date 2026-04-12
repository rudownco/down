import type { RSVPStatus } from '../types';

/**
 * Two playful emoji sets for RSVP buttons. Each event picks one
 * deterministically from its id so the feed feels alive without churning
 * on re-renders.
 */
const RSVP_EMOJI_SETS: ReadonlyArray<Readonly<Record<RSVPStatus, string>>> = [
  { going: '🔥', maybe: '🤔', not_going: '💀' },
  { going: '🤘', maybe: '🤐', not_going: '🤡' },
] as const;

export function getRsvpEmojiSet(eventId: string): Record<RSVPStatus, string> {
  let h = 0;
  for (let i = 0; i < eventId.length; i++) {
    h = (h * 31 + eventId.charCodeAt(i)) | 0;
  }
  const idx = Math.abs(h) % RSVP_EMOJI_SETS.length;
  return { ...RSVP_EMOJI_SETS[idx] };
}
