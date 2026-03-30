/**
 * RN API adapter — thin wrapper around @down/common API functions.
 * Injects the platform's Supabase client so common code stays platform-agnostic.
 */
import { supabase } from './supabase';
import {
  fetchGroups as _fetchGroups,
  createGroup as _createGroup,
  fetchEvents,
  createEvent,
  submitVotes,
  submitRSVP,
} from '@down/common';
import type { DownGroup, EventSuggestion, RSVP, RSVPStatus } from '@down/common';

export { fetchEvents, createEvent, submitVotes, submitRSVP };

export async function fetchGroups(): Promise<DownGroup[]> {
  return _fetchGroups(supabase);
}

export async function createGroup(name: string): Promise<DownGroup> {
  return _createGroup(supabase, name);
}
