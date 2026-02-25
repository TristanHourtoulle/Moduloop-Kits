import { Metadata } from 'next'
import { RoleGuard } from '@/components/auth/role-guard'
import { UserRole } from '@/lib/types/user'
import { KitForm } from '@/components/kits/kit-form'
import { Package2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Nouveau kit - Moduloop Kits',
  description: 'Créer un nouveau kit de produits dans le catalogue Moduloop',
}

export default function NewKitPage() {
  return (
    <RoleGuard requiredRole={UserRole.DEV}>
      <div className="bg-background min-h-screen w-full py-8">
        <div className="container mx-auto px-6">
          {/* Header épuré */}
          <div className="mb-8">
            <div className="mb-6 flex items-center gap-4">
              <div className="bg-primary/10 border-primary/20 flex h-12 w-12 items-center justify-center rounded-xl border">
                <Package2 className="text-primary h-6 w-6" />
              </div>
              <div>
                <h1 className="text-foreground text-3xl font-bold">Nouveau kit</h1>
                <p className="text-muted-foreground">
                  Créez un kit personnalisé en sélectionnant vos produits
                </p>
              </div>
            </div>

            {/* Navigation breadcrumb */}
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
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
  )
}
