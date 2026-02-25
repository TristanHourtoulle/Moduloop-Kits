'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calculator, Edit3, Save } from 'lucide-react'
import { useDialog } from '@/components/providers/dialog-provider'
import { useRouter } from 'next/navigation'

interface ProjectSurfaceManagerProps {
  projectId: string
  currentSurface: number
  manualSurface?: number | null
  isOverride: boolean
  onUpdate?: () => void
}

export function ProjectSurfaceManager({
  projectId,
  currentSurface,
  manualSurface,
  isOverride,
  onUpdate,
}: ProjectSurfaceManagerProps) {
  const [isManual, setIsManual] = useState(isOverride)
  const [manualValue, setManualValue] = useState(
    manualSurface !== null && manualSurface !== undefined ? manualSurface : currentSurface,
  )
  const [isLoading, setIsLoading] = useState(false)
  const { showError, showSuccess } = useDialog()
  const router = useRouter()

  const handleSave = async () => {
    // Validate input
    if (isManual && (manualValue === null || manualValue === undefined || manualValue < 0)) {
      await showError('Erreur de validation', 'La surface doit être un nombre positif')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          surfaceOverride: isManual,
          surfaceManual: isManual ? manualValue : null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update')
      }

      await showSuccess('Surface mise à jour', 'La surface du projet a été modifiée avec succès')
      router.refresh()
      onUpdate?.()
    } catch (error) {
      await showError(
        'Erreur',
        error instanceof Error ? error.message : 'Impossible de mettre à jour la surface',
      )
    } finally {
      setIsLoading(false)
    }
  }

  const hasChanges =
    isManual !== isOverride ||
    (isManual &&
      manualValue !==
        (manualSurface !== null && manualSurface !== undefined ? manualSurface : currentSurface))

  return (
    <div className="bg-card space-y-4 rounded-lg border p-6 shadow-sm">
      <div>
        <Label className="text-foreground mb-3 block text-sm font-semibold">
          Mode de calcul de la surface
        </Label>
        <p className="text-muted-foreground mb-4 text-xs">
          {isManual ? 'Valeur manuelle définie' : 'Calculée automatiquement depuis les kits'}
        </p>
        <div className="flex gap-2">
          <Button
            variant={!isManual ? 'default' : 'outline'}
            size="sm"
            onClick={() => setIsManual(false)}
            className="flex-1"
          >
            <Calculator className="mr-2 h-4 w-4" />
            Automatique
          </Button>
          <Button
            variant={isManual ? 'default' : 'outline'}
            size="sm"
            onClick={() => setIsManual(true)}
            className="flex-1"
          >
            <Edit3 className="mr-2 h-4 w-4" />
            Manuel
          </Button>
        </div>
      </div>

      <div className="space-y-3 pt-2">
        {isManual ? (
          <div className="space-y-2">
            <Label htmlFor="manual-surface" className="text-sm font-medium">
              Surface manuelle (m²)
            </Label>
            <Input
              id="manual-surface"
              type="number"
              min="0"
              step="0.1"
              value={manualValue}
              onChange={(e) => setManualValue(parseFloat(e.target.value))}
              className="max-w-xs"
            />
            <p className="text-muted-foreground text-xs">
              Surface calculée automatiquement :{' '}
              <span className="text-foreground font-medium">{currentSurface.toFixed(2)} m²</span>
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm">
              Surface calculée automatiquement :{' '}
              <span className="text-foreground text-lg font-semibold">
                {currentSurface.toFixed(2)} m²
              </span>
            </p>
          </div>
        )}

        {hasChanges && (
          <Button onClick={handleSave} disabled={isLoading} className="mt-4 w-full">
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </Button>
        )}
      </div>
    </div>
  )
}
