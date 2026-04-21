import type { User } from '../../types';

export interface AvatarCircleProps {
  user: User;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  imageUri?: string;
  tilt?: number;
  borderColor?: string;
  className?: string;
}
