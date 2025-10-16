"use client";

import { KitForm } from "@/components/kits/kit-form";
import { generateKitKey } from "@/lib/utils/kit-key";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface KitData {
  nom: string;
  style: string;
  description?: string;
  products: Array<{
    productId: string;
    quantite: number;
  }>;
}

interface KitEditWrapperProps {
  kitId: string;
  initialKit: KitData;
  kitName: string;
}

export function KitEditWrapper({
  kitId,
  initialKit,
  kitName,
}: KitEditWrapperProps) {
  const searchParams = useSearchParams();
  const timestamp = searchParams.get("t");

  // Generate a key that includes both kit data and timestamp
  const [kitKey, setKitKey] = useState("");

  useEffect(() => {
    // Generate key based on kit data AND timestamp from URL
    const dataKey = generateKitKey(kitId, initialKit);
    const fullKey = timestamp ? `${dataKey}-${timestamp}` : dataKey;
    setKitKey(fullKey);

    console.log("[KitEditWrapper] Component mounted with:", {
      kitId,
      kitName,
      timestamp,
      key: fullKey,
      productsCount: initialKit.products.length,
    });
  }, [kitId, initialKit, timestamp]);

  return (
    <>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto text-center mb-8">
        Modifiez les informations de{" "}
        <span className="font-semibold text-[#30C1BD]">
          &quot;{kitName}&quot;
        </span>
      </p>

      {/* Form with dynamic key for forcing remount on Vercel */}
      <KitForm key={kitKey} initialData={initialKit} kitId={kitId} />
    </>
  );
}
