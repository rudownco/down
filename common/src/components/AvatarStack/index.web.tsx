import React from 'react';
import { AvatarCircle } from '../AvatarCircle';
import type { AvatarStackProps } from './index';

export function AvatarStack({ users, maxVisible = 4, size = 'sm', borderColor = '#FFFFFF', showCount = true, className }: AvatarStackProps) {
  const visible   = users.slice(0, maxVisible);
  const remaining = users.length - maxVisible;

  return (
    <div className={`flex items-center ${className ?? ''}`}>
      {visible.map((user, i) => (
        <div key={user.id} className="ring-2 ring-white rounded-full" style={{ marginLeft: i === 0 ? 0 : '-8px' }}>
          <AvatarCircle user={user} size={size} />
        </div>
      ))}
      {showCount && remaining > 0 && (
        <div
          className="flex items-center justify-center rounded-full bg-surface-container text-xs font-bold text-on-surface-variant ring-2 ring-white"
          style={{
            width: size === 'xs' ? 24 : size === 'sm' ? 32 : 40,
            height: size === 'xs' ? 24 : size === 'sm' ? 32 : 40,
            marginLeft: '-8px',
          }}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}
