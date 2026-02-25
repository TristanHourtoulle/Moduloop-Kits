'use client'

import { Package } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProductCardImageProps {
  image?: string | null
  name: string
  className?: string
}

export function ProductCardImage({
  image,
  name,
  className,
}: ProductCardImageProps) {
  return (
    <div className={cn('relative overflow-hidden', className)}>
      {image ? (
        <img
          src={image}
          alt={name}
          className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            // Fallback si l'image ne charge pas
            const target = e.target as HTMLImageElement
            target.style.display = 'none'
            const fallback = target.nextElementSibling as HTMLElement
            if (fallback) {
              fallback.style.display = 'flex'
            }
          }}
        />
      ) : null}

      {/* Fallback toujours présent mais caché si image existe */}
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/15 flex items-center justify-center',
          image ? 'hidden' : 'flex',
        )}
        style={{ display: image ? 'none' : 'flex' }}
      >
        <Package className="h-16 w-16 text-primary/40" />
      </div>

      {/* Overlay avec dégradé pour améliorer la lisibilité si besoin */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  )
}
