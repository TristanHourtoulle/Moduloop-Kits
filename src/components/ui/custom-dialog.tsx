'use client'

import { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { X, AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react'

export type DialogType = 'info' | 'success' | 'warning' | 'error' | 'confirm'

interface CustomDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm?: () => void
  title: string
  message: string | ReactNode
  type?: DialogType
  confirmText?: string
  cancelText?: string
  showCancel?: boolean
}

const typeConfig = {
  info: {
    icon: Info,
    iconColor: 'text-[#30C1BD]',
    iconBg: 'bg-[#30C1BD]/10',
    buttonColor: 'bg-[#30C1BD] hover:bg-[#30C1BD]/90',
  },
  success: {
    icon: CheckCircle,
    iconColor: 'text-green-600',
    iconBg: 'bg-green-100',
    buttonColor: 'bg-green-600 hover:bg-green-700',
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-orange-600',
    iconBg: 'bg-orange-100',
    buttonColor: 'bg-orange-600 hover:bg-orange-700',
  },
  error: {
    icon: XCircle,
    iconColor: 'text-red-600',
    iconBg: 'bg-red-100',
    buttonColor: 'bg-red-600 hover:bg-red-700',
  },
  confirm: {
    icon: AlertTriangle,
    iconColor: 'text-[#30C1BD]',
    iconBg: 'bg-[#30C1BD]/10',
    buttonColor: 'bg-[#30C1BD] hover:bg-[#30C1BD]/90',
  },
}

export function CustomDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'info',
  confirmText = 'OK',
  cancelText = 'Annuler',
  showCancel = false,
}: CustomDialogProps) {
  const config = typeConfig[type]
  const IconComponent = config.icon

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm()
    }
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50"
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-xl"
          >
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${config.iconBg}`}
                >
                  <IconComponent className={`h-5 w-5 ${config.iconColor}`} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="mb-6">
              {typeof message === 'string' ? (
                <p className="leading-relaxed text-gray-600">{message}</p>
              ) : (
                message
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3">
              {showCancel && (
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  {cancelText}
                </Button>
              )}
              <Button onClick={handleConfirm} className={`text-white ${config.buttonColor}`}>
                {confirmText}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Hook pour utiliser facilement les dialogues
export function useCustomDialog() {
  const showInfo = (_title: string, _message: string | ReactNode) => {
    return new Promise<void>((resolve) => {
      // Cette fonction sera remplacée par le contexte
      resolve()
    })
  }

  const showSuccess = (_title: string, _message: string | ReactNode) => {
    return new Promise<void>((resolve) => {
      // Cette fonction sera remplacée par le contexte
      resolve()
    })
  }

  const showWarning = (_title: string, _message: string | ReactNode) => {
    return new Promise<void>((resolve) => {
      // Cette fonction sera remplacée par le contexte
      resolve()
    })
  }

  const showError = (_title: string, _message: string | ReactNode) => {
    return new Promise<void>((resolve) => {
      // Cette fonction sera remplacée par le contexte
      resolve()
    })
  }

  const showConfirm = (_title: string, _message: string | ReactNode) => {
    return new Promise<boolean>((resolve) => {
      // Cette fonction sera remplacée par le contexte
      resolve(false)
    })
  }

  return {
    showInfo,
    showSuccess,
    showWarning,
    showError,
    showConfirm,
  }
}
