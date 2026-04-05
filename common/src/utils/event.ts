import type { EventSuggestion, RSVPStatus, User, VotingOption } from '../types';

/** Returns the confirmed time option for an event, or null if not confirmed. */
export function getConfirmedTimeOption(event: EventSuggestion): VotingOption | null {
  if (!event.confirmedTimeOptionId) return null;
  return event.votingOptions?.find((o) => o.id === event.confirmedTimeOptionId) ?? null;
}

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
