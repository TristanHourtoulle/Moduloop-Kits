'use client'

import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle } from 'lucide-react'

interface QuantityEditorProps {
  value: number
  onChange: (value: number) => void
  onSave: () => void
  onCancel: () => void
  min?: number
  unit?: string
}

/**
 * Inline quantity editor with save/cancel actions.
 * @param props - Current value, handlers, and display options
 * @returns An inline number input with confirm/cancel buttons
 */
export function QuantityEditor({
  value,
  onChange,
  onSave,
  onCancel,
  min = 1,
  unit = 'kit',
}: QuantityEditorProps) {
  return (
    <div className="flex items-center space-x-2 rounded-lg border bg-white px-3 py-1">
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-16 border-none bg-transparent text-center text-sm focus:outline-none"
        min={String(min)}
        autoFocus
      />
      <span className="text-xs text-gray-500">{value > 1 ? `${unit}s` : unit}</span>
      <Button
        size="sm"
        variant="ghost"
        className="h-6 w-6 p-0 text-green-600 hover:text-green-700"
        onClick={onSave}
      >
        <CheckCircle className="h-3 w-3" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
        onClick={onCancel}
      >
        <XCircle className="h-3 w-3" />
      </Button>
    </div>
  )
}
