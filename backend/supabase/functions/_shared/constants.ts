// AUTO-GENERATED from @down/common types — DO NOT EDIT
// Sync: npm run sync:shared

export const RSVP_STATUSES = ['going', 'maybe', 'not_going'] as const;
export type RSVPStatus = (typeof RSVP_STATUSES)[number];

export const EVENT_STATUSES = ['voting', 'rsvp', 'confirmed', 'pending'] as const;
export type EventStatus = (typeof EVENT_STATUSES)[number];

export const GROUP_ROLES = ['owner', 'admin', 'member', 'initiate'] as const;
