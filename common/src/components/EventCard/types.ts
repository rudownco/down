import type { EventSuggestion, RSVPStatus } from '../../types';

export interface EventCardProps {
  event: EventSuggestion;
  onPress?: () => void;
  onRSVP?: (status: RSVPStatus) => void;
  currentUserId?: string;
}
