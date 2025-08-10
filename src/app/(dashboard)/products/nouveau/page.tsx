import { Metadata } from "next";
import { RoleGuard } from "@/components/auth/role-guard";
import { UserRole } from "@/lib/types/user";
import { ProductForm } from "@/components/products/product-form";
import { Package, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Nouveau produit - Moduloop Kits",
  description: "Créer un nouveau produit dans le catalogue Moduloop",
};

export default function NewProductPage() {
  return (
    <RoleGuard requiredRole={UserRole.DEV}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 w-full">
        <div className="container mx-auto px-6">
          {/* Header moderne */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#30C1BD] to-[#30C1BD]/80 rounded-2xl mb-4">
              <Package className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Créer un nouveau produit
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Ajoutez un nouveau produit à votre catalogue Moduloop avec toutes
              ses caractéristiques techniques et commerciales
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <Sparkles className="h-4 w-4 text-[#30C1BD]" />
              <span className="text-sm text-gray-500">
                Formulaire intelligent avec calculs automatiques
              </span>
            </div>
          </div>

          {/* Formulaire */}
          <ProductForm />
        </div>
      </div>
    </RoleGuard>
  );
}
