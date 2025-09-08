"use client";

import { ProductCard } from "@/components/products/product-card";
import { type Product } from "@/lib/types/project";

interface ProductsGridProps {
  products: Product[];
  onDelete: (productId: string) => Promise<void>;
}

export function ProductsGrid({ products, onDelete }: ProductsGridProps) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onDelete={onDelete} />
      ))}
    </div>
  );
}
