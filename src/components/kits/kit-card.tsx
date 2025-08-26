"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Package2, Calendar, User, Calculator, Leaf } from "lucide-react";
import Link from "next/link";

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
  description?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    name?: string;
    email: string;
  };
  updatedBy: {
    id: string;
    name?: string;
    email: string;
  };
  kitProducts: KitProduct[];
}

interface KitCardProps {
  kit: Kit;
}

export function KitCard({ kit }: KitCardProps) {
  const calculateTotals = () => {
    let total1An = 0;
    let totalCO2 = 0;

    kit.kitProducts.forEach(({ product, quantite }) => {
      total1An += product.prixVente1An * quantite;
      totalCO2 += product.rechauffementClimatique * quantite;
    });

    return { total1An, totalCO2 };
  };

  const { total1An, totalCO2 } = calculateTotals();

  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce kit ?")) {
      return;
    }

    try {
      const response = await fetch(`/api/kits/${kit.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression du kit");
      }

      // Refresh the page to show updated data
      window.location.reload();
    } catch (err) {
      console.error("Erreur:", err);
      alert("Erreur lors de la suppression du kit");
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-2 hover:border-[#30C1BD]/30">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#30C1BD]/10">
              <Package2 className="h-5 w-5 text-[#30C1BD]" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-[#30C1BD] transition-colors">
                {kit.nom}
              </CardTitle>
              <Badge variant="secondary" className="mt-1">
                {kit.style}
              </Badge>
            </div>
          </div>
        </div>

        {kit.description && (
          <CardDescription className="text-sm text-gray-600 mt-2 line-clamp-2">
            {kit.description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Produits du kit */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Package2 className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              {kit.kitProducts.length} produit
              {kit.kitProducts.length > 1 ? "s" : ""}
            </span>
          </div>
          <div className="space-y-1 max-h-20 overflow-y-auto">
            {kit.kitProducts.map(({ product, quantite }) => (
              <div
                key={product.id}
                className="flex justify-between items-center text-xs text-gray-600"
              >
                <span className="truncate">{product.nom}</span>
                <span className="font-medium">×{quantite}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Totaux */}
        <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Calculator className="h-3 w-3 text-[#30C1BD]" />
              <span className="text-xs text-gray-600">Prix total</span>
            </div>
            <p className="font-bold text-lg text-[#30C1BD]">
              {total1An.toFixed(2)}€
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Leaf className="h-3 w-3 text-green-600" />
              <span className="text-xs text-gray-600">CO2</span>
            </div>
            <p className="font-semibold text-green-700">
              {totalCO2.toFixed(2)} kg
            </p>
          </div>
        </div>

        {/* Métadonnées */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span>{kit.createdBy.name || kit.createdBy.email}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{new Date(kit.createdAt).toLocaleDateString("fr-FR")}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t">
        <div className="flex gap-2 w-full">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="flex-1 hover:border-[#30C1BD] hover:text-[#30C1BD]"
          >
            <Link href={`/kits/${kit.id}/modifier`}>Modifier</Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            className="flex-1 hover:border-red-500 hover:text-red-600"
          >
            Supprimer
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
