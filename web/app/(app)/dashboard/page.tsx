import { EventCard } from '@down/common';
import { AvatarCircle } from '@down/common';
import {
  getGreeting,
  currentUser,
  allGroups,
  MockEvents,
} from '@down/common';

// Top events across all groups (mock data — will come from Supabase)
const featuredEvents = [
  { event: MockEvents.pizzaNight,    groupId: 'g1' },
  { event: MockEvents.movieMarathon, groupId: 'g1' },
  { event: MockEvents.gamingSession, groupId: 'g3' },
];

export default function DashboardPage() {
  const greeting = getGreeting();

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-outline font-body">{greeting} 👋</p>
          <h1 className="text-2xl font-heading font-bold text-on-surface mt-0.5">
            What&apos;s the move?
          </h1>
        </div>
        <AvatarCircle user={currentUser} size="md" />
      </div>

      {/* Squad preview */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        {allGroups.map((g) => (
          <a
            key={g.id}
            href={`/groups/${g.id}`}
            className="flex flex-col items-center gap-1.5 flex-shrink-0"
          >
            <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center text-xl">
              {g.name[0]}
            </div>
            <span className="text-xs text-on-surface-variant font-body truncate max-w-[56px]">
              {g.name.split(' ')[0]}
            </span>
          </a>
        ))}
      </div>

      {/* Events feed */}
      <section>
        <h2 className="text-sm font-heading font-semibold text-on-surface-variant uppercase tracking-wide mb-3">
          🔥 Active Hangouts
        </h2>
        <div className="flex flex-col gap-3">
          {featuredEvents.map(({ event }) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>
    </div>
  );
}
