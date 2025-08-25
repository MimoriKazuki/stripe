'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { 
  Users, 
  Search, 
  Mail, 
  Phone, 
  MapPin, 
  ShoppingBag,
  TrendingUp,
  Calendar,
  DollarSign,
  UserPlus,
  Award,
  Filter,
  Download,
  MoreVertical
} from 'lucide-react';

interface Customer {
  id: string;
  email: string;
  name: string;
  phone?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
  averageOrderValue: number;
  createdAt: string;
  tags?: string[];
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState<any>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, [searchTerm]);

  const fetchCustomers = async () => {
    const url = searchTerm 
      ? `/api/admin/customers?search=${encodeURIComponent(searchTerm)}`
      : '/api/admin/customers';
    
    const response = await fetch(url);
    const data = await response.json();
    setCustomers(data.customers || []);
    setStats(data.stats || {});
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0
    }).format(value);
  };

  const getCustomerSegment = (customer: Customer) => {
    if (customer.totalOrders === 0) return { label: '新規', color: 'bg-gray-100 text-gray-800' };
    if (customer.totalOrders === 1) return { label: '初回購入', color: 'bg-blue-100 text-blue-800' };
    if (customer.totalOrders <= 3) return { label: 'リピーター', color: 'bg-green-100 text-green-800' };
    if (customer.totalSpent > 50000) return { label: 'VIP', color: 'bg-purple-100 text-purple-800' };
    return { label: '常連', color: 'bg-yellow-100 text-yellow-800' };
  };

  const getDaysSinceLastOrder = (lastOrderDate?: string) => {
    if (!lastOrderDate) return null;
    const last = new Date(lastOrderDate);
    const now = new Date();
    const diff = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">顧客管理</h1>
          <div className="flex gap-2">
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2">
              <Download className="w-4 h-4" />
              CSVエクスポート
            </button>
            <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              顧客を追加
            </button>
          </div>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">総顧客数</span>
              <Users className="w-4 h-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold">{stats.totalCustomers || 0}人</div>
            <div className="text-sm text-green-600 mt-1">
              今月 +{stats.newCustomersThisMonth || 0}人
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">リピーター</span>
              <Award className="w-4 h-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold">{stats.repeatCustomers || 0}人</div>
            <div className="text-sm text-gray-500 mt-1">
              リピート率 {stats.totalCustomers > 0 ? ((stats.repeatCustomers / stats.totalCustomers) * 100).toFixed(1) : 0}%
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">平均LTV</span>
              <DollarSign className="w-4 h-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold">{formatCurrency(stats.averageLifetimeValue || 0)}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">成長率</span>
              <TrendingUp className="w-4 h-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-green-600">+12.5%</div>
            <div className="text-sm text-gray-500 mt-1">前月比</div>
          </div>
        </div>

        {/* 検索バー */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="名前、メール、電話番号で検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
              <Filter className="w-4 h-4" />
              フィルター
            </button>
          </div>
        </div>

        {/* 顧客リスト */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">顧客</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">セグメント</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">注文数</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">総購入額</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">平均単価</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">最終購入</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">アクション</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {customers.map(customer => {
                const segment = getCustomerSegment(customer);
                const daysSince = getDaysSinceLastOrder(customer.lastOrderDate);
                
                return (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{customer.name || '名前未設定'}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                          <Mail className="w-3 h-3" />
                          {customer.email}
                        </div>
                        {customer.phone && (
                          <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                            <Phone className="w-3 h-3" />
                            {customer.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${segment.color}`}>
                        {segment.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <ShoppingBag className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{customer.totalOrders}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(customer.totalSpent)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {formatCurrency(customer.averageOrderValue)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {customer.lastOrderDate ? (
                        <div>
                          <div className="text-sm text-gray-900">
                            {new Date(customer.lastOrderDate).toLocaleDateString('ja-JP')}
                          </div>
                          {daysSince !== null && (
                            <div className="text-xs text-gray-500">
                              {daysSince === 0 ? '今日' : `${daysSince}日前`}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setShowDetails(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          詳細
                        </button>
                        <button className="text-gray-400 hover:text-gray-600">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 顧客詳細モーダル */}
        {showDetails && selectedCustomer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold">{selectedCustomer.name || '顧客詳細'}</h2>
                  <p className="text-sm text-gray-600">{selectedCustomer.email}</p>
                </div>
                <button
                  onClick={() => {
                    setShowDetails(false);
                    setSelectedCustomer(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">購買情報</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">総注文数:</span>
                      <span className="font-medium">{selectedCustomer.totalOrders}件</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">総購入額:</span>
                      <span className="font-medium">{formatCurrency(selectedCustomer.totalSpent)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">平均注文額:</span>
                      <span className="font-medium">{formatCurrency(selectedCustomer.averageOrderValue)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">顧客情報</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">登録日:</span>
                      <span className="font-medium">
                        {new Date(selectedCustomer.createdAt).toLocaleDateString('ja-JP')}
                      </span>
                    </div>
                    {selectedCustomer.lastOrderDate && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">最終購入日:</span>
                        <span className="font-medium">
                          {new Date(selectedCustomer.lastOrderDate).toLocaleDateString('ja-JP')}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">セグメント:</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getCustomerSegment(selectedCustomer).color}`}>
                        {getCustomerSegment(selectedCustomer).label}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <button className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                  メールを送信
                </button>
                <button className="flex-1 bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300">
                  注文履歴を表示
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}