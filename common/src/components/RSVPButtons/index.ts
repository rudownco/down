import type { RSVPStatus } from '../../types';

export interface RSVPButtonsProps {
  selectedStatus?: RSVPStatus;
  onSelect: (status: RSVPStatus) => void;
  className?: string;
  disabled?: boolean;
}

// TypeScript fallback — bundler replaces with .native.tsx or .web.tsx at runtime
export { RSVPButtons } from './index.web';
