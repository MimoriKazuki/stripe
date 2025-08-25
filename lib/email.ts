// 簡易的なメール送信サービス（nodemailerを使用）
// 注意: 実際の環境では、SendGrid、AWS SES、Mailgun等のサービスを推奨

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

// デモ用: 実際にはメールを送信せず、コンソールにログを出力
// 本番環境では、nodemailerまたは他のメールサービスを設定してください
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    // 開発環境では、メール内容をコンソールに出力
    if (process.env.NODE_ENV !== 'production') {
      console.log('📧 メール送信（デモモード）');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`To: ${options.to}`);
      console.log(`Subject: ${options.subject}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('メール内容:');
      console.log(options.html.replace(/<[^>]*>/g, ''));
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      // 実際のメール送信をシミュレート
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return true;
    }

    // 本番環境用のコード（nodemailerの設定例）
    /*
    const nodemailer = require('nodemailer');
    
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    */

    return true;
  } catch (error) {
    console.error('メール送信エラー:', error);
    return false;
  }
}

// 注文確認メールのテンプレート
export function generateOrderConfirmationEmail(
  order: {
    id: string;
    customerEmail: string;
    items: Array<{
      productName: string;
      quantity: number;
      price: number;
    }>;
    total: number;
    createdAt: string;
  }
): string {
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.productName}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">¥${item.price.toLocaleString()}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">¥${(item.price * item.quantity).toLocaleString()}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>ご注文確認</title>
    </head>
    <body style="font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">ご注文ありがとうございます！</h1>
      </div>
      
      <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
        <p style="font-size: 16px; margin-bottom: 20px;">
          この度はご注文いただき、誠にありがとうございます。<br>
          以下の内容でご注文を承りました。
        </p>

        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>注文番号:</strong> ${order.id}</p>
          <p style="margin: 5px 0;"><strong>注文日時:</strong> ${new Date(order.createdAt).toLocaleString('ja-JP')}</p>
        </div>

        <h2 style="color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px; margin-top: 30px;">ご注文内容</h2>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background: #f8f9fa;">
              <th style="padding: 10px; text-align: left;">商品名</th>
              <th style="padding: 10px; text-align: center;">数量</th>
              <th style="padding: 10px; text-align: right;">単価</th>
              <th style="padding: 10px; text-align: right;">小計</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="padding: 15px; text-align: right; font-weight: bold; font-size: 18px;">合計金額:</td>
              <td style="padding: 15px; text-align: right; font-weight: bold; font-size: 18px; color: #667eea;">
                ¥${order.total.toLocaleString()}
              </td>
            </tr>
          </tfoot>
        </table>

        <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #856404;">
            <strong>📦 配送について</strong><br>
            商品の準備が整い次第、発送させていただきます。<br>
            発送完了時には改めてメールにてご連絡いたします。
          </p>
        </div>

        <p style="margin-top: 30px; font-size: 14px; color: #666;">
          ご不明な点がございましたら、お気軽にお問い合わせください。<br>
          今後ともよろしくお願いいたします。
        </p>

        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #999; text-align: center;">
          このメールは自動送信されています。<br>
          © 2024 STRIPE EC STORE. All rights reserved.
        </p>
      </div>
    </body>
    </html>
  `;
}