'use client';

import { KitCard } from './kit-card';
import { Button } from '@/components/ui/button';
import { Package2, Plus } from 'lucide-react';

interface KitProduct {
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
  };
}

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
    product: KitProduct;
  }>;
}

interface KitsGridClientProps {
  kits: Kit[];
  showCreateButton?: boolean;
}

export function KitsGridClient({
  kits,
  showCreateButton = true,
}: KitsGridClientProps) {
  return (
    <div className='mt-8 space-y-8'>
      {/* Title and Action Section */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div className='space-y-2'>
          <h1 className='text-4xl font-bold text-gray-900'>Kits disponibles</h1>
          <p className='text-gray-600 max-w-2xl'>Gérez vos kits de produits</p>
        </div>
        {showCreateButton && (
          <div className='flex-shrink-0'>
            <Button
              asChild
              className='bg-[#30C1BD] hover:bg-[#30C1BD]/80 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 text-base font-semibold rounded-xl'
            >
              <a href='/kits/nouveau'>
                <Plus className='h-5 w-5 mr-2' />
                Nouveau kit
              </a>
            </Button>
          </div>
        )}
      </div>

      {/* Kits Grid or Empty State */}
      {kits.length === 0 ? (
        <div className='text-center py-20'>
          <div className='relative mx-auto mb-8 w-32 h-32'>
            <div className='absolute inset-0 bg-gradient-to-br from-[#30C1BD]/10 to-blue-50 rounded-full' />
            <div className='absolute inset-4 bg-gradient-to-br from-[#30C1BD]/20 to-blue-100 rounded-full' />
            <div className='absolute inset-8 bg-white rounded-full shadow-sm flex items-center justify-center'>
              <Package2 className='w-12 h-12 text-[#30C1BD]' />
            </div>
          </div>
          <h3 className='text-2xl font-bold text-gray-900 mb-3'>
            Aucun kit créé
          </h3>
          <p className='text-gray-600 mb-8 leading-relaxed'>
            Commencez par créer votre premier kit de produits modulaires
          </p>
          {showCreateButton && (
            <Button
              asChild
              className='bg-[#30C1BD] hover:bg-[#30C1BD]/80 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 text-base font-semibold rounded-xl'
            >
              <a href='/kits/nouveau'>
                <Plus className='h-5 w-5 mr-2' />
                Créer mon premier kit
              </a>
            </Button>
          )}
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'>
          {kits.map((kit) => (
            <KitCard key={kit.id} kit={kit as any} />
          ))}
        </div>
      )}
    </div>
  );
}
