'use client';

import { ShoppingCart, Lock } from 'lucide-react';
import Link from 'next/link';

interface HeaderProps {
  cartCount: number;
  onCartClick: () => void;
}

export default function Header({ cartCount, onCartClick }: HeaderProps) {
  return (
    <header className="bg-gray-900 text-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">STRIPE EC STORE</h1>
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-lg transition-colors"
          >
            <Lock size={18} />
            <span className="font-semibold">管理画面</span>
          </Link>
          <button
            onClick={onCartClick}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
          >
            <ShoppingCart size={20} />
            <span className="font-semibold">カート ({cartCount})</span>
          </button>
        </div>
      </div>
    </header>
  );
}