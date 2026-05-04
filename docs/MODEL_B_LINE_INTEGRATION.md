# SalonRink Model B LINE Integration

## 戦略

業界標準（A社・B社同様）のモデルB採用。
各美容師が自分の LINE 公式アカウントを開設し、Channel Token を SalonRink に登録する。

## 既存設計の活用

重要: `line_accounts` テーブル（20260427）と暗号化カラム（20260429）は既に実装済み。
本フェーズで追加するのは Phase 1.5 動作確認に必要な4カラムのみ。

---

## DB 設計

### line_accounts テーブル（既存 + 拡張）

| カラム | 型 | 説明 | 状態 |
|---|---|---|---|
| id | uuid PK | | 既存 |
| salon_id | uuid UNIQUE FK | salons.id ON DELETE CASCADE | 既存 |
| salon_code | text UNIQUE | Webhook URL 識別子（`/api/line/webhook/{salon_code}`） | 既存 |
| richmenu_id | text | LINE リッチメニュー ID | 既存 |
| richmenu_config | jsonb | リッチメニュー設定 | 既存 |
| active | boolean | LINE連携有効フラグ | 既存 |
| created_at | timestamptz | | 既存 |
| updated_at | timestamptz | | 既存 |
| channel_id | text | LINE Channel ID | 既存（20260429） |
| channel_access_token_enc | text | 暗号化 Channel Access Token | 既存（20260429） |
| channel_secret_enc | text | 暗号化 Channel Secret | 既存（20260429） |
| line_bot_basic_id | text | @xxxxx 形式 Bot basic ID | **今回追加** |
| line_webhook_url | text | 表示用 Webhook URL | **今回追加** |
| line_status | text | inactive / active / error | **今回追加** |
| line_connected_at | timestamptz | 初回接続成功日時 | **今回追加** |

**制約:**
- `salon_id UNIQUE` → 1サロン1レコード保証
- `line_status CHECK ('inactive', 'active', 'error')`
- `idx_line_accounts_status_active` → `WHERE line_status = 'active'` 部分インデックス

---

## アーキテクチャ

### 現状（モデルC）

```
環境変数 LINE_CHANNEL_TOKEN (共有)
  └─ pushMessage() ─→ LINE API
       全サロン共通のトークンを使用
```

### 新設計（モデルB）

```
line_accounts テーブル
  └─ salon_id → channel_access_token_enc (暗号化済み)
       └─ pushMessage(supabase, salonId, ...) ─→ LINE API
            サロンごとに個別トークンを使用
```

---

## API 設計

### lib/line.ts 新シグネチャ（Phase B で実装）

```typescript
async function pushMessage(
  supabase: SupabaseClient,
  salonId: string,
  userId: string,
  messages: unknown[]
): Promise<{ success: boolean; error?: string }>
```

内部フロー:
1. `line_accounts` から `salon_id` で検索
2. `line_status !== 'active'` なら `{ success: false, error: 'inactive' }` を返す
3. `channel_access_token_enc` を復号（`lib/crypto.ts` の `decrypt()`）
4. LINE API 呼び出し
5. エラー時は `line_status = 'error'` に更新

### 環境変数フォールバック（Phase B で実装）

```typescript
// line_status が 'inactive' または line_accounts レコードなし → 環境変数にフォールバック
const token = lineAccount?.line_status === 'active'
  ? decrypt(lineAccount.channel_access_token_enc)
  : process.env.LINE_CHANNEL_TOKEN
```

これにより既存 Phase 1.5 が継続稼働しつつ、各美容師がトークンを登録すると
自動的にモデルBに切り替わる。

---

## Webhook URL 設計

```
パターン: /api/line/webhook/{salonCode}
例:       /api/line/webhook/salon_abc123
```

`salonCode` を使う理由: 既存 `salon_code`（UNIQUE）を活用、UUID より短い。

LINE Developers Console での設定値（Phase D で自動生成・コピー機能を追加）:
```
https://salonrink.com/api/line/webhook/{salon_code}
```

---

## オンボーディングフロー（5ステップ）

1. 美容師が [LINE Developers Console](https://developers.line.biz/) で Messaging API チャネル作成
2. Channel ID, Channel Access Token, Channel Secret を取得
3. SalonRink ダッシュボード `/dashboard/integrations/line` で入力
   - 既存フォームに入力 → `app/api/salons/line-credentials/route.ts` が暗号化保存
4. SalonRink が表示する Webhook URL を LINE Developers Console に設定
5. テスト送信 → `line_status = 'active'` に更新

---

## 実装ロードマップ

### Phase A: DB 拡張 + ドキュメント（2026-05-04 完了）
- [x] `line_accounts` に4カラム追加（`20260504_line_accounts_model_b_extension.sql`）
- [x] 設計ドキュメント作成

### Phase B: lib/line.ts リファクタリング（2026-05-05）
- `pushMessage` の新シグネチャ実装
- `channel_access_token_enc` の復号ロジック（既存 `lib/crypto.ts` 活用）
- 環境変数フォールバック実装

### Phase C: Cron 改修（2026-05-05）
- `app/api/cron/reminder/route.ts` の `pushMessage` 呼び出しを新シグネチャに更新
- `reservation.salon_id` から Token 取得する流れに変更

### Phase D: ダッシュボード UI 拡張（2026-05-06）
- `/dashboard/integrations/line` に `line_bot_basic_id`, `line_status` 表示追加
- Webhook URL 自動生成・コピー機能

### Phase E: Webhook 改修（2026-05-07）
- `/api/line/webhook/[salonCode]` 動的ルート作成
- `salon_code` から `line_accounts` 取得
- `channel_secret_enc` で署名検証（HMAC-SHA256）

### Phase F: 統合テスト（2026-05-08）
- 各サロンのトークンで pushMessage 動作確認
- Webhook 受信確認
- フォールバック動作確認

---

## セキュリティ考慮事項

- `channel_access_token_enc` / `channel_secret_enc` は既に暗号化済み（`ENCRYPTION_KEY`）
- RLS でサロンごとのデータ分離（`20260427_create_rls_policies.sql`）
- ログ出力時は Token 値・`channel_id`・`line_user_id` を出さない（AGENTS.md A2）
- Webhook 受信時は `channel_secret_enc` を復号して署名検証（なりすまし防止）
- `line_webhook_url` カラムは表示用のみ（実際のルーティングは Next.js ファイルシステム）
