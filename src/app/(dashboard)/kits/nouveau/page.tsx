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
          {/* Header with gradient accent */}
          <div className="mb-8">
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#30C1BD] to-[#30C1BD]/70 shadow-lg shadow-[#30C1BD]/20">
                <Package2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-foreground text-3xl font-bold tracking-tight">Nouveau kit</h1>
                <p className="text-muted-foreground">
                  Créez un kit personnalisé en sélectionnant vos produits
                </p>
              </div>
            </div>

            {/* Navigation breadcrumb */}
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <span>Kits</span>
              <span className="text-[#30C1BD]">/</span>
              <span className="font-medium text-[#30C1BD]">Nouveau kit</span>
            </div>
          </div>

          {/* Formulaire */}
          <KitForm />
        </div>
      </div>
    </RoleGuard>
  )
}
