'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Plus, Link2, Check, Copy, X, ChevronRight } from 'lucide-react';
import { EventCard, AvatarCircle, getGroupEmoji, getMemberCountLabel, hasPermission, getRoleLabel, getAssignableRoles, canManageRole, getRoleRank } from '@down/common';
import { fetchGroups, fetchEvents, createInvite, removeGroupMember, updateMemberRole, transferOwnership, useGroupMembersRealtime } from '@down/common';
import type { DownGroup, EventSuggestion, GroupMember, GroupRole } from '@down/common';
import { Button } from '@/components/ui/button';
import { CreateEventModal } from '@/components/CreateEventModal';
import { EventDetailModal } from '@/components/EventDetailModal';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';

export default function GroupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [group, setGroup] = useState<DownGroup | null>(null);
  const [events, setEvents] = useState<EventSuggestion[]>([]);
  const [notFound, setNotFound] = useState(false);

  const [inviteLink, setInviteLink] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);
  const [inspectedMember, setInspectedMember] = useState<GroupMember | null>(null);
  const [roleUpdating, setRoleUpdating] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [inspectedEvent, setInspectedEvent] = useState<EventSuggestion | null>(null);

  useEffect(() => {
    if (!user || !id) return;

    fetchGroups(supabase)
      .then((groups) => {
        const found = groups.find((g) => g.id === id);
        if (!found) {
          setNotFound(true);
          return;
        }
        setGroup(found);
        return fetchEvents(supabase, id).then(setEvents).catch(() => {});
      })
      .catch(() => setNotFound(true));
  }, [user, id]);

  const myRole = group?.members.find((m) => m.id === user?.id)?.role;
  const canRemoveMembers = myRole ? hasPermission(myRole, 'member.remove') : false;
  const canInvite = myRole ? hasPermission(myRole, 'member.invite') : false;
  const canCreateEvent = myRole ? hasPermission(myRole, 'event.create') : false;

  useGroupMembersRealtime(supabase, id, (event) => {
    if (event.type === 'removed') {
      setGroup((prev) => {
        if (!prev) return prev;
        const memberExists = prev.members.some((m) => m.id === event.userId);
        if (!memberExists) return prev; // already removed optimistically
        return {
          ...prev,
          members: prev.members.filter((m) => m.id !== event.userId),
          memberCount: Math.max(0, (prev.memberCount ?? prev.members.length) - 1),
        };
      });
    }
  });

  const handleInvite = useCallback(async () => {
    if (!id) return;
    if (inviteLink) {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return;
    }
    setInviteLoading(true);
    try {
      const result = await createInvite(supabase, id);
      const link = `${window.location.origin}/invite/${result.token}`;
      setInviteLink(link);
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
    } finally {
      setInviteLoading(false);
    }
  }, [id, inviteLink]);

  const handleRemoveMember = useCallback(async (memberId: string, memberName: string) => {
    if (!id || !group) return;
    const confirmed = window.confirm(
      `Remove ${memberName.split(' ')[0]} from ${group.name}?`
    );
    if (!confirmed) return;

    setRemovingUserId(memberId);
    setInspectedMember(null);
    try {
      await removeGroupMember(supabase, id, memberId);
      setGroup((prev) => {
        if (!prev) return prev;
        const memberExists = prev.members.some((m) => m.id === memberId);
        if (!memberExists) return prev; // already removed by realtime event
        return {
          ...prev,
          members: prev.members.filter((m) => m.id !== memberId),
          memberCount: Math.max(0, (prev.memberCount ?? prev.members.length) - 1),
        };
      });
    } catch (e: any) {
      alert(e?.message ?? 'Could not remove member');
    } finally {
      setRemovingUserId(null);
    }
  }, [id, group]);

  const handleRoleChange = useCallback(async (memberId: string, newRole: GroupRole) => {
    if (!id) return;
    setRoleUpdating(true);
    try {
      await updateMemberRole(supabase, id, memberId, newRole);
      setGroup((prev) =>
        prev
          ? {
              ...prev,
              members: prev.members.map((m) =>
                m.id === memberId ? { ...m, role: newRole } : m
              ),
            }
          : prev
      );
      setInspectedMember((prev) => prev && prev.id === memberId ? { ...prev, role: newRole } : prev);
    } catch (e: any) {
      alert(e?.message ?? 'Could not update role');
    } finally {
      setRoleUpdating(false);
    }
  }, [id]);

  const handleTransferOwnership = useCallback(async (memberId: string, memberName: string) => {
    if (!id) return;
    const confirmed = window.confirm(
      `Transfer ownership to ${memberName.split(' ')[0]}? You'll be demoted to Admin.`
    );
    if (!confirmed) return;

    setRoleUpdating(true);
    try {
      await transferOwnership(supabase, id, memberId);
      setGroup((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          members: prev.members.map((m) => {
            if (m.id === memberId) return { ...m, role: 'owner' as GroupRole };
            if (m.id === user?.id) return { ...m, role: 'admin' as GroupRole };
            return m;
          }),
        };
      });
      setInspectedMember(null);
    } catch (e: any) {
      alert(e?.message ?? 'Could not transfer ownership');
    } finally {
      setRoleUpdating(false);
    }
  }, [id, user?.id]);

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <span className="text-4xl">🤷</span>
        <p className="font-heading font-bold text-on-surface">Squad not found</p>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const emoji = getGroupEmoji(group.name);
  const count = group.memberCount ?? group.members.length;

  // Compute inspect modal actions
  const isInspectingSelf = inspectedMember?.id === user?.id;
  const assignableRoles = (myRole && inspectedMember && !isInspectingSelf)
    ? getAssignableRoles(myRole, inspectedMember.role)
    : [];
  const canTransfer = myRole === 'owner' && inspectedMember && !isInspectingSelf;
  const canRemoveInspected = canRemoveMembers && inspectedMember && !isInspectingSelf
    && myRole && canManageRole(myRole, inspectedMember.role);

  return (
    <div className="flex flex-col gap-6">
      {/* Group header */}
      <div className="flex items-center gap-4">
        <span className="text-4xl">{emoji}</span>
        <div className="flex-1">
          <h1 className="text-2xl font-heading font-bold text-on-surface">{group.name}</h1>
          <p className="text-sm text-outline">{getMemberCountLabel(count)}</p>
        </div>
        {canInvite && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleInvite}
            disabled={inviteLoading}
          >
            {copied ? <Check size={14} /> : inviteLink ? <Copy size={14} /> : <Link2 size={14} />}
            {inviteLoading ? 'Creating...' : copied ? 'Copied!' : inviteLink ? 'Copy link' : 'Invite'}
          </Button>
        )}
      </div>

      {/* Members */}
      <section>
        <h2 className="text-sm font-heading font-semibold text-on-surface-variant uppercase tracking-wide mb-3">
          Members
        </h2>
        <div className="flex items-center gap-3 overflow-x-auto pt-2 pb-2">
          {group.members.map((member) => {
            const isCurrentUser = member.id === user?.id;
            const canRemove = canRemoveMembers && !isCurrentUser && !!myRole && canManageRole(myRole, member.role);
            return (
              <button
                key={member.id}
                onClick={() => setInspectedMember(member)}
                className="relative flex flex-col items-center gap-1.5 flex-shrink-0 group/member"
              >
                <div className="relative">
                  <AvatarCircle user={member} size="md" />
                  {removingUserId === member.id && (
                    <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  {canRemove && (
                    <div
                      onClick={(e) => { e.stopPropagation(); handleRemoveMember(member.id, member.name); }}
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-error text-on-error flex items-center justify-center opacity-0 group-hover/member:opacity-100 transition-opacity hover:bg-error/80 cursor-pointer"
                      title={`Remove ${member.name.split(' ')[0]}`}
                    >
                      <X size={10} />
                    </div>
                  )}
                </div>
                <span className="text-xs text-on-surface-variant max-w-[56px] truncate text-center">
                  {member.name.split(' ')[0]}
                  {isCurrentUser ? ' (you)' : ''}
                </span>
                <span className="text-[10px] text-outline max-w-[56px] truncate text-center leading-none">
                  {getRoleLabel(member.role)}
                </span>
              </button>
            );
          })}
          {canInvite && (
            <button
              onClick={handleInvite}
              disabled={inviteLoading}
              className="flex flex-col items-center gap-1.5 flex-shrink-0"
            >
              <div className="w-10 h-10 rounded-full border-2 border-dashed border-outline-variant flex items-center justify-center text-outline hover:border-primary hover:text-primary transition-colors">
                <Plus size={16} />
              </div>
              <span className="text-xs text-on-surface-variant">Invite</span>
              <span className="text-[10px] leading-none">&nbsp;</span>
            </button>
          )}
        </div>
      </section>

      {/* Member inspect modal */}
      {inspectedMember && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setInspectedMember(null)}
        >
          <div
            className="bg-surface rounded-2xl shadow-xl w-72 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex flex-col items-center gap-2 pt-6 pb-4 px-4">
              <AvatarCircle user={inspectedMember} size="lg" className="min-w-14" />
              <div className="text-center">
                <p className="font-heading font-bold text-on-surface text-lg">
                  {inspectedMember.name}
                  {isInspectingSelf ? ' (you)' : ''}
                </p>
                <p className="text-sm text-outline">{getRoleLabel(inspectedMember.role)}</p>
              </div>
            </div>

            {/* Actions */}
            {(assignableRoles.length > 0 || canTransfer || canRemoveInspected) && (
              <div className="border-t border-outline-variant/30 px-2 py-2 flex flex-col gap-0.5">
                {assignableRoles.map((role) => (
                  <button
                    key={role}
                    onClick={() => handleRoleChange(inspectedMember.id, role)}
                    disabled={roleUpdating}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-on-surface hover:bg-surface-container-lowest transition-colors disabled:opacity-50"
                  >
                    <span>
                      {getRoleRankDirection(inspectedMember.role, role)} to {getRoleLabel(role)}
                    </span>
                    <ChevronRight size={14} className="text-outline" />
                  </button>
                ))}
                {canTransfer && (
                  <button
                    onClick={() => handleTransferOwnership(inspectedMember.id, inspectedMember.name)}
                    disabled={roleUpdating}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-primary hover:bg-surface-container-lowest transition-colors disabled:opacity-50"
                  >
                    <span>Transfer ownership</span>
                    <ChevronRight size={14} className="text-outline" />
                  </button>
                )}
                {canRemoveInspected && (
                  <button
                    onClick={() => handleRemoveMember(inspectedMember.id, inspectedMember.name)}
                    disabled={removingUserId !== null}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-error hover:bg-error/10 transition-colors disabled:opacity-50"
                  >
                    <span>Remove from group</span>
                    <X size={14} />
                  </button>
                )}
              </div>
            )}

            {/* Close */}
            <div className="border-t border-outline-variant/30 px-2 py-2">
              <button
                onClick={() => setInspectedMember(null)}
                className="w-full px-3 py-2 rounded-lg text-sm text-on-surface-variant hover:bg-surface-container-lowest transition-colors text-center"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite link banner */}
      {inviteLink && (
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 flex items-center gap-3">
          <Link2 size={16} className="text-primary flex-shrink-0" />
          <p className="text-sm text-on-surface truncate flex-1">{inviteLink}</p>
          <button
            onClick={handleInvite}
            className="text-xs font-medium text-primary hover:underline flex-shrink-0"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      )}

      {/* Event detail modal */}
      {inspectedEvent && (
        <EventDetailModal
          event={inspectedEvent}
          currentUserId={user?.id}
          onClose={() => setInspectedEvent(null)}
          onEventUpdated={(updated) => {
            setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
            setInspectedEvent(updated);
          }}
        />
      )}

      {/* Create event modal */}
      {showCreateEvent && (
        <CreateEventModal
          groupId={id}
          onClose={() => setShowCreateEvent(false)}
          onCreated={(event) => {
            setEvents((prev) => [event, ...prev]);
            setShowCreateEvent(false);
          }}
        />
      )}

      {/* Events */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-heading font-semibold text-on-surface-variant uppercase tracking-wide">
            Hangouts
          </h2>
          {canCreateEvent && (
            <Button variant="primary" size="sm" onClick={() => setShowCreateEvent(true)}>
              <Plus size={14} />
              Plan something
            </Button>
          )}
        </div>

        {events.length === 0 ? (
          <div className="flex flex-col items-center py-12 gap-3">
            <span className="text-3xl">🍃</span>
            <p className="font-heading font-semibold text-on-surface">Nothing planned yet</p>
            <p className="text-sm text-on-surface-variant">Be the one to make it happen 👀</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                currentUserId={user?.id}
                onPress={() => setInspectedEvent(event)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/** Returns "Promote" or "Demote" based on rank comparison. */
function getRoleRankDirection(currentRole: GroupRole, newRole: GroupRole): string {
  const { getRoleRank } = require('@down/common');
  return getRoleRank(newRole) > getRoleRank(currentRole) ? 'Promote' : 'Demote';
}
