'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { CustomDialog, DialogType } from '@/components/ui/custom-dialog'

interface DialogState {
  isOpen: boolean
  title: string
  message: string | ReactNode
  type: DialogType
  onConfirm?: () => void
  onCancel?: () => void
  confirmText?: string
  cancelText?: string
  showCancel?: boolean
}

interface DialogContextType {
  showInfo: (title: string, message: string | ReactNode) => Promise<void>
  showSuccess: (title: string, message: string | ReactNode) => Promise<void>
  showWarning: (title: string, message: string | ReactNode) => Promise<void>
  showError: (title: string, message: string | ReactNode) => Promise<void>
  showConfirm: (
    title: string,
    message: string | ReactNode,
    confirmText?: string,
    cancelText?: string,
  ) => Promise<boolean>
}

const DialogContext = createContext<DialogContextType | undefined>(undefined)

export function DialogProvider({ children }: { children: ReactNode }) {
  const [dialog, setDialog] = useState<DialogState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
  })

  const closeDialog = () => {
    setDialog((prev) => ({ ...prev, isOpen: false }))
  }

  const showDialog = (
    type: DialogType,
    title: string,
    message: string | ReactNode,
    options?: {
      confirmText?: string
      cancelText?: string
      showCancel?: boolean
    },
  ) => {
    return new Promise<boolean>((resolve) => {
      setDialog({
        isOpen: true,
        title,
        message,
        type,
        confirmText: options?.confirmText,
        cancelText: options?.cancelText,
        showCancel: options?.showCancel,
        onConfirm: () => {
          resolve(true)
          closeDialog()
        },
      })

      // Auto-fermeture pour les dialogues sans confirmation
      if (!options?.showCancel && type !== 'confirm') {
        setTimeout(() => {
          resolve(true)
          closeDialog()
        }, 100)
      }
    })
  }

  const showInfo = async (
    title: string,
    message: string | ReactNode,
  ): Promise<void> => {
    await showDialog('info', title, message)
  }

  const showSuccess = async (
    title: string,
    message: string | ReactNode,
  ): Promise<void> => {
    await showDialog('success', title, message)
  }

  const showWarning = async (
    title: string,
    message: string | ReactNode,
  ): Promise<void> => {
    await showDialog('warning', title, message)
  }

  const showError = async (
    title: string,
    message: string | ReactNode,
  ): Promise<void> => {
    await showDialog('error', title, message)
  }

  const showConfirm = (
    title: string,
    message: string | ReactNode,
    confirmText = 'Confirmer',
    cancelText = 'Annuler',
  ) => {
    return new Promise<boolean>((resolve) => {
      setDialog({
        isOpen: true,
        title,
        message,
        type: 'confirm',
        confirmText,
        cancelText,
        showCancel: true,
        onConfirm: () => {
          resolve(true)
          closeDialog()
        },
        onCancel: () => {
          resolve(false)
          closeDialog()
        },
      })
    })
  }

  const contextValue: DialogContextType = {
    showInfo,
    showSuccess,
    showWarning,
    showError,
    showConfirm,
  }

  return (
    <DialogContext.Provider value={contextValue}>
      {children}
      <CustomDialog
        isOpen={dialog.isOpen}
        onClose={() => {
          if (dialog.onCancel) {
            dialog.onCancel()
          } else {
            closeDialog()
          }
        }}
        onConfirm={dialog.onConfirm}
        title={dialog.title}
        message={dialog.message}
        type={dialog.type}
        confirmText={dialog.confirmText}
        cancelText={dialog.cancelText}
        showCancel={dialog.showCancel}
      />
    </DialogContext.Provider>
  )
}

export function useDialog() {
  const context = useContext(DialogContext)
  if (context === undefined) {
    throw new Error('useDialog must be used within a DialogProvider')
  }
  return context
}
