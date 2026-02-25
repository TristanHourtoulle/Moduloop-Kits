import * as React from 'react'

import { cn } from '@/lib/utils'

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        data-slot="input"
        className={cn(
          'file:text-foreground placeholder:text-muted-foreground/70 selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input/60 flex h-10 w-full min-w-0 rounded-lg border bg-background/80 px-4 py-2 text-base transition-all duration-300 outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm hover:border-input hover:bg-background',
          'focus-visible:border-primary/40 focus-visible:ring-primary/20 focus-visible:ring-4 focus-visible:shadow-soft',
          'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
          className,
        )}
        {...props}
      />
    )
  },
)
Input.displayName = 'Input'

export { Input }
