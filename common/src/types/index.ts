import type { GroupRole } from '../utils/permissions';
export type { GroupRole } from '../utils/permissions';

// ─── User ───────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface GroupMember extends User {
  role: GroupRole;
}

// ─── Group ──────────────────────────────────────────────
export interface Group {
  id: string;
  name: string;
  members: GroupMember[];
  memberCount?: number;
  lastActivity: string;
  unreadCount: number;
  createdBy?: string; // historical — use member roles for permission checks
}

// ─── Event ──────────────────────────────────────────────
export type EventStatus = 'voting' | 'rsvp' | 'confirmed' | 'pending';

export const EventStatusMeta: Record<EventStatus, { label: string; emoji: string }> = {
  voting:    { label: 'Voting',    emoji: '🗳️' },
  rsvp:      { label: 'RSVP',     emoji: '📋' },
  confirmed: { label: 'Confirmed', emoji: '✅' },
  pending:   { label: 'Pending',   emoji: '⏳' },
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
  confirmedTimeOptionId?: string; // set when transitioning from voting → rsvp
  votingEndsAt?: string;           // ISO timestamp; triggers auto-transition when passed
}

// ─── Voting ─────────────────────────────────────────────
export interface VotingOption {
  id: string;
  date: string;
  time: string;
  votes: number;
  voters: User[];
}

// ─── RSVP ───────────────────────────────────────────────
export type RSVPStatus = 'going' | 'maybe' | 'not_going';

export const RSVPStatusMeta: Record<RSVPStatus, { label: string; emoji: string }> = {
  going:     { label: 'Going',  emoji: 'DOWN' },
  maybe:     { label: 'Maybe',  emoji: '🤔'   },
  not_going: { label: "Can't",  emoji: '😢'   },
};

export interface RSVP {
  id: string;
  userId: string;
  eventId: string;
  status: RSVPStatus;
  updatedAt: string;
}

// ─── Event Input Types ───────────────────────────────────

export interface CreateEventInput {
  title: string;
  description?: string;
  location?: string;
  group_id: string;
  time_options?: Array<{ date: string; time: string }>;
  voting_ends_at?: string; // ISO timestamp for when voting closes automatically
}

export interface SuggestTimeOptionInput {
  event_id: string;
  date: string;
  time: string;
}

// ─── Invites ────────────────────────────────────────────
export interface AcceptInviteResult {
  groupId: string;
  groupName: string;
}

export type InviteErrorCode =
  | 'expired'
  | 'already_used'
  | 'already_member'
  | 'not_found'
  | 'unauthenticated'
  | 'unknown';

export interface CreateInviteResult {
  token: string;
  expires_at: string;
}

// ─── API Response shapes (Supabase edge functions) ──────
export interface GroupMemberResponse {
  id: string;
  name: string;
  avatar_url: string | null;
  role: GroupRole;
}

export interface GroupResponse {
  id: string;
  name: string;
  created_by: string;
  last_activity: string;
  member_count: number;
  member_ids: string[];
  members: GroupMemberResponse[];
}

// ─── Convenience alias used throughout the apps ─────────
export type DownGroup = Group;

// ─── Notifications ────────────────────────────────────────
export type NotificationType = 'group_member_joined';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  groupId: string;
  actorId: string | null;
  actorName: string | null;
  read: boolean;
  createdAt: string;
}

export interface NotificationSettings {
  groupJoinNotifications: boolean;
}
