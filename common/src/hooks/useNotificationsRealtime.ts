import { useEffect, useRef } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Notification, NotificationType } from '../types';

/**
 * Subscribes to INSERT events on the notifications table filtered by user_id.
 * Triggers onNotification when a new notification arrives in real-time.
 *
 * Uses useRef to hold the latest callback, preventing stale closures when the
 * dep array intentionally excludes onNotification to avoid resubscribing on every render.
 *
 * Dep array intentionally excludes supabase (singleton) to avoid resubscription spam.
 */
export function useNotificationsRealtime(
  supabase: SupabaseClient,
  userId: string | null | undefined,
  onNotification: (notification: Notification) => void
): void {
  const onNotificationRef = useRef(onNotification);
  useEffect(() => { onNotificationRef.current = onNotification; });

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const n = payload.new;
          if (!n || typeof n !== 'object') return;
          onNotificationRef.current({
            id: (n as any).id as string,
            userId: (n as any).user_id as string,
            type: (n as any).type as NotificationType,
            groupId: (n as any).group_id as string,
            actorId: ((n as any).actor_id as string | null) ?? null,
            read: (n as any).read as boolean,
            createdAt: (n as any).created_at as string,
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps
}
