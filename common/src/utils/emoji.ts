/**
 * Stable hash function (djb2) — unlike Swift's hashValue which is randomly seeded
 */
function djb2Hash(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return Math.abs(hash);
}

const GROUP_EMOJI_POOL = [
  '🏄', '🎸', '🎮', '🍕', '☕', '🎬', '🏀', '🎭', '🌮', '🎯', '🎉', '🏔️',
];

/** Deterministic emoji for a group name */
export function getGroupEmoji(name: string): string {
  return GROUP_EMOJI_POOL[djb2Hash(name) % GROUP_EMOJI_POOL.length];
}

/** Keyword-based emoji for an event title */
export function getEventEmoji(title: string): string {
  const t = title.toLowerCase();
  if (/pizza|dinner|lunch|food/.test(t)) return '🍕';
  if (/movie|film|cinema/.test(t))       return '🎬';
  if (/game|gaming/.test(t))             return '🎮';
  if (/coffee|cafe|brunch/.test(t))      return '☕';
  if (/music|concert|band/.test(t))      return '🎸';
  if (/hike|hiking|trail/.test(t))       return '🏔️';
  if (/beach|surf/.test(t))              return '🏄';
  if (/bar|drink|cocktail/.test(t))      return '🍹';
  if (/sport|basket|footbal/.test(t))    return '🏀';
  return '🎉';
}

/** Deterministic avatar color index from a user name */
export function getAvatarColorIndex(name: string, paletteLength: number): number {
  return djb2Hash(name) % paletteLength;
}
