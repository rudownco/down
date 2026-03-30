// Mock API service for development
// Translated from ios/down/Services/MockDataService.swift

import {
  DownGroup,
  EventSuggestion,
  RSVP,
  RSVPStatus,
  User,
  VotingOption,
} from '../types';
import {
  MockEvents,
  MockGroups,
  allGroups,
  allUsers,
  currentUser,
  getMockEventsForGroup,
} from '../mocks/data';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

class MockApi {
  // In-memory session state
  private createdEvents: Record<string, EventSuggestion[]> = {};
  private mutatedEvents: Record<string, EventSuggestion> = {};

  private allSeedEvents: EventSuggestion[] = [
    MockEvents.pizzaNight,
    MockEvents.movieMarathon,
    MockEvents.coffeeRun,
    MockEvents.gamingSession,
  ];

  async fetchGroups(userId: string): Promise<DownGroup[]> {
    await delay(400);
    return allGroups;
  }

  async fetchEvents(groupId: string): Promise<EventSuggestion[]> {
    await delay(400);
    const base = getMockEventsForGroup(groupId);
    const merged = base.map((e) => this.mutatedEvents[e.id] ?? e);
    const extra = this.createdEvents[groupId] ?? [];
    return [...extra, ...merged];
  }

  async submitVotes(
    eventId: string,
    optionIds: string[],
    userId: string
  ): Promise<EventSuggestion> {
    await delay(600);
    let event: EventSuggestion =
      this.mutatedEvents[eventId] ??
      this.allSeedEvents.find((e) => e.id === eventId) ??
      MockEvents.pizzaNight;

    // Deep clone to avoid mutating originals
    event = JSON.parse(JSON.stringify(event));

    for (const option of event.votingOptions) {
      if (optionIds.includes(option.id)) {
        option.votes += 1;
        const user = allUsers.find((u) => u.id === userId);
        if (user && !option.voters.some((v) => v.id === userId)) {
          option.voters.push(user);
        }
      }
    }

    this.mutatedEvents[eventId] = event;
    return event;
  }

  async submitRSVP(
    eventId: string,
    status: RSVPStatus,
    userId: string
  ): Promise<RSVP> {
    await delay(600);
    const rsvp: RSVP = {
      id: `r-${Date.now()}`,
      userId,
      eventId,
      status,
      updatedAt: new Date().toISOString(),
    };

    let event: EventSuggestion =
      this.mutatedEvents[eventId] ??
      this.allSeedEvents.find((e) => e.id === eventId) ??
      MockEvents.movieMarathon;

    event = JSON.parse(JSON.stringify(event));

    const idx = event.rsvps.findIndex((r) => r.userId === userId);
    if (idx >= 0) {
      event.rsvps[idx] = rsvp;
    } else {
      event.rsvps.push(rsvp);
    }

    this.mutatedEvents[eventId] = event;
    return rsvp;
  }

  async createEvent(
    event: EventSuggestion,
    groupId: string
  ): Promise<EventSuggestion> {
    await delay(800);
    if (!this.createdEvents[groupId]) {
      this.createdEvents[groupId] = [];
    }
    this.createdEvents[groupId].unshift(event);
    return event;
  }

  async createGroup(name: string): Promise<DownGroup> {
    await delay(600);
    return {
      id: `g-${Date.now()}`,
      name,
      members: [currentUser],
      lastActivity: 'just now',
      unreadCount: 0,
    };
  }

}

export const mockApi = new MockApi();
