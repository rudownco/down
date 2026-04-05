// Re-export all domain types from the shared package.
// Do not redefine types here — @down/common is the single source of truth.
export type {
  User,
  DownGroup,
  GroupMember,
  GroupRole,
  EventSuggestion,
  EventStatus,
  VotingOption,
  RSVP,
  RSVPStatus,
} from '@down/common';
export { EventStatusMeta, RSVPStatusMeta } from '@down/common';
