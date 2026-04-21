'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Sparkles, Users, User, Bell, LogOut, Plus, X, ChevronRight, Menu } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import {
  getNotifications, markNotificationAsRead, useNotificationsRealtime,
  relativeFormatted, fetchGroups, createGroup,
} from '@down/common';
import type { DownGroup, EventSuggestion } from '@down/common';
import { supabase } from '@/lib/supabase';
import { useNotificationStore } from '@/lib/stores/notificationStore';
import { CreateEventModal } from '@/components/CreateEventModal';
import { toast } from 'sonner';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Events', icon: Sparkles },
  { href: '/groups',    label: 'Squads', icon: Users },
  { href: '/profile',   label: 'Profile', icon: User },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { session, user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { notifications, groups, setNotifications, setGroups, addNotification, markAllRead } = useNotificationStore();

  // Mobile sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Bell
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Sidebar "+ New" dropdown (desktop)
  const [sidebarNewOpen, setSidebarNewOpen] = useState(false);
  const sidebarNewRef = useRef<HTMLDivElement>(null);

  // FAB dropdown (mobile)
  const [fabOpen, setFabOpen] = useState(false);
  const fabRef = useRef<HTMLDivElement>(null);

  // New event flow: group picker → CreateEventModal
  const [showGroupPicker, setShowGroupPicker] = useState(false);
  const [createEventGroupId, setCreateEventGroupId] = useState<string | null>(null);

  // New squad modal
  const [showNewSquad, setShowNewSquad] = useState(false);
  const [newSquadName, setNewSquadName] = useState('');
  const [isCreatingSquad, setIsCreatingSquad] = useState(false);
  const squadInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    getNotifications(supabase).then(setNotifications).catch(() => {});
    fetchGroups(supabase).then(setGroups).catch(() => {});
  }, [user?.id]);

  useNotificationsRealtime(supabase, user?.id, addNotification);

  // Close sidebar on navigation
  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  // Outside-click handlers
  useEffect(() => {
    if (!bellOpen) return;
    const h = (e: MouseEvent) => { if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBellOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [bellOpen]);

  useEffect(() => {
    if (!sidebarNewOpen) return;
    const h = (e: MouseEvent) => { if (sidebarNewRef.current && !sidebarNewRef.current.contains(e.target as Node)) setSidebarNewOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [sidebarNewOpen]);

  useEffect(() => {
    if (!fabOpen) return;
    const h = (e: MouseEvent) => { if (fabRef.current && !fabRef.current.contains(e.target as Node)) setFabOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [fabOpen]);

  useEffect(() => {
    if (showNewSquad) squadInputRef.current?.focus();
  }, [showNewSquad]);

  const handleBellClick = () => {
    if (!bellOpen) {
      notifications.filter((n) => !n.read).forEach((n) => {
        markNotificationAsRead(supabase, n.id).catch(() => {});
      });
      markAllRead();
    }
    setBellOpen((o) => !o);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  const handleNewHangout = () => {
    setSidebarNewOpen(false);
    setFabOpen(false);
    if (groups.length === 0) {
      toast.error('Create a squad first, then make a hangout 👀');
      return;
    }
    setShowGroupPicker(true);
  };

  const handleNewSquad = () => {
    setSidebarNewOpen(false);
    setFabOpen(false);
    setShowNewSquad(true);
  };

  const handlePickGroup = (group: DownGroup) => {
    setShowGroupPicker(false);
    setCreateEventGroupId(group.id);
  };

  const handleEventCreated = (event: EventSuggestion) => {
    setCreateEventGroupId(null);
    toast.success(`${event.title} is live! 🎉`);
  };

  const handleCreateSquad = async () => {
    const name = newSquadName.trim();
    if (!name) return;
    setIsCreatingSquad(true);
    try {
      const group = await createGroup(supabase, name);
      setGroups([group, ...groups]);
      setShowNewSquad(false);
      setNewSquadName('');
      toast.success(`${group.name} squad is up! 🫂`);
      router.push(`/groups/${group.id}`);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Could not create squad');
    } finally {
      setIsCreatingSquad(false);
    }
  };

  useEffect(() => {
    if (isLoading) return;
    if (!session) router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
  }, [session, isLoading, router, pathname]);

  if (isLoading || !session) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const avatarInitial = user?.name?.charAt(0).toUpperCase() ?? '?';

  // Shared new-item dropdown menu content
  const NewMenu = ({ onHangout, onSquad }: { onHangout: () => void; onSquad: () => void }) => (
    <>
      <button
        onClick={onHangout}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-surface-container transition-colors text-left"
      >
        <span className="text-sm font-medium text-on-surface">New Hangout 🎉</span>
        <ChevronRight size={14} className="text-on-surface-variant" />
      </button>
      <div className="border-t border-outline-variant/20" />
      <button
        onClick={onSquad}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-surface-container transition-colors text-left"
      >
        <span className="text-sm font-medium text-on-surface">New Squad 🫂</span>
        <ChevronRight size={14} className="text-on-surface-variant" />
      </button>
    </>
  );

  return (
    <div className="min-h-screen bg-surface flex">
      {/* ── Mobile sidebar backdrop ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`
        w-64 flex flex-col bg-surface-container-lowest border-r border-outline-variant/20 shadow-sm
        fixed inset-y-0 left-0 z-50 transition-transform duration-300
        md:sticky md:top-0 md:h-screen md:shrink-0 md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo + mobile close */}
        <div className="px-5 py-6 flex items-center justify-between">
          <Link href="/dashboard" onClick={() => setSidebarOpen(false)}>
            <span className="font-heading font-black text-xl text-primary tracking-tight">
              r u down?
            </span>
          </Link>
          <button
            className="md:hidden p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 flex flex-col gap-1 px-2">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href + '/'));
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className={`text-xs tracking-widest uppercase ${isActive ? 'font-bold' : 'font-medium'}`}>
                  {label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="px-2 pb-4 flex flex-col gap-1">
          {/* + New (desktop only — mobile uses FAB) */}
          <div ref={sidebarNewRef} className="relative hidden md:block">
            <button
              onClick={() => setSidebarNewOpen((o) => !o)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-primary text-on-primary hover:bg-primary/90 transition-colors"
            >
              <Plus size={18} strokeWidth={2.2} />
              <span className="text-xs tracking-widest uppercase font-bold">New</span>
            </button>
            {sidebarNewOpen && (
              <div className="absolute bottom-full mb-2 left-0 right-0 bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-lg overflow-hidden z-50">
                <NewMenu onHangout={handleNewHangout} onSquad={handleNewSquad} />
              </div>
            )}
          </div>

          {/* Log out */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            <LogOut size={18} strokeWidth={1.8} />
            <span className="text-xs tracking-widest uppercase font-medium">log out</span>
          </button>
        </div>
      </aside>

      {/* ── Content area ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar: hamburger (mobile) + bell + avatar */}
        <div className="flex items-center gap-2 px-4 py-4 shrink-0">
          {/* Hamburger — mobile only */}
          <button
            className="md:hidden p-2 rounded-xl hover:bg-surface-container text-on-surface-variant transition-colors"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

          {/* Push bell + avatar to the right */}
          <div className="flex-1" />

          {/* Bell */}
          <div ref={bellRef} className="relative">
            <button
              onClick={handleBellClick}
              className="p-2 rounded-xl hover:bg-surface-container text-on-surface-variant transition-colors relative"
              aria-label="Notifications"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-primary text-on-primary text-[10px] font-bold flex items-center justify-center leading-none">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {bellOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-lg z-50 overflow-hidden">
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
                          onClick={() => setBellOpen(false)}
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

          {/* Avatar */}
          <Link href="/profile" className="shrink-0">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name ?? 'profile'}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-outline-variant/30"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-primary/15 text-primary flex items-center justify-center ring-2 ring-outline-variant/30">
                <span className="text-sm font-bold">{avatarInitial}</span>
              </div>
            )}
          </Link>
        </div>

        {/* Page content */}
        <main className="flex-1 w-full px-4 md:px-8 pb-24 md:pb-8">
          {children}
        </main>
      </div>

      {/* ── FAB (mobile only) ── */}
      <div ref={fabRef} className="md:hidden fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
        {fabOpen && (
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-lg overflow-hidden w-48">
            <NewMenu onHangout={handleNewHangout} onSquad={handleNewSquad} />
          </div>
        )}
        <button
          onClick={() => setFabOpen((o) => !o)}
          className="w-14 h-14 rounded-full bg-primary text-on-primary shadow-lg flex items-center justify-center hover:bg-primary/90 active:scale-95 transition-all"
          aria-label="New"
        >
          <Plus size={26} strokeWidth={2.5} className={`transition-transform duration-200 ${fabOpen ? 'rotate-45' : ''}`} />
        </button>
      </div>

      {/* ── Group picker modal ── */}
      {showGroupPicker && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowGroupPicker(false)}
        >
          <div
            className="bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/20">
              <h2 className="font-heading font-bold text-lg text-on-surface">Which squad? 👀</h2>
              <button
                onClick={() => setShowGroupPicker(false)}
                className="p-1.5 rounded-full hover:bg-surface-container text-on-surface-variant transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <ul className="max-h-72 overflow-y-auto divide-y divide-outline-variant/10">
              {groups.map((g) => (
                <li key={g.id}>
                  <button
                    onClick={() => handlePickGroup(g)}
                    className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-surface-container transition-colors text-left"
                  >
                    <span className="text-xl">{g.name[0]}</span>
                    <span className="text-sm font-medium text-on-surface">{g.name}</span>
                    <ChevronRight size={14} className="ml-auto text-on-surface-variant" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* ── Create event modal ── */}
      {createEventGroupId && (
        <CreateEventModal
          groupId={createEventGroupId}
          onClose={() => setCreateEventGroupId(null)}
          onCreated={handleEventCreated}
        />
      )}

      {/* ── New squad modal ── */}
      {showNewSquad && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => { setShowNewSquad(false); setNewSquadName(''); }}
        >
          <div
            className="bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-sm p-5 flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-bold text-lg text-on-surface">Name your squad</h2>
              <button
                onClick={() => { setShowNewSquad(false); setNewSquadName(''); }}
                className="p-1.5 rounded-full hover:bg-surface-container text-on-surface-variant transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <input
              ref={squadInputRef}
              type="text"
              value={newSquadName}
              onChange={(e) => setNewSquadName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateSquad()}
              placeholder="The Boys, Brunch Gang..."
              maxLength={50}
              className="w-full h-11 px-3 rounded-xl border border-outline-variant/40 bg-surface text-on-surface placeholder:text-outline text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={handleCreateSquad}
              disabled={isCreatingSquad || !newSquadName.trim()}
              className="w-full py-3 rounded-xl bg-primary text-on-primary font-heading font-bold text-sm disabled:opacity-50 hover:bg-primary/90 transition-colors"
            >
              {isCreatingSquad ? 'Creating...' : "Let's go 🚀"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
