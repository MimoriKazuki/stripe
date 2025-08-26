import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createOrder, decrementStock, getOrderBySessionId, updateOrder } from '@/lib/db';
import { sendEmail, generateOrderConfirmationEmail } from '@/lib/email';
import Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    // Webhookシークレットが設定されていない場合は、ボディをそのまま使用（開発用）
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      event = JSON.parse(body);
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // checkout.session.completed イベントを処理
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    try {
      // 既存の注文を確認
      const existingOrder = await getOrderBySessionId(session.id);
      if (existingOrder) {
        console.log('Order already processed:', session.id);
        return NextResponse.json({ received: true });
      }

      // メタデータから商品情報を取得
      const itemsMetadata = session.metadata?.items;
      let orderItems: any[] = [];
      
      if (itemsMetadata) {
        // メタデータから商品情報を復元
        const items = JSON.parse(itemsMetadata);
        
        for (const item of items) {
          // 在庫を減らす
          const success = await decrementStock(item.id, item.quantity);
          if (!success) {
            console.error(`Failed to decrement stock for product ${item.id}`);
          }
        }
        
        // セッションの詳細を取得して注文アイテムを作成
        const sessionWithLineItems = await stripe.checkout.sessions.retrieve(
          session.id,
          {
            expand: ['line_items'],
          }
        );
        
        const lineItems = sessionWithLineItems.line_items?.data || [];
        orderItems = lineItems.map((lineItem: any, index: number) => ({
          productId: items[index]?.id || 'unknown',
          productName: lineItem.description || '',
          quantity: lineItem.quantity || 1,
          price: lineItem.amount_total || 0,
        }));
      }

      // 顧客情報の詳細を取得
      const sessionWithDetails = await stripe.checkout.sessions.retrieve(
        session.id,
        {
          expand: ['customer', 'shipping_details', 'customer_details', 'shipping_cost'],
        }
      );
      
      // 顧客情報を整形
      const customerDetails = sessionWithDetails.customer_details;
      const shippingDetails = sessionWithDetails.shipping_details;
      const shippingCost = sessionWithDetails.shipping_cost;
      
      // 顧客情報を自動登録/更新
      if (customerDetails?.email || session.customer_email) {
        const { createOrUpdateCustomer } = await import('@/lib/db');
        const customerEmail = customerDetails?.email || session.customer_email || '';
        const customerName = customerDetails?.name || shippingDetails?.name || '';
        
        // 既存顧客の取得または新規作成
        const addresses = [];
        if (shippingDetails?.address) {
          addresses.push({
            type: 'shipping' as const,
            line1: shippingDetails.address.line1 || '',
            line2: shippingDetails.address.line2 || undefined,
            city: shippingDetails.address.city || '',
            state: shippingDetails.address.state || undefined,
            postal_code: shippingDetails.address.postal_code || '',
            country: shippingDetails.address.country || 'JP',
            isDefault: true
          });
        }
        
        await createOrUpdateCustomer({
          email: customerEmail,
          name: customerName,
          phone: customerDetails?.phone || undefined,
          addresses: addresses.length > 0 ? addresses : undefined,
        });
        
        console.log(`Customer auto-registered/updated: ${customerEmail}`);
      }
      
      // 注文を作成（初期配送履歴を含む）
      const order = await createOrder({
        stripeSessionId: session.id,
        customerEmail: customerDetails?.email || session.customer_email || '',
        customerName: customerDetails?.name || shippingDetails?.name || '',
        customerPhone: customerDetails?.phone || '',
        shippingAddress: shippingDetails?.address ? {
          line1: shippingDetails.address.line1 || '',
          line2: shippingDetails.address.line2 || undefined,
          city: shippingDetails.address.city || '',
          state: shippingDetails.address.state || undefined,
          postal_code: shippingDetails.address.postal_code || '',
          country: shippingDetails.address.country || 'JP',
        } : undefined,
        billingAddress: customerDetails?.address ? {
          line1: customerDetails.address.line1 || '',
          line2: customerDetails.address.line2 || undefined,
          city: customerDetails.address.city || '',
          state: customerDetails.address.state || undefined,
          postal_code: customerDetails.address.postal_code || '',
          country: customerDetails.address.country || 'JP',
        } : undefined,
        shippingOption: typeof sessionWithDetails.shipping_options?.[0]?.shipping_rate === 'string' 
          ? sessionWithDetails.shipping_options[0].shipping_rate 
          : undefined,
        shippingCost: shippingCost?.amount_total || 0,
        items: orderItems,
        total: session.amount_total || 0,
        status: 'completed',
        paymentStatus: 'paid',
        fulfillmentStatus: 'unfulfilled',
        shippingHistory: [{
          timestamp: new Date().toISOString(),
          status: 'unfulfilled',
          description: '注文を受け付けました',
          performedBy: 'System'
        }],
        lastShippingUpdate: new Date().toISOString()
      });

      console.log('Order created:', order.id);

      // 注文確認メールを送信
      if (session.customer_email) {
        const emailHtml = generateOrderConfirmationEmail(order);
        const emailSent = await sendEmail({
          to: session.customer_email,
          subject: `【注文確認】ご注文ありがとうございます（注文番号: ${order.id}）`,
          html: emailHtml,
        });

        if (emailSent) {
          console.log(`✅ 注文確認メール送信成功: ${session.customer_email}`);
        } else {
          console.error(`❌ 注文確認メール送信失敗: ${session.customer_email}`);
        }
      } else {
        console.log('顧客のメールアドレスが取得できませんでした');
      }
    } catch (error) {
      console.error('Error processing order:', error);
      return NextResponse.json({ error: 'Error processing order' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}

// 商品名から商品IDを取得するヘルパー関数
function getProductIdFromName(name: string): string | null {
  const productMap: { [key: string]: string } = {
    'プレミアムTシャツ': 'prod_1',
    'デザイナーマグカップ': 'prod_2',
    'ノートブック': 'prod_3',
    'エコバッグ': 'prod_4',
  };
  
  return productMap[name] || null;
}