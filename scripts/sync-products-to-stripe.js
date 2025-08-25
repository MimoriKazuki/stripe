const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Stripe SDKをインポート
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function syncProductsToStripe() {
  try {
    // 商品データを読み込み
    const productsPath = path.join(__dirname, '..', 'data', 'products.json');
    const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));
    const products = productsData.products;

    console.log(`\n📦 ${products.length}個の商品をStripeと同期します...\n`);

    for (const product of products) {
      // 既にStripe IDがある場合はスキップ
      if (product.stripeProductId) {
        console.log(`✅ ${product.name} - 既に同期済み (${product.stripeProductId})`);
        continue;
      }

      try {
        // Stripeに商品を作成
        const stripeProduct = await stripe.products.create({
          name: product.name,
          description: product.description,
          images: product.image ? [product.image] : undefined,
          active: product.active,
          metadata: {
            local_id: product.id,
            created_from: 'sync_script'
          }
        });

        // 価格を作成
        const stripePrice = await stripe.prices.create({
          product: stripeProduct.id,
          unit_amount: product.price,
          currency: product.currency || 'jpy',
          metadata: {
            local_id: product.id,
            created_from: 'sync_script'
          }
        });

        // ローカルデータを更新
        product.stripeProductId = stripeProduct.id;
        product.stripePriceId = stripePrice.id;

        console.log(`✨ ${product.name} - Stripe同期完了`);
        console.log(`   Product ID: ${stripeProduct.id}`);
        console.log(`   Price ID: ${stripePrice.id}`);
      } catch (error) {
        console.error(`❌ ${product.name} - 同期失敗:`, error.message);
      }
    }

    // 更新されたデータを保存
    fs.writeFileSync(productsPath, JSON.stringify(productsData, null, 2));
    console.log('\n✅ 同期完了！商品データを更新しました。\n');

  } catch (error) {
    console.error('エラー:', error);
  }
}

// Stripeキーの確認
if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('sk_test_')) {
  console.log('⚠️  Stripeテストキーを使用しています');
} else if (process.env.STRIPE_SECRET_KEY.includes('sk_live_')) {
  console.log('⚠️  警告: Stripe本番キーを使用しています！');
}

if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('あなたの')) {
  console.error('❌ .env.localにSTRIPE_SECRET_KEYを設定してください');
  process.exit(1);
}

// 実行
syncProductsToStripe();