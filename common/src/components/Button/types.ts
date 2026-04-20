export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  iconRight?: React.ReactNode;
  className?: string;
}
