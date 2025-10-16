/**
 * Utilities for generating stable keys for kit components
 * Used to force React remounting when kit data changes
 */

interface KitKeyData {
  nom: string;
  style: string;
  description?: string;
  products: Array<{
    productId: string;
    quantite: number;
  }>;
}

/**
 * Generate a stable, deterministic key from kit data
 * This ensures the component remounts when data changes
 *
 * @param kitId - The unique identifier of the kit
 * @param kitData - The kit data to generate a key from
 * @returns A stable string key for React component keying
 */
export function generateKitKey(kitId: string, kitData: KitKeyData): string {
  // Create a deterministic string from kit data
  const dataSignature = [
    kitData.nom,
    kitData.style,
    kitData.description || "",
    kitData.products
      .map((p) => `${p.productId}:${p.quantite}`)
      .sort() // Sort to ensure consistent order
      .join(","),
  ].join("|");

  // Simple hash function for shorter keys
  const hash = simpleHash(dataSignature);

  const key = `kit-${kitId}-${hash}`;

  console.log("[KitKey] Generated key:", {
    kitId,
    kitName: kitData.nom,
    productsCount: kitData.products.length,
    key,
  });

  return key;
}

/**
 * Simple hash function to create a short numeric hash from a string
 * Not cryptographically secure, just for component keying
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}
