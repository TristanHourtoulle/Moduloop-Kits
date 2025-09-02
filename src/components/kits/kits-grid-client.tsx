'use client';

import { KitCard } from './kit-card';
import { Button } from '@/components/ui/button';
import { Package2, Plus } from 'lucide-react';
import Link from 'next/link';

interface Kit {
  id: string;
  nom: string;
  style: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    name?: string | null;
    email: string;
  };
  updatedBy: {
    id: string;
    name?: string | null;
    email: string;
  };
  kitProducts: Array<{
    id: string;
    quantite: number;
    product: {
      id: string;
      nom: string;
      reference: string;
      prixVente1An: number;
      prixVente2Ans?: number;
      prixVente3Ans?: number;
      rechauffementClimatique: number;
      epuisementRessources: number;
      acidification: number;
      eutrophisation: number;
      surfaceM2: number;
    };
  }>;
}

interface KitsGridClientProps {
  kits: Kit[];
  showCreateButton?: boolean;
  onDelete?: (kitId: string) => Promise<void>;
}

export function KitsGridClient({
  kits,
  showCreateButton = true,
  onDelete,
}: KitsGridClientProps) {
  return (
    <>
      {/* Kits Grid or Empty State */}
      {kits.length === 0 ? (
        <div className='text-center py-12'>
          <div className='w-16 h-16 mx-auto mb-4 bg-muted/30 rounded-2xl flex items-center justify-center'>
            <Package2 className='h-8 w-8 text-muted-foreground' />
          </div>
          <h3 className='text-lg font-semibold text-foreground mb-2'>
            Aucun kit trouvé
          </h3>
          <p className='text-muted-foreground mb-6'>
            Commencez par créer votre premier kit de produits
          </p>
          {showCreateButton && (
            <Button asChild>
              <Link href='/kits/nouveau'>
                <Plus className='h-4 w-4 mr-2' />
                Créer mon premier kit
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'>
          {kits.map((kit) => (
            <KitCard key={kit.id} kit={kit as any} onDelete={onDelete} />
          ))}
        </div>
      )}
    </>
  );
}
