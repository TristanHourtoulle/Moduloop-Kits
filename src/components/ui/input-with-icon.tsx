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
          <Icon className="absolute top-1/2 left-3 z-10 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
        )}
        <Input
          className={cn(Icon && 'pl-10', rightIcon && 'pr-10', 'h-12', className)}
          ref={ref}
          {...props}
        />
        {rightIcon && (
          <div className="absolute top-1/2 right-3 z-10 -translate-y-1/2 transform">
            {rightIcon}
          </div>
        )}
      </div>
    )
  },
)
InputWithIcon.displayName = 'InputWithIcon'

export { InputWithIcon }
