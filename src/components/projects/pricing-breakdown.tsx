"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Euro,
  Package,
  TrendingUp,
  Calculator,
  Percent,
  DollarSign,
  BarChart3,
  Info,
} from "lucide-react";
import { Project } from "@/lib/types/project";

interface PricingBreakdownProps {
  project: Project;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
};

const getKitPriceBreakdown = (project: Project) => {
  if (!project.projectKits) return [];

  return project.projectKits
    .map((projectKit) => {
      const kit = projectKit.kit;
      if (!kit || !kit.kitProducts) return null;

      let kitTotalPrice = 0;
      let kitTotalCost = 0;
      let kitTotalMargin = 0;

      kit.kitProducts.forEach((kitProduct) => {
        const product = kitProduct.product;
        if (product) {
          const productPrice =
            product.prixVente1An * kitProduct.quantite * projectKit.quantite;
          const productCost =
            (product.prixAchat1An || 0) *
            kitProduct.quantite *
            projectKit.quantite;
          kitTotalPrice += productPrice;
          kitTotalCost += productCost;
        }
      });

      kitTotalMargin = kitTotalPrice - kitTotalCost;

      return {
        kitName: kit.nom,
        quantity: projectKit.quantite,
        totalPrice: kitTotalPrice,
        totalCost: kitTotalCost,
        totalMargin: kitTotalMargin,
        marginPercentage:
          kitTotalPrice > 0 ? (kitTotalMargin / kitTotalPrice) * 100 : 0,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
};

export function PricingBreakdown({ project }: PricingBreakdownProps) {
  const totalPrice = project.totalPrix || 0;
  const totalCost = project.totalPrix ? totalPrice * 0.7 : 0; // Estimation du coût
  const totalMargin = totalPrice - totalCost;
  const marginPercentage =
    totalPrice > 0 ? (totalMargin / totalPrice) * 100 : 0;

  const kitBreakdown = getKitPriceBreakdown(project);
  const averagePricePerKit =
    kitBreakdown.length > 0 ? totalPrice / kitBreakdown.length : 0;

  return (
    <div className="space-y-6">
      {/* Vue d'ensemble des prix */}
      <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in slide-in-from-bottom-4 duration-500">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Euro className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-900 mb-1">
              {formatPrice(totalPrice)}
            </div>
            <div className="text-sm text-green-600">Prix total</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Calculator className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-900 mb-1">
              {formatPrice(totalCost)}
            </div>
            <div className="text-sm text-blue-600">Coût total</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-900 mb-1">
              {formatPrice(totalMargin)}
            </div>
            <div className="text-sm text-purple-600">Marge totale</div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Marge et rentabilité */}
      <motion.div className="animate-in slide-in-from-bottom-4 duration-500 delay-200">
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <Percent className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-amber-800">
                  Rentabilité du projet
                </h3>
                <p className="text-sm text-amber-600">
                  Marge et indicateurs de performance
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-amber-700">Marge brute</span>
                  <span className="font-semibold text-amber-900">
                    {marginPercentage.toFixed(1)}%
                  </span>
                </div>
                <Progress
                  value={Math.min(marginPercentage, 100)}
                  className="h-2 bg-amber-100"
                />

                <div className="pt-2">
                  <div className="text-xs text-amber-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Coût</span>
                      <span>{formatPrice(totalCost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Marge</span>
                      <span>{formatPrice(totalMargin)}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span>Prix de vente</span>
                      <span>{formatPrice(totalPrice)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-center p-4 bg-amber-100 rounded-lg">
                  <div className="text-2xl font-bold text-amber-900 mb-1">
                    {formatPrice(averagePricePerKit)}
                  </div>
                  <div className="text-sm text-amber-700">
                    Prix moyen par kit
                  </div>
                </div>

                <div className="text-center p-4 bg-amber-100 rounded-lg">
                  <div className="text-2xl font-bold text-amber-900 mb-1">
                    {kitBreakdown.length}
                  </div>
                  <div className="text-sm text-amber-700">Nombre de kits</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Détail par kit */}
      <motion.div className="animate-in slide-in-from-bottom-4 duration-500 delay-300">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="w-5 h-5" />
              <span>Détail des prix par kit</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {kitBreakdown.map((kit, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors animate-in slide-in-from-left-4 duration-500"
                  style={{ animationDelay: `${400 + index * 100}ms` }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Package className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {kit.kitName}
                        </h4>
                        <p className="text-sm text-gray-500">
                          Quantité: {kit.quantity}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-sm">
                      {kit.marginPercentage.toFixed(1)}% marge
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="font-semibold text-gray-900">
                        {formatPrice(kit.totalPrice)}
                      </div>
                      <div className="text-gray-500">Prix total</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="font-semibold text-gray-900">
                        {formatPrice(kit.totalCost)}
                      </div>
                      <div className="text-gray-500">Coût total</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="font-semibold text-gray-900">
                        {formatPrice(kit.totalMargin)}
                      </div>
                      <div className="text-gray-500">Marge</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Insights et recommandations */}
      <motion.div className="animate-in slide-in-from-bottom-4 duration-500 delay-500">
        <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <BarChart3 className="w-5 h-5 text-indigo-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-indigo-800 mb-2">
                  Insights et recommandations
                </h3>
                <div className="space-y-2 text-sm text-indigo-700">
                  {marginPercentage > 30 ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span>
                        Excellente rentabilité ! Votre marge de{" "}
                        {marginPercentage.toFixed(1)}% est très bonne.
                      </span>
                    </div>
                  ) : marginPercentage > 20 ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      <span>
                        Rentabilité correcte. Considérez optimiser les coûts
                        pour améliorer la marge.
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      <span>
                        Marge faible. Analysez les coûts et considérez ajuster
                        les prix.
                      </span>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span>
                      Prix moyen par kit: {formatPrice(averagePricePerKit)}
                    </span>
                  </div>

                  {kitBreakdown.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span>
                        Kit le plus rentable:{" "}
                        {kitBreakdown.reduce((max, kit) =>
                          kit.marginPercentage > max.marginPercentage
                            ? kit
                            : max
                        )?.kitName || "N/A"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
