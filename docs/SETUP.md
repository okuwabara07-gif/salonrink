# SALOMÉ セットアップガイド

## 環境変数

`.env.local`（ローカル開発用、`.gitignore` 済み）に以下を設定:

```
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # 絶対にクライアントに漏らさない
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

本番（Vercel）では `NEXT_PUBLIC_SITE_URL=https://salonrink.vercel.app` に差し替える。

## Supabase 設定

### 初回マイグレーション

`scripts/migrations/001-phase2-auth.sql` を Supabase Dashboard の SQL Editor で実行。

### Auth 設定

Dashboard → Authentication → URL Configuration:
- **Site URL**: `https://salonrink.vercel.app`
- **Redirect URLs**:
  - `https://salonrink.vercel.app/auth/callback`
  - `http://localhost:3000/auth/callback`

### Custom SMTP (Resend)

Dashboard → Authentication → SMTP Settings で Enable Custom SMTP:
- Host: `smtp.resend.com`
- Port: `465`
- User: `resend`
- Pass: `<Resend API key>`
- Sender email: `noreply@salonrink.com`（Resend で認証済みドメイン）

## Stripe 設定

3つの Payment Link の success_url:
```
https://salonrink.vercel.app/register/complete?salon_id={CLIENT_REFERENCE_ID}&session_id={CHECKOUT_SESSION_ID}
```

## ローカル開発

```
npm install
npm run dev
```

http://localhost:3000 を開く。

## デプロイ

main ブランチへの push で Vercel が自動デプロイ。環境変数は Vercel Dashboard で設定。

## Phase 2 動作確認チェックリスト

Prerequisites 完了後、以下を順に確認:

1. 未ログインで http://localhost:3000/dashboard → `/login?redirect=/dashboard` にリダイレクトされる
2. `/login` で自分のメールを入力 → メール受信 → リンククリック → `/dashboard` 表示
3. サイドバー「ログアウト」→ `/login` 遷移、再度 `/dashboard` 叩くと redirect される
4. Supabase Table Editor で手動で salon 行を追加し、`owner_user_id` に自分の auth uid を入れる
5. `/dashboard` を再度開いて自salon情報が表示される
6. 新規 `/register` → Stripe test mode（`4242 4242 4242 4242`）→ `/register/complete` → メール受信 → 初回ログイン成功
7. 別ブラウザで別アカウント作成 → 相手の salon データが見えないこと（RLS確認）
