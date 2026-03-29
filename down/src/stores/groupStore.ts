// Group store — manages groups list
// Translated from GroupDashboardViewModel

import { create } from 'zustand';
import { DownGroup } from '../types';
import * as api from '../services/api';

interface GroupState {
  groups: DownGroup[];
  isLoading: boolean;
  error: string | null;

  loadGroups: () => Promise<void>;
  addGroup: (group: DownGroup) => void;
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
}));
