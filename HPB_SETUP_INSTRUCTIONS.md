# HPB Setup & Sync Status ページ — セットアップ手順

## 1. 環境変数設定

`.env.local` に以下を追加してください（既に追加済み）：

```env
# HPB Encryption
ENCRYPTION_KEY=b5907960d381532624b595546dca17324927207ad85f7f89a8021b45bec75361
```

## 2. Supabase テーブル作成

以下の SQL をSupabase SQL Editorで実行してテーブルを作成してください。

### 2.1 `salon_hpb_credentials` テーブル

HPBの認証情報を暗号化して保存します。

```sql
create table if not exists salon_hpb_credentials (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid references salons(id) on delete cascade unique,
  hpb_login_id_enc text not null,
  hpb_password_enc text not null,
  hpb_salon_id text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- インデックス
create index idx_salon_hpb_credentials_salon_id on salon_hpb_credentials(salon_id);
```

### 2.2 `sync_status` テーブル

データ同期の状態を管理します。

```sql
create table if not exists sync_status (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid references salons(id) on delete cascade unique,
  status text default 'healthy', -- 'healthy' | 'unhealthy' | 'maintenance'
  maintenance_mode boolean default false,
  last_sync_at timestamptz,
  last_error text,
  updated_at timestamptz default now()
);

-- インデックス
create index idx_sync_status_salon_id on sync_status(salon_id);
```

### 2.3 `sync_logs` テーブル

同期履歴のログを保存します。

```sql
create table if not exists sync_logs (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid references salons(id) on delete cascade,
  status text not null, -- 'success' | 'error'
  message text,
  created_at timestamptz default now()
);

-- インデックス
create index idx_sync_logs_salon_id on sync_logs(salon_id);
create index idx_sync_logs_created_at on sync_logs(created_at);
```

## 3. 実装済み機能

### HPB Setup ページ (`/dashboard/hpb-setup`)

- **概要**: HPBの認証情報（ログインID・パスワード・サロンID）を入力して保存
- **動作**:
  - フォーム送信時に `/api/salons/hpb-credentials` へ POST
  - サーバーで AES-256-GCM で暗号化
  - `salon_hpb_credentials` テーブルに upsert
- **免責事項**: 4項目を表示
  - 15分ごとのデータ取得タイムラグ
  - ダブルブッキングリスク
  - 同期失敗時のLINE予約停止
  - AES-256-GCM暗号化

### Sync Status ページ (`/dashboard/sync-status`)

- **概要**: HPBデータ同期の状態をリアルタイム監視
- **機能**:
  - ステータス表示（健全性バッジ）
  - 最終同期時刻
  - エラーメッセージ表示
  - メンテナンスモード切替
  - 同期ログ表示（直近10件）
  - 60秒ごと自動更新 + カウントダウン表示

### API エンドポイント

#### POST `/api/salons/hpb-credentials`

HPB認証情報を保存します。

**リクエスト**:
```json
{
  "hpb_login_id": "user@example.com",
  "hpb_password": "password123",
  "hpb_salon_id": "H000123456"
}
```

**レスポンス成功**:
```json
{ "success": true }
```

**レスポンスエラー**:
```json
{ "error": "エラーメッセージ" }
```

#### GET `/api/salons/[salonId]/availability`

空き時間情報を取得します。同期が不健全な場合は503エラー。

**レスポンス成功**:
```json
{
  "available": true,
  "slots": [],
  "lastSync": "2024-04-24T12:00:00Z"
}
```

**レスポンスエラー（503）**:
```json
{
  "available": false,
  "error": "unavailable",
  "reason": "sync_unhealthy" | "maintenance"
}
```

## 4. ナビゲーション更新

サイドバーに以下のリンクが追加されました：
- **HPB設定** → `/dashboard/hpb-setup`
- **同期状態** → `/dashboard/sync-status`

既存の「HPB連携」（`/dashboard/hotpepper`）は別ページです。

## 5. セキュリティ

### 暗号化について

- **暗号化方式**: AES-256-GCM（認証付き暗号）
- **鍵**: `ENCRYPTION_KEY` 環境変数（64文字のhex = 32バイト）
- **IV（初期化ベクトル）**: ランダムに生成（12バイト）
- **保存形式**: `{iv:authTag:ciphertext}` (hex エンコード、コロン区切り)

Supabase には暗号化済みテキストのみが保存され、平文は送信されません。

### RLS（Row Level Security）

必要に応じて以下のRLS設定を行ってください：

```sql
-- salon_hpb_credentials のRLS
alter table salon_hpb_credentials enable row level security;

create policy "Users can see their salon's HPB credentials"
  on salon_hpb_credentials
  for select
  using (
    salon_id in (
      select id from salons
      where owner_user_id = auth.uid()
    )
  );

-- sync_status のRLS
alter table sync_status enable row level security;

create policy "Users can see their salon's sync status"
  on sync_status
  for select
  using (
    salon_id in (
      select id from salons
      where owner_user_id = auth.uid()
    )
  );
```

## 6. デプロイ

コミットをpushするとVercelが自動デプロイします：

```bash
git push origin main
```

Vercelダッシュボードで以下を確認してください：
- ビルド成功 ✓
- デプロイ完了 ✓
- 環境変数 `ENCRYPTION_KEY` が設定されている ✓

## 7. テスト

### 1. HPB Setup ページのテスト

1. `/dashboard/hpb-setup` にアクセス
2. テストの認証情報を入力
3. 「保存」をクリック
4. "保存しました" メッセージが表示される
5. Supabaseで `salon_hpb_credentials` テーブルを確認
   - `hpb_login_id_enc` / `hpb_password_enc` が暗号化された状態で保存されているか確認

### 2. Sync Status ページのテスト

1. `/dashboard/sync-status` にアクセス
2. 「ステータス」セクションが表示されるか確認
3. メンテナンスモードボタンをテスト
4. 60秒のカウントダウンが動作しているか確認

### 3. Availability API のテスト

```bash
curl "https://your-domain.com/api/salons/{salonId}/availability"
```

予期される挙動：
- sync_status が存在しない → 404
- maintenance_mode = true → 503
- status ≠ 'healthy' → 503
- それ以外 → 200, `{ "available": true, "slots": [] }`

## 8. トラブルシューティング

### ビルドエラー: "ENCRYPTION_KEY is not set"

**原因**: `.env.local` に `ENCRYPTION_KEY` がない
**解決**: 手順1を実行して環境変数を追加

### 暗号化/復号化エラー

**原因**: 鍵の長さが64文字でない、または形式が不正
**解決**: `ENCRYPTION_KEY=b5907960d381532624b595546dca17324927207ad85f7f89a8021b45bec75361` を確認

### Supabaseエラー: "relation does not exist"

**原因**: テーブルが作成されていない
**解決**: 手順2のSQLをすべて実行

## 9. 今後の実装予定

このページは以下の機能の基盤です：

- [ ] 自動HPBデータ取得クローン（cron or webhook）
- [ ] 予約データの LINE との同期
- [ ] ダブルブッキング検出アラート
- [ ] HPB API 連携（直接sync）
