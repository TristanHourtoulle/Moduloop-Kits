import { RoleGuard } from '@/components/auth/role-guard'
import { UserRole } from '@/lib/types/user'
import { KitsListWrapper } from '@/components/kits/kits-list-wrapper'
import { Button } from '@/components/ui/button'
import { Package2, Plus } from 'lucide-react'
import Link from 'next/link'
import { getKits } from '@/lib/db'

// Disable all caching for this page
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function KitsPage() {
  // Fetch kits directly from database using Prisma
  const kits = await getKits()

  return (
    <RoleGuard requiredRole={UserRole.DEV}>
      <div className="bg-background min-h-screen w-full">
        <div className="mx-auto max-w-7xl space-y-8 px-6 py-8">
          {/* Header épuré */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 border-primary/20 flex h-12 w-12 items-center justify-center rounded-xl border">
                <Package2 className="text-primary h-6 w-6" />
              </div>
              <div>
                <h1 className="text-foreground text-3xl font-bold">Kits</h1>
                <p className="text-muted-foreground">Gérez votre collection de kits de produits</p>
              </div>
            </div>

            <Button asChild data-testid="kits-create-btn">
              <Link href="/kits/nouveau">
                <Plus className="mr-2 h-4 w-4" />
                Nouveau kit
              </Link>
            </Button>
          </div>

          {/* Client wrapper for kits list */}
          <KitsListWrapper initialKits={kits} />
        </div>
      </div>
    </RoleGuard>
  )
}
