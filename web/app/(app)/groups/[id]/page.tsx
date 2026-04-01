'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Plus, Link2, Check, Copy, X } from 'lucide-react';
import { EventCard, AvatarCircle, getGroupEmoji, getMemberCountLabel } from '@down/common';
import { fetchGroups, fetchEvents, createInvite, removeGroupMember, useGroupMembersRealtime } from '@down/common';
import type { DownGroup, EventSuggestion } from '@down/common';
import { Button } from '@/components/ui/button';
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

  const isCreator = user?.id === group?.createdBy;

  // Sync member changes from other clients in real-time
  useGroupMembersRealtime(supabase, id, (event) => {
    if (event.type === 'removed') {
      setGroup((prev) =>
        prev
          ? {
              ...prev,
              members: prev.members.filter((m) => m.id !== event.userId),
              memberCount: Math.max(0, (prev.memberCount ?? prev.members.length) - 1),
            }
          : prev
      );
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
      // Silently fail — could add toast later
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
    try {
      await removeGroupMember(supabase, id, memberId);
      // Optimistic update
      setGroup((prev) =>
        prev
          ? {
              ...prev,
              members: prev.members.filter((m) => m.id !== memberId),
              memberCount: Math.max(0, (prev.memberCount ?? prev.members.length) - 1),
            }
          : prev
      );
    } catch (e: any) {
      alert(e?.message ?? 'Could not remove member');
    } finally {
      setRemovingUserId(null);
    }
  }, [id, group]);

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

  return (
    <div className="flex flex-col gap-6">
      {/* Group header */}
      <div className="flex items-center gap-4">
        <span className="text-4xl">{emoji}</span>
        <div className="flex-1">
          <h1 className="text-2xl font-heading font-bold text-on-surface">{group.name}</h1>
          <p className="text-sm text-outline">{getMemberCountLabel(count)}</p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleInvite}
          disabled={inviteLoading}
        >
          {copied ? <Check size={14} /> : inviteLink ? <Copy size={14} /> : <Link2 size={14} />}
          {inviteLoading ? 'Creating...' : copied ? 'Copied!' : inviteLink ? 'Copy link' : 'Invite'}
        </Button>
      </div>

      {/* Members */}
      <section>
        <h2 className="text-sm font-heading font-semibold text-on-surface-variant uppercase tracking-wide mb-3">
          Members
        </h2>
        <div className="flex items-center gap-3 overflow-x-auto pb-1">
          {group.members.map((member) => {
            const isCurrentUser = member.id === user?.id;
            const canRemove = isCreator && !isCurrentUser;
            return (
              <div key={member.id} className="relative flex flex-col items-center gap-1.5 flex-shrink-0 group/member">
                <div className="relative">
                  <AvatarCircle user={member} size="md" />
                  {removingUserId === member.id && (
                    <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  {canRemove && (
                    <button
                      onClick={() => handleRemoveMember(member.id, member.name)}
                      disabled={removingUserId !== null}
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-error text-on-error flex items-center justify-center opacity-0 group-hover/member:opacity-100 transition-opacity hover:bg-error/80"
                      title={`Remove ${member.name.split(' ')[0]}`}
                    >
                      <X size={10} />
                    </button>
                  )}
                </div>
                <span className="text-xs text-on-surface-variant max-w-[56px] truncate text-center">
                  {member.name.split(' ')[0]}
                  {isCurrentUser ? ' (you)' : ''}
                </span>
              </div>
            );
          })}
          <button
            onClick={handleInvite}
            disabled={inviteLoading}
            className="flex flex-col items-center gap-1.5 flex-shrink-0"
          >
            <div className="w-10 h-10 rounded-full border-2 border-dashed border-outline-variant flex items-center justify-center text-outline hover:border-primary hover:text-primary transition-colors">
              <Plus size={16} />
            </div>
            <span className="text-xs text-on-surface-variant">Invite</span>
          </button>
        </div>
      </section>

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

      {/* Events */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-heading font-semibold text-on-surface-variant uppercase tracking-wide">
            Hangouts
          </h2>
          <Button variant="primary" size="sm">
            <Plus size={14} />
            Plan something
          </Button>
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
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
