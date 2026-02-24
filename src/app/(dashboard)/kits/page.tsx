import { type ComponentProps } from "react";
import { RoleGuard } from "@/components/auth/role-guard";
import { UserRole } from "@/lib/types/user";
import { KitsListWrapper } from "@/components/kits/kits-list-wrapper";
import { Button } from "@/components/ui/button";
import { Package2, Plus } from "lucide-react";
import Link from "next/link";
import { getKits } from "@/lib/db";

type Kit = ComponentProps<typeof KitsListWrapper>["initialKits"][number];

// Disable all caching for this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function KitsPage() {
  // Fetch kits directly from database using Prisma
  const kits = await getKits() as unknown as Kit[];

  return (
    <RoleGuard requiredRole={UserRole.DEV}>
      <div className="min-h-screen bg-background w-full">
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
          {/* Header épuré */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                <Package2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Kits</h1>
                <p className="text-muted-foreground">
                  Gérez votre collection de kits de produits
                </p>
              </div>
            </div>

            <Button asChild>
              <Link href="/kits/nouveau">
                <Plus className="h-4 w-4 mr-2" />
                Nouveau kit
              </Link>
            </Button>
          </div>

          {/* Client wrapper for kits list */}
          <KitsListWrapper initialKits={kits} />
        </div>
      </div>
    </RoleGuard>
  );
}
