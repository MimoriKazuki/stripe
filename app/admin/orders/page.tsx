'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Package, CheckCircle, Clock, XCircle, ChevronDown, ChevronUp, User, MapPin, Phone, Mail, Truck } from 'lucide-react';
import { Order } from '@/lib/db';

export default function OrdersManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const response = await fetch('/api/admin/orders');
    const data = await response.json();
    setOrders(data);
  };

  const toggleOrderExpansion = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return '完了';
      case 'pending':
        return '処理中';
      case 'failed':
        return '失敗';
      default:
        return status;
    }
  };

  const formatAddress = (address: any) => {
    if (!address) return '未設定';
    return `〒${address.postal_code} ${address.city}${address.state || ''}${address.line1}${address.line2 || ''}`;
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">注文管理</h2>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">注文はまだありません</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  詳細
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  注文ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  顧客名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  商品数
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  合計
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ステータス
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  日時
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <>
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => toggleOrderExpansion(order.id)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {expandedOrders.has(order.id) ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.customerName || order.customerEmail || '未設定'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.items.reduce((sum, item) => sum + item.quantity, 0)}点
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ¥{order.total.toLocaleString()}
                      {order.shippingCost && order.shippingCost > 0 && (
                        <span className="text-xs text-gray-500 block">
                          (送料: ¥{order.shippingCost.toLocaleString()})
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(order.status)}
                        <span className="text-sm">{getStatusLabel(order.status)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleString('ja-JP')}
                    </td>
                  </tr>
                  {expandedOrders.has(order.id) && (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 bg-gray-50">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* 顧客情報 */}
                          <div className="space-y-4">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                              <User className="w-4 h-4" />
                              顧客情報
                            </h3>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600">名前:</span>
                                <span className="text-gray-900">{order.customerName || '未設定'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600">メール:</span>
                                <span className="text-gray-900">{order.customerEmail || '未設定'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600">電話:</span>
                                <span className="text-gray-900">{order.customerPhone || '未設定'}</span>
                              </div>
                            </div>
                          </div>

                          {/* 配送情報 */}
                          <div className="space-y-4">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                              <Truck className="w-4 h-4" />
                              配送情報
                            </h3>
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="text-gray-600">配送先住所:</span>
                                <p className="text-gray-900 mt-1">{formatAddress(order.shippingAddress)}</p>
                              </div>
                              {order.billingAddress && (
                                <div>
                                  <span className="text-gray-600">請求先住所:</span>
                                  <p className="text-gray-900 mt-1">{formatAddress(order.billingAddress)}</p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* 注文商品詳細 */}
                          <div className="space-y-4 lg:col-span-2">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                              <Package className="w-4 h-4" />
                              注文商品
                            </h3>
                            <div className="border rounded-lg overflow-hidden">
                              <table className="w-full text-sm">
                                <thead className="bg-gray-100">
                                  <tr>
                                    <th className="px-4 py-2 text-left text-gray-700">商品名</th>
                                    <th className="px-4 py-2 text-left text-gray-700">商品ID</th>
                                    <th className="px-4 py-2 text-right text-gray-700">数量</th>
                                    <th className="px-4 py-2 text-right text-gray-700">単価</th>
                                    <th className="px-4 py-2 text-right text-gray-700">小計</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                  {order.items.map((item, index) => (
                                    <tr key={index}>
                                      <td className="px-4 py-2 text-gray-900">{item.productName}</td>
                                      <td className="px-4 py-2 text-gray-600">{item.productId}</td>
                                      <td className="px-4 py-2 text-right text-gray-900">{item.quantity}</td>
                                      <td className="px-4 py-2 text-right text-gray-900">
                                        ¥{item.price.toLocaleString()}
                                      </td>
                                      <td className="px-4 py-2 text-right text-gray-900">
                                        ¥{(item.price * item.quantity).toLocaleString()}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* Stripe情報 */}
                          <div className="space-y-4 lg:col-span-2">
                            <h3 className="font-semibold text-gray-900">決済情報</h3>
                            <div className="text-sm">
                              <span className="text-gray-600">Stripe Session ID:</span>
                              <code className="ml-2 px-2 py-1 bg-gray-100 rounded text-xs">
                                {order.stripeSessionId}
                              </code>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}