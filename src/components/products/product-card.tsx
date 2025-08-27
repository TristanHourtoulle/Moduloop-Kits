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
    <Card className="group relative overflow-hidden hover:shadow-soft hover:border-primary/20 transition-all duration-300 bg-card">
      <div className="flex gap-6 p-6">
        {/* Image à gauche */}
        <div className="relative overflow-hidden rounded-lg flex-shrink-0">
          {product.image ? (
            <img
              src={product.image}
              alt={product.nom}
              className="w-20 h-20 object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-20 h-20 bg-gradient-to-br from-muted/30 to-muted/50 flex items-center justify-center rounded-lg">
              <Package className="h-8 w-8 text-muted-foreground/40" />
            </div>
          )}
        </div>

        {/* Contenu principal */}
        <div className="flex-1 min-w-0">
          {/* Header avec titre et référence */}
          <div className="flex justify-between items-start mb-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xl font-semibold text-foreground truncate">
                    {product.nom}
                  </h3>
                  <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border border-primary/20 font-medium">
                    {product.reference}
                  </Badge>
                </div>
              </div>
              {product.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 max-w-md">
                  {product.description}
                </p>
              )}
            </div>
            
            <RoleGuard requiredRole={UserRole.DEV} showAlert={false}>
              <div className="flex gap-1 ml-4" onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/products/${product.id}/modifier`);
                  }}
                  className="h-8 w-8 p-0 border-primary/30 bg-white/80 backdrop-blur-sm hover:bg-primary/10 hover:text-primary hover:border-primary transition-all relative z-20 cursor-pointer shadow-sm"
                  title="Modifier le produit"
                >
                  <Edit className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                  className="h-8 w-8 p-0 border-red-200 bg-white/80 backdrop-blur-sm hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all relative z-20 cursor-pointer shadow-sm"
                  title="Supprimer le produit"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </RoleGuard>
          </div>

          {/* Métriques et informations en bas */}
          <div className="flex items-center justify-between">
            {/* Prix à gauche */}
            <div className="flex items-center gap-2">
              <Euro className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold text-primary">
                {product.prixVente1An.toFixed(0)}€
              </span>
            </div>

            {/* Informations à droite */}
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="truncate max-w-[150px]">{product.createdBy.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{new Date(product.createdAt).toLocaleDateString("fr-FR")}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-foreground font-medium">{product.surfaceM2}m²</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
