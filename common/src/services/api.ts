/**
 * Platform-agnostic API service.
 * Each platform passes its own SupabaseClient instance (dependency injection).
 * This keeps business logic here while storage/auth remain platform-specific.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  AcceptInviteResult,
  CreateInviteResult,
  DownGroup,
  EventSuggestion,
  GroupMember,
  GroupMemberResponse,
  GroupResponse,
  GroupRole,
  InviteErrorCode,
  Notification,
  NotificationSettings,
  NotificationType,
  RSVP,
  RSVPStatus,
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
    method: 'GET',
    body: { group_id: groupId },
  });
  if (error) throw error;
  return data as EventSuggestion[];
}

export async function createEvent(
  supabase: SupabaseClient,
  event: EventSuggestion,
  groupId: string
): Promise<EventSuggestion> {
  const { data, error } = await supabase.functions.invoke('create-event', {
    method: 'POST',
    body: { ...event, group_id: groupId },
  });
  if (error) throw error;
  return data as EventSuggestion;
}

export async function submitVotes(
  supabase: SupabaseClient,
  eventId: string,
  optionIds: string[],
  userId: string
): Promise<EventSuggestion> {
  const { data, error } = await supabase.functions.invoke('submit-votes', {
    method: 'POST',
    body: { event_id: eventId, option_ids: optionIds, user_id: userId },
  });
  if (error) throw error;
  return data as EventSuggestion;
}

export async function submitRSVP(
  supabase: SupabaseClient,
  eventId: string,
  status: RSVPStatus,
  userId: string
): Promise<RSVP> {
  const { data, error } = await supabase.functions.invoke('submit-rsvp', {
    method: 'POST',
    body: { event_id: eventId, status, user_id: userId },
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

// ─── Notifications ───────────────────────────────────────
// Direct Supabase queries — RLS enforces user_id = auth.uid()

export async function getNotifications(supabase: SupabaseClient): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data ?? []).map((n) => ({
    id: n.id,
    userId: n.user_id,
    type: n.type as NotificationType,
    groupId: n.group_id,
    actorId: n.actor_id ?? null,
    actorName: n.actor_name ?? null,
    read: n.read,
    createdAt: n.created_at,
  }));
}

export async function markNotificationAsRead(
  supabase: SupabaseClient,
  id: string
): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', id);
  if (error) throw error;
}

export async function getNotificationSettings(
  supabase: SupabaseClient
): Promise<NotificationSettings> {
  const { data, error } = await supabase
    .from('user_notification_settings')
    .select('group_join_notifications')
    .maybeSingle();
  if (error) throw error;
  // No row = defaults to enabled
  return { groupJoinNotifications: data?.group_join_notifications ?? true };
}

// userId passed in — avoids an extra supabase.auth.getUser() network call
export async function updateNotificationSettings(
  supabase: SupabaseClient,
  userId: string,
  settings: Partial<NotificationSettings>
): Promise<void> {
  const { error } = await supabase
    .from('user_notification_settings')
    .upsert(
      { user_id: userId, group_join_notifications: settings.groupJoinNotifications ?? true },
      { onConflict: 'user_id' }
    );
  if (error) throw error;
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
