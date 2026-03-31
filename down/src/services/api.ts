/**
 * RN API adapter — thin wrapper around @down/common API functions.
 * Injects the platform's Supabase client so common code stays platform-agnostic.
 */
import { supabase } from './supabase';
import {
  fetchGroups as _fetchGroups,
  createGroup as _createGroup,
  fetchEvents as _fetchEvents,
  createEvent as _createEvent,
  submitVotes as _submitVotes,
  submitRSVP as _submitRSVP,
  createInvite as _createInvite,
} from '@down/common';
import type { DownGroup, EventSuggestion, RSVP, RSVPStatus, CreateInviteResult } from '@down/common';

export async function fetchGroups(): Promise<DownGroup[]> {
  return _fetchGroups(supabase);
}

export async function createGroup(name: string): Promise<DownGroup> {
  return _createGroup(supabase, name);
}

export async function createInvite(groupId: string): Promise<CreateInviteResult> {
  return _createInvite(supabase, groupId);
}

export async function fetchEvents(groupId: string): Promise<EventSuggestion[]> {
  return _fetchEvents(supabase, groupId);
}

export async function createEvent(event: EventSuggestion, groupId: string): Promise<EventSuggestion> {
  return _createEvent(supabase, event, groupId);
}

export async function submitVotes(eventId: string, optionIds: string[], userId: string): Promise<EventSuggestion> {
  return _submitVotes(supabase, eventId, optionIds, userId);
}

export async function submitRSVP(eventId: string, status: RSVPStatus, userId: string): Promise<RSVP> {
  return _submitRSVP(supabase, eventId, status, userId);
}
