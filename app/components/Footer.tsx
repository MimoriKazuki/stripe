import Link from 'next/link';
import { ShoppingBag, Shield, CreditCard, Mail, Github, Lock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ShoppingBag className="h-6 w-6 text-purple-400" />
              <span className="text-xl font-bold">STRIPE EC STORE</span>
            </div>
            <p className="text-gray-400 text-sm">
              Stripeを使用した安全で簡単なオンラインショッピング
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-3 text-purple-400">ショップ</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition">新着商品</a></li>
              <li><a href="#" className="hover:text-white transition">人気商品</a></li>
              <li><a href="#" className="hover:text-white transition">セール</a></li>
              <li><a href="#" className="hover:text-white transition">全商品</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3 text-purple-400">サポート</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition">配送について</a></li>
              <li><a href="#" className="hover:text-white transition">返品・交換</a></li>
              <li><a href="#" className="hover:text-white transition">お支払い方法</a></li>
              <li><a href="#" className="hover:text-white transition">よくある質問</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3 text-purple-400">会社情報</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition">会社概要</a></li>
              <li><a href="#" className="hover:text-white transition">利用規約</a></li>
              <li><a href="#" className="hover:text-white transition">プライバシーポリシー</a></li>
              <li><a href="#" className="hover:text-white transition">特定商取引法</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Shield className="h-4 w-4" />
                <span>SSL暗号化通信</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <CreditCard className="h-4 w-4" />
                <span>Stripe決済</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Mail className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-800">
            <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 text-yellow-400">
                  <Shield className="h-4 w-4" />
                  <span className="text-sm font-semibold">テスト環境</span>
                </div>
                <p className="text-xs text-yellow-400/80">
                  このサイトはStripeテスト環境で動作しています。実際の決済は行われません。
                </p>
                <Link 
                  href="/admin" 
                  className="flex items-center gap-1 px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded-md transition"
                >
                  <Lock className="h-3 w-3" />
                  管理画面
                </Link>
              </div>
            </div>
          </div>

          <div className="text-center mt-6">
            <p className="text-xs text-gray-500">
              © 2024 STRIPE EC STORE. All rights reserved. | Powered by Next.js & Stripe
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}