import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, icon, id, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-xs font-medium text-on-surface-variant uppercase tracking-wide">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline">
            {icon}
          </span>
        )}
        <input
          id={id}
          ref={ref}
          className={cn(
            'w-full rounded-input border border-outline-variant/40 bg-surface-container-low px-4 py-2.5 text-sm text-on-surface placeholder:text-outline transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary',
            icon && 'pl-10',
            className
          )}
          {...props}
        />
      </div>
    </div>
  )
);
Input.displayName = 'Input';

export { Input };
