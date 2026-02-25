"use client";

import { useState, useEffect, useCallback } from "react";
import { KitsGridClient } from "@/components/kits/kits-grid-client";
import { type Kit } from "@/lib/types/project";

interface KitsListWrapperProps {
  initialKits: Kit[];
}

export function KitsListWrapper({ initialKits }: KitsListWrapperProps) {
  const [kits, setKits] = useState<Kit[]>(initialKits);

  useEffect(() => {
    setKits(initialKits);
  }, [initialKits]);

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
