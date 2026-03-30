import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-button font-heading text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]',
  {
    variants: {
      variant: {
        primary:   'bg-primary text-on-primary hover:bg-primary/90',
        secondary: 'bg-secondary text-on-secondary hover:bg-secondary/90',
        outline:   'border border-outline bg-transparent text-on-surface hover:bg-surface-container',
        ghost:     'bg-transparent text-on-surface hover:bg-surface-container',
        danger:    'bg-error text-on-error hover:bg-error/90',
        surface:   'bg-surface-container-lowest text-on-surface border border-outline-variant/30 shadow-sm hover:bg-surface-container-low',
      },
      size: {
        sm:   'h-8  px-3 text-xs',
        md:   'h-10 px-4 text-sm',
        lg:   'h-12 px-6 text-base',
        icon: 'h-9  w-9 p-0',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />
  )
);
Button.displayName = 'Button';

export { Button, buttonVariants };
