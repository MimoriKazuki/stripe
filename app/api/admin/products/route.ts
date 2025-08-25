import { NextResponse } from 'next/server';
import { getProducts, createProduct } from '@/lib/db';

export async function GET() {
  const products = await getProducts();
  return NextResponse.json(products);
}

export async function POST(req: Request) {
  const body = await req.json();
  const product = await createProduct(body);
  return NextResponse.json(product);
}