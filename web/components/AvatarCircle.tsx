import { getInitials, getAvatarColor } from '@down/common';
import { cn } from '@/lib/utils';

interface AvatarCircleProps {
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  xs: 'w-6  h-6  text-[9px]',
  sm: 'w-8  h-8  text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base',
  xl: 'w-20 h-20 text-xl',
};

export function AvatarCircle({ name, size = 'md', className }: AvatarCircleProps) {
  const color    = getAvatarColor(name);
  const initials = getInitials(name);

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-heading font-bold text-white flex-shrink-0',
        sizeClasses[size],
        className
      )}
      style={{ backgroundColor: color }}
      title={name}
    >
      {initials}
    </div>
  );
}
