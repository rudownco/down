import { useEffect, useRef } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';

export type MemberRealtimeEvent =
  | { type: 'removed'; userId: string }
  | { type: 'added'; userId: string };

/**
 * Subscribes to real-time changes on group_users for a specific group.
 * Currently handles DELETE (member removed). INSERT is stubbed for future use.
 *
 * Uses a discriminated union event payload so adding new event types (e.g. 'added')
 * is non-breaking — callers just add a new branch.
 *
 * Uses useRef to hold the latest callback, preventing stale closures when the
 * dep array intentionally excludes onEvent to avoid resubscribing on every render.
 *
 * Requires group_users to have REPLICA IDENTITY FULL so payload.old includes user_id.
 */
export function useGroupMembersRealtime(
  supabase: SupabaseClient,
  groupId: string | null | undefined,
  onEvent: (event: MemberRealtimeEvent) => void
): void {
  // Always call the latest version of onEvent without resubscribing
  const onEventRef = useRef(onEvent);
  useEffect(() => { onEventRef.current = onEvent; });

  useEffect(() => {
    if (!groupId) return;

    const channel = supabase
      .channel(`group_users:${groupId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'group_users',
          filter: `group_id=eq.${groupId}`,
        },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            const userId = (payload.old as { user_id?: string })?.user_id;
            if (userId) onEventRef.current({ type: 'removed', userId });
          }
          // INSERT: placeholder for future live member-join updates
          // if (payload.eventType === 'INSERT') {
          //   const userId = (payload.new as { user_id?: string })?.user_id;
          //   if (userId) onEventRef.current({ type: 'added', userId });
          // }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId, supabase]);
}
