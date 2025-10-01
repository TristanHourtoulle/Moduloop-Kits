'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { useDialog } from '@/components/providers/dialog-provider';
import { type PurchaseRentalMode } from '@/lib/schemas/product';
import { getDefaultProductMode } from '@/lib/utils/product-helpers';
import { type Product } from '@/lib/types/project';

import { ProductCardImage } from './product-card/ProductCardImage';
import { ProductCardHeader } from './product-card/ProductCardHeader';
import { ProductCardPricing } from './product-card/ProductCardPricing';
import { ProductCardMeta } from './product-card/ProductCardMeta';
import { ProductCardActions } from './product-card/ProductCardActions';

interface ProductCardProps {
  product: Product;
  onDelete: (productId: string) => Promise<void>;
}

export function ProductCard({ product, onDelete }: ProductCardProps) {
  const router = useRouter();
  const { showConfirm } = useDialog();
  const [selectedMode, setSelectedMode] = useState<PurchaseRentalMode>(
    getDefaultProductMode(product)
  );

  const handleDelete = async () => {
    const confirmed = await showConfirm(
      'Supprimer le produit',
      'Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.',
      'Supprimer',
      'Annuler'
    );

    if (!confirmed) {
      return;
    }

    await onDelete(product.id);
  };

  const handleEdit = () => {
    router.push(`/products/${product.id}/modifier`);
  };

  return (
    <Card className='group relative overflow-hidden hover:shadow-soft hover:border-primary/20 hover:-translate-y-1 transition-all duration-300 bg-card pt-0'>
      <div className='flex flex-col'>
        {/* Large Product Image - Responsive height */}
        <ProductCardImage
          image={product.image}
          name={product.nom}
          className='h-32 sm:h-40 md:h-48 w-full'
        />

        <CardContent className='flex-1 p-6'>
          {/* Header with name, description, reference */}
          <ProductCardHeader
            name={product.nom}
            reference={product.reference}
            className='mb-4'
          />

          {/* Pricing section */}
          <ProductCardPricing
            product={product}
            selectedMode={selectedMode}
            onModeChange={setSelectedMode}
            className='mb-4'
          />

          {/* Metadata section */}
          <ProductCardMeta
            createdAt={product.createdAt}
            updatedAt={product.updatedAt}
            createdBy={product.createdBy}
            surfaceM2={product.surfaceM2}
            className='mb-4'
          />

          {/* Action buttons */}
          <ProductCardActions
            productName={product.nom}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </div>
    </Card>
  );
}
