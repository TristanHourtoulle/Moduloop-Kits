"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { KitsGridClient } from "@/components/kits/kits-grid-client";
import { type Kit } from "@/lib/types/project";

interface KitsListWrapperProps {
  initialKits: Kit[];
}

export function KitsListWrapper({ initialKits }: KitsListWrapperProps) {
  const searchParams = useSearchParams();
  const [kits, setKits] = useState<Kit[]>(initialKits);

  // Update kits when initialKits prop changes (server-side data refresh)
  useEffect(() => {
    console.log("[KitsListWrapper] Initial kits updated:", initialKits.length);
    setKits(initialKits);
  }, [initialKits]);

  // Detect when returning from edit page with updated param
  useEffect(() => {
    const updatedParam = searchParams.get("updated");
    if (updatedParam) {
      console.log(
        "[KitsListWrapper] Detected update param, data already fresh from server",
      );
      // Data is already fresh from server-side fetch, no need to refetch
    }
  }, [searchParams]);

  const handleDelete = useCallback(
    async (kitId: string) => {
      try {
        const response = await fetch(`/api/kits/${kitId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Erreur lors de la suppression du kit");
        }

        // Remove kit from local state without refetch
        const updatedKits = kits.filter((k) => k.id !== kitId);
        setKits(updatedKits);
      } catch (err) {
        console.error("[KitsListWrapper] Error deleting kit:", err);
      }
    },
    [kits],
  );

  return (
    <KitsGridClient
      kits={kits}
      showCreateButton={false}
      onDelete={handleDelete}
    />
  );
}
