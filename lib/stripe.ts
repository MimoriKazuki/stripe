import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
  telemetry: false, // 分析機能を無効化してエラーログを防ぐ
});