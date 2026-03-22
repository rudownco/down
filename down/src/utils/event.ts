// Event utility functions
// Translated from EventSuggestion computed properties

import { EventSuggestion, RSVPStatus, User } from '../types';

/** Count unique voters across all voting options */
export function getTotalVoters(event: EventSuggestion): number {
  const voterIds = new Set<string>();
  for (const option of event.votingOptions) {
    for (const voter of option.voters) {
      voterIds.add(voter.id);
    }
  }
  return voterIds.size;
}

/** Get maximum votes among all options */
export function getMaxVotes(event: EventSuggestion): number {
  return Math.max(0, ...event.votingOptions.map((o) => o.votes));
}

/** Filter users by RSVP status */
export function getRsvpUsers(
  event: EventSuggestion,
  status: RSVPStatus,
  users: User[]
): User[] {
  const ids = new Set(
    event.rsvps.filter((r) => r.status === status).map((r) => r.userId)
  );
  return users.filter((u) => ids.has(u.id));
}
