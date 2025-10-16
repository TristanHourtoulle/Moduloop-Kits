import { RoleGuard } from "@/components/auth/role-guard";
import { UserRole } from "@/lib/types/user";
import { KitsListWrapper } from "@/components/kits/kits-list-wrapper";
import { Button } from "@/components/ui/button";
import { Package2, Plus } from "lucide-react";
import Link from "next/link";
import { headers, cookies } from "next/headers";
import { getKits } from "@/lib/db";

// Fetch kits data server-side with no cache for fresh data
async function getKitsData() {
  try {
    // Get the base URL from headers or environment
    const headersList = headers();
    const host = headersList.get("host") || "localhost:3000";
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    const baseUrl = `${protocol}://${host}`;

    // Get cookies for authentication
    const cookieStore = cookies();
    const cookieHeader = cookieStore.toString();

    console.log("[KitsPage Server] Fetching kits list");

    const response = await fetch(`${baseUrl}/api/kits`, {
      cache: "no-store", // Force fresh data
      headers: {
        Cookie: cookieHeader, // Pass cookies for authentication
      },
    });

    if (!response.ok) {
      console.error("[KitsPage Server] Failed to fetch kits:", response.status);
      return [];
    }

    const data = await response.json();

    console.log("[KitsPage Server] Kits fetched:", {
      count: data.length,
      isProduction: process.env.NODE_ENV === "production",
    });

    return data;
  } catch (error) {
    console.error("[KitsPage Server] Error fetching kits:", error);
    return [];
  }
}

export default async function KitsPage() {
  // Fetch kits data server-side
  const kits = await getKitsData();

  console.log("[KitsPage Server] Rendering page with", kits.length, "kits");

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
