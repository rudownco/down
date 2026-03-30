import React from 'react';
import type { AvatarCircleProps } from './index';

const AVATAR_COLORS = [
  '#FE6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FEB64F', '#C681F6', '#4FC294', '#FE7FA3',
];

const SIZE_CLASSES = {
  xs: 'w-6  h-6  text-[9px]',
  sm: 'w-8  h-8  text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base',
  xl: 'w-20 h-20 text-xl',
};

function djb2Hash(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return hash >>> 0;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export function AvatarCircle({ user, size = 'md', imageUri, tilt = 0, borderColor, className }: AvatarCircleProps) {
  const bgColor = AVATAR_COLORS[djb2Hash(user.id) % AVATAR_COLORS.length];

  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 select-none ${SIZE_CLASSES[size]} ${className ?? ''}`}
      style={{
        backgroundColor: imageUri ? 'transparent' : bgColor,
        transform: tilt ? `rotate(${tilt}deg)` : undefined,
        border: borderColor ? `3px solid ${borderColor}` : undefined,
      }}
      title={user.name}
    >
      {imageUri
        ? <img src={imageUri} alt={user.name} className="w-full h-full rounded-full object-cover" />
        : getInitials(user.name)
      }
    </div>
  );
}
