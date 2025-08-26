import { Metadata } from "next";
import { RoleGuard } from "@/components/auth/role-guard";
import { UserRole } from "@/lib/types/user";
import { ProductForm } from "@/components/products/product-form";
import { Package } from "lucide-react";

export const metadata: Metadata = {
  title: "Nouveau produit - Moduloop Kits",
  description: "Créer un nouveau produit dans le catalogue Moduloop",
};

export default function NewProductPage() {
  return (
    <RoleGuard requiredRole={UserRole.DEV}>
      <div className="min-h-screen bg-background py-8 w-full">
        <div className="max-w-4xl mx-auto px-6">
          {/* Header épuré */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Nouveau produit
                </h1>
                <p className="text-muted-foreground">
                  Ajoutez un nouveau produit à votre catalogue
                </p>
              </div>
            </div>
            
            {/* Navigation breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Produits</span>
              <span>•</span>
              <span className="text-primary">Nouveau produit</span>
            </div>
          </div>

          {/* Formulaire */}
          <ProductForm />
        </div>
      </div>
    </RoleGuard>
  );
}
