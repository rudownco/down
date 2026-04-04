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
  suggestTimeOption as _suggestTimeOption,
  submitVotes as _submitVotes,
  submitRSVP as _submitRSVP,
  createInvite as _createInvite,
  removeGroupMember as _removeGroupMember,
  updateMemberRole as _updateMemberRole,
  transferOwnership as _transferOwnership,
  getNotifications as _getNotifications,
  markNotificationAsRead as _markNotificationAsRead,
} from '@down/common';
import type { CreateEventInput, DownGroup, EventSuggestion, GroupRole, Notification, RSVP, RSVPStatus, CreateInviteResult, SuggestTimeOptionInput } from '@down/common';

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

export async function createEvent(input: CreateEventInput): Promise<EventSuggestion> {
  return _createEvent(supabase, input);
}

export async function suggestTimeOption(input: SuggestTimeOptionInput): Promise<EventSuggestion> {
  return _suggestTimeOption(supabase, input);
}

export async function submitVotes(eventId: string, optionIds: string[]): Promise<EventSuggestion> {
  return _submitVotes(supabase, eventId, optionIds);
}

export async function submitRSVP(eventId: string, status: RSVPStatus): Promise<RSVP> {
  return _submitRSVP(supabase, eventId, status);
}

export async function removeGroupMember(groupId: string, userId: string): Promise<void> {
  return _removeGroupMember(supabase, groupId, userId);
}

export async function updateMemberRole(groupId: string, userId: string, newRole: GroupRole): Promise<void> {
  return _updateMemberRole(supabase, groupId, userId, newRole);
}

export async function transferOwnership(groupId: string, newOwnerId: string): Promise<void> {
  return _transferOwnership(supabase, groupId, newOwnerId);
}

export async function getNotifications(): Promise<Notification[]> {
  return _getNotifications(supabase);
}

export async function markNotificationAsRead(id: string): Promise<void> {
  return _markNotificationAsRead(supabase, id);
}
