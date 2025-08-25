'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Home, Package } from 'lucide-react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    setTimeout(() => setIsAnimating(false), 500);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className={`bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all duration-500 ${
        isAnimating ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
      }`}>
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            決済が完了しました！
          </h1>
          
          <p className="text-gray-600 mb-6">
            ご購入ありがとうございます。
            <br />
            確認メールをお送りしました。
          </p>

          {sessionId && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-500">注文番号</p>
              <p className="font-mono text-sm text-gray-700 break-all">
                {sessionId.substring(0, 20)}...
              </p>
            </div>
          )}

          <div className="space-y-3">
            <Link href="/" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2">
              <Home size={20} />
              ショップに戻る
            </Link>
            
            <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2">
              <Package size={20} />
              注文履歴を見る
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Success() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4 animate-pulse">
              <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto animate-pulse"></div>
          </div>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}