import { NextRequest, NextResponse } from 'next/server';
import { getOrders, updateOrder } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { orderId, action, data } = await req.json();
    
    const orders = await getOrders();
    const order = orders.find(o => o.id === orderId);
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    let updates: any = {
      updatedAt: new Date().toISOString()
    };
    
    switch (action) {
      case 'update_status':
        updates.fulfillmentStatus = data.status;
        if (data.status === 'shipped') {
          updates.trackingNumber = data.trackingNumber;
          updates.trackingUrl = data.trackingUrl;
          updates.shippingCarrier = data.shippingCarrier;
          updates.estimatedDelivery = data.estimatedDelivery;
        }
        if (data.status === 'delivered') {
          updates.actualDelivery = new Date().toISOString();
        }
        break;
        
      case 'update_tracking':
        updates.trackingNumber = data.trackingNumber;
        updates.trackingUrl = data.trackingUrl;
        updates.shippingCarrier = data.shippingCarrier;
        break;
        
      case 'add_note':
        updates.notes = order.notes ? `${order.notes}\n${data.note}` : data.note;
        break;
        
      case 'update_address':
        updates.shippingAddress = data.shippingAddress;
        break;
        
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
    
    const success = await updateOrder(orderId, updates);
    
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error updating fulfillment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    
    const orders = await getOrders();
    
    let filteredOrders = orders;
    if (status) {
      filteredOrders = orders.filter(o => o.fulfillmentStatus === status);
    }
    
    // 配送統計を計算
    const stats = {
      unfulfilled: orders.filter(o => o.fulfillmentStatus === 'unfulfilled').length,
      processing: orders.filter(o => o.fulfillmentStatus === 'partially_fulfilled' || o.fulfillmentStatus === 'fulfilled').length,
      shipped: orders.filter(o => o.fulfillmentStatus === 'shipped').length,
      delivered: orders.filter(o => o.fulfillmentStatus === 'delivered').length,
      returned: orders.filter(o => o.fulfillmentStatus === 'returned').length,
    };
    
    return NextResponse.json({
      orders: filteredOrders,
      stats
    });
  } catch (error) {
    console.error('Error fetching fulfillment data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}