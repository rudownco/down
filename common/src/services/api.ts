/**
 * Platform-agnostic API service.
 * Each platform passes its own SupabaseClient instance (dependency injection).
 * This keeps business logic here while storage/auth remain platform-specific.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { DownGroup, EventSuggestion, GroupResponse, RSVP, RSVPStatus } from '../types';
import { relativeFormatted } from '../utils/dateFormatting';
import { mockApi } from './mockApi';

// ─── Groups ─────────────────────────────────────────────

export async function fetchGroups(supabase: SupabaseClient): Promise<DownGroup[]> {
  const { data, error } = await supabase.functions.invoke('get-user-groups', {
    method: 'GET',
  });

  if (error) throw error;

  return (data as GroupResponse[]).map((g) => ({
    id: g.id,
    name: g.name,
    members: [],
    memberCount: g.member_count,
    lastActivity: relativeFormatted(g.last_activity),
    unreadCount: 0,
  }));
}

export async function createGroup(
  supabase: SupabaseClient,
  name: string
): Promise<DownGroup> {
  const { data, error } = await supabase.functions.invoke('create-group', {
    method: 'POST',
    body: { name },
  });

  if (error) throw error;

  const g = data as GroupResponse;
  return {
    id: g.id,
    name: g.name,
    members: [],
    memberCount: g.member_count,
    lastActivity: relativeFormatted(g.last_activity),
    unreadCount: 0,
  };
}

// ─── Events (mock until backend is ready) ───────────────

export async function fetchEvents(groupId: string): Promise<EventSuggestion[]> {
  return mockApi.fetchEvents(groupId);
}

export async function createEvent(
  event: EventSuggestion,
  groupId: string
): Promise<EventSuggestion> {
  return mockApi.createEvent(event, groupId);
}

export async function submitVotes(
  eventId: string,
  optionIds: string[],
  userId: string
): Promise<EventSuggestion> {
  return mockApi.submitVotes(eventId, optionIds, userId);
}

export async function submitRSVP(
  eventId: string,
  status: RSVPStatus,
  userId: string
): Promise<RSVP> {
  return mockApi.submitRSVP(eventId, status, userId);
}
