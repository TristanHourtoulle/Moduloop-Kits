'use client';

import { useState } from 'react';
import { Product } from '@/lib/types/project';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Minus, Plus, Package } from 'lucide-react';
import { formatPrice, getProductPricing } from '@/lib/utils/product-helpers';
import { cn } from '@/lib/utils';

interface AddProductDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (productId: string, quantite: number) => void;
}

export function AddProductDialog({
  product,
  open,
  onOpenChange,
  onAdd,
}: AddProductDialogProps) {
  const [quantite, setQuantite] = useState(1);

  if (!product) return null;

  const pricing = getProductPricing(product, 'achat', '1an');
  const totalPrice = (pricing.prixVente || 0) * quantite;

  const handleAdd = () => {
    onAdd(product.id, quantite);
    setQuantite(1); // Reset quantity
    onOpenChange(false);
  };

  const incrementQuantity = () => setQuantite((q) => q + 1);
  const decrementQuantity = () => setQuantite((q) => Math.max(1, q - 1));
  const handleQuantityChange = (value: string) => {
    const num = parseInt(value) || 1;
    setQuantite(Math.max(1, num));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Ajouter un produit au kit</DialogTitle>
          <DialogDescription>
            Définissez la quantité pour ce produit
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Product Preview */}
          <div className="flex gap-4">
            {/* Image */}
            <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-muted/30 to-muted/50">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.nom}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove(
                      'hidden'
                    );
                  }}
                />
              ) : null}
              <div
                className={cn(
                  'absolute inset-0 flex items-center justify-center',
                  product.image && 'hidden'
                )}
              >
                <Package className="h-8 w-8 text-muted-foreground/40" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 space-y-2">
              <h3 className="font-semibold text-lg text-foreground">
                {product.nom}
              </h3>
              <Badge variant="secondary">{product.reference}</Badge>
              {pricing.prixVente && (
                <div className="text-sm text-muted-foreground">
                  Prix unitaire :{' '}
                  <span className="font-semibold text-primary">
                    {formatPrice(pricing.prixVente)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Quantity Input */}
          <div className="space-y-2">
            <Label htmlFor="quantite">Quantité</Label>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={decrementQuantity}
                disabled={quantite <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                id="quantite"
                type="number"
                min="1"
                value={quantite}
                onChange={(e) => handleQuantityChange(e.target.value)}
                className="text-center w-20"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={incrementQuantity}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Total Price */}
          {pricing.prixVente && (
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">
                  Prix total :
                </span>
                <span className="text-2xl font-bold text-primary">
                  {formatPrice(totalPrice)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {quantite} × {formatPrice(pricing.prixVente)}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleAdd}>Ajouter au kit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
