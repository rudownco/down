import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-chip px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        voting:    'bg-[#FFEFC7] text-[#D17D04]',
        confirmed: 'bg-[#D8F8E7] text-[#1AA04F]',
        pending:   'bg-[#EEEFF5] text-[#7D859E]',
        default:   'bg-surface-container text-on-surface-variant',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
