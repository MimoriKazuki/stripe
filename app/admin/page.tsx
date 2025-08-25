'use client';

import { useState, useEffect } from 'react';
import AdminLayout from './components/AdminLayout';
import { Package, ShoppingCart, TrendingUp, DollarSign } from 'lucide-react';

interface Stats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  lowStockProducts: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    lowStockProducts: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const statCards = [
    {
      title: '総商品数',
      value: stats.totalProducts,
      icon: Package,
      color: 'bg-blue-500',
    },
    {
      title: '総注文数',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'bg-green-500',
    },
    {
      title: '総売上',
      value: `¥${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-purple-500',
    },
    {
      title: '在庫少商品',
      value: stats.lowStockProducts,
      icon: TrendingUp,
      color: 'bg-yellow-500',
    },
  ];

  return (
    <AdminLayout>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-gray-600 text-sm mb-1">{card.title}</h3>
              <p className="text-2xl font-bold text-gray-800">{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* 最近の注文 */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">最近の注文</h3>
        </div>
        <div className="p-6">
          <p className="text-gray-500">注文データが表示されます</p>
        </div>
      </div>
    </AdminLayout>
  );
}