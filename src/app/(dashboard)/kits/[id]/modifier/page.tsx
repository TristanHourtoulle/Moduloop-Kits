import { RoleGuard } from '@/components/auth/role-guard'
import { UserRole } from '@/lib/types/user'
import { KitEditWrapper } from '@/components/kits/kit-edit-wrapper'
import { Package2, Sparkles } from 'lucide-react'
import { notFound } from 'next/navigation'
import { getKitById } from '@/lib/db'

// Disable all caching for this page
export const dynamic = 'force-dynamic'
export const revalidate = 0

interface KitData {
  nom: string
  style: string
  description?: string
  surfaceM2?: number
  products: Array<{
    productId: string
    quantite: number
  }>
}

export default async function EditKitPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ t?: string }>
}) {
  const { id: kitId } = await params
  // Await searchParams to opt into dynamic rendering (Next.js requirement)
  await searchParams

  const kitData = await getKitById(kitId)

  if (!kitData) {
    notFound()
  }

  // Transform data for the form
  const transformedKit: KitData = {
    nom: kitData.nom,
    style: kitData.style,
    description: kitData.description || undefined,
    surfaceM2: kitData.surfaceM2 || undefined,
    products: kitData.kitProducts.map((kp) => ({
      productId: kp.product.id,
      quantite: kp.quantite,
    })),
  }

  const kitKey = `${kitId}-${String(kitData.updatedAt ?? 'initial')}`

  return (
    <RoleGuard requiredRole={UserRole.DEV}>
      <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100 py-8">
        <div className="container mx-auto px-6">
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-[#30C1BD] to-[#30C1BD]/80">
              <Package2 className="h-8 w-8 text-white" />
            </div>
            <h1 className="mb-2 text-4xl font-bold text-gray-900">Modifier le kit</h1>
            <div className="mt-4 flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4 text-[#30C1BD]" />
              <span className="text-sm text-gray-500">
                Calculs automatiques mis à jour en temps réel
              </span>
            </div>
          </div>

          <KitEditWrapper key={kitKey} kitId={kitId} initialKit={transformedKit} />
        </div>
      </div>
    </RoleGuard>
  )
}
