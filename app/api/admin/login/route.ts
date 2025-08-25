import { NextRequest, NextResponse } from 'next/server';

const ADMIN_PASSWORD = 'admin123'; // 本番環境では環境変数を使用

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  
  if (password === ADMIN_PASSWORD) {
    const response = NextResponse.json({ success: true });
    response.cookies.set('admin-session', ADMIN_PASSWORD, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24時間
    });
    return response;
  }
  
  return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
}