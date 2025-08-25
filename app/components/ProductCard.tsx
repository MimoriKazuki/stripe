'use client';

import { Product } from '@/lib/types';
import { ShoppingBag } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <div className="aspect-square relative overflow-hidden bg-gray-100">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-1">
          {product.name}
        </h3>
        <p className="text-sm text-gray-600 mb-3">{product.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold text-gray-900">
            ¥{product.price.toLocaleString()}
          </span>
          <button
            onClick={() => onAddToCart(product)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <ShoppingBag size={18} />
            カートに追加
          </button>
        </div>
      </div>
    </div>
  );
}