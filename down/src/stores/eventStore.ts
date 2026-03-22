// Event store — manages events per group
// Translated from GroupDetailViewModel

import { create } from 'zustand';
import { EventSuggestion } from '../types';
import * as api from '../services/api';

interface EventState {
  events: EventSuggestion[];
  isLoading: boolean;
  error: string | null;

  loadEvents: (groupId: string) => Promise<void>;
  addEvent: (event: EventSuggestion) => void;
  updateEvent: (event: EventSuggestion) => void;
}

export const useEventStore = create<EventState>((set) => ({
  events: [],
  isLoading: false,
  error: null,

  loadEvents: async (groupId) => {
    set({ isLoading: true, error: null });
    try {
      const events = await api.fetchEvents(groupId);
      set({ events, isLoading: false });
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },

  addEvent: (event) => {
    set((state) => ({ events: [event, ...state.events] }));
  },

  updateEvent: (event) => {
    set((state) => ({
      events: state.events.map((e) => (e.id === event.id ? event : e)),
    }));
  },
}));
