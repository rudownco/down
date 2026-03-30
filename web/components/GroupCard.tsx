import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AvatarStack } from '@/components/AvatarStack';
import { getGroupEmoji, getMemberCountLabel } from '@down/common';
import type { DownGroup } from '@down/common';

interface GroupCardProps {
  group: DownGroup;
}

export function GroupCard({ group }: GroupCardProps) {
  const emoji = getGroupEmoji(group.name);
  const count = group.memberCount ?? group.members.length;

  return (
    <Link href={`/groups/${group.id}`}>
      <Card className="hover:shadow-md transition-all hover:border-primary/30 cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{emoji}</span>
            <div className="min-w-0">
              <CardTitle className="text-base truncate">{group.name}</CardTitle>
              <p className="text-xs text-outline mt-0.5">{getMemberCountLabel(count)}</p>
            </div>
            {group.unreadCount > 0 && (
              <span className="ml-auto bg-primary text-on-primary text-xs font-bold rounded-chip px-2 py-0.5">
                {group.unreadCount}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            <AvatarStack users={group.members} max={5} size="xs" />
            <span className="text-xs text-outline">{group.lastActivity}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
