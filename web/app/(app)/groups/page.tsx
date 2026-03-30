import { Plus } from 'lucide-react';
import { GroupCard } from '@/components/GroupCard';
import { Button } from '@/components/ui/button';
import { allGroups } from '@down/common';

export default function GroupsPage() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold text-on-surface">Your Squads</h1>
        <Button variant="primary" size="sm">
          <Plus size={16} />
          New Squad
        </Button>
      </div>

      {allGroups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <span className="text-4xl">🫂</span>
          <p className="font-heading font-bold text-on-surface">No squads yet</p>
          <p className="text-sm text-on-surface-variant text-center">
            Create a squad and get your people together
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {allGroups.map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>
      )}
    </div>
  );
}
