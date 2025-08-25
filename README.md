# Stripe EC Store - Next.js & Tailwind CSS

モダンなNext.js 14（App Router）とTailwind CSSを使用したStripe決済連携ECサイトです。

## 機能

- 商品一覧表示
- カート機能（追加/削除/数量変更）
- Stripe Checkout連携
- レスポンシブデザイン
- TypeScript対応

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

※npmのキャッシュ権限エラーが出る場合は:
```bash
sudo chown -R $(whoami) ~/.npm
```

### 2. Stripeアカウントの設定

1. [Stripe Dashboard](https://dashboard.stripe.com)でアカウントを作成
2. テスト環境のAPIキーを取得

### 3. 環境変数の設定

`.env.local`ファイルを編集して、Stripeのテストキーを設定:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_あなたの公開可能キー
STRIPE_SECRET_KEY=sk_test_あなたのシークレットキー
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開きます。

## テスト用カード情報

### 成功するテストカード
- カード番号: `4242 4242 4242 4242`
- 有効期限: 任意の将来の日付（例: 12/25）
- CVC: 任意の3桁（例: 123）
- 郵便番号: 任意の5桁（例: 12345）

### その他のテストカード
- 残高不足: `4000 0000 0000 9995`
- カード拒否: `4000 0000 0000 0002`
- 3Dセキュア必須: `4000 0025 0000 3155`

## プロジェクト構造

```
stripe-ec-site/
├── app/
│   ├── api/
│   │   ├── products/      # 商品API
│   │   └── checkout/       # 決済API
│   ├── components/         # UIコンポーネント
│   │   ├── Header.tsx
│   │   ├── ProductCard.tsx
│   │   └── Cart.tsx
│   ├── success/           # 決済完了ページ
│   ├── layout.tsx         # ルートレイアウト
│   └── page.tsx           # メインページ
├── lib/
│   ├── stripe.ts          # Stripe設定
│   └── types.ts           # TypeScript型定義
└── package.json
```

## 注意事項

- これはテスト環境用の設定です
- 本番環境では必ずHTTPSを使用してください
- APIキーは環境変数で適切に管理してください
- セキュリティ対策を追加実装してください

## ライセンス

MIT