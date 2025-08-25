import { stripe } from './stripe';
import Stripe from 'stripe';

// Stripeに商品を作成
export async function createStripeProduct(productData: {
  name: string;
  description: string;
  price: number;
  image?: string;
  active?: boolean;
}) {
  try {
    // 1. Stripe商品を作成
    const product = await stripe.products.create({
      name: productData.name,
      description: productData.description,
      images: productData.image ? [productData.image] : undefined,
      active: productData.active !== false,
      metadata: {
        created_from: 'admin_panel'
      }
    });

    // 2. 価格を作成
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: productData.price,
      currency: 'jpy',
      metadata: {
        created_from: 'admin_panel'
      }
    });

    return {
      productId: product.id,
      priceId: price.id,
      product,
      price
    };
  } catch (error) {
    console.error('Stripe商品作成エラー:', error);
    throw error;
  }
}

// Stripe商品を更新
export async function updateStripeProduct(
  stripeProductId: string,
  stripePriceId: string,
  updates: {
    name?: string;
    description?: string;
    price?: number;
    image?: string;
    active?: boolean;
  }
) {
  try {
    // 1. 商品情報を更新
    if (updates.name || updates.description || updates.image || updates.active !== undefined) {
      await stripe.products.update(stripeProductId, {
        name: updates.name,
        description: updates.description,
        images: updates.image ? [updates.image] : undefined,
        active: updates.active
      });
    }

    // 2. 価格が変更された場合は新しい価格を作成
    let newPriceId = stripePriceId;
    if (updates.price) {
      // 既存の価格を無効化
      await stripe.prices.update(stripePriceId, { active: false });
      
      // 新しい価格を作成
      const newPrice = await stripe.prices.create({
        product: stripeProductId,
        unit_amount: updates.price,
        currency: 'jpy',
        metadata: {
          created_from: 'admin_panel'
        }
      });
      newPriceId = newPrice.id;
    }

    return { productId: stripeProductId, priceId: newPriceId };
  } catch (error) {
    console.error('Stripe商品更新エラー:', error);
    throw error;
  }
}

// Stripe商品を削除（非アクティブ化）
export async function deactivateStripeProduct(stripeProductId: string) {
  try {
    await stripe.products.update(stripeProductId, {
      active: false
    });
    return true;
  } catch (error) {
    console.error('Stripe商品非アクティブ化エラー:', error);
    throw error;
  }
}

// Stripe商品リストを取得
export async function listStripeProducts(limit: number = 100) {
  try {
    const products = await stripe.products.list({
      limit,
      active: true,
      expand: ['data.default_price']
    });
    return products.data;
  } catch (error) {
    console.error('Stripe商品リスト取得エラー:', error);
    throw error;
  }
}

// ローカル商品とStripe商品を同期
export async function syncProductWithStripe(localProduct: any) {
  try {
    // Stripe商品が既に存在するか確認
    if (localProduct.stripeProductId) {
      // 更新
      return await updateStripeProduct(
        localProduct.stripeProductId,
        localProduct.stripePriceId,
        {
          name: localProduct.name,
          description: localProduct.description,
          price: localProduct.price,
          image: localProduct.image,
          active: localProduct.active
        }
      );
    } else {
      // 新規作成
      return await createStripeProduct({
        name: localProduct.name,
        description: localProduct.description,
        price: localProduct.price,
        image: localProduct.image,
        active: localProduct.active
      });
    }
  } catch (error) {
    console.error('商品同期エラー:', error);
    throw error;
  }
}