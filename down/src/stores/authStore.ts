// Auth store — manages user session
// Translated from LoginViewModel + RootView auth logic

import { create } from 'zustand';
import { User } from '../types';
import * as api from '../services/api';
import { mockApi } from '../services/mockApi';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isRestoringSession: boolean;
  error: string | null;

  restoreSession: () => Promise<void>;
  signIn: (provider: api.AuthProvider) => Promise<User | null>;
  signInMock: () => Promise<User | null>;
  signOut: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isRestoringSession: true,
  error: null,

  restoreSession: async () => {
    try {
      const user = await api.restoreSession();
      set({ user, isRestoringSession: false });
    } catch {
      set({ isRestoringSession: false });
    }
  },

  signIn: async (provider) => {
    set({ isLoading: true, error: null });
    try {
      // For now, use mock sign in since we don't have native auth modules set up yet
      const user = await mockApi.signIn();
      set({ user, isLoading: false });
      return user;
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
      return null;
    }
  },

  signInMock: async () => {
    set({ isLoading: true, error: null });
    try {
      const user = await mockApi.signIn();
      set({ user, isLoading: false });
      return user;
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
      return null;
    }
  },

  signOut: () => {
    api.signOut();
    set({ user: null });
  },

  setUser: (user) => set({ user }),
}));
