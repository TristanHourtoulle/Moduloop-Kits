'use client';

import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Package2,
  Calendar,
  User,
  Calculator,
  Leaf,
  Edit,
  Trash2,
  ShoppingCart,
  Home,
  Square,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { RoleGuard } from '@/components/auth/role-guard';
import { UserRole } from '@/lib/types/user';
import { type PurchaseRentalMode } from '@/lib/schemas/product';
import {
  getProductPricing,
  getProductEnvironmentalImpact,
  formatPrice,
} from '@/lib/utils/product-helpers';

// Utiliser le type Kit complet du system
import { type Kit } from '@/lib/types/project';

interface KitCardProps {
  kit: Kit;
  onDelete?: (kitId: string) => Promise<void>;
}

export function KitCard({ kit, onDelete }: KitCardProps) {
  const router = useRouter();
  const [selectedMode, setSelectedMode] = useState<PurchaseRentalMode>('achat');

  // Calculate total price based on selected mode and period
  const totalPriceAchat = useMemo(() => {
    let total = 0;
    kit.kitProducts?.forEach((kitProduct) => {
      const { product, quantite } = kitProduct;
      if (product) {
        const pricing = getProductPricing(product, 'achat', '1an');
        total += (pricing.prixVente || 0) * quantite;
      }
    });
    return total;
  }, [kit.kitProducts]);

  const totalPriceLocation1An = useMemo(() => {
    let total = 0;
    kit.kitProducts?.forEach((kitProduct) => {
      const { product, quantite } = kitProduct;
      if (product) {
        const pricing = getProductPricing(product, 'location', '1an');
        total += (pricing.prixVente || 0) * quantite;
      }
    });
    return total;
  }, [kit.kitProducts]);

  const totalPriceLocation2Ans = useMemo(() => {
    let total = 0;
    kit.kitProducts?.forEach((kitProduct) => {
      const { product, quantite } = kitProduct;
      if (product) {
        const pricing = getProductPricing(product, 'location', '2ans');
        total += (pricing.prixVente || 0) * quantite;
      }
    });
    return total;
  }, [kit.kitProducts]);

  const totalPriceLocation3Ans = useMemo(() => {
    let total = 0;
    kit.kitProducts?.forEach((kitProduct) => {
      const { product, quantite } = kitProduct;
      if (product) {
        const pricing = getProductPricing(product, 'location', '3ans');
        total += (pricing.prixVente || 0) * quantite;
      }
    });
    return total;
  }, [kit.kitProducts]);

  // Calculate CO2 impact based on selected mode
  // Note: DB values for 'location' mode already represent savings/difference
  const totalCO2 = useMemo(() => {
    let total = 0;

    kit.kitProducts?.forEach((kitProduct) => {
      const { product, quantite } = kitProduct;
      if (product) {
        const environmentalImpact = getProductEnvironmentalImpact(
          product,
          selectedMode
        );
        total += (environmentalImpact.rechauffementClimatique || 0) * quantite;
      }
    });

    return total;
  }, [selectedMode, kit.kitProducts]);

  // Calculate total surface area from products
  const totalProductsSurface = useMemo(() => {
    let total = 0;
    kit.kitProducts?.forEach((kitProduct) => {
      const { product, quantite } = kitProduct;
      if (product && product.surfaceM2) {
        total += product.surfaceM2 * quantite;
      }
    });
    return total;
  }, [kit.kitProducts]);

  const handleDelete = async () => {
    if (!onDelete) {
      return;
    }

    try {
      await onDelete(kit.id);
    } catch (err) {
      console.error('Erreur:', err);
    }
  };

  return (
    <Card
      className='group relative overflow-hidden'
      style={{ pointerEvents: 'auto' }}
    >
      <CardHeader className='pb-4'>
        <div className='flex items-start justify-between'>
          <div className='space-y-2'>
            <div className='flex items-center gap-3'>
              <div className='w-12 h-12 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center'>
                <Package2 className='h-6 w-6 text-primary' />
              </div>
              <div>
                <CardTitle className='text-xl font-semibold text-foreground'>
                  {kit.nom}
                </CardTitle>
                <Badge
                  variant='secondary'
                  className='mt-1 bg-primary/10 text-primary border-primary/20'
                >
                  {kit.style}
                </Badge>
              </div>
            </div>
            {kit.description && (
              <CardDescription className='text-sm text-muted-foreground mt-3 line-clamp-2 max-w-sm'>
                {kit.description}
              </CardDescription>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className='space-y-6'>
        {/* Section produits */}
        <div className='space-y-3'>
          <div className='flex items-center gap-2'>
            <div className='w-1.5 h-1.5 rounded-full bg-primary'></div>
            <span className='text-sm font-medium text-foreground'>
              {kit.kitProducts?.length || 0} produit
              {(kit.kitProducts?.length || 0) > 1 ? 's' : ''}
              {' unique'}
              {(kit.kitProducts?.length || 0) > 1 ? 's' : ''}
            </span>
          </div>
          {totalProductsSurface > 0 && (
            <div className='flex items-center gap-2'>
              <Square className='h-4 w-4 text-primary' />
              <span className='text-sm text-muted-foreground'>
                Surface totale:{' '}
                <span className='font-medium text-foreground'>
                  {totalProductsSurface.toFixed(2)} m²
                </span>
              </span>
            </div>
          )}
          <div className='space-y-2 max-h-24 overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent'>
            {kit.kitProducts
              ?.map((kitProduct) => {
                const { product, quantite } = kitProduct;
                if (!product) return null;

                return (
                  <div
                    key={kitProduct.id}
                    className='flex justify-between items-center p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors'
                  >
                    <span className='text-sm text-foreground truncate pr-2'>
                      {product.nom}
                    </span>
                    <Badge variant='outline' className='text-xs bg-background'>
                      ×{quantite}
                    </Badge>
                  </div>
                );
              })
              ?.filter(Boolean)}
          </div>
        </div>

        {/* Sélecteur de mode */}
        <div className='flex gap-1 mb-4'>
          <Button
            variant={selectedMode === 'achat' ? 'default' : 'outline'}
            size='sm'
            onClick={() => setSelectedMode('achat')}
            className={`h-7 px-2 text-xs flex-1 ${
              selectedMode === 'achat'
                ? 'bg-[#30C1BD] hover:bg-[#30C1BD]/90'
                : ''
            }`}
          >
            <ShoppingCart className='w-3 h-3 mr-1' />
            Achat
          </Button>
          <Button
            variant={selectedMode === 'location' ? 'default' : 'outline'}
            size='sm'
            onClick={() => setSelectedMode('location')}
            className={`h-7 px-2 text-xs flex-1 ${
              selectedMode === 'location'
                ? 'bg-[#30C1BD] hover:bg-[#30C1BD]/90'
                : ''
            }`}
          >
            <Home className='w-3 h-3 mr-1' />
            Location
          </Button>
        </div>

        {/* Section métriques */}
        {selectedMode === 'achat' ? (
          <div className='bg-white/60 rounded-lg p-6 border border-primary/10'>
            <div className='flex flex-col items-center justify-center gap-2'>
              <div className='flex items-center gap-2'>
                <Calculator className='h-4 w-4 text-primary' />
                <span className='text-sm text-muted-foreground font-medium'>
                  Prix d'achat total
                </span>
              </div>
              <p className='text-3xl font-bold text-primary'>
                {formatPrice(totalPriceAchat)}
              </p>
            </div>
          </div>
        ) : (
          <div className='space-y-4'>
            <div className='flex items-center gap-2'>
              <Calculator className='h-4 w-4 text-primary' />
              <span className='text-sm font-medium text-muted-foreground'>
                Prix location
              </span>
            </div>
            <div className='grid grid-cols-3 gap-2'>
              <div className='bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-3 border border-primary/20'>
                <div className='text-xs text-primary/70 font-medium mb-1'>
                  1 an
                </div>
                <div className='text-sm font-bold text-primary'>
                  {formatPrice(totalPriceLocation1An)}
                </div>
              </div>
              <div className='bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-3 border border-primary/20'>
                <div className='text-xs text-primary/70 font-medium mb-1'>
                  2 ans
                </div>
                <div className='text-sm font-bold text-primary'>
                  {formatPrice(totalPriceLocation2Ans)}
                </div>
              </div>
              <div className='bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-3 border border-primary/20'>
                <div className='text-xs text-primary/70 font-medium mb-1'>
                  3 ans
                </div>
                <div className='text-sm font-bold text-primary'>
                  {formatPrice(totalPriceLocation3Ans)}
                </div>
              </div>
            </div>
            <div className='flex items-center gap-2 pt-2'>
              <Leaf className='h-4 w-4 text-emerald-600' />
              <span className='text-sm text-muted-foreground'>
                CO₂ économisé
              </span>
              <span className='text-xl font-bold text-emerald-600 ml-auto'>
                {totalCO2.toFixed(1)} kg
              </span>
            </div>
          </div>
        )}

        {/* Section métadonnées */}
        <div className='pt-4 border-t border-border/50 space-y-2'>
          <div className='flex items-center justify-between text-xs text-muted-foreground'>
            <div className='flex items-center gap-1'>
              <User className='h-3 w-3' />
              <span className='truncate'>
                {kit.createdBy?.name || kit.createdBy?.email || 'N/A'}
              </span>
            </div>
            <div className='flex items-center gap-1'>
              <Calendar className='h-3 w-3' />
              <span>{new Date(kit.createdAt).toLocaleDateString('fr-FR')}</span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className='pt-4 pb-4'>
        <div
          className='flex gap-3 w-full pointer-events-auto'
          style={{ pointerEvents: 'auto' }}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <RoleGuard requiredRole={UserRole.DEV}>
            <button
              type='button'
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Modifier clicked for kit:', kit.id);
                // Add timestamp to URL to bypass Vercel cache
                router.push(`/kits/${kit.id}/modifier?t=${Date.now()}`);
              }}
              className='flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-primary/10 hover:text-primary hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 cursor-pointer relative z-10'
              style={{ pointerEvents: 'auto', cursor: 'pointer' }}
              title='Modifier le kit'
            >
              <Edit className='h-4 w-4 mr-2' />
              Modifier
            </button>
          </RoleGuard>
          <RoleGuard requiredRole={UserRole.DEV}>
            {onDelete && (
              <DeleteConfirmDialog
                title='Supprimer le kit ?'
                itemName={kit.nom}
                description='Tous les produits associés à ce kit seront également supprimés.'
                onConfirm={handleDelete}
                triggerVariant='outline'
                triggerSize='default'
                showIcon={false}
              >
                <button
                  type='button'
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className='flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-red-300 rounded-md hover:bg-red-50 hover:text-red-600 hover:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200 transition-all duration-200 cursor-pointer relative z-10'
                  style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                  title='Supprimer le kit'
                >
                  <Trash2 className='h-4 w-4 mr-2' />
                  Supprimer
                </button>
              </DeleteConfirmDialog>
            )}
          </RoleGuard>
        </div>
      </CardFooter>
    </Card>
  );
}
