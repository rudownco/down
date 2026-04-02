import { create } from 'zustand';
import { getNotifications } from '../services/api';

interface NotificationState {
  unreadCount: number;
  unreadGroupIds: string[];
  loadUnread: () => Promise<void>;
  incrementGroup: (groupId: string) => void;
  reset: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,
  unreadGroupIds: [],

  loadUnread: async () => {
    try {
      const notifs = await getNotifications();
      const unread = notifs.filter((n) => !n.read);
      const groupIds = [...new Set(unread.map((n) => n.groupId))];
      set({ unreadCount: unread.length, unreadGroupIds: groupIds });
    } catch {}
  },

  incrementGroup: (groupId: string) =>
    set((state) => ({
      unreadCount: state.unreadCount + 1,
      unreadGroupIds: state.unreadGroupIds.includes(groupId)
        ? state.unreadGroupIds
        : [...state.unreadGroupIds, groupId],
    })),

  reset: () => set({ unreadCount: 0, unreadGroupIds: [] }),
}));
