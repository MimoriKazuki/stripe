import { NextResponse } from 'next/server';
import { getProducts, getOrders } from '@/lib/db';

export async function GET() {
  const products = await getProducts();
  const orders = await getOrders();
  
  const stats = {
    totalProducts: products.length,
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
    lowStockProducts: products.filter(p => p.stock < 10).length,
  };
  
  return NextResponse.json(stats);
}