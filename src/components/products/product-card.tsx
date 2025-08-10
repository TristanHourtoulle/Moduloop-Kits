"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RoleGuard } from "@/components/auth/role-guard";
import { UserRole } from "@/lib/types/user";
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

  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
      return;
    }
    await onDelete(product.id);
  };

  return (
    <Card className="group hover:shadow-lg hover:border-[#30C1BD]/20 transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-1">
              {product.nom}
            </CardTitle>
            <Badge variant="outline" className="mt-1">
              {product.reference}
            </Badge>
          </div>
          <RoleGuard requiredRole={UserRole.DEV} showAlert={false}>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  router.push(`/dashboard/products/${product.id}/modifier`)
                }
                className="h-8 w-8 p-0 cursor-pointer"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </RoleGuard>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Image */}
        {product.image ? (
          <img
            src={product.image}
            alt={product.nom}
            className="w-full h-32 object-cover rounded-lg border"
          />
        ) : (
          <div className="w-full h-32 bg-gray-100 rounded-lg border flex items-center justify-center">
            <Package className="h-8 w-8 text-gray-400" />
          </div>
        )}

        {/* Description */}
        {product.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Informations clés */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-gray-600">
              <Euro className="h-3 w-3" />
              Prix
            </span>
            <span className="font-medium">
              {product.prixVente1An.toFixed(2)}€
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-gray-600">
              <Package className="h-3 w-3" />
              Stock
            </span>
            <span className="font-medium">{product.quantite}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-gray-600">
              <Leaf className="h-3 w-3" />
              CO₂
            </span>
            <span className="font-medium">
              {product.rechauffementClimatique} kg
            </span>
          </div>
        </div>

        {/* Métadonnées */}
        <div className="pt-2 border-t text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {product.createdBy.name}
          </div>
          <div className="flex items-center gap-1 mt-1">
            <Calendar className="h-3 w-3" />
            {new Date(product.createdAt).toLocaleDateString("fr-FR")}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
