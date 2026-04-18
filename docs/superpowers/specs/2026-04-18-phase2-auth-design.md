# Phase 2: 認証 + テナント分離 設計書

- **作成日**: 2026-04-18
- **対象**: SALOMÉ（SalonRink）
- **ステータス**: 設計承認済み、実装計画待ち
- **事業主体**: AOKAE LLC

## 1. 背景と目的

現状、`/dashboard` は Supabase の anon key で無認証に `salons` テーブルの最初の1件を誰にでも見せている。Phase 1 でハードコードされた anon key は env 化したが、**認証とテナント分離はゼロ**。本番運用に入る前に、サロンオーナーごとに自分の salon データのみ閲覧・編集できる状態にする。

また、`app/register/page.tsx` の最終ボタンは `handleSubmit()` を呼ばずに直接 Stripe に遷移しており、**登録データがどこにも保存されない致命的バグ**が存在する。これも本 Phase で解消する。

## 2. スコープ

### In-Scope
- サロンオーナー向け `/dashboard` の認証ゲート化
- Supabase Auth (Magic Link) 導入
- `/register` フォーム → Stripe → Magic Link → 初回ログイン の正常系フロー完成
- `salons` / `reservations` / `customers` への RLS 適用
- Stripe Checkout Session の success_url 検証フロー
- `/login` ページ新設

### Out-of-Scope（Phase 3以降）
- 顧客向け `/customer` の認証（LIFF 別設計）
- 代理店向け `/agency` の認証
- Stripe Webhook（サブスクキャンセル・支払失敗の反映）
- 2要素認証
- E2E自動テスト（Playwright導入は別Phase）

## 3. 主要決定事項

| 項目 | 決定 | 理由 |
|---|---|---|
| 認証方式 | **Magic Link**（Supabase Auth） | パスワード管理不要、サロンオーナーは高頻度ログインしない |
| 対象ロール | **サロンオーナーのみ** | 顧客/代理店は別設計・Phase外 |
| 登録フロー | **Next.js完結型** | Railway依存を切り、自リポジトリ内でテスト可能 |
| SMTP | **Resend（無料枠）** | 3000通/月で当面十分。Supabase内蔵は4通/時で本番不可 |
| テナント分離 | **RLS（auth.uid() = owner_user_id）** | Supabase推奨、クライアント側のフィルタロジックを排除できる |

## 4. アーキテクチャ

```
[ブラウザ]
   │
   ▼
[Next.js 16 App Router (Vercel)]
   │
   ├── app/register/page.tsx          … 既存フォーム（handleSubmit呼び出しに修正）
   ├── app/register/actions.ts        … "use server" — salons仮INSERT
   ├── app/register/complete/page.tsx … Stripe成功URL受け先、session検証＆Magic Link送信
   ├── app/auth/callback/route.ts     … Magic Link code→session交換、owner_user_id埋め
   ├── app/auth/signout/route.ts      … signOut+cookie削除
   ├── app/login/page.tsx             … メール入力→signInWithOtp
   ├── app/dashboard/page.tsx         … Server Component化、自salonのみ取得
   ├── app/dashboard/actions.ts       … "use server" — iCal URL保存など
   ├── lib/supabase/server.ts         … createServerClient（cookies付き）
   ├── lib/supabase/client.ts         … createBrowserClient
   ├── lib/supabase/admin.ts          … service_roleクライアント（Server専用）
   └── proxy.ts                       … /dashboard保護（Next16のmiddleware後継）
   │
   ▼
[Supabase]
   ├── auth.users            … Magic Link管理
   ├── public.salons         … +owner_user_id, +stripe_*, +status、RLS有効
   ├── public.reservations   … RLS有効（自salon連鎖）
   └── public.customers      … RLS有効（自salon連鎖）
   │
   ▼
[Stripe]  決済 + Checkout Session 検証
[Resend] Magic Link メール配信
```

### 追加パッケージ
```json
{
  "@supabase/supabase-js": "^2.x",
  "@supabase/ssr": "^0.5.x",
  "stripe": "^17.x"
}
```

### 新規環境変数
```
# Server-only
SUPABASE_SERVICE_ROLE_KEY=<Supabase Settings > API > service_role>
STRIPE_SECRET_KEY=<Stripe Dashboard > API keys > secret>
```
既存の `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` はそのまま再利用。

## 5. データモデル変更

### 5.1 マイグレーションSQL

```sql
-- salons テーブル拡張
alter table public.salons
  add column if not exists owner_user_id uuid references auth.users(id) on delete set null,
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists status text default 'pending'
    check (status in ('pending','active','past_due','canceled'));

create index if not exists salons_email_idx on public.salons (email);
create index if not exists salons_owner_user_id_idx on public.salons (owner_user_id);

-- RLS 有効化
alter table public.salons enable row level security;
alter table public.reservations enable row level security;
alter table public.customers enable row level security;

-- ポリシー
create policy "salons_owner_rw" on public.salons
  for all using (auth.uid() = owner_user_id)
  with check (auth.uid() = owner_user_id);

create policy "reservations_owner_rw" on public.reservations
  for all using (
    salon_id in (select id from public.salons where owner_user_id = auth.uid())
  )
  with check (
    salon_id in (select id from public.salons where owner_user_id = auth.uid())
  );

create policy "customers_owner_rw" on public.customers
  for all using (
    salon_id in (select id from public.salons where owner_user_id = auth.uid())
  )
  with check (
    salon_id in (select id from public.salons where owner_user_id = auth.uid())
  );
```

### 5.2 登録時の service_role 経由INSERT
`salons` の INSERT は RLS を迂回する必要があるため、Server Action から `SUPABASE_SERVICE_ROLE_KEY` で行う。クライアントには絶対に漏らさない。

## 6. エンドツーエンド データフロー

### STEP 1 — 登録フォーム送信
```
/register フォーム最終ボタン
  ↓ Server Action: registerSalon(form)
  ↓ admin client で salons INSERT
    (owner_user_id=null, status='pending', email=form.email, ...)
  ↓ 返値 { salonId }
  ↓ window.location.href = STRIPE_LINKS[plan]
      ?client_reference_id=<salonId>&prefilled_email=<email>
```

### STEP 2 — Stripe 決済
Stripe Payment Link で決済完了 → success_url へリダイレクト:
```
https://salonrink.vercel.app/register/complete?session_id={CHECKOUT_SESSION_ID}
```

### STEP 3 — 決済確認 + Magic Link 送信
```
app/register/complete/page.tsx (Server Component)
  ↓ stripe.checkout.sessions.retrieve(session_id)
  ↓ status=complete & payment_status=paid を確認
  ↓ admin で salons UPDATE:
    status='active', stripe_customer_id=..., stripe_subscription_id=...,
    trial_ends_at = now()+'14 days'
  ↓ supabase.auth.admin.generateLink({ type:'magiclink', email }) で Magic Link取得
  ↓ Resend 経由でユーザーに送信（件名: 「SALOMÉ へようこそ - ログインリンク」）
  ↓ 画面: "決済完了！メールをご確認ください"
```

### STEP 4 — Magic Link クリック → 初回ログイン
```
メール上のリンク → https://salonrink.vercel.app/auth/callback?code=xxx
  ↓ Route Handler: exchangeCodeForSession(code)
  ↓ session cookie Set-Cookie で発行
  ↓ admin で salons UPDATE:
    owner_user_id = user.id WHERE email = user.email AND owner_user_id IS NULL
  ↓ redirect('/dashboard')
```

### STEP 5 — 以降のログイン
```
/login → email 入力 → signInWithOtp({ email })
  ↓ Magic Link 受信 → /auth/callback → /dashboard
```

### STEP 6 — ログアウト
```
/auth/signout → supabase.auth.signOut() → redirect('/login')
```

## 7. ルート保護（proxy.ts）

> **Next.js 16 では `middleware.ts` → `proxy.ts` に名称変更**（関数名も `proxy`）。Supabase公式ドキュメントは旧`middleware.ts`前提なので、ここで翻訳済み実装を記載。

```ts
// proxy.ts (project root)
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_PREFIXES = ['/dashboard']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isProtected = PROTECTED_PREFIXES.some(p => pathname.startsWith(p))
  if (!isProtected) return NextResponse.next({ request })

  let response = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookies) => {
          cookies.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg)$).*)'],
}
```

Server Component 側 (`/dashboard/page.tsx`) でも `supabase.auth.getUser()` を再実行し、proxy に頼らない二重チェックを行う（公式推奨）。

## 8. エラーハンドリング

| 状況 | 処理 |
|---|---|
| Stripe session が未決済 | `/register/complete` でエラー表示＋再決済リンク |
| `generateLink` / メール送信失敗 | リトライボタン＋サポート連絡先表示 |
| `/auth/callback` で code 無効・期限切れ | `/login?error=invalid_link` に戻す |
| RLS で自salonが見つからない | `/dashboard` で「サロンがリンクされていません」＋サポート連絡 |
| email 重複登録 | Server Action で既存チェック、既存ありなら Magic Link のみ送信（サインイン扱い） |

## 9. インフラコスト

### 月次固定費（Phase 2 完了時点）

| サービス | 費用 | 備考 |
|---|---|---|
| Supabase | **$0** | Free tier: 50k MAU / 500MB DB / 2GB帯域 |
| Vercel | **$0** | Hobby（商用本格化後 Pro $20/mo） |
| Resend | **$0** | 3,000通/月無料 |
| Stripe | $0 | 決済発生時 3.6%（JCB/Amex 3.95%） |
| LINE Messaging API | $0 | 200通/月まで無料（Phase2ではまだ未使用） |
| **合計** | **¥0/月** | |

### 課金発動条件とその時点の費用

| 閾値 | 発動する有料化 | 月額 |
|---|---|---|
| アクティブサロン ~500社超 | Resend Pro | $20 |
| 商用運用開始 or 帯域 100GB/月超 | Vercel Pro | $20/人 |
| MAU 50k超 or DB 500MB超 | Supabase Pro | $25 |
| 契約1件（ミディアム¥3,980） | Stripe決済手数料 | ¥143/件 |

### コストダウン代替案

| 項目 | 現在案 | より安い代替 | トレードオフ |
|---|---|---|---|
| SMTP | Resend 無料 | AWS SES ($0.10/1000通) | ドメイン検証の初期工数が重い |
| ホスティング | Vercel Hobby | Cloudflare Pages（商用無料） | Next.js 16 + App Router の最適化レベルが劣る可能性 |
| Auth | Supabase Auth | 自前実装 | 工数激増、本末転倒 |

**結論**: Phase 2 完了時点では**追加コストゼロ**。将来の課金ポイントは把握済みで、サービス移行の選択肢も残している。

## 10. セキュリティ考慮

- `SUPABASE_SERVICE_ROLE_KEY` は Server Action / Route Handler のみで使用。`NEXT_PUBLIC_` プレフィックス禁止
- `/register/complete` は URLパラメータを信じず、Stripe API で session を再取得して検証
- Magic Link 有効期限は Supabase デフォルト1時間
- RLS は「拒否がデフォルト」、ポリシーで明示的に許可

## 11. テスト戦略

自動テストは Phase 2 では導入しない（既存ゼロ、Phase肥大化を避ける）。以下の手動E2E チェックリストをローンチ前に実施:

1. 未ログインで `/dashboard` → `/login?redirect=/dashboard` にリダイレクトされる
2. `/login` で email 入力 → Magic Link メール受信（実メール確認）
3. Magic Link クリック → session cookie 発行 → `/dashboard` 表示
4. `/dashboard` に自salon のデータのみ表示（他salon は見えない）
5. ログアウト → `/login` へ遷移、直叩きで `/dashboard` に入れない
6. 新規 `/register` → Stripe test mode → `/register/complete` → メール受信 → 初回ログイン成功
7. 2アカウントで同時ログインし、相互のデータが見えないこと（RLS検証）

Playwright 導入は Phase 3 以降の別タスク。

## 12. 手作業（ユーザー側）

実装完了後、以下はユーザー（Osamu）が直接行う必要がある:

- **Stripe Dashboard**: 3つの Payment Link の success_url を `https://salonrink.vercel.app/register/complete?session_id={CHECKOUT_SESSION_ID}` に設定
- **Supabase Auth settings**:
  - Site URL: `https://salonrink.vercel.app`
  - Redirect URLs に追加: `https://salonrink.vercel.app/auth/callback`, `http://localhost:3000/auth/callback`
  - Custom SMTP として Resend を接続
- **Resend**: アカウント作成、ドメイン認証（`salonrink.com` or `salonrink.vercel.app`）、API key 発行
- **Vercel**: 環境変数 `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `RESEND_API_KEY` を追加

## 13. 未解決事項（実装中に詰める）

- Resend 経由で Magic Link を送る際、Supabase の Custom SMTP 設定で済むか、明示的に `generateLink` → Resend `send()` でコントロールするかは実装時判断
- 初回ログイン時の `/dashboard` で「ようこそ」オンボーディングを出すか（UI判断）
- email 重複時の UX（Phase 2 では単純にサインイン扱い、見直しは後日）

## 14. 次のステップ

本仕様書が承認された後、`superpowers:writing-plans` スキルで実装計画を作成 → subagent-driven-development で実装開始。
