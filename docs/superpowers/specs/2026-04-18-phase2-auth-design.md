# Phase 2: 認証 + テナント分離 設計書

- **作成日**: 2026-04-18
- **対象**: SALOMÉ（SalonRink）
- **ステータス**: 設計承認済み（最小コスト案 v2）、実装計画待ち
- **事業主体**: AOKAE LLC
- **設計方針**: コスト最小化（インフラ月額¥0、依存最小、Phase 2.5に後送りできるものは削る）

## 1. 背景と目的

現状、`/dashboard` は Supabase の anon key で無認証に `salons` テーブルの最初の1件を誰にでも見せている。Phase 1 でハードコードされた anon key は env 化したが、**認証とテナント分離はゼロ**。本番運用に入る前に、サロンオーナーごとに自分の salon データのみ閲覧・編集できる状態にする。

また、`app/register/page.tsx` の最終ボタンは `handleSubmit()` を呼ばずに直接 Stripe に遷移しており、**登録データがどこにも保存されない致命的バグ**が存在する。これも本 Phase で解消する。

## 2. スコープ

### In-Scope
- サロンオーナー向け `/dashboard` の認証ゲート化
- Supabase Auth (Magic Link) 導入
- `/register` フォーム → Stripe → Magic Link → 初回ログイン の正常系フロー完成
- `salons` / `reservations` / `customers` への RLS 適用
- Stripe Payment Link の success_url 受け入れ（内容検証は Phase 2.5）
- `/login` ページ新設

### Out-of-Scope（Phase 2.5 に後送り）
- **Stripe Checkout Session の payment_status 検証**（→ 最小コスト版では省略）
- **Stripe Webhook**（`checkout.session.completed`, `customer.subscription.updated/deleted`）
- `stripe_customer_id`, `stripe_subscription_id` カラム追加
- 未課金サロンの自動アクセスブロック（`trial_ends_at` 監視）

### Out-of-Scope（Phase 3以降）
- 顧客向け `/customer` の認証（LIFF 別設計）
- 代理店向け `/agency` の認証
- 2要素認証
- E2E自動テスト（Playwright導入は別Phase）

## 3. 主要決定事項

| 項目 | 決定 | 理由 |
|---|---|---|
| 認証方式 | **Magic Link**（Supabase Auth） | パスワード管理不要、サロンオーナーは高頻度ログインしない |
| 対象ロール | **サロンオーナーのみ** | 顧客/代理店は別設計・Phase外 |
| 登録フロー | **Next.js完結型** | Railway依存を切り、自リポジトリ内でテスト可能 |
| SMTP | **Resend（無料枠）を Supabase Custom SMTP に設定** | 3000通/月で当面十分。コード側から Resend を直接呼ばず、Supabase Auth 標準フローで自動送信 |
| テナント分離 | **RLS（auth.uid() = owner_user_id）** | Supabase推奨、クライアント側のフィルタロジックを排除できる |
| Stripe検証 | **省略（Phase 2.5 で Webhook 導入）** | 最小コスト。`stripe` SDK 不要、`STRIPE_SECRET_KEY` 不要 |

## 4. アーキテクチャ

```
[ブラウザ]
   │
   ▼
[Next.js 16 App Router (Vercel)]
   │
   ├── app/register/page.tsx          … 既存フォーム（handleSubmit呼び出しに修正）
   ├── app/register/actions.ts        … "use server" — salons仮INSERT
   ├── app/register/complete/page.tsx … Stripe成功URL受け先、salonId で pending salon を確定＆Magic Link送信
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
   ├── public.salons         … +owner_user_id, +status、RLS有効
   ├── public.reservations   … RLS有効（自salon連鎖）
   └── public.customers      … RLS有効（自salon連鎖）
   │
   ▼
[Stripe]  決済（Payment Link、検証は Phase 2.5）
[Resend] Magic Link メール配信
```

### 追加パッケージ
```json
{
  "@supabase/supabase-js": "^2.x",
  "@supabase/ssr": "^0.5.x"
}
```
`stripe` SDK は不要（Phase 2.5 で Webhook 導入時に追加）。

### 新規環境変数
```
# Server-only
SUPABASE_SERVICE_ROLE_KEY=<Supabase Settings > API > service_role>
```
既存の `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` はそのまま再利用。
`STRIPE_SECRET_KEY` は Phase 2.5 で追加。

## 5. データモデル変更

### 5.1 マイグレーションSQL

```sql
-- salons テーブル拡張（最小カラムのみ。stripe_* は Phase 2.5）
alter table public.salons
  add column if not exists owner_user_id uuid references auth.users(id) on delete set null,
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
https://salonrink.vercel.app/register/complete?salon_id={CLIENT_REFERENCE_ID}&session_id={CHECKOUT_SESSION_ID}
```

### STEP 3 — salon確定 + Magic Link 送信（Stripe検証省略版）
```
app/register/complete/page.tsx (Server Component)
  ↓ URL params から salonId と session_id を取得
  ↓ admin で salons を SELECT:
    id=salonId AND status='pending' の行が存在するか確認
    （存在しない／既にactiveなら 404 or 再ログイン案内）
  ↓ admin で salons UPDATE:
    status='active',
    trial_ends_at = now() + '14 days'
  ↓ supabase.auth.signInWithOtp({ email, options:{ emailRedirectTo:'/auth/callback' } })
    （Supabase Custom SMTP=Resend 経由で自動メール送信）
  ↓ 画面: "決済完了！メールをご確認ください"
```
> Stripe の payment_status 検証は Phase 2.5（Webhook導入時）に実装。
> 現時点のリスク: URL直叩きで14日トライアル取得が可能だが、Subscriptionが作られていないため継続課金はされず、Phase 2.5 の Webhook 同期で自動失効する想定。

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
| `/register/complete` で salonId が pending でない | 「既に登録済みのようです」+ `/login` リンク |
| `signInWithOtp` / メール送信失敗 | リトライボタン＋サポート連絡先表示 |
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

### 最小化で削った依存
- `stripe` npm パッケージ（Phase 2.5 で追加）
- `STRIPE_SECRET_KEY` 環境変数（Phase 2.5 で追加）
- `stripe_customer_id` / `stripe_subscription_id` カラム（Phase 2.5 で追加）
- Resend API key をコード側で持つ実装（Supabase Custom SMTP に集約）

## 10. セキュリティ考慮

- `SUPABASE_SERVICE_ROLE_KEY` は Server Action / Route Handler のみで使用。`NEXT_PUBLIC_` プレフィックス禁止
- `/register/complete` は URLの salonId で DB を照会し status='pending' のみを通す（Stripe API 検証は Phase 2.5）
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

- **Stripe Dashboard**: 3つの Payment Link の success_url を `https://salonrink.vercel.app/register/complete?salon_id={CLIENT_REFERENCE_ID}&session_id={CHECKOUT_SESSION_ID}` に設定（`client_reference_id` は register ページで URL に付与）
- **Supabase Auth settings**:
  - Site URL: `https://salonrink.vercel.app`
  - Redirect URLs に追加: `https://salonrink.vercel.app/auth/callback`, `http://localhost:3000/auth/callback`
  - Custom SMTP として Resend を接続（Settings > Auth > SMTP Settings）
- **Resend**: アカウント作成、ドメイン認証（`salonrink.com` or `salonrink.vercel.app`）、SMTP 認証情報を Supabase に登録
- **Vercel**: 環境変数 `SUPABASE_SERVICE_ROLE_KEY` を追加（Stripe 関連は Phase 2.5 で追加）

## 13. 未解決事項（実装中に詰める）

- 初回ログイン時の `/dashboard` で「ようこそ」オンボーディングを出すか（UI判断）
- email 重複時の UX（Phase 2 では単純にサインイン扱い、見直しは後日）
- trial_ends_at の表示位置（dashboard の sidebar にバッジ表示するか）

## 14. 次のステップ

本仕様書が承認された後、`superpowers:writing-plans` スキルで実装計画を作成 → subagent-driven-development で実装開始。
