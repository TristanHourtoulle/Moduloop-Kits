import { Metadata } from 'next'
import { RoleGuard } from '@/components/auth/role-guard'
import { UserRole } from '@/lib/types/user'
import { ProductForm } from '@/components/products/product-form'
import { Package } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Nouveau produit - Moduloop Kits',
  description: 'Créer un nouveau produit dans le catalogue Moduloop',
}

export default function NewProductPage() {
  return (
    <RoleGuard requiredRole={UserRole.DEV}>
      <div className="bg-background min-h-screen w-full py-8">
        <div className="mx-auto max-w-4xl px-6">
          {/* Header épuré */}
          <div className="mb-8">
            <div className="mb-6 flex items-center gap-4">
              <div className="bg-primary/10 border-primary/20 flex h-12 w-12 items-center justify-center rounded-xl border">
                <Package className="text-primary h-6 w-6" />
              </div>
              <div>
                <h1 className="text-foreground text-3xl font-bold">Nouveau produit</h1>
                <p className="text-muted-foreground">
                  Ajoutez un nouveau produit à votre catalogue
                </p>
              </div>
            </div>

            {/* Navigation breadcrumb */}
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
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
  )
}
