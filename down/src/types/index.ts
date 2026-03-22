// All data types — translated from ios/down/Models/

// ─── User ───────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
}

// ─── Group ──────────────────────────────────────────────
export interface DownGroup {
  id: string;
  name: string;
  members: User[];
  memberCount?: number;
  lastActivity: string;
  unreadCount: number;
}

// ─── Event ──────────────────────────────────────────────
export type EventStatus = 'voting' | 'confirmed' | 'pending';

export const EventStatusMeta: Record<EventStatus, { label: string; emoji: string }> = {
  voting: { label: 'Voting', emoji: '🗳️' },
  confirmed: { label: 'Confirmed', emoji: '✅' },
  pending: { label: 'Pending', emoji: '⏳' },
};

export interface EventSuggestion {
  id: string;
  title: string;
  description?: string;
  location?: string;
  date?: string;
  time?: string;
  status: EventStatus;
  attendees: User[];
  suggestedBy: User;
  votingOptions: VotingOption[];
  rsvps: RSVP[];
}

// ─── Voting ─────────────────────────────────────────────
export interface VotingOption {
  id: string;
  date: string;
  time: string;
  votes: number;
  voters: User[];
}

export interface Vote {
  id: string;
  userId: string;
  eventId: string;
  votingOptionId: string;
  createdAt: string;
}

// ─── RSVP ───────────────────────────────────────────────
export type RSVPStatus = 'going' | 'maybe' | 'not_going';

export const RSVPStatusMeta: Record<RSVPStatus, { label: string; emoji: string }> = {
  going: { label: 'Going', emoji: 'DOWN' },
  maybe: { label: 'Maybe', emoji: '🤔' },
  not_going: { label: "Can't", emoji: '😢' },
};

export interface RSVP {
  id: string;
  userId: string;
  eventId: string;
  status: RSVPStatus;
  updatedAt: string;
}
