"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { KitsGridClient } from "@/components/kits/kits-grid-client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface Kit {
  id: string;
  nom: string;
  style: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    name?: string | null;
    email: string;
  };
  updatedBy: {
    id: string;
    name?: string | null;
    email: string;
  };
  kitProducts: Array<{
    id: string;
    quantite: number;
    product: {
      id: string;
      nom: string;
      reference: string;
      prixVente1An: number;
      prixVente2Ans?: number;
      prixVente3Ans?: number;
      rechauffementClimatique: number;
      epuisementRessources: number;
      acidification: number;
      eutrophisation: number;
      surfaceM2: number;
    };
  }>;
}

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
