import type { EventSuggestion, RSVPStatus } from '../../types';

export interface EventCardProps {
  event: EventSuggestion;
  onPress?: () => void;
  onRSVP?: (status: RSVPStatus) => void;
  currentUserId?: string;
}

// TypeScript fallback — bundler replaces with .native.tsx or .web.tsx at runtime
export { EventCard } from './index.web';
