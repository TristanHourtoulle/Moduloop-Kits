import { KitCard } from "./kit-card";
import { Button } from "@/components/ui/button";
import { Package2, Plus } from "lucide-react";
import { getKits } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UserRole } from "@/lib/types/user";

interface Kit {
  id: string;
  nom: string;
  style: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    name?: string;
    email: string;
  };
  updatedBy: {
    id: string;
    name?: string;
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
    };
  }>;
}

interface KitsGridProps {
  showCreateButton?: boolean;
}

export async function KitsGrid({ showCreateButton = true }: KitsGridProps) {
  // Server-side data fetching with caching
  const kits = await getKits();

  return (
    <div className="space-y-6">
      {showCreateButton && (
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Kits disponibles
            </h2>
            <p className="text-gray-600">Gérez vos kits de produits</p>
          </div>
          <Button
            asChild
            className="bg-[#30C1BD] hover:bg-[#30C1BD]/80 text-white"
          >
            <a href="/kits/nouveau">
              <Plus className="h-4 w-4 mr-2" />
              Nouveau kit
            </a>
          </Button>
        </div>
      )}

      {kits.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <Package2 className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Aucun kit créé
          </h3>
          <p className="text-gray-600 mb-4">
            Commencez par créer votre premier kit de produits
          </p>
          {showCreateButton && (
            <Button
              asChild
              className="bg-[#30C1BD] hover:bg-[#30C1BD]/80 text-white"
            >
              <a href="/kits/nouveau">
                <Plus className="h-4 w-4 mr-2" />
                Créer mon premier kit
              </a>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {kits.map((kit) => (
            <KitCard key={kit.id} kit={kit as unknown as Kit} />
          ))}
        </div>
      )}
    </div>
  );
}
