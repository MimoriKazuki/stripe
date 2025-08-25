import { NextResponse } from 'next/server';
import { getOrders } from '@/lib/db';

export async function GET() {
  const orders = await getOrders();
  // 新しい順に並べ替え
  orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return NextResponse.json(orders);
}