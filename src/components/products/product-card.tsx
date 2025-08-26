"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RoleGuard } from "@/components/auth/role-guard";
import { UserRole } from "@/lib/types/user";
import { useDialog } from "@/components/providers/dialog-provider";
import {
  Edit,
  Trash2,
  Package,
  Euro,
  Calendar,
  User,
  Leaf,
} from "lucide-react";

interface Product {
  id: string;
  nom: string;
  reference: string;
  description?: string;
  prixVente1An: number;
  quantite: number;
  surfaceM2: number;
  rechauffementClimatique: number;
  image?: string;
  createdAt: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
}

interface ProductCardProps {
  product: Product;
  onDelete: (productId: string) => Promise<void>;
}

export function ProductCard({ product, onDelete }: ProductCardProps) {
  const router = useRouter();
  const { showConfirm } = useDialog();

  const handleDelete = async () => {
    const confirmed = await showConfirm(
      "Supprimer le produit",
      "Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.",
      "Supprimer",
      "Annuler"
    );
    
    if (!confirmed) {
      return;
    }
    
    await onDelete(product.id);
  };

  return (
    <Card className="group relative overflow-hidden hover:shadow-soft hover:border-primary/20 hover:-translate-y-1 transition-all duration-300 bg-card">
      {/* Header Section */}
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 flex-shrink-0">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg font-semibold text-foreground line-clamp-1 mb-2">
                {product.nom}
              </CardTitle>
              <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border border-primary/20 font-medium">
                {product.reference}
              </Badge>
              {product.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                  {product.description}
                </p>
              )}
            </div>
          </div>
          
          <RoleGuard requiredRole={UserRole.DEV} showAlert={false}>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/dashboard/products/${product.id}/modifier`)}
                className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary transition-colors"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </RoleGuard>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 pt-0">
        {/* Image avec overlay */}
        <div className="relative overflow-hidden rounded-lg">
          {product.image ? (
            <img
              src={product.image}
              alt={product.nom}
              className="w-full h-36 object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-36 bg-gradient-to-br from-muted/30 to-muted/50 flex items-center justify-center">
              <Package className="h-10 w-10 text-muted-foreground/40" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Métriques dans des cards distinctes */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-primary/5 border border-primary/10 rounded-lg p-3 text-center group/metric hover:bg-primary/10 transition-colors">
            <div className="flex items-center justify-center mb-1">
              <Euro className="h-4 w-4 text-primary" />
            </div>
            <p className="font-bold text-primary text-sm">
              {product.prixVente1An.toFixed(0)}€
            </p>
            <p className="text-xs text-muted-foreground">Prix</p>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center group/metric hover:bg-blue-100 transition-colors">
            <div className="flex items-center justify-center mb-1">
              <Package className="h-4 w-4 text-blue-600" />
            </div>
            <p className="font-bold text-blue-600 text-sm">
              {product.quantite}
            </p>
            <p className="text-xs text-muted-foreground">Stock</p>
          </div>
          
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-center group/metric hover:bg-emerald-100 transition-colors">
            <div className="flex items-center justify-center mb-1">
              <Leaf className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="font-bold text-emerald-600 text-sm">
              {product.rechauffementClimatique.toFixed(1)}
            </p>
            <p className="text-xs text-muted-foreground">kg CO₂</p>
          </div>
        </div>

        {/* Informations complémentaires */}
        <div className="bg-muted/30 rounded-lg p-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-3 w-3" />
              <span className="font-medium">{product.createdBy.name}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{new Date(product.createdAt).toLocaleDateString("fr-FR")}</span>
            </div>
          </div>
          
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>Surface: <span className="font-medium text-foreground">{product.surfaceM2}m²</span></span>
            <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
              Stock disponible
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
