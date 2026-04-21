export interface ChipProps {
  label: string;
  emoji?: string;
  selected?: boolean;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'neutral';
  className?: string;
}
