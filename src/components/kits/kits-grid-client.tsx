'use client'

import { KitCard } from './kit-card'
import { Button } from '@/components/ui/button'
import { Package2, Plus } from 'lucide-react'
import Link from 'next/link'
import { type Kit } from '@/lib/types/project'

interface KitsGridClientProps {
  kits: Kit[]
  showCreateButton?: boolean
  onDelete?: (kitId: string) => Promise<void>
}

export function KitsGridClient({ kits, showCreateButton = true, onDelete }: KitsGridClientProps) {
  return (
    <>
      {/* Kits Grid or Empty State */}
      {kits.length === 0 ? (
        <div className="py-12 text-center">
          <div className="bg-muted/30 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl">
            <Package2 className="text-muted-foreground h-8 w-8" />
          </div>
          <h3 className="text-foreground mb-2 text-lg font-semibold">Aucun kit trouvé</h3>
          <p className="text-muted-foreground mb-6">
            Commencez par créer votre premier kit de produits
          </p>
          {showCreateButton && (
            <Button asChild>
              <Link href="/kits/nouveau">
                <Plus className="mr-2 h-4 w-4" />
                Créer mon premier kit
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {kits.map((kit) => (
            <KitCard key={kit.id} kit={kit} onDelete={onDelete} />
          ))}
        </div>
      )}
    </>
  )
}
