'use client'

import * as React from 'react'
import { Eye, EyeOff, Lock } from 'lucide-react'
import { InputWithIcon, InputWithIconProps } from './input-with-icon'
import { Button } from './button'

export interface PasswordInputProps extends Omit<InputWithIconProps, 'type' | 'rightIcon'> {
  showStrength?: boolean
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ showStrength = false, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)

    const togglePasswordVisibility = () => {
      setShowPassword((prev) => !prev)
    }

    const getPasswordStrength = (password: string) => {
      let strength = 0
      if (password.length >= 8) strength++
      if (/[A-Z]/.test(password)) strength++
      if (/[0-9]/.test(password)) strength++
      if (/[^A-Za-z0-9]/.test(password)) strength++
      return strength
    }

    const passwordStrength =
      showStrength && props.value ? getPasswordStrength(String(props.value)) : 0
    const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500']
    const strengthLabels = ['Faible', 'Moyen', 'Bon', 'Excellent']

    return (
      <div className="space-y-2">
        <InputWithIcon
          {...props}
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          icon={Lock}
          rightIcon={
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              )}
            </Button>
          }
        />

        {showStrength && props.value && (
          <div className="space-y-2">
            <div className="flex space-x-1">
              {[0, 1, 2, 3].map((level) => (
                <div
                  key={level}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    level < passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-gray-500">
              Force du mot de passe :{' '}
              {passwordStrength > 0 ? strengthLabels[passwordStrength - 1] : 'Trop faible'}
            </p>
          </div>
        )}
      </div>
    )
  },
)
PasswordInput.displayName = 'PasswordInput'

export { PasswordInput }
