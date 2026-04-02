'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Home, Users, User, Bell } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { getNotifications, markNotificationAsRead, useNotificationsRealtime, relativeFormatted, fetchGroups } from '@down/common';
import type { Notification, DownGroup } from '@down/common';
import { supabase } from '@/lib/supabase';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { session, user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [groups, setGroups] = useState<DownGroup[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (!user) return;
    getNotifications(supabase).then(setNotifications).catch(() => {});
    fetchGroups(supabase).then(setGroups).catch(() => {});
  }, [user?.id]);

  useNotificationsRealtime(supabase, user?.id, (notif) => {
    setNotifications((prev) => [notif, ...prev]);
  });

  // Close dropdown on outside click
  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleBellClick = () => {
    if (!isOpen) {
      // Mark all unread as read when opening
      notifications
        .filter((n) => !n.read)
        .forEach((n) => {
          markNotificationAsRead(supabase, n.id).catch(() => {});
        });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
    setIsOpen((o) => !o);
  };

  useEffect(() => {
    if (isLoading) return;
    if (!session) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [session, isLoading, router, pathname]);

  // Show nothing while checking auth — avoids flash of protected content
  if (isLoading || !session) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Top nav */}
      <header className="sticky top-0 z-40 bg-surface-container-lowest/80 backdrop-blur border-b border-outline-variant/20">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/dashboard">
            <span className="font-heading font-black text-xl text-primary tracking-tight">
              r u down?
            </span>
          </Link>
          <nav className="flex items-center gap-1">
            <Link href="/dashboard" className="p-2 rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors">
              <Home size={20} />
            </Link>
            <Link href="/groups" className="p-2 rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors">
              <Users size={20} />
            </Link>
            <div ref={bellRef} className="relative">
              <button
                onClick={handleBellClick}
                className="p-2 rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors relative"
                aria-label="Notifications"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-primary text-on-primary text-[10px] font-bold flex items-center justify-center leading-none">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-lg z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-outline-variant/20">
                    <p className="font-heading font-semibold text-sm text-on-surface">Notifications</p>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <p className="text-2xl mb-2">🔔</p>
                      <p className="text-sm text-on-surface-variant">all caught up 👌</p>
                    </div>
                  ) : (
                    <ul className="max-h-80 overflow-y-auto divide-y divide-outline-variant/10">
                      {notifications.map((n) => (
                        <li key={n.id}>
                          <Link
                            href={`/groups/${n.groupId}`}
                            onClick={() => setIsOpen(false)}
                            className="flex items-start gap-3 px-4 py-3 hover:bg-surface-container transition-colors"
                          >
                            <span className="text-lg flex-shrink-0 mt-0.5">👥</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-on-surface leading-snug">
                                {n.actorName ? <strong>{n.actorName}</strong> : 'Someone'}{' joined '}
                                <strong>{groups.find((g) => g.id === n.groupId)?.name ?? 'your group'}</strong>
                              </p>
                              <p className="text-xs text-on-surface-variant mt-0.5">
                                {relativeFormatted(n.createdAt)}
                              </p>
                            </div>
                            {!n.read && (
                              <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                            )}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
            <Link href="/profile" className="p-2 rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors">
              <User size={20} />
            </Link>
          </nav>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
