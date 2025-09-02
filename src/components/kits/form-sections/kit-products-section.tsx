"use client";

import { useState, useEffect } from "react";
import { Control, useFieldArray, FieldErrors, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Package, Plus, Trash2, Calculator } from "lucide-react";
import { KitFormData } from "@/lib/schemas/kit";

interface Product {
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
}

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

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "products",
  });

  // Watch les valeurs des produits pour les calculs en temps réel
  const watchedProducts = useWatch({
    control,
    name: "products",
  });

  // Charger la liste des produits
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products", {
          next: {
            revalidate: 300, // Revalider toutes les 5 minutes (produits changent moins souvent)
            tags: ["products"], // Tag pour invalider le cache si nécessaire
          },
        });
        if (!response.ok) {
          throw new Error("Erreur lors du chargement des produits");
        }
        const data = await response.json();
        // Extraire le tableau de produits de la réponse paginée
        const productsArray = data.products || data;
        setProducts(productsArray);
      } catch (error) {
        console.error("Erreur:", error);
        onError("Impossible de charger la liste des produits");
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [onError]);

  const addProduct = () => {
    append({ productId: "", quantite: 1 });
  };

  // Vérifier si un produit est déjà sélectionné
  const isProductAlreadySelected = (
    productId: string,
    currentIndex: number
  ) => {
    return fields.some(
      (field, index) => index !== currentIndex && field.productId === productId
    );
  };

  const getSelectedProduct = (productId: string) => {
    return products.find((p) => p.id === productId);
  };

  const calculateTotalPricing = () => {
    let total1An = 0;
    let total2Ans = 0;
    let total3Ans = 0;
    let totalCO2 = 0;
    let totalRessources = 0;
    let totalAcidification = 0;
    let totalEutrophisation = 0;

    // S'assurer que watchedProducts est un tableau valide
    const productsToCalculate = Array.isArray(watchedProducts)
      ? watchedProducts
      : [];

    productsToCalculate.forEach((productData) => {
      if (productData && productData.productId && productData.quantite) {
        const product = getSelectedProduct(productData.productId);
        if (product) {
          const quantite = Number(productData.quantite) || 0;
          total1An += product.prixVente1An * quantite;
          total2Ans += (product.prixVente2Ans || 0) * quantite;
          total3Ans += (product.prixVente3Ans || 0) * quantite;
          totalCO2 += product.rechauffementClimatique * quantite;
          totalRessources += product.epuisementRessources * quantite;
          totalAcidification += product.acidification * quantite;
          totalEutrophisation += product.eutrophisation * quantite;
        }
      }
    });

    return {
      total1An,
      total2Ans,
      total3Ans,
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
          <div className="p-2 rounded-lg bg-[#30C1BD]/10">
            <Package className="h-5 w-5 text-[#30C1BD]" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold">Produits du kit</h3>
            <p className="text-sm text-gray-500">
              Sélectionnez les produits et leurs quantités
            </p>
          </div>
          {fields.length > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {fields.length} produit{fields.length > 1 ? "s" : ""}
            </Badge>
          )}
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6 pb-6">
        <div className="space-y-6">
          {fields.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Aucun produit ajouté au kit</p>
              <p className="text-sm">
                Cliquez sur &ldquo;Ajouter un produit&rdquo; pour commencer
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {fields.map((field, index) => {
                const selectedProduct = getSelectedProduct(field.productId);
                return (
                  <div
                    key={field.id}
                    className="p-4 border rounded-lg bg-gray-50"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-1 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2 md:col-span-2">
                            <Label className="text-sm font-medium">
                              Produit *
                            </Label>
                            <Select
                              value={field.productId}
                              onValueChange={(value) => {
                                // Vérifier que le produit n'est pas déjà sélectionné
                                if (!isProductAlreadySelected(value, index)) {
                                  update(index, { ...field, productId: value });
                                }
                              }}
                              disabled={isLoadingProducts}
                            >
                              <SelectTrigger className="transition-colors focus:border-[#30C1BD] focus:ring-[#30C1BD]">
                                <SelectValue
                                  placeholder={
                                    isLoadingProducts
                                      ? "Chargement..."
                                      : "Sélectionner un produit"
                                  }
                                />
                              </SelectTrigger>
                              <SelectContent>
                                {products.map((product) => {
                                  const isAlreadySelected =
                                    isProductAlreadySelected(product.id, index);
                                  return (
                                    <SelectItem
                                      key={product.id}
                                      value={product.id}
                                      disabled={isAlreadySelected}
                                      className={
                                        isAlreadySelected
                                          ? "opacity-50 cursor-not-allowed"
                                          : ""
                                      }
                                    >
                                      <div className="flex flex-col">
                                        <span className="font-medium">
                                          {product.nom}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                          {product.reference}
                                          {isAlreadySelected &&
                                            " (déjà sélectionné)"}
                                        </span>
                                      </div>
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-medium">
                              Quantité *
                            </Label>
                            <Input
                              type="number"
                              min="1"
                              value={field.quantite}
                              onChange={(e) => {
                                update(index, { ...field, quantite: Number(e.target.value) || 1 });
                              }}
                              className="transition-colors focus:border-[#30C1BD] focus:ring-[#30C1BD]"
                            />
                          </div>
                        </div>

                        {selectedProduct && (
                          <div className="p-3 bg-white rounded border">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">
                                  Prix 1 an:
                                </span>
                                <p className="font-medium">
                                  {(
                                    selectedProduct.prixVente1An *
                                    (Number(field.quantite) || 0)
                                  ).toFixed(2)}
                                  €
                                </p>
                              </div>
                              {selectedProduct.prixVente2Ans && (
                                <div>
                                  <span className="text-gray-500">
                                    Prix 2 ans:
                                  </span>
                                  <p className="font-medium">
                                    {(
                                      selectedProduct.prixVente2Ans *
                                      (Number(field.quantite) || 0)
                                    ).toFixed(2)}
                                    €
                                  </p>
                                </div>
                              )}
                              {selectedProduct.prixVente3Ans && (
                                <div>
                                  <span className="text-gray-500">
                                    Prix 3 ans:
                                  </span>
                                  <p className="font-medium">
                                    {(
                                      selectedProduct.prixVente3Ans *
                                      (Number(field.quantite) || 0)
                                    ).toFixed(2)}
                                    €
                                  </p>
                                </div>
                              )}
                              <div>
                                <span className="text-gray-500">CO2:</span>
                                <p className="font-medium">
                                  {(
                                    selectedProduct.rechauffementClimatique *
                                    (Number(field.quantite) || 0)
                                  ).toFixed(2)}{" "}
                                  kg
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => remove(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {errors.products && (
            <p className="text-sm text-red-500">{errors.products.message}</p>
          )}

          <Button
            type="button"
            variant="outline"
            onClick={addProduct}
            className="w-full border-dashed border-2 hover:border-[#30C1BD] hover:text-[#30C1BD]"
            disabled={isLoadingProducts}
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un produit
          </Button>

          {fields.length > 0 && (
            <div className="p-4 bg-[#30C1BD]/5 rounded-lg border border-[#30C1BD]/20">
              <div className="flex items-center gap-2 mb-3">
                <Calculator className="h-5 w-5 text-[#30C1BD]" />
                <h4 className="font-semibold text-[#30C1BD]">
                  Récapitulatif du kit
                </h4>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Total 1 an:</span>
                  <p className="font-bold text-lg">
                    {totals.total1An.toFixed(2)}€
                  </p>
                </div>
                {totals.total2Ans > 0 && (
                  <div>
                    <span className="text-gray-600">Total 2 ans:</span>
                    <p className="font-bold text-lg">
                      {totals.total2Ans.toFixed(2)}€
                    </p>
                  </div>
                )}
                {totals.total3Ans > 0 && (
                  <div>
                    <span className="text-gray-600">Total 3 ans:</span>
                    <p className="font-bold text-lg">
                      {totals.total3Ans.toFixed(2)}€
                    </p>
                  </div>
                )}
                <div>
                  <span className="text-gray-600">Impact CO2:</span>
                  <p className="font-semibold">
                    {totals.totalCO2.toFixed(2)} kg eq.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-sm">
                <div>
                  <span className="text-gray-600">Épuisement ressources:</span>
                  <p className="font-semibold">
                    {totals.totalRessources.toFixed(2)} MJ
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Acidification:</span>
                  <p className="font-semibold">
                    {totals.totalAcidification.toFixed(4)} MOL H+
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Eutrophisation:</span>
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
