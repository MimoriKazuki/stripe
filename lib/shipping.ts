import { Order, updateOrder, getOrder } from './db';

// 配送ステータスの遷移ルール
export const FULFILLMENT_STATUS_FLOW = {
  'unfulfilled': ['processing', 'cancelled'],
  'processing': ['ready_to_ship', 'cancelled'],
  'ready_to_ship': ['shipped', 'cancelled'],
  'shipped': ['out_for_delivery', 'delivered', 'returned'],
  'out_for_delivery': ['delivered', 'delivery_failed'],
  'delivered': ['returned'],
  'delivery_failed': ['shipped', 'returned', 'cancelled'],
  'returned': ['refunded'],
  'cancelled': [],
  'refunded': []
};

// 配送ステータスの詳細定義
export const FULFILLMENT_STATUS_DETAILS = {
  'unfulfilled': { label: '未処理', color: 'gray', icon: '📦' },
  'processing': { label: '処理中', color: 'yellow', icon: '⚙️' },
  'ready_to_ship': { label: '発送準備完了', color: 'blue', icon: '📋' },
  'shipped': { label: '発送済み', color: 'purple', icon: '🚚' },
  'out_for_delivery': { label: '配達中', color: 'indigo', icon: '🚛' },
  'delivered': { label: '配達完了', color: 'green', icon: '✅' },
  'delivery_failed': { label: '配達失敗', color: 'red', icon: '❌' },
  'returned': { label: '返品', color: 'orange', icon: '↩️' },
  'cancelled': { label: 'キャンセル', color: 'gray', icon: '🚫' },
  'refunded': { label: '返金済み', color: 'gray', icon: '💰' }
};

// 配送業者の設定
export const SHIPPING_CARRIERS = {
  'yamato': {
    name: 'ヤマト運輸',
    trackingUrlTemplate: 'https://toi.kuronekoyamato.co.jp/cgi-bin/tneko?init&q={tracking}',
    estimatedDays: { standard: 2, express: 1 },
    logo: '🐈'
  },
  'sagawa': {
    name: '佐川急便',
    trackingUrlTemplate: 'https://k2k.sagawa-exp.co.jp/p/web/okurijosearch.do?okurijoNo={tracking}',
    estimatedDays: { standard: 3, express: 1 },
    logo: '🚚'
  },
  'jppost': {
    name: '日本郵便',
    trackingUrlTemplate: 'https://trackings.post.japanpost.jp/services/srv/search/?requestNo1={tracking}',
    estimatedDays: { standard: 3, express: 2 },
    logo: '📮'
  }
};

// 配送履歴エントリ
export interface ShippingEvent {
  timestamp: string;
  status: string;
  description: string;
  location?: string;
  carrierStatus?: string;
  performedBy?: string;
}

// 配送追跡情報
export interface ShippingTracking {
  orderId: string;
  trackingNumber: string;
  carrier: string;
  status: string;
  events: ShippingEvent[];
  estimatedDelivery?: string;
  actualDelivery?: string;
  lastUpdated: string;
}

// 配送ステータスが有効な遷移かチェック
export function canTransitionTo(currentStatus: string, newStatus: string): boolean {
  const allowedStatuses = FULFILLMENT_STATUS_FLOW[currentStatus as keyof typeof FULFILLMENT_STATUS_FLOW];
  return allowedStatuses ? allowedStatuses.includes(newStatus) : false;
}

// 配送ステータスを更新
export async function updateShippingStatus(
  orderId: string,
  newStatus: string,
  event?: Partial<ShippingEvent>
): Promise<{ success: boolean; message?: string; order?: Order }> {
  const orders = await import('./db').then(m => m.getOrders());
  const order = orders.find(o => o.id === orderId);
  
  if (!order) {
    return { success: false, message: '注文が見つかりません' };
  }
  
  const currentStatus = order.fulfillmentStatus || 'unfulfilled';
  
  // ステータス遷移の検証
  if (!canTransitionTo(currentStatus, newStatus)) {
    return { 
      success: false, 
      message: `${currentStatus}から${newStatus}への遷移は許可されていません` 
    };
  }
  
  // 配送履歴の更新
  const shippingHistory = order.shippingHistory || [];
  const newEvent: ShippingEvent = {
    timestamp: new Date().toISOString(),
    status: newStatus,
    description: event?.description || getStatusChangeDescription(currentStatus, newStatus),
    location: event?.location,
    carrierStatus: event?.carrierStatus,
    performedBy: event?.performedBy || 'System'
  };
  
  shippingHistory.push(newEvent);
  
  // 注文の更新
  const updates: any = {
    fulfillmentStatus: newStatus,
    shippingHistory,
    lastShippingUpdate: new Date().toISOString()
  };
  
  // 特定のステータスに応じた追加処理
  if (newStatus === 'delivered') {
    updates.actualDelivery = new Date().toISOString();
    updates.status = 'completed';
  } else if (newStatus === 'cancelled') {
    updates.status = 'cancelled';
  } else if (newStatus === 'refunded') {
    updates.status = 'refunded';
    updates.paymentStatus = 'refunded';
  }
  
  const success = await updateOrder(orderId, updates);
  
  if (success) {
    // 通知を送信（実装予定）
    await sendShippingNotification(orderId, newStatus);
    
    return { 
      success: true, 
      message: `配送ステータスを${FULFILLMENT_STATUS_DETAILS[newStatus as keyof typeof FULFILLMENT_STATUS_DETAILS].label}に更新しました`,
      order: { ...order, ...updates }
    };
  }
  
  return { success: false, message: '更新に失敗しました' };
}

// ステータス変更の説明文を生成
function getStatusChangeDescription(oldStatus: string, newStatus: string): string {
  const descriptions: { [key: string]: string } = {
    'unfulfilled_processing': '注文の処理を開始しました',
    'processing_ready_to_ship': '商品の梱包が完了しました',
    'ready_to_ship_shipped': '商品を発送しました',
    'shipped_out_for_delivery': '配達員が商品を持って配達に向かっています',
    'out_for_delivery_delivered': '商品が配達されました',
    'out_for_delivery_delivery_failed': '配達に失敗しました（不在等）',
    'shipped_returned': '商品が返送されました',
    'returned_refunded': '返金処理が完了しました'
  };
  
  const key = `${oldStatus}_${newStatus}`;
  return descriptions[key] || `ステータスが${newStatus}に変更されました`;
}

// 配送通知を送信
async function sendShippingNotification(orderId: string, status: string): Promise<void> {
  const orders = await import('./db').then(m => m.getOrders());
  const order = orders.find(o => o.id === orderId);
  
  if (!order || !order.customerEmail) return;
  
  const statusDetail = FULFILLMENT_STATUS_DETAILS[status as keyof typeof FULFILLMENT_STATUS_DETAILS];
  
  // メール通知のテンプレート
  const emailTemplates: { [key: string]: { subject: string; body: string } } = {
    'shipped': {
      subject: `【発送完了】ご注文商品を発送しました（注文番号: ${order.orderNumber})`,
      body: `
        <h2>商品を発送いたしました</h2>
        <p>お客様のご注文商品を発送いたしました。</p>
        <p>追跡番号: ${order.trackingNumber || '未設定'}</p>
        <p>配送予定日: ${order.estimatedDelivery || '2-3営業日'}</p>
        ${order.trackingUrl ? `<p><a href="${order.trackingUrl}">配送状況を確認</a></p>` : ''}
      `
    },
    'out_for_delivery': {
      subject: `【配達中】本日お届け予定です（注文番号: ${order.orderNumber})`,
      body: `
        <h2>本日お届け予定です</h2>
        <p>商品は配達員がお持ちしており、本日中にお届けの予定です。</p>
      `
    },
    'delivered': {
      subject: `【配達完了】ご注文商品をお届けしました（注文番号: ${order.orderNumber})`,
      body: `
        <h2>商品のお届けが完了しました</h2>
        <p>ご注文いただいた商品の配達が完了いたしました。</p>
        <p>この度はご利用いただきありがとうございました。</p>
      `
    },
    'delivery_failed': {
      subject: `【配達できませんでした】再配達のご案内（注文番号: ${order.orderNumber})`,
      body: `
        <h2>配達できませんでした</h2>
        <p>ご不在等の理由により、商品をお届けできませんでした。</p>
        <p>再配達のご希望は配送業者までご連絡ください。</p>
        ${order.trackingUrl ? `<p><a href="${order.trackingUrl}">再配達の申し込み</a></p>` : ''}
      `
    }
  };
  
  const template = emailTemplates[status];
  if (template) {
    const { sendEmail } = await import('./email');
    await sendEmail({
      to: order.customerEmail,
      subject: template.subject,
      html: template.body
    });
    console.log(`配送通知メールを送信: ${order.customerEmail} - ${status}`);
  }
}

// 追跡番号を生成（テスト用）
export function generateTrackingNumber(carrier: string): string {
  const prefixes = {
    'yamato': '1234',
    'sagawa': '5678',
    'jppost': '9012'
  };
  
  const prefix = prefixes[carrier as keyof typeof prefixes] || '0000';
  const random = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  
  return `${prefix}${random}`;
}

// 配送予定日を計算
export function calculateEstimatedDelivery(carrier: string, isExpress: boolean = false): string {
  const carrierInfo = SHIPPING_CARRIERS[carrier as keyof typeof SHIPPING_CARRIERS];
  if (!carrierInfo) return '';
  
  const days = isExpress ? carrierInfo.estimatedDays.express : carrierInfo.estimatedDays.standard;
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + days);
  
  // 土日を除外
  while (deliveryDate.getDay() === 0 || deliveryDate.getDay() === 6) {
    deliveryDate.setDate(deliveryDate.getDate() + 1);
  }
  
  return deliveryDate.toISOString();
}

// 配送コストを計算
export function calculateShippingCost(
  items: any[],
  shippingOption: string,
  destination?: string
): number {
  let baseCost = 0;
  
  // 配送オプション別の基本料金
  const optionCosts: { [key: string]: number } = {
    'standard': 500,
    'express': 1000,
    'overnight': 2000
  };
  
  baseCost = optionCosts[shippingOption] || 500;
  
  // 重量による追加料金（仮想的な計算）
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  if (totalQuantity > 5) {
    baseCost += (totalQuantity - 5) * 100;
  }
  
  // 地域による追加料金
  if (destination) {
    const remotePrefectures = ['北海道', '沖縄県', '離島'];
    if (remotePrefectures.some(pref => destination.includes(pref))) {
      baseCost += 500;
    }
  }
  
  return baseCost;
}

// バッチ処理：配送ステータスの自動更新
export async function processShippingBatch(): Promise<void> {
  const orders = await import('./db').then(m => m.getOrders());
  const now = new Date();
  
  for (const order of orders) {
    // 発送済みで2日経過したら配達中に
    if (order.fulfillmentStatus === 'shipped' && order.lastShippingUpdate) {
      const lastUpdate = new Date(order.lastShippingUpdate);
      const daysSince = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSince >= 2) {
        await updateShippingStatus(order.id, 'out_for_delivery', {
          description: '配達員が商品をお持ちしています',
          location: '配達営業所'
        });
      }
    }
    
    // 配達中で1日経過したら配達完了に
    if (order.fulfillmentStatus === 'out_for_delivery' && order.lastShippingUpdate) {
      const lastUpdate = new Date(order.lastShippingUpdate);
      const hoursSince = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60));
      
      if (hoursSince >= 8) {
        // 10%の確率で配達失敗
        if (Math.random() > 0.9) {
          await updateShippingStatus(order.id, 'delivery_failed', {
            description: 'ご不在のため持ち帰りました',
            location: '配達営業所'
          });
        } else {
          await updateShippingStatus(order.id, 'delivered', {
            description: '配達が完了しました',
            location: order.shippingAddress?.city || '配達先'
          });
        }
      }
    }
  }
}