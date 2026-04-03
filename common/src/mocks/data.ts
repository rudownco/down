import type { DownGroup, EventSuggestion, GroupMember, RSVP, User, VotingOption } from '../types';

// ─── Mock Users ─────────────────────────────────────────
export const MockUsers = {
  alex:   { id: 'u1', name: 'Alex Kim' }      as User,
  jamie:  { id: 'u2', name: 'Jamie Chen' }    as User,
  taylor: { id: 'u3', name: 'Taylor Rodriguez' } as User,
  morgan: { id: 'u4', name: 'Morgan Lee' }    as User,
  casey:  { id: 'u5', name: 'Casey Park' }    as User,
  river:  { id: 'u6', name: 'River Stone' }   as User,
  sam:    { id: 'u7', name: 'Sam Walsh' }      as User,
};

export const currentUser = MockUsers.alex;
export const allUsers    = Object.values(MockUsers);

function mockMembers(users: User[]): GroupMember[] {
  return users.map((u, i) => ({ ...u, role: i === 0 ? 'owner' as const : 'member' as const }));
}

// ─── Mock Voting Options ────────────────────────────────
const pizzaOptions: VotingOption[] = [
  { id: 'vo1', date: 'Friday, Mar 21',   time: '7:00 PM', votes: 4, voters: [MockUsers.alex, MockUsers.jamie, MockUsers.taylor, MockUsers.morgan] },
  { id: 'vo2', date: 'Saturday, Mar 22', time: '6:30 PM', votes: 2, voters: [MockUsers.casey, MockUsers.river] },
  { id: 'vo3', date: 'Sunday, Mar 23',   time: '5:00 PM', votes: 1, voters: [MockUsers.sam] },
];

const movieOptions: VotingOption[] = [
  { id: 'vo4', date: 'Saturday, Mar 22', time: '8:00 PM', votes: 3, voters: [MockUsers.alex, MockUsers.jamie, MockUsers.casey] },
  { id: 'vo5', date: 'Sunday, Mar 23',   time: '3:00 PM', votes: 2, voters: [MockUsers.morgan, MockUsers.taylor] },
];

// ─── Mock Events ────────────────────────────────────────
export const MockEvents = {
  pizzaNight: {
    id: 'e1',
    title: 'Pizza Night',
    description: "Let's hit that new wood-fired place downtown. They have 30+ toppings!",
    location: "Napoli's Pizza, 42 Main St",
    status: 'voting',
    attendees: allUsers.slice(0, 5),
    suggestedBy: MockUsers.jamie,
    votingOptions: pizzaOptions,
    rsvps: [],
  } as EventSuggestion,

  movieMarathon: {
    id: 'e2',
    title: 'Movie Marathon',
    description: 'Horror movie triple feature — if you dare 👻',
    location: "Taylor's place",
    date: 'Saturday, Mar 22',
    time: '8:00 PM',
    status: 'confirmed',
    attendees: allUsers.slice(0, 4),
    suggestedBy: MockUsers.taylor,
    votingOptions: movieOptions,
    rsvps: [
      { id: 'r1', userId: 'u1', eventId: 'e2', status: 'going',     updatedAt: new Date().toISOString() },
      { id: 'r2', userId: 'u2', eventId: 'e2', status: 'going',     updatedAt: new Date().toISOString() },
      { id: 'r3', userId: 'u3', eventId: 'e2', status: 'maybe',     updatedAt: new Date().toISOString() },
      { id: 'r4', userId: 'u4', eventId: 'e2', status: 'not_going', updatedAt: new Date().toISOString() },
      { id: 'r5', userId: 'u5', eventId: 'e2', status: 'going',     updatedAt: new Date().toISOString() },
    ] as RSVP[],
  } as EventSuggestion,

  coffeeRun: {
    id: 'e3',
    title: 'Sunday Coffee Run',
    description: 'Brunch vibes, lazy Sunday energy ☀️',
    location: 'Blue Bottle Coffee',
    status: 'pending',
    attendees: [MockUsers.alex, MockUsers.casey],
    suggestedBy: MockUsers.casey,
    votingOptions: [],
    rsvps: [],
  } as EventSuggestion,

  gamingSession: {
    id: 'e4',
    title: 'Gaming Session',
    description: 'Mario Kart tournament — loser buys pizza next time',
    location: "Morgan's place",
    date: 'Friday, Mar 28',
    time: '9:00 PM',
    status: 'confirmed',
    attendees: allUsers.slice(0, 6),
    suggestedBy: MockUsers.morgan,
    votingOptions: [],
    rsvps: [
      { id: 'r6',  userId: 'u1', eventId: 'e4', status: 'going',     updatedAt: new Date().toISOString() },
      { id: 'r7',  userId: 'u2', eventId: 'e4', status: 'going',     updatedAt: new Date().toISOString() },
      { id: 'r8',  userId: 'u4', eventId: 'e4', status: 'going',     updatedAt: new Date().toISOString() },
      { id: 'r9',  userId: 'u5', eventId: 'e4', status: 'maybe',     updatedAt: new Date().toISOString() },
      { id: 'r10', userId: 'u6', eventId: 'e4', status: 'not_going', updatedAt: new Date().toISOString() },
    ] as RSVP[],
  } as EventSuggestion,
};

// ─── Mock Groups ────────────────────────────────────────
export const MockGroups = {
  fridaySquad: {
    id: 'g1',
    name: 'Friday Squad',
    members: mockMembers(allUsers.slice(0, 5)),
    lastActivity: '2h ago',
    unreadCount: 3,
  } as DownGroup,

  workBuds: {
    id: 'g2',
    name: 'Work Buds',
    members: mockMembers(allUsers.slice(0, 4)),
    lastActivity: '1d ago',
    unreadCount: 0,
  } as DownGroup,

  weekendWarriors: {
    id: 'g3',
    name: 'Weekend Warriors',
    members: mockMembers(allUsers),
    lastActivity: '5m ago',
    unreadCount: 7,
  } as DownGroup,

  coffeeClub: {
    id: 'g4',
    name: 'Coffee Club',
    members: mockMembers([MockUsers.alex, MockUsers.casey, MockUsers.river]),
    lastActivity: '3d ago',
    unreadCount: 0,
  } as DownGroup,
};

export const allGroups: DownGroup[] = [
  MockGroups.fridaySquad,
  MockGroups.weekendWarriors,
  MockGroups.workBuds,
  MockGroups.coffeeClub,
];

export function getMockEventsForGroup(groupId: string): EventSuggestion[] {
  switch (groupId) {
    case 'g1': return [MockEvents.pizzaNight, MockEvents.movieMarathon];
    case 'g3': return [MockEvents.gamingSession, MockEvents.coffeeRun, MockEvents.pizzaNight];
    default:   return [MockEvents.coffeeRun];
  }
}
