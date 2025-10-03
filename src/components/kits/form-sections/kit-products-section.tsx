'use client';

import { useState, useEffect } from 'react';
import { Control, useFieldArray, FieldErrors, useWatch } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Package, Trash2, Calculator, Plus, Minus } from 'lucide-react';
import { KitFormData } from '@/lib/schemas/kit';
import { ProductSelectionGrid } from '../product-selection/ProductSelectionGrid';
import { Product } from '@/lib/types/project';
import { getProductPricing, getProductEnvironmentalImpact } from '@/lib/utils/product-helpers';

interface KitProductsSectionProps {
  control: Control<KitFormData>;
  errors: FieldErrors<KitFormData>;
  onError: (error: string) => void;
}

export function KitProductsSection({
  control,
  errors,
  onError,
}: KitProductsSectionProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [showProductSelection, setShowProductSelection] = useState(false);

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'products',
  });

  // Watch product values for real-time calculations
  const watchedProducts = useWatch({
    control,
    name: 'products',
  });

  // Load products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products', {
          next: {
            revalidate: 300,
            tags: ['products'],
          },
        });
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des produits');
        }
        const data = await response.json();
        const productsArray = data.products || data;
        setProducts(productsArray);
      } catch (error) {
        console.error('Erreur:', error);
        onError('Impossible de charger la liste des produits');
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [onError]);

  const handleQuantityChange = (productId: string, quantity: number) => {
    // Find existing product in fields
    const existingIndex = fields.findIndex((field) => field.productId === productId);

    if (quantity === 0) {
      // Remove product if quantity is 0
      if (existingIndex >= 0) {
        remove(existingIndex);
      }
    } else {
      // Update or add product
      if (existingIndex >= 0) {
        update(existingIndex, { productId, quantite: quantity });
      } else {
        append({ productId, quantite: quantity });
      }
    }
  };

  // Build product quantities map for ProductSelectionGrid
  const productQuantities: Record<string, number> = {};
  fields.forEach((field) => {
    productQuantities[field.productId] = field.quantite;
  });

  const getSelectedProduct = (productId: string) => {
    return products.find((p) => p.id === productId);
  };

  const updateQuantity = (index: number, delta: number) => {
    const field = fields[index];
    const newQuantity = Math.max(1, (field.quantite || 1) + delta);
    update(index, { ...field, quantite: newQuantity });
  };

  const calculateTotalPricing = () => {
    // Calculs pour le mode ACHAT
    let totalAchat1An = 0;
    let totalAchat2Ans = 0;
    let totalAchat3Ans = 0;

    // Calculs pour le mode LOCATION
    let totalLocation1An = 0;
    let totalLocation2Ans = 0;
    let totalLocation3Ans = 0;

    // Impact environnemental (utilise mode ACHAT par défaut pour l'affichage)
    let totalCO2 = 0;
    let totalRessources = 0;
    let totalAcidification = 0;
    let totalEutrophisation = 0;

    const productsToCalculate = Array.isArray(watchedProducts)
      ? watchedProducts
      : [];

    productsToCalculate.forEach((productData) => {
      if (productData && productData.productId && productData.quantite) {
        const product = getSelectedProduct(productData.productId);
        if (product) {
          const quantite = Number(productData.quantite) || 0;

          // Utiliser les champs mode-specific avec getProductPricing
          const pricingAchat1An = getProductPricing(product, 'achat', '1an');
          const pricingAchat2Ans = getProductPricing(product, 'achat', '2ans');
          const pricingAchat3Ans = getProductPricing(product, 'achat', '3ans');

          const pricingLocation1An = getProductPricing(product, 'location', '1an');
          const pricingLocation2Ans = getProductPricing(product, 'location', '2ans');
          const pricingLocation3Ans = getProductPricing(product, 'location', '3ans');

          totalAchat1An += (pricingAchat1An.prixVente || 0) * quantite;
          totalAchat2Ans += (pricingAchat2Ans.prixVente || 0) * quantite;
          totalAchat3Ans += (pricingAchat3Ans.prixVente || 0) * quantite;

          totalLocation1An += (pricingLocation1An.prixVente || 0) * quantite;
          totalLocation2Ans += (pricingLocation2Ans.prixVente || 0) * quantite;
          totalLocation3Ans += (pricingLocation3Ans.prixVente || 0) * quantite;

          // Impact environnemental (utilise mode achat)
          const environmentalImpact = getProductEnvironmentalImpact(product, 'achat');
          totalCO2 += (environmentalImpact.rechauffementClimatique || 0) * quantite;
          totalRessources += (environmentalImpact.epuisementRessources || 0) * quantite;
          totalAcidification += (environmentalImpact.acidification || 0) * quantite;
          totalEutrophisation += (environmentalImpact.eutrophisation || 0) * quantite;
        }
      }
    });

    return {
      // Pour compatibilité, on garde total1An, total2Ans, total3Ans qui pointent vers ACHAT
      total1An: totalAchat1An,
      total2Ans: totalAchat2Ans,
      total3Ans: totalAchat3Ans,
      // Nouveaux champs mode-specific
      totalAchat1An,
      totalAchat2Ans,
      totalAchat3Ans,
      totalLocation1An,
      totalLocation2Ans,
      totalLocation3Ans,
      // Impact environnemental
      totalCO2,
      totalRessources,
      totalAcidification,
      totalEutrophisation,
    };
  };

  const totals = calculateTotalPricing();

  return (
    <AccordionItem value="products" className="border rounded-lg">
      <AccordionTrigger className="px-6 py-4 hover:no-underline">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold">Produits du kit</h3>
            <p className="text-sm text-muted-foreground">
              Sélectionnez les produits et leurs quantités
            </p>
          </div>
          {fields.length > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {fields.length} produit{fields.length > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6 pb-6">
        <div className="space-y-6">
          {/* Selected Products List */}
          {fields.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground">
                Produits sélectionnés
              </h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {fields.map((field, index) => {
                  const selectedProduct = getSelectedProduct(field.productId);
                  if (!selectedProduct) return null;

                  return (
                    <Card key={field.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex gap-3">
                          {/* Product Image */}
                          <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-gradient-to-br from-muted/30 to-muted/50">
                            {selectedProduct.image ? (
                              <img
                                src={selectedProduct.image}
                                alt={selectedProduct.nom}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full">
                                <Package className="h-6 w-6 text-muted-foreground/40" />
                              </div>
                            )}
                          </div>

                          {/* Product Info */}
                          <div className="flex-1 min-w-0 space-y-2">
                            <div>
                              <h5 className="font-semibold text-sm truncate">
                                {selectedProduct.nom}
                              </h5>
                              <Badge variant="secondary" className="text-xs">
                                {selectedProduct.reference}
                              </Badge>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-2">
                              <Label className="text-xs text-muted-foreground">
                                Quantité:
                              </Label>
                              <div className="flex items-center gap-1">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => updateQuantity(index, -1)}
                                  disabled={field.quantite <= 1}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <Input
                                  type="number"
                                  min="1"
                                  value={field.quantite}
                                  onChange={(e) => {
                                    const value = Number(e.target.value) || 1;
                                    update(index, {
                                      ...field,
                                      quantite: Math.max(1, value),
                                    });
                                  }}
                                  className="h-6 w-12 text-center text-xs p-0"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => updateQuantity(index, 1)}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>

                            {/* Price */}
                            {selectedProduct.prixVente1An && (
                              <p className="text-xs text-muted-foreground">
                                Total:{' '}
                                <span className="font-semibold text-primary">
                                  {(
                                    selectedProduct.prixVente1An * field.quantite
                                  ).toFixed(2)}
                                  €
                                </span>
                              </p>
                            )}
                          </div>

                          {/* Delete Button */}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(index)}
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Product Selection Grid */}
          {showProductSelection && !isLoadingProducts && (
            <div className="border-t pt-6">
              <ProductSelectionGrid
                products={products}
                productQuantities={productQuantities}
                onQuantityChange={handleQuantityChange}
              />
            </div>
          )}

          {/* Add Product Button */}
          {!showProductSelection && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowProductSelection(true)}
              className="w-full border-dashed border-2 hover:border-primary hover:text-primary"
              disabled={isLoadingProducts}
            >
              <Plus className="h-4 w-4 mr-2" />
              {fields.length === 0
                ? 'Ajouter des produits'
                : 'Ajouter un autre produit'}
            </Button>
          )}

          {errors.products && (
            <p className="text-sm text-red-500">{errors.products.message}</p>
          )}

          {/* Summary Card */}
          {fields.length > 0 && (
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-center gap-2 mb-3">
                <Calculator className="h-5 w-5 text-primary" />
                <h4 className="font-semibold text-primary">
                  Récapitulatif du kit
                </h4>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Total 1 an:</span>
                  <p className="font-bold text-lg">
                    {totals.total1An.toFixed(2)}€
                  </p>
                </div>
                {totals.total2Ans > 0 && (
                  <div>
                    <span className="text-muted-foreground">Total 2 ans:</span>
                    <p className="font-bold text-lg">
                      {totals.total2Ans.toFixed(2)}€
                    </p>
                  </div>
                )}
                {totals.total3Ans > 0 && (
                  <div>
                    <span className="text-muted-foreground">Total 3 ans:</span>
                    <p className="font-bold text-lg">
                      {totals.total3Ans.toFixed(2)}€
                    </p>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Impact CO2:</span>
                  <p className="font-semibold">
                    {totals.totalCO2.toFixed(2)} kg eq.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-sm">
                <div>
                  <span className="text-muted-foreground">
                    Épuisement ressources:
                  </span>
                  <p className="font-semibold">
                    {totals.totalRessources.toFixed(2)} MJ
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Acidification:</span>
                  <p className="font-semibold">
                    {totals.totalAcidification.toFixed(4)} MOL H+
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Eutrophisation:</span>
                  <p className="font-semibold">
                    {totals.totalEutrophisation.toFixed(4)} kg P eq.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
