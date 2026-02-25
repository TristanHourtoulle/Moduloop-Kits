'use client'

import { useState, useCallback } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Project } from '@/lib/types/project'

interface ProjectPdfDownloadButtonProps {
  project: Project
}

export function ProjectPdfDownloadButton({ project }: ProjectPdfDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleDownload = useCallback(async () => {
    setIsGenerating(true)
    try {
      const { pdf } = await import('@react-pdf/renderer')
      const { ProjectPdfDocument } = await import('./project-pdf-document')

      const blob = await pdf(<ProjectPdfDocument project={project} />).toBlob()

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${project.nom}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('PDF generation failed:', error)
    } finally {
      setIsGenerating(false)
    }
  }, [project])

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDownload}
      disabled={isGenerating}
      title="Telecharger le resume PDF"
    >
      {isGenerating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
    </Button>
  )
}
