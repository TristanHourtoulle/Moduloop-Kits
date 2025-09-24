"use client";

import { ProductCard } from "@/components/products/product-card";
import { type Product } from "@/lib/types/project";

interface ProductsGridProps {
  products: Product[];
  onDelete: (productId: string) => Promise<void>;
}

export function ProductsGrid({ products, onDelete }: ProductsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onDelete={onDelete} />
      ))}
    </div>
  );
}
