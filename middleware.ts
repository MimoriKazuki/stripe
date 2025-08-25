import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_PASSWORD = 'admin123'; // 本番環境では環境変数を使用

export function middleware(request: NextRequest) {
  // /admin パスへのアクセスをチェック
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const authHeader = request.headers.get('authorization');
    const sessionCookie = request.cookies.get('admin-session');
    
    // APIルートの場合
    if (request.nextUrl.pathname.startsWith('/admin/api')) {
      if (authHeader !== `Bearer ${ADMIN_PASSWORD}` && sessionCookie?.value !== ADMIN_PASSWORD) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }
    
    // 管理画面ページの場合
    if (!request.nextUrl.pathname.includes('/login') && sessionCookie?.value !== ADMIN_PASSWORD) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*']
};