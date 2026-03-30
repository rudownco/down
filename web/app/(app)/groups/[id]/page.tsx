import { notFound } from 'next/navigation';
import { Plus } from 'lucide-react';
import { EventCard } from '@/components/EventCard';
import { AvatarCircle } from '@/components/AvatarCircle';
import { Button } from '@/components/ui/button';
import {
  allGroups,
  getMockEventsForGroup,
  getGroupEmoji,
  getMemberCountLabel,
} from '@down/common';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function GroupDetailPage({ params }: Props) {
  const { id } = await params;
  const group  = allGroups.find((g) => g.id === id);
  if (!group) notFound();

  const events = getMockEventsForGroup(id);
  const emoji  = getGroupEmoji(group.name);
  const count  = group.memberCount ?? group.members.length;

  return (
    <div className="flex flex-col gap-6">
      {/* Group header */}
      <div className="flex items-center gap-4">
        <span className="text-4xl">{emoji}</span>
        <div>
          <h1 className="text-2xl font-heading font-bold text-on-surface">{group.name}</h1>
          <p className="text-sm text-outline">{getMemberCountLabel(count)}</p>
        </div>
      </div>

      {/* Members row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {group.members.map((member) => (
          <div key={member.id} className="flex flex-col items-center gap-1 flex-shrink-0">
            <AvatarCircle name={member.name} size="md" />
            <span className="text-xs text-on-surface-variant">{member.name.split(' ')[0]}</span>
          </div>
        ))}
        <div className="flex flex-col items-center gap-1 flex-shrink-0">
          <button className="w-10 h-10 rounded-full border-2 border-dashed border-outline-variant flex items-center justify-center text-outline hover:border-primary hover:text-primary transition-colors">
            <Plus size={16} />
          </button>
          <span className="text-xs text-on-surface-variant">Invite</span>
        </div>
      </div>

      {/* Events */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-heading font-semibold text-on-surface-variant uppercase tracking-wide">
            Hangouts
          </h2>
          <Button variant="primary" size="sm">
            <Plus size={14} />
            Plan something
          </Button>
        </div>

        {events.length === 0 ? (
          <div className="flex flex-col items-center py-12 gap-3">
            <span className="text-3xl">🍃</span>
            <p className="font-heading font-semibold text-on-surface">Nothing planned yet</p>
            <p className="text-sm text-on-surface-variant">Be the one to make it happen 👀</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} groupId={id} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
