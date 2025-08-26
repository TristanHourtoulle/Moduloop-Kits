"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface KitFormActionsProps {
  isLoading: boolean;
  kitId?: string;
  onReset: () => void;
}

export function KitFormActions({
  isLoading,
  kitId,
  onReset,
}: KitFormActionsProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t">
      <Button
        type="button"
        variant="outline"
        onClick={() => router.back()}
        disabled={isLoading}
        className="order-3 sm:order-1"
      >
        Annuler
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={onReset}
        disabled={isLoading}
        className="order-2"
      >
        Réinitialiser
      </Button>
      <Button
        type="submit"
        disabled={isLoading}
        className="cursor-pointer bg-[#30C1BD] hover:bg-[#30C1BD]/80 text-white order-1 sm:order-3"
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {kitId ? "Mettre à jour le kit" : "Créer le kit"}
      </Button>
    </div>
  );
}
