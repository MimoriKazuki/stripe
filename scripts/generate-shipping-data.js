const fs = require('fs');
const path = require('path');

// 現在の日時を取得
const now = new Date();

// 日時をずらす関数
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function addHours(date, hours) {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
}

// 実際の配送データを生成
const orders = [
  // 1. 本日配達完了予定
  {
    id: "order_20241225001",
    orderNumber: "ORD-202412-001",
    stripeSessionId: "cs_live_a1b2c3d4e5f6",
    customerEmail: "yamada@example.com",
    customerName: "山田 太郎",
    customerPhone: "090-1234-5678",
    shippingAddress: {
      line1: "渋谷1-2-3",
      line2: "渋谷ビル10F",
      city: "渋谷区",
      state: "東京都",
      postal_code: "150-0002",
      country: "JP"
    },
    billingAddress: {
      line1: "渋谷1-2-3",
      line2: "渋谷ビル10F",
      city: "渋谷区",
      state: "東京都",
      postal_code: "150-0002",
      country: "JP"
    },
    shippingOption: "express",
    shippingCost: 1000,
    items: [
      {
        productId: "prod_1",
        productName: "プレミアムTシャツ",
        quantity: 2,
        price: 3500
      }
    ],
    total: 8000,
    status: "completed",
    paymentStatus: "paid",
    fulfillmentStatus: "out_for_delivery",
    trackingNumber: "425678901234",
    trackingUrl: "https://toi.kuronekoyamato.co.jp/cgi-bin/tneko?init&q=425678901234",
    shippingCarrier: "yamato",
    estimatedDelivery: now.toISOString(),
    lastShippingUpdate: addHours(now, -2).toISOString(),
    shippingHistory: [
      {
        timestamp: addDays(now, -2).toISOString(),
        status: "unfulfilled",
        description: "注文を受け付けました",
        performedBy: "System"
      },
      {
        timestamp: addHours(addDays(now, -2), 2).toISOString(),
        status: "processing",
        description: "注文の処理を開始しました",
        performedBy: "倉庫システム"
      },
      {
        timestamp: addHours(addDays(now, -2), 4).toISOString(),
        status: "ready_to_ship",
        description: "商品の梱包が完了しました",
        location: "東京物流センター",
        performedBy: "梱包担当：佐藤"
      },
      {
        timestamp: addDays(now, -1).toISOString(),
        status: "shipped",
        description: "商品を発送しました（速達便）",
        location: "東京物流センター",
        carrierStatus: "荷物受付",
        performedBy: "発送担当：鈴木"
      },
      {
        timestamp: addHours(now, -2).toISOString(),
        status: "out_for_delivery",
        description: "本日お届け予定です",
        location: "渋谷営業所",
        carrierStatus: "配達中",
        performedBy: "配達ドライバー：田中"
      }
    ],
    notes: "速達便・午前中指定",
    createdAt: addDays(now, -2).toISOString(),
    updatedAt: addHours(now, -2).toISOString()
  },

  // 2. 昨日配達完了
  {
    id: "order_20241224001",
    orderNumber: "ORD-202412-002",
    stripeSessionId: "cs_live_b2c3d4e5f6g7",
    customerEmail: "sato@example.com",
    customerName: "佐藤 花子",
    customerPhone: "080-2345-6789",
    shippingAddress: {
      line1: "中央町3-4-5",
      city: "千代田区",
      state: "東京都",
      postal_code: "100-0001",
      country: "JP"
    },
    shippingOption: "standard",
    shippingCost: 500,
    items: [
      {
        productId: "prod_2",
        productName: "デザイナーマグカップ",
        quantity: 3,
        price: 2000
      },
      {
        productId: "prod_3",
        productName: "ノートブック",
        quantity: 2,
        price: 1500
      }
    ],
    total: 9500,
    status: "completed",
    paymentStatus: "paid",
    fulfillmentStatus: "delivered",
    trackingNumber: "789012345678",
    trackingUrl: "https://k2k.sagawa-exp.co.jp/p/web/okurijosearch.do?okurijoNo=789012345678",
    shippingCarrier: "sagawa",
    estimatedDelivery: addDays(now, -1).toISOString(),
    actualDelivery: addHours(addDays(now, -1), 14).toISOString(),
    lastShippingUpdate: addHours(addDays(now, -1), 14).toISOString(),
    shippingHistory: [
      {
        timestamp: addDays(now, -4).toISOString(),
        status: "unfulfilled",
        description: "注文を受け付けました",
        performedBy: "System"
      },
      {
        timestamp: addHours(addDays(now, -4), 1).toISOString(),
        status: "processing",
        description: "注文の処理を開始しました",
        performedBy: "倉庫システム"
      },
      {
        timestamp: addDays(now, -3).toISOString(),
        status: "ready_to_ship",
        description: "商品の梱包が完了しました",
        location: "東京物流センター",
        performedBy: "梱包担当：高橋"
      },
      {
        timestamp: addHours(addDays(now, -3), 4).toISOString(),
        status: "shipped",
        description: "商品を発送しました",
        location: "東京物流センター",
        carrierStatus: "集荷",
        performedBy: "発送担当：伊藤"
      },
      {
        timestamp: addDays(now, -2).toISOString(),
        status: "shipped",
        description: "中継センターに到着",
        location: "関東中継センター",
        carrierStatus: "輸送中",
        performedBy: "佐川急便"
      },
      {
        timestamp: addHours(addDays(now, -1), 9).toISOString(),
        status: "out_for_delivery",
        description: "配達に出発しました",
        location: "千代田営業所",
        carrierStatus: "配達中",
        performedBy: "配達員：渡辺"
      },
      {
        timestamp: addHours(addDays(now, -1), 14).toISOString(),
        status: "delivered",
        description: "配達完了（対面・サイン受領）",
        location: "東京都千代田区",
        carrierStatus: "配達完了",
        performedBy: "配達員：渡辺"
      }
    ],
    createdAt: addDays(now, -4).toISOString(),
    updatedAt: addHours(addDays(now, -1), 14).toISOString()
  },

  // 3. 本日発送予定
  {
    id: "order_20241225002",
    orderNumber: "ORD-202412-003",
    stripeSessionId: "cs_live_c3d4e5f6g7h8",
    customerEmail: "tanaka@example.com",
    customerName: "田中 一郎",
    customerPhone: "070-3456-7890",
    shippingAddress: {
      line1: "港南2-15-1",
      line2: "品川インターシティA棟",
      city: "港区",
      state: "東京都",
      postal_code: "108-0075",
      country: "JP"
    },
    shippingOption: "standard",
    shippingCost: 500,
    items: [
      {
        productId: "prod_4",
        productName: "エコバッグ",
        quantity: 5,
        price: 1200
      }
    ],
    total: 6500,
    status: "completed",
    paymentStatus: "paid",
    fulfillmentStatus: "ready_to_ship",
    lastShippingUpdate: addHours(now, -3).toISOString(),
    shippingHistory: [
      {
        timestamp: addHours(now, -20).toISOString(),
        status: "unfulfilled",
        description: "注文を受け付けました",
        performedBy: "System"
      },
      {
        timestamp: addHours(now, -18).toISOString(),
        status: "processing",
        description: "在庫確認中",
        performedBy: "在庫管理システム"
      },
      {
        timestamp: addHours(now, -16).toISOString(),
        status: "processing",
        description: "ピッキング作業開始",
        location: "東京倉庫",
        performedBy: "ピッキング担当：山本"
      },
      {
        timestamp: addHours(now, -3).toISOString(),
        status: "ready_to_ship",
        description: "梱包完了・発送待ち",
        location: "東京倉庫",
        performedBy: "梱包担当：小林"
      }
    ],
    notes: "本日17時までに発送予定",
    createdAt: addHours(now, -20).toISOString(),
    updatedAt: addHours(now, -3).toISOString()
  },

  // 4. 配達失敗・再配達調整中
  {
    id: "order_20241223001",
    orderNumber: "ORD-202412-004",
    stripeSessionId: "cs_live_d4e5f6g7h8i9",
    customerEmail: "suzuki@example.com",
    customerName: "鈴木 美香",
    customerPhone: "090-4567-8901",
    shippingAddress: {
      line1: "北区王子1-2-3",
      city: "北区",
      state: "東京都",
      postal_code: "114-0002",
      country: "JP"
    },
    shippingOption: "standard",
    shippingCost: 500,
    items: [
      {
        productId: "prod_1",
        productName: "プレミアムTシャツ",
        quantity: 1,
        price: 3500
      }
    ],
    total: 4000,
    status: "completed",
    paymentStatus: "paid",
    fulfillmentStatus: "delivery_failed",
    trackingNumber: "JP123456789012",
    trackingUrl: "https://trackings.post.japanpost.jp/services/srv/search/?requestNo1=JP123456789012",
    shippingCarrier: "jppost",
    estimatedDelivery: addDays(now, -2).toISOString(),
    lastShippingUpdate: addDays(now, -1).toISOString(),
    shippingHistory: [
      {
        timestamp: addDays(now, -5).toISOString(),
        status: "unfulfilled",
        description: "注文を受け付けました",
        performedBy: "System"
      },
      {
        timestamp: addHours(addDays(now, -5), 3).toISOString(),
        status: "processing",
        description: "注文処理中",
        performedBy: "倉庫システム"
      },
      {
        timestamp: addDays(now, -4).toISOString(),
        status: "ready_to_ship",
        description: "発送準備完了",
        location: "東京倉庫",
        performedBy: "梱包担当：中村"
      },
      {
        timestamp: addHours(addDays(now, -4), 6).toISOString(),
        status: "shipped",
        description: "郵便局へ引き渡し",
        location: "東京中央郵便局",
        carrierStatus: "引受",
        performedBy: "日本郵便"
      },
      {
        timestamp: addDays(now, -2).toISOString(),
        status: "out_for_delivery",
        description: "配達に向かっています",
        location: "北区郵便局",
        carrierStatus: "配達中",
        performedBy: "配達員"
      },
      {
        timestamp: addHours(addDays(now, -2), 4).toISOString(),
        status: "delivery_failed",
        description: "ご不在のため持ち戻り",
        location: "北区郵便局",
        carrierStatus: "持戻",
        performedBy: "配達員"
      },
      {
        timestamp: addDays(now, -1).toISOString(),
        status: "delivery_failed",
        description: "再配達不在票を投函しました",
        location: "北区郵便局",
        carrierStatus: "保管中",
        performedBy: "日本郵便"
      }
    ],
    notes: "再配達待ち（お客様からの連絡待ち）",
    createdAt: addDays(now, -5).toISOString(),
    updatedAt: addDays(now, -1).toISOString()
  },

  // 5. 大量注文・処理中
  {
    id: "order_20241225003",
    orderNumber: "ORD-202412-005",
    stripeSessionId: "cs_live_e5f6g7h8i9j0",
    customerEmail: "kimura@example.com",
    customerName: "木村商事株式会社",
    customerPhone: "03-1234-5678",
    shippingAddress: {
      line1: "新宿3-1-13",
      line2: "新宿ビル8F",
      city: "新宿区",
      state: "東京都",
      postal_code: "160-0022",
      country: "JP"
    },
    shippingOption: "standard",
    shippingCost: 0,
    items: [
      {
        productId: "prod_1",
        productName: "プレミアムTシャツ",
        quantity: 50,
        price: 3500
      },
      {
        productId: "prod_4",
        productName: "エコバッグ",
        quantity: 100,
        price: 1200
      }
    ],
    total: 295000,
    status: "completed",
    paymentStatus: "paid",
    fulfillmentStatus: "processing",
    lastShippingUpdate: addHours(now, -1).toISOString(),
    shippingHistory: [
      {
        timestamp: addHours(now, -6).toISOString(),
        status: "unfulfilled",
        description: "法人注文を受け付けました",
        performedBy: "System"
      },
      {
        timestamp: addHours(now, -5).toISOString(),
        status: "processing",
        description: "在庫確認・大量注文処理開始",
        performedBy: "法人営業部"
      },
      {
        timestamp: addHours(now, -1).toISOString(),
        status: "processing",
        description: "商品準備中（50%完了）",
        location: "東京倉庫",
        performedBy: "倉庫チーム"
      }
    ],
    notes: "法人大量注文・分割発送予定",
    tags: ["法人", "優先処理"],
    createdAt: addHours(now, -6).toISOString(),
    updatedAt: addHours(now, -1).toISOString()
  },

  // 6. 返品処理中
  {
    id: "order_20241220001",
    orderNumber: "ORD-202412-006",
    stripeSessionId: "cs_live_f6g7h8i9j0k1",
    customerEmail: "watanabe@example.com",
    customerName: "渡辺 真理",
    customerPhone: "080-5678-9012",
    shippingAddress: {
      line1: "横浜市中区山下町1-1",
      city: "横浜市中区",
      state: "神奈川県",
      postal_code: "231-0023",
      country: "JP"
    },
    shippingOption: "standard",
    shippingCost: 500,
    items: [
      {
        productId: "prod_2",
        productName: "デザイナーマグカップ",
        quantity: 1,
        price: 2000
      }
    ],
    total: 2500,
    status: "refunded",
    paymentStatus: "refunded",
    fulfillmentStatus: "returned",
    trackingNumber: "425678901235",
    trackingUrl: "https://toi.kuronekoyamato.co.jp/cgi-bin/tneko?init&q=425678901235",
    shippingCarrier: "yamato",
    actualDelivery: addDays(now, -10).toISOString(),
    lastShippingUpdate: addDays(now, -3).toISOString(),
    shippingHistory: [
      {
        timestamp: addDays(now, -15).toISOString(),
        status: "unfulfilled",
        description: "注文を受け付けました",
        performedBy: "System"
      },
      {
        timestamp: addDays(now, -14).toISOString(),
        status: "processing",
        description: "注文処理開始",
        performedBy: "倉庫システム"
      },
      {
        timestamp: addHours(addDays(now, -14), 6).toISOString(),
        status: "ready_to_ship",
        description: "発送準備完了",
        location: "東京倉庫",
        performedBy: "梱包担当"
      },
      {
        timestamp: addDays(now, -13).toISOString(),
        status: "shipped",
        description: "発送完了",
        location: "東京物流センター",
        performedBy: "ヤマト運輸"
      },
      {
        timestamp: addDays(now, -11).toISOString(),
        status: "out_for_delivery",
        description: "配達中",
        location: "横浜営業所",
        performedBy: "配達員"
      },
      {
        timestamp: addDays(now, -10).toISOString(),
        status: "delivered",
        description: "配達完了",
        location: "神奈川県横浜市",
        performedBy: "配達員"
      },
      {
        timestamp: addDays(now, -5).toISOString(),
        status: "returned",
        description: "返品受付（商品不良）",
        performedBy: "カスタマーサービス"
      },
      {
        timestamp: addDays(now, -4).toISOString(),
        status: "returned",
        description: "返品商品受領・検品完了",
        location: "返品センター",
        performedBy: "品質管理部"
      },
      {
        timestamp: addDays(now, -3).toISOString(),
        status: "refunded",
        description: "返金処理完了",
        performedBy: "経理部"
      }
    ],
    notes: "商品不良による返品・返金済み",
    createdAt: addDays(now, -15).toISOString(),
    updatedAt: addDays(now, -3).toISOString()
  },

  // 7. 昨日発送済み
  {
    id: "order_20241224002",
    orderNumber: "ORD-202412-007",
    stripeSessionId: "cs_live_g7h8i9j0k1l2",
    customerEmail: "ito@example.com",
    customerName: "伊藤 光",
    customerPhone: "070-6789-0123",
    shippingAddress: {
      line1: "大阪市北区梅田1-1-3",
      city: "大阪市北区",
      state: "大阪府",
      postal_code: "530-0001",
      country: "JP"
    },
    shippingOption: "standard",
    shippingCost: 600,
    items: [
      {
        productId: "prod_3",
        productName: "ノートブック",
        quantity: 4,
        price: 1500
      }
    ],
    total: 6600,
    status: "completed",
    paymentStatus: "paid",
    fulfillmentStatus: "shipped",
    trackingNumber: "567890123456",
    trackingUrl: "https://k2k.sagawa-exp.co.jp/p/web/okurijosearch.do?okurijoNo=567890123456",
    shippingCarrier: "sagawa",
    estimatedDelivery: addDays(now, 2).toISOString(),
    lastShippingUpdate: addDays(now, -1).toISOString(),
    shippingHistory: [
      {
        timestamp: addDays(now, -3).toISOString(),
        status: "unfulfilled",
        description: "注文を受け付けました",
        performedBy: "System"
      },
      {
        timestamp: addHours(addDays(now, -3), 2).toISOString(),
        status: "processing",
        description: "注文処理開始",
        performedBy: "倉庫システム"
      },
      {
        timestamp: addDays(now, -2).toISOString(),
        status: "ready_to_ship",
        description: "発送準備完了",
        location: "大阪倉庫",
        performedBy: "梱包担当：西村"
      },
      {
        timestamp: addDays(now, -1).toISOString(),
        status: "shipped",
        description: "佐川急便に引き渡し",
        location: "大阪物流センター",
        carrierStatus: "集荷",
        performedBy: "発送担当：東"
      }
    ],
    notes: "関西地域配送",
    createdAt: addDays(now, -3).toISOString(),
    updatedAt: addDays(now, -1).toISOString()
  },

  // 8. 本日注文・未処理
  {
    id: "order_20241225004",
    orderNumber: "ORD-202412-008",
    stripeSessionId: "cs_live_h8i9j0k1l2m3",
    customerEmail: "nakamura@example.com",
    customerName: "中村 健太",
    customerPhone: "090-8765-4321",
    shippingAddress: {
      line1: "世田谷区三軒茶屋2-11-22",
      city: "世田谷区",
      state: "東京都",
      postal_code: "154-0024",
      country: "JP"
    },
    shippingOption: "express",
    shippingCost: 1000,
    items: [
      {
        productId: "prod_1",
        productName: "プレミアムTシャツ",
        quantity: 1,
        price: 3500
      },
      {
        productId: "prod_2",
        productName: "デザイナーマグカップ",
        quantity: 1,
        price: 2000
      }
    ],
    total: 6500,
    status: "completed",
    paymentStatus: "paid",
    fulfillmentStatus: "unfulfilled",
    lastShippingUpdate: addHours(now, -1).toISOString(),
    shippingHistory: [
      {
        timestamp: addHours(now, -1).toISOString(),
        status: "unfulfilled",
        description: "注文を受け付けました",
        performedBy: "System"
      }
    ],
    notes: "速達便希望",
    createdAt: addHours(now, -1).toISOString(),
    updatedAt: addHours(now, -1).toISOString()
  },

  // 9. キャンセル済み
  {
    id: "order_20241223002",
    orderNumber: "ORD-202412-009",
    stripeSessionId: "cs_live_i9j0k1l2m3n4",
    customerEmail: "yoshida@example.com",
    customerName: "吉田 由美",
    customerPhone: "080-1111-2222",
    shippingAddress: {
      line1: "福岡市博多区博多駅前3-25-21",
      city: "福岡市博多区",
      state: "福岡県",
      postal_code: "812-0011",
      country: "JP"
    },
    shippingOption: "standard",
    shippingCost: 700,
    items: [
      {
        productId: "prod_4",
        productName: "エコバッグ",
        quantity: 3,
        price: 1200
      }
    ],
    total: 4300,
    status: "cancelled",
    paymentStatus: "refunded",
    fulfillmentStatus: "cancelled",
    lastShippingUpdate: addDays(now, -2).toISOString(),
    shippingHistory: [
      {
        timestamp: addDays(now, -3).toISOString(),
        status: "unfulfilled",
        description: "注文を受け付けました",
        performedBy: "System"
      },
      {
        timestamp: addHours(addDays(now, -3), 4).toISOString(),
        status: "processing",
        description: "注文処理開始",
        performedBy: "倉庫システム"
      },
      {
        timestamp: addDays(now, -2).toISOString(),
        status: "cancelled",
        description: "お客様都合によりキャンセル",
        performedBy: "カスタマーサービス：青木"
      }
    ],
    notes: "顧客都合キャンセル・返金済み",
    createdAt: addDays(now, -3).toISOString(),
    updatedAt: addDays(now, -2).toISOString()
  },

  // 10. 週末配達予定
  {
    id: "order_20241224003",
    orderNumber: "ORD-202412-010",
    stripeSessionId: "cs_live_j0k1l2m3n4o5",
    customerEmail: "kobayashi@example.com",
    customerName: "小林 愛子",
    customerPhone: "070-9999-8888",
    shippingAddress: {
      line1: "名古屋市中区栄3-15-33",
      city: "名古屋市中区",
      state: "愛知県",
      postal_code: "460-0008",
      country: "JP"
    },
    shippingOption: "standard",
    shippingCost: 600,
    items: [
      {
        productId: "prod_1",
        productName: "プレミアムTシャツ",
        quantity: 2,
        price: 3500
      },
      {
        productId: "prod_3",
        productName: "ノートブック",
        quantity: 1,
        price: 1500
      }
    ],
    total: 9100,
    status: "completed",
    paymentStatus: "paid",
    fulfillmentStatus: "shipped",
    trackingNumber: "JP987654321098",
    trackingUrl: "https://trackings.post.japanpost.jp/services/srv/search/?requestNo1=JP987654321098",
    shippingCarrier: "jppost",
    estimatedDelivery: addDays(now, 3).toISOString(),
    lastShippingUpdate: addHours(now, -6).toISOString(),
    shippingHistory: [
      {
        timestamp: addDays(now, -2).toISOString(),
        status: "unfulfilled",
        description: "注文を受け付けました",
        performedBy: "System"
      },
      {
        timestamp: addHours(addDays(now, -2), 3).toISOString(),
        status: "processing",
        description: "注文処理開始",
        performedBy: "倉庫システム"
      },
      {
        timestamp: addDays(now, -1).toISOString(),
        status: "ready_to_ship",
        description: "発送準備完了",
        location: "名古屋倉庫",
        performedBy: "梱包担当：松田"
      },
      {
        timestamp: addHours(now, -6).toISOString(),
        status: "shipped",
        description: "日本郵便に引き渡し",
        location: "名古屋中央郵便局",
        carrierStatus: "引受",
        performedBy: "日本郵便"
      }
    ],
    notes: "週末配達指定",
    createdAt: addDays(now, -2).toISOString(),
    updatedAt: addHours(now, -6).toISOString()
  }
];

// ファイルに書き込み
const outputPath = path.join(__dirname, '..', 'data', 'orders.json');
fs.writeFileSync(outputPath, JSON.stringify({ orders }, null, 2), 'utf-8');

console.log(`✅ ${orders.length}件の実際の配送データを生成しました`);
console.log(`📁 保存先: ${outputPath}`);

// 統計を表示
const stats = {
  unfulfilled: orders.filter(o => o.fulfillmentStatus === 'unfulfilled').length,
  processing: orders.filter(o => o.fulfillmentStatus === 'processing').length,
  ready_to_ship: orders.filter(o => o.fulfillmentStatus === 'ready_to_ship').length,
  shipped: orders.filter(o => o.fulfillmentStatus === 'shipped').length,
  out_for_delivery: orders.filter(o => o.fulfillmentStatus === 'out_for_delivery').length,
  delivered: orders.filter(o => o.fulfillmentStatus === 'delivered').length,
  delivery_failed: orders.filter(o => o.fulfillmentStatus === 'delivery_failed').length,
  returned: orders.filter(o => o.fulfillmentStatus === 'returned').length,
  cancelled: orders.filter(o => o.fulfillmentStatus === 'cancelled').length,
  refunded: orders.filter(o => o.fulfillmentStatus === 'refunded').length
};

console.log('\n📊 配送ステータス別集計:');
Object.entries(stats).forEach(([status, count]) => {
  if (count > 0) {
    console.log(`  ${status}: ${count}件`);
  }
});