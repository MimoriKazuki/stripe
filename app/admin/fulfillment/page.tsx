'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Search,
  Filter,
  ChevronRight,
  MapPin,
  Calendar,
  Edit,
  ExternalLink,
  Download,
  Printer,
  MoreVertical
} from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  customerName?: string;
  customerEmail: string;
  total: number;
  fulfillmentStatus: string;
  paymentStatus: string;
  trackingNumber?: string;
  trackingUrl?: string;
  shippingCarrier?: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  shippingAddress?: any;
  items: Array<any>;
  createdAt: string;
}

export default function FulfillmentPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<any>({});
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [trackingInfo, setTrackingInfo] = useState({
    trackingNumber: '',
    shippingCarrier: 'yamato',
    estimatedDelivery: ''
  });

  useEffect(() => {
    fetchFulfillmentData();
  }, [selectedStatus]);

  const fetchFulfillmentData = async () => {
    const url = selectedStatus === 'all' 
      ? '/api/admin/fulfillment'
      : `/api/admin/fulfillment?status=${selectedStatus}`;
    
    const response = await fetch(url);
    const data = await response.json();
    setOrders(data.orders || []);
    setStats(data.stats || {});
  };

  const updateFulfillmentStatus = async (orderId: string, status: string) => {
    const response = await fetch('/api/admin/fulfillment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId,
        action: 'update_status',
        data: { status }
      })
    });

    if (response.ok) {
      fetchFulfillmentData();
    }
  };

  const updateTracking = async () => {
    if (!selectedOrder) return;

    const response = await fetch('/api/admin/fulfillment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: selectedOrder.id,
        action: 'update_status',
        data: {
          status: 'shipped',
          trackingNumber: trackingInfo.trackingNumber,
          shippingCarrier: trackingInfo.shippingCarrier,
          estimatedDelivery: trackingInfo.estimatedDelivery,
          trackingUrl: generateTrackingUrl(trackingInfo.shippingCarrier, trackingInfo.trackingNumber)
        }
      })
    });

    if (response.ok) {
      setShowUpdateModal(false);
      setSelectedOrder(null);
      setTrackingInfo({ trackingNumber: '', shippingCarrier: 'yamato', estimatedDelivery: '' });
      fetchFulfillmentData();
    }
  };

  const generateTrackingUrl = (carrier: string, trackingNumber: string) => {
    const urls: { [key: string]: string } = {
      yamato: `https://toi.kuronekoyamato.co.jp/cgi-bin/tneko?init&q=${trackingNumber}`,
      sagawa: `https://k2k.sagawa-exp.co.jp/p/web/okurijosearch.do?okurijoNo=${trackingNumber}`,
      jppost: `https://trackings.post.japanpost.jp/services/srv/search/?requestNo1=${trackingNumber}`,
    };
    return urls[carrier] || '';
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      unfulfilled: 'bg-gray-100 text-gray-800',
      partially_fulfilled: 'bg-yellow-100 text-yellow-800',
      fulfilled: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      returned: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      unfulfilled: '未処理',
      partially_fulfilled: '一部発送',
      fulfilled: '発送準備完了',
      shipped: '発送済み',
      delivered: '配達完了',
      returned: '返品'
    };
    return labels[status] || status;
  };

  const formatAddress = (address: any) => {
    if (!address) return '住所未設定';
    return `〒${address.postal_code} ${address.city}${address.state || ''}${address.line1}${address.line2 || ''}`;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">配送管理</h1>
          <div className="flex gap-2">
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2">
              <Download className="w-4 h-4" />
              配送ラベル一括印刷
            </button>
          </div>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">未処理</span>
              <AlertCircle className="w-4 h-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold">{stats.unfulfilled || 0}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">処理中</span>
              <Clock className="w-4 h-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold">{stats.processing || 0}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">発送済み</span>
              <Truck className="w-4 h-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold">{stats.shipped || 0}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">配達完了</span>
              <CheckCircle className="w-4 h-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold">{stats.delivered || 0}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">返品</span>
              <Package className="w-4 h-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold">{stats.returned || 0}</div>
          </div>
        </div>

        {/* フィルター */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">ステータス:</span>
            </div>
            <div className="flex gap-2">
              {['all', 'unfulfilled', 'shipped', 'delivered'].map(status => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-3 py-1 rounded text-sm ${
                    selectedStatus === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status === 'all' ? '全て' : getStatusLabel(status)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 注文リスト */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">注文番号</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">顧客</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">配送先</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ステータス</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">追跡番号</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">アクション</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString('ja-JP')}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{order.customerName || '名前未設定'}</div>
                    <div className="text-xs text-gray-500">{order.customerEmail}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600 max-w-xs truncate">
                      {formatAddress(order.shippingAddress)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.fulfillmentStatus)}`}>
                      {getStatusLabel(order.fulfillmentStatus)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {order.trackingNumber ? (
                      <div className="flex items-center gap-1">
                        <span className="text-sm">{order.trackingNumber}</span>
                        {order.trackingUrl && (
                          <a
                            href={order.trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {order.fulfillmentStatus === 'unfulfilled' && (
                        <button
                          onClick={() => updateFulfillmentStatus(order.id, 'fulfilled')}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          発送準備
                        </button>
                      )}
                      {order.fulfillmentStatus === 'fulfilled' && (
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowUpdateModal(true);
                          }}
                          className="text-purple-600 hover:text-purple-800 text-sm"
                        >
                          発送処理
                        </button>
                      )}
                      {order.fulfillmentStatus === 'shipped' && (
                        <button
                          onClick={() => updateFulfillmentStatus(order.id, 'delivered')}
                          className="text-green-600 hover:text-green-800 text-sm"
                        >
                          配達完了
                        </button>
                      )}
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 発送処理モーダル */}
        {showUpdateModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-lg font-bold mb-4">発送処理</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    配送業者
                  </label>
                  <select
                    value={trackingInfo.shippingCarrier}
                    onChange={(e) => setTrackingInfo({ ...trackingInfo, shippingCarrier: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="yamato">ヤマト運輸</option>
                    <option value="sagawa">佐川急便</option>
                    <option value="jppost">日本郵便</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    追跡番号
                  </label>
                  <input
                    type="text"
                    value={trackingInfo.trackingNumber}
                    onChange={(e) => setTrackingInfo({ ...trackingInfo, trackingNumber: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    placeholder="123456789012"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    配達予定日
                  </label>
                  <input
                    type="date"
                    value={trackingInfo.estimatedDelivery}
                    onChange={(e) => setTrackingInfo({ ...trackingInfo, estimatedDelivery: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  onClick={updateTracking}
                  className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                  発送処理を完了
                </button>
                <button
                  onClick={() => {
                    setShowUpdateModal(false);
                    setSelectedOrder(null);
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}