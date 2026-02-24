"use client";

import { KitForm } from "@/components/kits/kit-form";
import { generateKitKey } from "@/lib/utils/kit-key";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

interface KitData {
  nom: string;
  style: string;
  description?: string;
  surfaceM2?: number;
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
  const kitKey = useMemo(() => {
    const dataKey = generateKitKey(kitId, initialKit);
    return timestamp ? `${dataKey}-${timestamp}` : dataKey;
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
