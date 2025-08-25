'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Edit, Trash2, Plus, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { DBProduct } from '@/lib/db';

export default function ProductsManagement() {
  const [products, setProducts] = useState<DBProduct[]>([]);
  const [editingProduct, setEditingProduct] = useState<DBProduct | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const response = await fetch('/api/admin/products');
    const data = await response.json();
    setProducts(data);
  };

  const handleUpdateStock = async (productId: string, newStock: number) => {
    const response = await fetch(`/api/admin/products/${productId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock: newStock }),
    });

    if (response.ok) {
      fetchProducts();
      setEditingProduct(null);
    }
  };

  const handleToggleActive = async (productId: string, active: boolean) => {
    const response = await fetch(`/api/admin/products/${productId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active }),
    });

    if (response.ok) {
      fetchProducts();
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold">商品管理</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={20} />
          新規商品追加
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                商品
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                価格
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                在庫
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ステータス
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stripe同期
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <img
                      className="h-10 w-10 rounded-lg object-cover"
                      src={product.image}
                      alt={product.name}
                    />
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {product.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {product.description}
                      </div>
                      <div className="text-xs text-gray-400">
                        ID: {product.id}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    ¥{product.price.toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingProduct?.id === product.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={editingProduct.stock}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            stock: parseInt(e.target.value),
                          })
                        }
                        className="w-20 px-2 py-1 border rounded"
                      />
                      <button
                        onClick={() =>
                          handleUpdateStock(product.id, editingProduct.stock)
                        }
                        className="text-green-600 hover:text-green-900"
                      >
                        保存
                      </button>
                      <button
                        onClick={() => setEditingProduct(null)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        取消
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm ${
                          product.stock < 10 ? 'text-red-600 font-semibold' : 'text-gray-900'
                        }`}
                      >
                        {product.stock}
                      </span>
                      {product.stock < 10 && (
                        <AlertTriangle className="w-4 h-4 text-yellow-500" />
                      )}
                      <button
                        onClick={() => setEditingProduct(product)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit size={16} />
                      </button>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleToggleActive(product.id, !product.active)}
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      product.active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {product.active ? '販売中' : '停止中'}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    {product.stripeProductId ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-xs text-green-600">同期済み</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-gray-400" />
                        <span className="text-xs text-gray-500">未同期</span>
                      </>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-red-600 hover:text-red-900">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 新規商品追加フォーム（モーダル） */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">新規商品追加</h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                // 実装は省略
                setShowAddForm(false);
              }}
            >
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="商品名"
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
                <textarea
                  placeholder="商品説明"
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
                <input
                  type="number"
                  placeholder="価格"
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
                <input
                  type="number"
                  placeholder="在庫数"
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
                <input
                  type="url"
                  placeholder="画像URL"
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  追加
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}