'use client';

import { CartItem } from '@/lib/types';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';

interface CartProps {
  isOpen: boolean;
  items: CartItem[];
  onClose: () => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout: () => void;
}

export default function Cart({
  isOpen,
  items,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}: CartProps) {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-semibold">ショッピングカート</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {items.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">カートは空です</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex gap-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{item.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                              className="p-1 hover:bg-gray-200 rounded transition-colors"
                              disabled={item.quantity <= 1}
                            >
                              <Minus size={16} />
                            </button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <button
                              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                              className="p-1 hover:bg-gray-200 rounded transition-colors"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-semibold">
                              ¥{(item.price * item.quantity).toLocaleString()}
                            </span>
                            <button
                              onClick={() => onRemoveItem(item.id)}
                              className="text-red-500 hover:text-red-700 transition-colors"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t p-4 space-y-4">
            <div className="flex justify-between text-xl font-semibold">
              <span>合計</span>
              <span>¥{total.toLocaleString()}</span>
            </div>
            <button
              onClick={onCheckout}
              disabled={items.length === 0}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              決済に進む
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}