import { NextResponse } from 'next/server';
import { getProducts, createProduct, updateProduct } from '@/lib/db';
import { createStripeProduct, updateStripeProduct } from '@/lib/stripe-products';

export async function GET() {
  const products = await getProducts();
  return NextResponse.json(products);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Stripeに商品を作成
    let stripeIds: { stripeProductId?: string; stripePriceId?: string } = {};
    if (process.env.STRIPE_SECRET_KEY) {
      try {
        const stripeResult = await createStripeProduct({
          name: body.name,
          description: body.description,
          price: body.price,
          image: body.image,
          active: body.active !== false
        });
        stripeIds = {
          stripeProductId: stripeResult.productId,
          stripePriceId: stripeResult.priceId
        };
        console.log('Stripe商品作成成功:', stripeIds);
      } catch (stripeError) {
        console.error('Stripe商品作成エラー（続行）:', stripeError);
        // Stripeエラーがあってもローカル商品は作成する
      }
    }
    
    // ローカルDBに商品を作成
    const product = await createProduct({
      ...body,
      ...stripeIds
    });
    
    return NextResponse.json({
      ...product,
      stripeSync: !!stripeIds.stripeProductId
    });
  } catch (error) {
    console.error('商品作成エラー:', error);
    return NextResponse.json(
      { error: '商品の作成に失敗しました' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;
    
    // 既存の商品を取得
    const products = await getProducts();
    const existingProduct = products.find(p => p.id === id);
    
    if (!existingProduct) {
      return NextResponse.json(
        { error: '商品が見つかりません' },
        { status: 404 }
      );
    }
    
    // Stripeの商品を更新
    let newStripeIds = {};
    if (process.env.STRIPE_SECRET_KEY && existingProduct.stripeProductId) {
      try {
        const result = await updateStripeProduct(
          existingProduct.stripeProductId,
          existingProduct.stripePriceId!,
          {
            name: updates.name,
            description: updates.description,
            price: updates.price,
            image: updates.image,
            active: updates.active
          }
        );
        if (result.priceId !== existingProduct.stripePriceId) {
          newStripeIds = { stripePriceId: result.priceId };
        }
        console.log('Stripe商品更新成功');
      } catch (stripeError) {
        console.error('Stripe商品更新エラー（続行）:', stripeError);
      }
    }
    
    // ローカルDBの商品を更新
    const success = await updateProduct(id, {
      ...updates,
      ...newStripeIds
    });
    
    if (success) {
      const updatedProducts = await getProducts();
      const updatedProduct = updatedProducts.find(p => p.id === id);
      return NextResponse.json({
        ...updatedProduct,
        stripeSync: !!existingProduct.stripeProductId
      });
    } else {
      return NextResponse.json(
        { error: '商品の更新に失敗しました' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('商品更新エラー:', error);
    return NextResponse.json(
      { error: '商品の更新に失敗しました' },
      { status: 500 }
    );
  }
}