import { RoleGuard } from "@/components/auth/role-guard";
import { UserRole } from "@/lib/types/user";
import { ProductsListWrapper } from "@/components/products/products-list-wrapper";
import { Button } from "@/components/ui/button";
import { Package2, Plus } from "lucide-react";
import Link from "next/link";
import { headers, cookies } from "next/headers";

// Force dynamic rendering since we use headers() for authentication
export const dynamic = 'force-dynamic';

// Fetch products data server-side with no cache for fresh data
async function getProductsData() {
  try {
    // Get the base URL from headers or environment
    const headersList = headers();
    const host = headersList.get("host") || "localhost:3000";
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    const baseUrl = `${protocol}://${host}`;

    // Get cookies for authentication
    const cookieStore = cookies();
    const cookieHeader = cookieStore.toString();

    console.log("[ProductsPage Server] Fetching products list");

    const response = await fetch(`${baseUrl}/api/products?all=true`, {
      cache: "no-store", // Force fresh data
      headers: {
        Cookie: cookieHeader, // Pass cookies for authentication
      },
    });

    if (!response.ok) {
      console.error("[ProductsPage Server] Failed to fetch products:", response.status);
      return [];
    }

    const data = await response.json();

    // Extract products array from response
    const products = data.products || [];

    console.log("[ProductsPage Server] Products fetched:", {
      count: products.length,
      isProduction: process.env.NODE_ENV === "production",
    });

    return products;
  } catch (error) {
    console.error("[ProductsPage Server] Error fetching products:", error);
    return [];
  }
}

export default async function ProductsPage() {
  // Fetch products data server-side
  const products = await getProductsData();

  console.log("[ProductsPage Server] Rendering page with", products.length, "products");

  return (
    <RoleGuard requiredRole={UserRole.DEV}>
      <div className="min-h-screen bg-background w-full">
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                <Package2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Produits</h1>
                <p className="text-muted-foreground">
                  Gérez votre catalogue de produits
                </p>
              </div>
            </div>

            <Button asChild>
              <Link href="/products/nouveau">
                <Plus className="h-4 w-4 mr-2" />
                Nouveau produit
              </Link>
            </Button>
          </div>

          {/* Client wrapper for products list */}
          <ProductsListWrapper initialProducts={products} />
        </div>
      </div>
    </RoleGuard>
  );
}