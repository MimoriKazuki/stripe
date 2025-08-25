import { NextResponse } from 'next/server';
import { getActiveProducts } from '@/lib/db';

export async function GET() {
  // データベースから在庫がある有効な商品のみ取得
  const products = await getActiveProducts();
  
  // フロントエンド用の形式に変換
  const frontendProducts = products.map(product => ({
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    image: product.image,
    currency: product.currency,
  }));
  
  return NextResponse.json(frontendProducts);
}