'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  ComposedChart
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Package, 
  Users,
  Percent,
  Target,
  UserCheck,
  AlertCircle,
  Calendar,
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface AnalyticsData {
  summary: {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    totalCost: number;
    totalProfit: number;
    profitMargin: number;
    revenueGrowth: number;
    orderGrowth: number;
    profitGrowth: number;
    period: string;
    conversionRate: number;
    repeatRate: number;
    totalCustomers: number;
    repeatCustomers: number;
    cartAbandonment: number;
    estimatedLTV: number;
  };
  chartData: Array<{
    date: string;
    sales: number;
    profit: number;
    orders: number;
  }>;
  topProducts: Array<{
    id: string;
    name: string;
    quantity: number;
    revenue: number;
    cost: number;
    profit: number;
    profitMargin: number;
    averagePrice: number;
  }>;
  hourlyData: Array<{
    hour: number;
    orders: number;
    revenue: number;
  }>;
  weekdayData: Array<{
    day: string;
    orders: number;
    revenue: number;
    averageOrderValue: number;
  }>;
  periodLabel: string;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [period, setPeriod] = useState('7d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/analytics?period=${period}`);
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const formatPercent = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-500">読み込み中...</div>
        </div>
      </AdminLayout>
    );
  }

  if (!analyticsData) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-500">データの取得に失敗しました</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* ヘッダーと期間選択 */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">売上分析レポート</h1>
          <div className="flex gap-2">
            {[
              { value: '24h', label: '24時間' },
              { value: '7d', label: '7日間' },
              { value: '30d', label: '30日間' },
              { value: '90d', label: '90日間' },
              { value: '1y', label: '1年間' }
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setPeriod(value)}
                className={`px-4 py-2 rounded ${
                  period === value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* 主要KPIセクション */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">主要パフォーマンス指標</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">総売上</span>
                <DollarSign className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-2xl font-bold">{formatCurrency(analyticsData.summary.totalRevenue)}</div>
              <div className={`text-sm mt-1 flex items-center gap-1 ${
                analyticsData.summary.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {analyticsData.summary.revenueGrowth >= 0 ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                {formatPercent(analyticsData.summary.revenueGrowth)}
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">純利益</span>
                <TrendingUp className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-2xl font-bold">{formatCurrency(analyticsData.summary.totalProfit)}</div>
              <div className="text-sm text-gray-500 mt-1">
                利益率: {analyticsData.summary.profitMargin}%
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">注文数</span>
                <ShoppingCart className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-2xl font-bold">{analyticsData.summary.totalOrders}件</div>
              <div className={`text-sm mt-1 flex items-center gap-1 ${
                analyticsData.summary.orderGrowth >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {analyticsData.summary.orderGrowth >= 0 ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                {formatPercent(analyticsData.summary.orderGrowth)}
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">平均注文額</span>
                <Target className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-2xl font-bold">{formatCurrency(analyticsData.summary.averageOrderValue)}</div>
              <div className="text-sm text-gray-500 mt-1">
                LTV予測: {formatCurrency(analyticsData.summary.estimatedLTV)}
              </div>
            </div>
          </div>
        </div>

        {/* マーケティング指標 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">マーケティング指標</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">コンバージョン率</span>
                <Percent className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-2xl font-bold">{analyticsData.summary.conversionRate}%</div>
              <div className="text-sm text-gray-500 mt-1">業界平均: 2-3%</div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">リピート率</span>
                <UserCheck className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-2xl font-bold">{analyticsData.summary.repeatRate}%</div>
              <div className="text-sm text-gray-500 mt-1">
                {analyticsData.summary.repeatCustomers}/{analyticsData.summary.totalCustomers}人
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">カート放棄率</span>
                <AlertCircle className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-2xl font-bold">{analyticsData.summary.cartAbandonment}%</div>
              <div className="text-sm text-gray-500 mt-1">業界平均: 70%</div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">顧客数</span>
                <Users className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-2xl font-bold">{analyticsData.summary.totalCustomers}人</div>
              <div className="text-sm text-gray-500 mt-1">
                新規: {analyticsData.summary.totalCustomers - analyticsData.summary.repeatCustomers}人
              </div>
            </div>
          </div>
        </div>

        {/* 売上・利益推移チャート */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">売上・利益推移</h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analyticsData.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={formatDate} />
                <YAxis tickFormatter={(value) => `¥${(value/1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stackId="1"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.6}
                  name="売上"
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  stackId="2"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.6}
                  name="利益"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">注文数推移</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={formatDate} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  dot={{ fill: '#8B5CF6' }}
                  name="注文数"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 曜日別分析 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">曜日別パフォーマンス</h2>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={analyticsData.weekdayData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip formatter={(value: number, name: string) => {
                if (name === '売上' || name === '平均注文額') return formatCurrency(value);
                return `${value}件`;
              }} />
              <Legend />
              <Bar yAxisId="left" dataKey="orders" fill="#3B82F6" name="注文数" />
              <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#10B981" name="売上" />
              <Line yAxisId="right" type="monotone" dataKey="averageOrderValue" stroke="#F59E0B" name="平均注文額" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* 商品分析 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">商品別売上ランキング</h2>
            <div className="space-y-3">
              {analyticsData.topProducts.map((product, index) => (
                <div key={product.id} className="border-b pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                        <span className="font-medium">{product.name}</span>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        販売数: {product.quantity}個 | 平均単価: {formatCurrency(product.averagePrice)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(product.revenue)}</div>
                      <div className="text-sm text-green-600">
                        利益: {formatCurrency(product.profit)} ({product.profitMargin.toFixed(0)}%)
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">売上構成比</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={analyticsData.topProducts}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="revenue"
                >
                  {analyticsData.topProducts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 時間帯別分析 */}
        {analyticsData.hourlyData.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">時間帯別売上分析</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.hourlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" tickFormatter={(hour) => `${hour}時`} />
                <YAxis yAxisId="left" orientation="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip formatter={(value: number, name: string) => {
                  if (name === '売上') return formatCurrency(value);
                  return `${value}件`;
                }} />
                <Legend />
                <Bar yAxisId="left" dataKey="orders" fill="#3B82F6" name="注文数" />
                <Bar yAxisId="right" dataKey="revenue" fill="#10B981" name="売上" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* 改善提案 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">改善提案</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analyticsData.summary.conversionRate < 2 && (
              <div className="border-l-4 border-yellow-500 pl-4">
                <h3 className="font-medium text-gray-900">コンバージョン率の改善</h3>
                <p className="text-sm text-gray-600 mt-1">
                  現在のCVR {analyticsData.summary.conversionRate}%は業界平均を下回っています。
                  商品ページの改善、チェックアウトフローの簡素化を検討してください。
                </p>
              </div>
            )}
            
            {analyticsData.summary.repeatRate < 20 && (
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-medium text-gray-900">リピート率の向上</h3>
                <p className="text-sm text-gray-600 mt-1">
                  リピート率 {analyticsData.summary.repeatRate}%は改善の余地があります。
                  メールマーケティングやロイヤリティプログラムの導入を検討してください。
                </p>
              </div>
            )}
            
            {analyticsData.summary.averageOrderValue < 5000 && (
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-medium text-gray-900">平均注文額の向上</h3>
                <p className="text-sm text-gray-600 mt-1">
                  クロスセル・アップセル施策、まとめ買い割引、送料無料の閾値設定などで
                  平均注文額の向上を図りましょう。
                </p>
              </div>
            )}
            
            {analyticsData.summary.cartAbandonment > 70 && (
              <div className="border-l-4 border-red-500 pl-4">
                <h3 className="font-medium text-gray-900">カート放棄率の削減</h3>
                <p className="text-sm text-gray-600 mt-1">
                  カート放棄率が高めです。送料の明確化、ゲストチェックアウトの導入、
                  信頼性バッジの表示などを検討してください。
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}