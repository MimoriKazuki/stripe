'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Package, ShoppingCart, BarChart3, LogOut, Home, Users, Truck, ExternalLink } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  const menuItems = [
    { href: '/admin', icon: Home, label: 'ダッシュボード' },
    { href: '/admin/products', icon: Package, label: '商品管理' },
    { href: '/admin/orders', icon: ShoppingCart, label: '注文管理' },
    { href: '/admin/fulfillment', icon: Truck, label: '配送管理' },
    { href: '/admin/customers', icon: Users, label: '顧客管理' },
    { href: '/admin/analytics', icon: BarChart3, label: '売上分析' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* サイドバー - 固定位置 */}
      <div className="w-64 bg-gray-900 text-white fixed h-full z-10">
        <div className="p-6">
          <h1 className="text-2xl font-bold">管理画面</h1>
        </div>
        
        <nav className="mt-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-6 py-3 hover:bg-gray-800 transition-colors ${
                  isActive ? 'bg-gray-800 border-l-4 border-blue-500' : ''
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="absolute bottom-0 w-64 p-6 space-y-4">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors"
          >
            <ExternalLink size={20} />
            <span>ストアを表示</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors"
          >
            <LogOut size={20} />
            <span>ログアウト</span>
          </button>
        </div>
      </div>
      
      {/* メインコンテンツ - サイドバー分の余白を追加 */}
      <div className="flex-1 ml-64">
        <div className="bg-white shadow-sm sticky top-0 z-5">
          <div className="px-8 py-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {pathname === '/admin' && 'ダッシュボード'}
              {pathname === '/admin/products' && '商品管理'}
              {pathname === '/admin/orders' && '注文管理'}
              {pathname === '/admin/fulfillment' && '配送管理'}
              {pathname === '/admin/customers' && '顧客管理'}
              {pathname === '/admin/analytics' && '売上分析'}
            </h2>
          </div>
        </div>
        
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
}