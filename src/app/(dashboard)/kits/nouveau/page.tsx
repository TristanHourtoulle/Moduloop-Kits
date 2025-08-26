import { Metadata } from "next";
import { RoleGuard } from "@/components/auth/role-guard";
import { UserRole } from "@/lib/types/user";
import { KitForm } from "@/components/kits/kit-form";
import { Package2, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Nouveau kit - Moduloop Kits",
  description: "Créer un nouveau kit de produits dans le catalogue Moduloop",
};

export default function NewKitPage() {
  return (
    <RoleGuard requiredRole={UserRole.DEV}>
      <div className="min-h-screen bg-background py-8 w-full">
        <div className="container mx-auto px-6">
          {/* Header épuré */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                <Package2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Nouveau kit
                </h1>
                <p className="text-muted-foreground">
                  Créez un kit personnalisé en sélectionnant vos produits
                </p>
              </div>
            </div>
            
            {/* Navigation breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Kits</span>
              <span>•</span>
              <span className="text-primary">Nouveau kit</span>
            </div>
          </div>

          {/* Formulaire */}
          <KitForm />
        </div>
      </div>
    </RoleGuard>
  );
}
