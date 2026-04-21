import type { RSVPStatus } from '../../types';

export interface RSVPButtonsProps {
  selectedStatus?: RSVPStatus;
  onSelect: (status: RSVPStatus) => void;
  className?: string;
  disabled?: boolean;
}
