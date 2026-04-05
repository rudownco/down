import { create } from 'zustand';
import type { DownGroup, Notification } from '@down/common';

interface NotificationState {
  notifications: Notification[];
  groups: DownGroup[];
  setNotifications: (notifications: Notification[]) => void;
  setGroups: (groups: DownGroup[]) => void;
  addNotification: (notification: Notification) => void;
  markAllRead: () => void;
  markOneRead: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  groups: [],

  setNotifications: (notifications) => set({ notifications }),
  setGroups: (groups) => set({ groups }),

  addNotification: (notification) =>
    set((state) => ({ notifications: [notification, ...state.notifications] })),

  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),

  markOneRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),
}));
