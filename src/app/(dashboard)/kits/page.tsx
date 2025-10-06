'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
// Client component - no need for Metadata
import { RoleGuard } from '@/components/auth/role-guard';
import { UserRole } from '@/lib/types/user';
import { KitsGridClient } from '@/components/kits/kits-grid-client';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Package2, Plus, AlertTriangle } from 'lucide-react';
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

export default function KitsPage() {
  const searchParams = useSearchParams();
  const [kits, setKits] = useState<Kit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchKits = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const response = await fetch('/api/kits', {
        cache: "no-store", // Éviter le cache du navigateur
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des kits');
      }

      const data = await response.json();
      setKits(data);
    } catch (err) {
      console.error('Erreur lors du chargement des kits:', err);
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur inattendue s'est produite"
      );
      setKits([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refetch when returning from edit page (detected by 'updated' param)
  useEffect(() => {
    const updatedParam = searchParams.get('updated');
    if (updatedParam) {
      console.log('[KitsPage] Detected update, refetching kits...');
      fetchKits();
    }
  }, [searchParams, fetchKits]);

  useEffect(() => {
    fetchKits();

    // Refetch when page regains focus (user returns from edit page)
    const handleFocus = () => {
      console.log('[KitsPage] Page regained focus, refetching kits...');
      fetchKits();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchKits]);

  const handleDelete = useCallback(
    async (kitId: string) => {
      try {
        const response = await fetch(`/api/kits/${kitId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Erreur lors de la suppression du kit');
        }

        // Remove kit from local state without refetch
        const updatedKits = kits.filter(k => k.id !== kitId);
        setKits(updatedKits);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Erreur lors de la suppression'
        );
      }
    },
    [kits]
  );

  return (
    <RoleGuard requiredRole={UserRole.DEV}>
      <div className='min-h-screen bg-background w-full'>
        <div className='max-w-7xl mx-auto px-6 py-8 space-y-8'>
          {/* Header épuré */}
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <div className='w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20'>
                <Package2 className='h-6 w-6 text-primary' />
              </div>
              <div>
                <h1 className='text-3xl font-bold text-foreground'>
                  Kits
                </h1>
                <p className='text-muted-foreground'>
                  Gérez votre collection de kits de produits
                </p>
              </div>
            </div>

            <Button asChild>
              <Link href='/kits/nouveau'>
                <Plus className='h-4 w-4 mr-2' />
                Nouveau kit
              </Link>
            </Button>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert className='border-red-200 bg-red-50'>
              <AlertTriangle className='h-4 w-4 text-red-600' />
              <AlertDescription className='text-red-800'>
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Loading or Content */}
          {loading ? (
            <KitsGridSkeleton />
          ) : (
            <KitsGridClient 
              kits={kits} 
              showCreateButton={false} 
              onDelete={handleDelete}
            />
          )}
        </div>
      </div>
    </RoleGuard>
  );
}

function KitsGridSkeleton() {
  return (
    <div className='space-y-6'>
      {/* Header skeleton */}
      <div className='flex justify-between items-center'>
        <div className='space-y-2'>
          <div className='h-8 w-48 bg-gray-200 rounded animate-pulse'></div>
          <div className='h-4 w-64 bg-gray-200 rounded animate-pulse'></div>
        </div>
        <div className='h-10 w-32 bg-gray-200 rounded animate-pulse'></div>
      </div>

      {/* Grid skeleton */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className='animate-pulse'>
            <div className='bg-white rounded-lg shadow-sm border p-6 space-y-4'>
              <div className='flex justify-between items-start'>
                <div className='space-y-2 flex-1'>
                  <div className='h-6 w-3/4 bg-gray-200 rounded'></div>
                  <div className='h-4 w-1/2 bg-gray-200 rounded'></div>
                </div>
                <div className='h-6 w-16 bg-gray-200 rounded'></div>
              </div>

              <div className='space-y-2'>
                <div className='h-4 w-full bg-gray-200 rounded'></div>
                <div className='h-4 w-2/3 bg-gray-200 rounded'></div>
              </div>

              <div className='space-y-2'>
                <div className='h-3 w-1/4 bg-gray-200 rounded'></div>
                <div className='h-3 w-1/3 bg-gray-200 rounded'></div>
              </div>

              <div className='flex justify-between items-center pt-4'>
                <div className='h-8 w-20 bg-gray-200 rounded'></div>
                <div className='h-8 w-20 bg-gray-200 rounded'></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
