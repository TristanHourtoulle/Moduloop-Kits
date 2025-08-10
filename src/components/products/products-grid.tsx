"use client";

import { ProductCard } from "@/components/products/product-card";

interface Product {
  id: string;
  nom: string;
  reference: string;
  description?: string;
  prixVente1An: number;
  quantite: number;
  surfaceM2: number;
  rechauffementClimatique: number;
  image?: string;
  createdAt: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
}

interface ProductsGridProps {
  products: Product[];
  onDelete: (productId: string) => Promise<void>;
}

export function ProductsGrid({ products, onDelete }: ProductsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onDelete={onDelete} />
      ))}
    </div>
  );
}
