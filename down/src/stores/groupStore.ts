// Group store — manages groups list
// Translated from GroupDashboardViewModel

import { create } from 'zustand';
import type { DownGroup, GroupRole } from '@down/common';
import * as api from '../services/api';

interface GroupState {
  groups: DownGroup[];
  isLoading: boolean;
  error: string | null;

  loadGroups: () => Promise<void>;
  addGroup: (group: DownGroup) => void;
  removeMember: (groupId: string, userId: string) => void;
  updateMemberRole: (groupId: string, userId: string, newRole: GroupRole) => void;
}

export const useGroupStore = create<GroupState>((set) => ({
  groups: [],
  isLoading: false,
  error: null,

  loadGroups: async () => {
    set({ isLoading: true, error: null });
    try {
      const groups = await api.fetchGroups();
      set({ groups, isLoading: false });
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },

  addGroup: (group) => {
    set((state) => ({ groups: [group, ...state.groups] }));
  },

  // Optimistically remove a member from local state after API call succeeds
  removeMember: (groupId, userId) => {
    set((state) => ({
      groups: state.groups.map((g) =>
        g.id !== groupId
          ? g
          : {
              ...g,
              members: g.members.filter((m) => m.id !== userId),
              memberCount: Math.max(0, (g.memberCount ?? g.members.length) - 1),
            }
      ),
    }));
  },

  updateMemberRole: (groupId, userId, newRole) => {
    set((state) => ({
      groups: state.groups.map((g) =>
        g.id !== groupId
          ? g
          : { ...g, members: g.members.map((m) => m.id === userId ? { ...m, role: newRole } : m) }
      ),
    }));
  },
}));
