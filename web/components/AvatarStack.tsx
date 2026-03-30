import { AvatarCircle } from './AvatarCircle';
import type { User } from '@down/common';

interface AvatarStackProps {
  users: User[];
  max?: number;
  size?: 'xs' | 'sm' | 'md';
}

export function AvatarStack({ users, max = 4, size = 'sm' }: AvatarStackProps) {
  const visible  = users.slice(0, max);
  const overflow = users.length - max;

  return (
    <div className="flex items-center">
      {visible.map((user, i) => (
        <div key={user.id} className="-ml-2 first:ml-0 ring-2 ring-surface-container-lowest rounded-full">
          <AvatarCircle name={user.name} size={size} />
        </div>
      ))}
      {overflow > 0 && (
        <div className="-ml-2 w-8 h-8 rounded-full bg-surface-container flex items-center justify-center ring-2 ring-surface-container-lowest">
          <span className="text-xs font-medium text-on-surface-variant">+{overflow}</span>
        </div>
      )}
    </div>
  );
}
