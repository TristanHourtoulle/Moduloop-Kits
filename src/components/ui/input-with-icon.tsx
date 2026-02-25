import * as React from 'react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { LucideIcon } from 'lucide-react'

export interface InputWithIconProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon
  rightIcon?: React.ReactNode
}

const InputWithIcon = React.forwardRef<HTMLInputElement, InputWithIconProps>(
  ({ className, icon: Icon, rightIcon, ...props }, ref) => {
    return (
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
        )}
        <Input
          className={cn(
            Icon && 'pl-10',
            rightIcon && 'pr-10',
            'h-12',
            className,
          )}
          ref={ref}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10">
            {rightIcon}
          </div>
        )}
      </div>
    )
  },
)
InputWithIcon.displayName = 'InputWithIcon'

export { InputWithIcon }
