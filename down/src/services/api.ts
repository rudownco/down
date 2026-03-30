// API service — real Supabase implementation
// Translated from ios/down/Services/SupabaseService.swift

import { supabase } from './supabase';
import { mockApi } from './mockApi';
import { DownGroup, EventSuggestion, RSVP, RSVPStatus } from '../types';
import { relativeFormatted } from '../utils/dateFormatting';

// ─── Groups ─────────────────────────────────────────────

interface GroupResponse {
  id: string;
  name: string;
  last_activity: string;
  member_count: number;
  member_ids: string[];
}

export async function fetchGroups(): Promise<DownGroup[]> {
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

export async function createGroup(name: string): Promise<DownGroup> {
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

// ─── Events (delegated to mock until backend is ready) ──

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
