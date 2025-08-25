import { NextRequest, NextResponse } from 'next/server';
import { updateShippingStatus, generateTrackingNumber, calculateEstimatedDelivery, SHIPPING_CARRIERS } from '@/lib/shipping';
import { getOrder, updateOrder } from '@/lib/db';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { status, trackingNumber, carrier, description, location } = await req.json();
    
    // 既存の注文を取得
    const order = await getOrder(params.id);
    if (!order) {
      return NextResponse.json({ error: '注文が見つかりません' }, { status: 404 });
    }
    
    // 配送ステータスを更新
    const result = await updateShippingStatus(params.id, status, {
      description,
      location,
      performedBy: 'Admin'
    });
    
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }
    
    // 追跡番号と配送業者を設定（shippedステータスの場合）
    if (status === 'shipped' && carrier) {
      const tracking = trackingNumber || generateTrackingNumber(carrier);
      const carrierInfo = SHIPPING_CARRIERS[carrier as keyof typeof SHIPPING_CARRIERS];
      const trackingUrl = carrierInfo ? 
        carrierInfo.trackingUrlTemplate.replace('{tracking}', tracking) : 
        undefined;
      
      await updateOrder(params.id, {
        trackingNumber: tracking,
        trackingUrl,
        shippingCarrier: carrier,
        estimatedDelivery: calculateEstimatedDelivery(carrier, false)
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: result.message,
      order: result.order 
    });
  } catch (error) {
    console.error('Error updating fulfillment:', error);
    return NextResponse.json({ error: 'Failed to update fulfillment' }, { status: 500 });
  }
}

// 配送履歴を取得
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const order = await getOrder(params.id);
    if (!order) {
      return NextResponse.json({ error: '注文が見つかりません' }, { status: 404 });
    }
    
    return NextResponse.json({
      fulfillmentStatus: order.fulfillmentStatus,
      shippingHistory: order.shippingHistory || [],
      trackingNumber: order.trackingNumber,
      trackingUrl: order.trackingUrl,
      shippingCarrier: order.shippingCarrier,
      estimatedDelivery: order.estimatedDelivery,
      actualDelivery: order.actualDelivery
    });
  } catch (error) {
    console.error('Error fetching fulfillment:', error);
    return NextResponse.json({ error: 'Failed to fetch fulfillment' }, { status: 500 });
  }
}