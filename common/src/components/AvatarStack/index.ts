import type { User } from '../../types';

export interface AvatarStackProps {
  users: User[];
  maxVisible?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  borderColor?: string;
  showCount?: boolean;
  className?: string;
}

// TypeScript fallback — bundler replaces with .native.tsx or .web.tsx at runtime
export { AvatarStack } from './index.web';
