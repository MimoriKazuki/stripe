import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { CartItem } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    // Stripeキーの確認
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('あなたの')) {
      console.error('Stripe secret key is not configured');
      return NextResponse.json(
        { error: 'Stripe configuration error: Please set your Stripe secret key in .env.local' },
        { status: 500 }
      );
    }

    const { items } = await req.json() as { items: CartItem[] };

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'No items in cart' },
        { status: 400 }
      );
    }

    console.log('Creating checkout session for items:', items);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map((item) => ({
        price_data: {
          currency: item.currency,
          product_data: {
            name: item.name,
            description: item.description,
            images: [item.image],
            metadata: {
              productId: item.id, // 商品IDをメタデータに追加
            },
          },
          unit_amount: item.price,
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}`,
      metadata: {
        items: JSON.stringify(items.map(i => ({ id: i.id, quantity: i.quantity }))),
      },
      // 顧客情報の収集設定
      billing_address_collection: 'required', // 請求先住所を必須にする
      shipping_address_collection: {
        allowed_countries: ['JP'], // 日本への配送のみ許可
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 0,
              currency: 'jpy',
            },
            display_name: '通常配送',
            delivery_estimate: {
              minimum: {
                unit: 'business_day',
                value: 3,
              },
              maximum: {
                unit: 'business_day',
                value: 7,
              },
            },
          },
        },
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 500,
              currency: 'jpy',
            },
            display_name: 'お急ぎ便',
            delivery_estimate: {
              minimum: {
                unit: 'business_day',
                value: 1,
              },
              maximum: {
                unit: 'business_day',
                value: 2,
              },
            },
          },
        },
      ],
      customer_creation: 'always', // 常に顧客を作成
      phone_number_collection: {
        enabled: true, // 電話番号の収集を有効化
      },
    });

    console.log('Checkout session created:', session.id);
    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe error details:', {
      message: error.message,
      type: error.type,
      statusCode: error.statusCode,
      raw: error
    });
    
    let errorMessage = 'Error creating checkout session';
    if (error.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}