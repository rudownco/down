/**
 * Platform-agnostic API service.
 * Each platform passes its own SupabaseClient instance (dependency injection).
 * This keeps business logic here while storage/auth remain platform-specific.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  AcceptInviteResult,
  CreateEventInput,
  CreateInviteResult,
  DownGroup,
  EventSuggestion,
  GroupMember,
  GroupMemberResponse,
  GroupResponse,
  GroupRole,
  InviteErrorCode,
  RSVP,
  RSVPStatus,
  SuggestTimeOptionInput,
} from '../types';
import { relativeFormatted } from '../utils/dateFormatting';

function mapMember(m: GroupMemberResponse): GroupMember {
  return { id: m.id, name: m.name, avatarUrl: m.avatar_url ?? undefined, role: m.role };
}

// ─── Groups ─────────────────────────────────────────────

export async function fetchGroups(supabase: SupabaseClient): Promise<DownGroup[]> {
  const { data, error } = await supabase.functions.invoke('get-user-groups', {
    method: 'GET',
  });

  if (error) throw error;

  return (data as GroupResponse[]).map((g) => ({
    id: g.id,
    name: g.name,
    members: (g.members ?? []).map(mapMember),
    memberCount: g.member_count,
    lastActivity: relativeFormatted(g.last_activity),
    unreadCount: 0,
    createdBy: g.created_by,
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
    members: (g.members ?? []).map(mapMember),
    memberCount: g.member_count,
    lastActivity: relativeFormatted(g.last_activity),
    unreadCount: 0,
    createdBy: g.created_by,
  };
}

// ─── Events ─────────────────────────────────────────────

export async function fetchEvents(
  supabase: SupabaseClient,
  groupId: string
): Promise<EventSuggestion[]> {
  const { data, error } = await supabase.functions.invoke('get-group-events', {
    method: 'POST',
    body: { group_id: groupId },
  });
  if (error) throw error;
  return data as EventSuggestion[];
}

export async function createEvent(
  supabase: SupabaseClient,
  input: CreateEventInput
): Promise<EventSuggestion> {
  const { data, error } = await supabase.functions.invoke('create-event', {
    method: 'POST',
    body: input,
  });
  if (error) throw error;
  return data as EventSuggestion;
}

export async function suggestTimeOption(
  supabase: SupabaseClient,
  input: SuggestTimeOptionInput
): Promise<EventSuggestion> {
  const { data, error } = await supabase.functions.invoke('suggest-time-option', {
    method: 'POST',
    body: input,
  });
  if (error) throw error;
  return data as EventSuggestion;
}

export async function submitVotes(
  supabase: SupabaseClient,
  eventId: string,
  optionIds: string[]
): Promise<EventSuggestion> {
  const { data, error } = await supabase.functions.invoke('submit-votes', {
    method: 'POST',
    body: { event_id: eventId, option_ids: optionIds },
  });
  if (error) throw error;
  return data as EventSuggestion;
}

export async function lockEventTime(
  supabase: SupabaseClient,
  eventId: string,
  timeOptionId: string | null
): Promise<EventSuggestion> {
  const { data, error } = await supabase.functions.invoke('lock-event-time', {
    method: 'POST',
    body: { event_id: eventId, time_option_id: timeOptionId },
  });
  if (error) throw error;
  return data as EventSuggestion;
}

export async function submitRSVP(
  supabase: SupabaseClient,
  eventId: string,
  status: RSVPStatus
): Promise<RSVP> {
  const { data, error } = await supabase.functions.invoke('submit-rsvp', {
    method: 'POST',
    body: { event_id: eventId, status },
  });
  if (error) throw error;
  return data as RSVP;
}

// ─── Group Members ───────────────────────────────────────

export async function removeGroupMember(
  supabase: SupabaseClient,
  groupId: string,
  userId: string
): Promise<void> {
  const { error } = await supabase.functions.invoke('remove-group-member', {
    method: 'POST',
    body: { group_id: groupId, user_id: userId },
  });
  // Treat "not a member" as success — idempotent, concurrent deletes are fine
  if (error && !error?.message?.includes('not a member')) throw error;
}

export async function updateMemberRole(
  supabase: SupabaseClient,
  groupId: string,
  userId: string,
  newRole: GroupRole
): Promise<void> {
  const { error } = await supabase.functions.invoke('update-member-role', {
    method: 'POST',
    body: { group_id: groupId, user_id: userId, new_role: newRole },
  });
  if (error) throw error;
}

export async function transferOwnership(
  supabase: SupabaseClient,
  groupId: string,
  newOwnerId: string
): Promise<void> {
  const { error } = await supabase.functions.invoke('transfer-ownership', {
    method: 'POST',
    body: { group_id: groupId, new_owner_id: newOwnerId },
  });
  if (error) throw error;
}

// ─── Invites ─────────────────────────────────────────────

export async function createInvite(
  supabase: SupabaseClient,
  groupId: string
): Promise<CreateInviteResult> {
  const { data, error } = await supabase.functions.invoke('create-invite', {
    method: 'POST',
    body: { group_id: groupId },
  });
  if (error) throw error;
  return data as CreateInviteResult;
}

export async function acceptInvite(
  supabase: SupabaseClient,
  token: string
): Promise<AcceptInviteResult> {
  const { data, error } = await supabase.functions.invoke('accept-invite', {
    method: 'POST',
    body: { token },
  });

  if (error) {
    const msg: string = (error as any)?.message ?? '';
    let code: InviteErrorCode = 'unknown';
    if (msg.includes('expired')) code = 'expired';
    else if (msg.includes('already_used') || msg.includes('already used')) code = 'already_used';
    else if (msg.includes('already_member') || msg.includes('already a member')) code = 'already_member';
    else if (msg.includes('not_found') || msg.includes('not found') || msg.includes('not found')) code = 'not_found';
    else if (msg.includes('Unauthorized') || msg.includes('JWT')) code = 'unauthenticated';

    const typedError = new Error(msg) as Error & { code: InviteErrorCode };
    typedError.code = code;
    throw typedError;
  }

  return {
    groupId: data.group_id,
    groupName: data.group_name ?? 'your squad',
  };
}
