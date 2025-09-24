"use client";

import { Euro, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { type Product } from "@/lib/types/project";
import { type PurchaseRentalMode } from "@/lib/schemas/product";
import { getProductPricing, formatPrice } from "@/lib/utils/product-helpers";

interface ProductCardPricingProps {
  product: Product;
  selectedMode: PurchaseRentalMode;
  onModeChange: (mode: PurchaseRentalMode) => void;
  className?: string;
}

export function ProductCardPricing({ product, selectedMode, onModeChange, className }: ProductCardPricingProps) {
  // Prix d'achat principal (mode achat, 1 an)
  const purchasePrice = getProductPricing(product, 'achat', '1an');
  
  // Prix de location pour 1, 2 et 3 ans
  const rental1Year = getProductPricing(product, 'location', '1an');
  const rental2Years = getProductPricing(product, 'location', '2ans');
  const rental3Years = getProductPricing(product, 'location', '3ans');

  return (
    <div className={cn("space-y-4", className)}>
      {/* Prix d'achat principal */}
      <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
        <div className="flex items-center gap-2 mb-2">
          <ShoppingCart className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">Prix d'achat</span>
        </div>
        <div className="flex items-center gap-2">
          <Euro className="h-5 w-5 text-primary" />
          <span className="text-2xl font-bold text-primary">
            {formatPrice(purchasePrice.prixAchat)}
          </span>
        </div>
      </div>

      {/* Prix de location */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-sm font-medium text-foreground">Prix de location</span>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          {/* 1 an */}
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-lg p-3 border border-emerald-200/50">
            <div className="text-xs text-emerald-700 font-medium mb-1">1 an</div>
            <div className="text-sm font-semibold text-emerald-800">
              {formatPrice(rental1Year.prixAchat) || "N/A"}
            </div>
          </div>
          
          {/* 2 ans */}
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-lg p-3 border border-emerald-200/50">
            <div className="text-xs text-emerald-700 font-medium mb-1">2 ans</div>
            <div className="text-sm font-semibold text-emerald-800">
              {formatPrice(rental2Years.prixAchat) || "N/A"}
            </div>
          </div>
          
          {/* 3 ans */}
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-lg p-3 border border-emerald-200/50">
            <div className="text-xs text-emerald-700 font-medium mb-1">3 ans</div>
            <div className="text-sm font-semibold text-emerald-800">
              {formatPrice(rental3Years.prixAchat) || "N/A"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}