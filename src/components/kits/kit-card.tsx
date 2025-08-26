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
import { useDialog } from "@/components/providers/dialog-provider";

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
  const { showConfirm, showError } = useDialog();

  const handleDelete = async () => {
    const confirmed = await showConfirm(
      "Supprimer le kit",
      "Êtes-vous sûr de vouloir supprimer ce kit ? Cette action est irréversible.",
      "Supprimer",
      "Annuler"
    );
    
    if (!confirmed) {
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
      await showError(
        "Erreur", 
        "Une erreur est survenue lors de la suppression du kit. Veuillez réessayer."
      );
    }
  };

  return (
    <Card className="group relative overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center">
                <Package2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-foreground">
                  {kit.nom}
                </CardTitle>
                <Badge variant="secondary" className="mt-1 bg-primary/10 text-primary border-primary/20">
                  {kit.style}
                </Badge>
              </div>
            </div>
            {kit.description && (
              <CardDescription className="text-sm text-muted-foreground mt-3 line-clamp-2 max-w-sm">
                {kit.description}
              </CardDescription>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Section produits */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
            <span className="text-sm font-medium text-foreground">
              {kit.kitProducts.length} produit{kit.kitProducts.length > 1 ? "s" : ""}
            </span>
          </div>
          <div className="space-y-2 max-h-24 overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent">
            {kit.kitProducts.map(({ product, quantite }) => (
              <div
                key={product.id}
                className="flex justify-between items-center p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <span className="text-sm text-foreground truncate pr-2">{product.nom}</span>
                <Badge variant="outline" className="text-xs bg-background">×{quantite}</Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Section métriques */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Prix total</span>
            </div>
            <p className="text-2xl font-bold text-primary">
              {total1An.toFixed(2)}€
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Leaf className="h-4 w-4 text-emerald-600" />
              <span className="text-sm text-muted-foreground">CO₂</span>
            </div>
            <p className="text-2xl font-bold text-emerald-600">
              {totalCO2.toFixed(2)} kg
            </p>
          </div>
        </div>

        {/* Section métadonnées */}
        <div className="pt-4 border-t border-border/50 space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span className="truncate">{kit.createdBy.name || kit.createdBy.email}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{new Date(kit.createdAt).toLocaleDateString("fr-FR")}</span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-4">
        <div className="flex gap-3 w-full">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="flex-1"
          >
            <Link href={`/kits/${kit.id}/modifier`}>Modifier</Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            className="flex-1 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
          >
            Supprimer
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
