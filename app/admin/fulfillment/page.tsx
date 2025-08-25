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
  MoreVertical,
  X,
  RefreshCw,
  History,
  ArrowRight
} from 'lucide-react';
// Constants that were previously imported from shipping.ts
// Moved here to avoid fs module usage in client component
const FULFILLMENT_STATUS_DETAILS = {
  'unfulfilled': { label: '未処理', color: 'gray' },
  'processing': { label: '処理中', color: 'yellow' },
  'ready_to_ship': { label: '発送準備完了', color: 'blue' },
  'shipped': { label: '発送済み', color: 'purple' },
  'out_for_delivery': { label: '配達中', color: 'indigo' },
  'delivered': { label: '配達完了', color: 'green' },
  'delivery_failed': { label: '配達失敗', color: 'red' },
  'returned': { label: '返品', color: 'orange' },
  'cancelled': { label: 'キャンセル', color: 'gray' },
  'refunded': { label: '返金済み', color: 'gray' }
};

const FULFILLMENT_STATUS_FLOW = {
  'unfulfilled': ['processing', 'cancelled'],
  'processing': ['ready_to_ship', 'cancelled'],
  'ready_to_ship': ['shipped', 'cancelled'],
  'shipped': ['out_for_delivery', 'delivered', 'returned'],
  'out_for_delivery': ['delivered', 'delivery_failed'],
  'delivered': ['returned'],
  'delivery_failed': ['shipped', 'returned', 'cancelled'],
  'returned': ['refunded'],
  'cancelled': [],
  'refunded': []
};

const SHIPPING_CARRIERS = {
  'yamato': {
    name: 'ヤマト運輸',
    trackingUrlTemplate: 'https://toi.kuronekoyamato.co.jp/cgi-bin/tneko?init&q={tracking}',
    estimatedDays: { standard: 2, express: 1 }
  },
  'sagawa': {
    name: '佐川急便',
    trackingUrlTemplate: 'https://k2k.sagawa-exp.co.jp/p/web/okurijosearch.do?okurijoNo={tracking}',
    estimatedDays: { standard: 3, express: 1 }
  },
  'jppost': {
    name: '日本郵便',
    trackingUrlTemplate: 'https://trackings.post.japanpost.jp/services/srv/search/?requestNo1={tracking}',
    estimatedDays: { standard: 3, express: 2 }
  }
};

interface ShippingEvent {
  timestamp: string;
  status: string;
  description: string;
  location?: string;
  carrierStatus?: string;
  performedBy?: string;
}

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
  lastShippingUpdate?: string;
  shippingHistory?: ShippingEvent[];
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
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [trackingInfo, setTrackingInfo] = useState({
    trackingNumber: '',
    shippingCarrier: 'yamato',
    description: '',
    location: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFulfillmentData();
  }, [selectedStatus]);

  const fetchFulfillmentData = async () => {
    const url = selectedStatus === 'all' 
      ? '/api/admin/orders'
      : `/api/admin/orders?status=${selectedStatus}`;
    
    const response = await fetch(url);
    const data = await response.json();
    const ordersData = data.orders || [];
    
    // 統計を計算
    const statsData = {
      unfulfilled: ordersData.filter((o: Order) => o.fulfillmentStatus === 'unfulfilled').length,
      processing: ordersData.filter((o: Order) => o.fulfillmentStatus === 'processing').length,
      ready_to_ship: ordersData.filter((o: Order) => o.fulfillmentStatus === 'ready_to_ship').length,
      shipped: ordersData.filter((o: Order) => o.fulfillmentStatus === 'shipped').length,
      out_for_delivery: ordersData.filter((o: Order) => o.fulfillmentStatus === 'out_for_delivery').length,
      delivered: ordersData.filter((o: Order) => o.fulfillmentStatus === 'delivered').length,
      delivery_failed: ordersData.filter((o: Order) => o.fulfillmentStatus === 'delivery_failed').length,
      returned: ordersData.filter((o: Order) => o.fulfillmentStatus === 'returned').length,
    };
    
    setOrders(ordersData);
    setStats(statsData);
  };

  const updateFulfillmentStatus = async () => {
    if (!selectedOrder || !newStatus) return;
    
    setLoading(true);
    const response = await fetch(`/api/admin/orders/${selectedOrder.id}/fulfillment`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: newStatus,
        trackingNumber: trackingInfo.trackingNumber,
        carrier: trackingInfo.shippingCarrier,
        description: trackingInfo.description,
        location: trackingInfo.location
      })
    });

    if (response.ok) {
      setShowUpdateModal(false);
      setSelectedOrder(null);
      setNewStatus('');
      setTrackingInfo({ trackingNumber: '', shippingCarrier: 'yamato', description: '', location: '' });
      fetchFulfillmentData();
    }
    setLoading(false);
  };

  const runBatchUpdate = async () => {
    setLoading(true);
    const response = await fetch('/api/admin/shipping/batch', { method: 'POST' });
    if (response.ok) {
      fetchFulfillmentData();
    }
    setLoading(false);
  };

  const getAvailableStatuses = (currentStatus: string) => {
    return FULFILLMENT_STATUS_FLOW[currentStatus as keyof typeof FULFILLMENT_STATUS_FLOW] || [];
  };

  const formatAddress = (address: any) => {
    if (!address) return '住所未設定';
    return `〒${address.postal_code} ${address.state || ''}${address.city}${address.line1}${address.line2 || ''}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">配送管理</h1>
          <div className="flex gap-2">
            <button 
              onClick={runBatchUpdate}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              ステータス自動更新
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2">
              <Download className="w-4 h-4" />
              配送ラベル一括印刷
            </button>
          </div>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-600">未処理</span>
              <Package className="w-4 h-4 text-gray-400" />
            </div>
            <div className="text-xl font-bold">{stats.unfulfilled || 0}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-600">処理中</span>
              <Clock className="w-4 h-4 text-gray-400" />
            </div>
            <div className="text-xl font-bold">{stats.processing || 0}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-600">発送準備</span>
              <Package className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-xl font-bold">{stats.ready_to_ship || 0}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-600">発送済み</span>
              <Truck className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-xl font-bold">{stats.shipped || 0}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-600">配達中</span>
              <Truck className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-xl font-bold">{stats.out_for_delivery || 0}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-600">配達完了</span>
              <CheckCircle className="w-4 h-4 text-green-400" />
            </div>
            <div className="text-xl font-bold">{stats.delivered || 0}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-600">配達失敗</span>
              <AlertCircle className="w-4 h-4 text-red-400" />
            </div>
            <div className="text-xl font-bold">{stats.delivery_failed || 0}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-600">返品</span>
              <Package className="w-4 h-4 text-orange-400" />
            </div>
            <div className="text-xl font-bold">{stats.returned || 0}</div>
          </div>
        </div>

        {/* フィルター */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">ステータス:</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedStatus('all')}
                className={`px-3 py-1 rounded text-sm ${
                  selectedStatus === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                全て
              </button>
              {Object.keys(FULFILLMENT_STATUS_DETAILS).map(status => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-3 py-1 rounded text-sm ${
                    selectedStatus === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {FULFILLMENT_STATUS_DETAILS[status as keyof typeof FULFILLMENT_STATUS_DETAILS].label}
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">追跡情報</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">アクション</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map(order => {
                const statusInfo = FULFILLMENT_STATUS_DETAILS[order.fulfillmentStatus as keyof typeof FULFILLMENT_STATUS_DETAILS];
                return (
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
                      {statusInfo && (
                        <span className={`px-2 py-1 text-xs rounded-full bg-${statusInfo.color}-100 text-${statusInfo.color}-800`}>
                          {statusInfo.label}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {order.trackingNumber ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            {order.shippingCarrier && SHIPPING_CARRIERS[order.shippingCarrier as keyof typeof SHIPPING_CARRIERS] && (
                              <span className="text-sm font-medium">
                                {SHIPPING_CARRIERS[order.shippingCarrier as keyof typeof SHIPPING_CARRIERS].name}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-600">{order.trackingNumber}</span>
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
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowHistoryModal(true);
                          }}
                          className="text-gray-600 hover:text-gray-800"
                          title="配送履歴"
                        >
                          <History className="w-4 h-4" />
                        </button>
                        {getAvailableStatuses(order.fulfillmentStatus).length > 0 && (
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setNewStatus(getAvailableStatuses(order.fulfillmentStatus)[0]);
                              setShowUpdateModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-800"
                            title="ステータス更新"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ステータス更新モーダル */}
        {showUpdateModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">配送ステータス更新</h2>
                <button
                  onClick={() => {
                    setShowUpdateModal(false);
                    setSelectedOrder(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    注文番号: {selectedOrder.orderNumber}
                  </label>
                  <div className="text-sm text-gray-600">
                    現在のステータス: {FULFILLMENT_STATUS_DETAILS[selectedOrder.fulfillmentStatus as keyof typeof FULFILLMENT_STATUS_DETAILS]?.label}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    新しいステータス
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  >
                    {getAvailableStatuses(selectedOrder.fulfillmentStatus).map(status => (
                      <option key={status} value={status}>
                        {FULFILLMENT_STATUS_DETAILS[status as keyof typeof FULFILLMENT_STATUS_DETAILS]?.label}
                      </option>
                    ))}
                  </select>
                </div>

                {newStatus === 'shipped' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        配送業者
                      </label>
                      <select
                        value={trackingInfo.shippingCarrier}
                        onChange={(e) => setTrackingInfo({ ...trackingInfo, shippingCarrier: e.target.value })}
                        className="w-full border rounded px-3 py-2"
                      >
                        {Object.entries(SHIPPING_CARRIERS).map(([key, carrier]) => (
                          <option key={key} value={key}>
                            {carrier.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        追跡番号（省略可）
                      </label>
                      <input
                        type="text"
                        value={trackingInfo.trackingNumber}
                        onChange={(e) => setTrackingInfo({ ...trackingInfo, trackingNumber: e.target.value })}
                        className="w-full border rounded px-3 py-2"
                        placeholder="自動生成されます"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    説明（省略可）
                  </label>
                  <input
                    type="text"
                    value={trackingInfo.description}
                    onChange={(e) => setTrackingInfo({ ...trackingInfo, description: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    placeholder="例：商品の梱包が完了しました"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    場所（省略可）
                  </label>
                  <input
                    type="text"
                    value={trackingInfo.location}
                    onChange={(e) => setTrackingInfo({ ...trackingInfo, location: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    placeholder="例：東京配送センター"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={updateFulfillmentStatus}
                  disabled={loading || !newStatus}
                  className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {loading ? '更新中...' : 'ステータスを更新'}
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

        {/* 配送履歴モーダル */}
        {showHistoryModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">配送履歴 - {selectedOrder.orderNumber}</h2>
                <button
                  onClick={() => {
                    setShowHistoryModal(false);
                    setSelectedOrder(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {selectedOrder.shippingHistory && selectedOrder.shippingHistory.length > 0 ? (
                  <div className="relative">
                    <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                    {selectedOrder.shippingHistory.map((event, index) => {
                      const statusInfo = FULFILLMENT_STATUS_DETAILS[event.status as keyof typeof FULFILLMENT_STATUS_DETAILS];
                      return (
                        <div key={index} className="relative flex items-start mb-6">
                          <div className="absolute left-8 w-4 h-4 bg-white border-2 border-blue-600 rounded-full -translate-x-1/2"></div>
                          <div className="ml-16 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {statusInfo && (
                                <span className="font-medium">{statusInfo.label}</span>
                              )}
                            </div>
                            <div className="text-sm text-gray-600">{event.description}</div>
                            <div className="flex gap-4 mt-1 text-xs text-gray-500">
                              <span>{formatDate(event.timestamp)}</span>
                              {event.location && <span>場所: {event.location}</span>}
                              {event.performedBy && <span>担当: {event.performedBy}</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    配送履歴がありません
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t">
                <button
                  onClick={() => {
                    setShowHistoryModal(false);
                    setSelectedOrder(null);
                  }}
                  className="w-full bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}