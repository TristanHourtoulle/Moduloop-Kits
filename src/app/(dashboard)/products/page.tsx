import { RoleGuard } from '@/components/auth/role-guard'
import { UserRole } from '@/lib/types/user'
import { ProductsListWrapper } from '@/components/products/products-list-wrapper'
import { Button } from '@/components/ui/button'
import { Package2, Plus } from 'lucide-react'
import Link from 'next/link'
import { getProducts } from '@/lib/db'

// Disable all caching for this page
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ProductsPage() {
  // Fetch products directly from database using Prisma
  const products = await getProducts()

  return (
    <RoleGuard requiredRole={UserRole.DEV}>
      <div className="bg-background min-h-screen w-full">
        <div className="mx-auto max-w-7xl space-y-8 px-6 py-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 border-primary/20 flex h-12 w-12 items-center justify-center rounded-xl border">
                <Package2 className="text-primary h-6 w-6" />
              </div>
              <div>
                <h1 className="text-foreground text-3xl font-bold">Produits</h1>
                <p className="text-muted-foreground">Gérez votre catalogue de produits</p>
              </div>
            </div>

            <Button asChild data-testid="products-create-btn">
              <Link href="/products/nouveau">
                <Plus className="mr-2 h-4 w-4" />
                Nouveau produit
              </Link>
            </Button>
          </div>

          {/* Client wrapper for products list */}
          <ProductsListWrapper initialProducts={products} />
        </div>
      </div>
    </RoleGuard>
  )
}
