import { NextRequest, NextResponse } from 'next/server';
import { updateProduct, getProduct } from '@/lib/db';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const success = await updateProduct(params.id, body);
  
  if (success) {
    const product = await getProduct(params.id);
    return NextResponse.json(product);
  }
  
  return NextResponse.json({ error: 'Product not found' }, { status: 404 });
}