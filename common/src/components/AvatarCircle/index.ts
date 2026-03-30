import type { User } from '../../types';

export interface AvatarCircleProps {
  user: User;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  imageUri?: string;
  tilt?: number;
  borderColor?: string;
  className?: string;
}

// TypeScript fallback — bundler replaces with .native.tsx or .web.tsx at runtime
export { AvatarCircle } from './index.web';
