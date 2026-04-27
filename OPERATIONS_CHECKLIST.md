# 🎯 SalonRink 営業解禁 オペレーションチェックリスト

**このドキュメントは、営業開始直前の最終確認・実行チェックリストです。**

---

## 📋 実行順序（必須）

本リストの項目は **上から順番に実行してください**。各ステップが完了するまで次に進まないください。

---

## フェーズ1: Supabase 本番デプロイ

### Step 1-1: テーブル作成 SQL 実行

**所要時間**: 2-3分  
**リスク**: 低（IF NOT EXISTS で保護）

#### 準備
- [ ] Supabase Dashboard: https://app.supabase.com にログイン
- [ ] 対象プロジェクトを選択（本番環境）
- [ ] SQL Editor を開く

#### 実行
- [ ] ファイルを開く: `supabase/migrations/20260427_create_dashboard_tables.sql`
- [ ] 全文をコピー
- [ ] SQL Editor に貼り付け
- [ ] **「Run」をクリック**
- [ ] ✅ エラーなく完了を確認

#### 検証

```sql
-- 以下を実行して 10 が返ることを確認
SELECT count(*) as table_count FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN (
  'salon_addons', 'line_accounts', 'line_customer_links',
  'hpb_integrations', 'salon_hpb_credentials', 'kartes',
  'karte_photos', 'karte_recipes', 'articles_queue', 'article_deliveries'
);
```

- [ ] 結果: `table_count = 10` ✅

---

### Step 1-2: RLS ポリシー設定 SQL 実行

**所要時間**: 2-3分  
**リスク**: 低（既存ポリシー上書き対応）

#### 実行
- [ ] ファイルを開く: `supabase/migrations/20260427_create_rls_policies.sql`
- [ ] 全文をコピー
- [ ] SQL Editor に新規クエリとして貼り付け
- [ ] **「Run」をクリック**
- [ ] ✅ エラーなく完了を確認

#### 検証

```sql
-- 以下を実行して 25+ が返ることを確認
SELECT count(*) as policy_count FROM pg_policies
WHERE tablename IN (
  'salon_addons', 'line_accounts', 'line_customer_links',
  'hpb_integrations', 'salon_hpb_credentials', 'kartes',
  'karte_photos', 'karte_recipes', 'article_deliveries'
);
```

- [ ] 結果: `policy_count >= 25` ✅

---

## フェーズ2: Vercel 環境変数設定

### Step 2-1: Vercel Dashboard で環境変数追加

**所要時間**: 1分  
**リスク**: 極低（環境変数のみ）

#### 実行
- [ ] Vercel Dashboard: https://vercel.com/dashboard
- [ ] Project「salonrink」を選択
- [ ] **Settings → Environment Variables**
- [ ] **「Add New」をクリック**

```
Name:  NEXT_PUBLIC_SALONRINK_URL
Value: https://salonrink.com
```

- [ ] **Environments**: Production ☑️ Preview ☑️ Development ☑️
- [ ] **「Save」をクリック**

#### 確認
- [ ] Environment Variables リストに表示されたことを確認
  ```
  NEXT_PUBLIC_SALONRINK_URL = https://salonrink.com
  ```

---

### Step 2-2: デプロイ再トリガー

**所要時間**: 1分  
**リスク**: 低（環境変数反映のため必須）

#### 実行
- [ ] Vercel Dashboard → **Deployments**
- [ ] 最新デプロイを見つける（日時表示）
- [ ] 右側の **3点メニュー → Redeploy**
- [ ] **「Redeploy」をクリック確認**

#### 待機
- [ ] デプロイが開始される（Status: Building...）
- [ ] デプロイ完了を待つ（Status: Ready）
  - 通常 1-2分で完了

- [ ] **✅ Ready 状態を確認**

---

## フェーズ3: 動作確認テスト（5-10分）

### Test A: アドオン ON/OFF 機能確認

**テスト内容**: salon_addons テーブルが正常に動作しているか確認

#### 準備
- [ ] ブラウザを開く（シークレット/プライベートモード推奨）
- [ ] URL: https://salonrink.com/dashboard
- [ ] テストアカウントでログイン

#### テスト実行
- [ ] **「その他」タブ → 「プラン管理」をクリック**
- [ ] ページが読み込まれることを確認
- [ ] 「アドオン管理」セクションを確認:
  ```
  ☐ 顧客カルテ        ON/OFF
  ☐ 店販EC            ON/OFF
  ☐ ポイントカード    ON/OFF
  ☐ ブログ発信        ON/OFF
  ☐ 売上確定申告      ON/OFF
  ☐ 複数スタッフ      ON/OFF
  ☐ 美容コラム配信    ON/OFF
  ```

#### テスト実行（メイン）
- [ ] 任意のアドオン（例: 顧客カルテ）の ON/OFF ボタンをクリック
- [ ] **期待される動作**:
  - ✅ ボタンが切り替わる
  - ✅ 成功メッセージが表示: 「アドオンを更新しました」
  - ✅ ページがリロードしない（SPA 動作）

#### エラー対応
- ❌ `relation "salon_addons" does not exist` エラー
  - → Step 1-1 をもう一度実行

- ❌ `permission denied` エラー
  - → Step 1-2 をもう一度実行

- [ ] **✅ テスト成功**

---

### Test B: Customer Portal リダイレクト確認

**テスト内容**: NEXT_PUBLIC_SALONRINK_URL が正しく設定されているか確認

#### テスト実行
- [ ] 同じ「プラン管理」ページの下部を下にスクロール
- [ ] 「支払い情報」セクションを確認
- [ ] **「Customer Portal を開く →」ボタンをクリック**

#### 期待される動作
- [ ] ✅ Stripe Customer Portal へリダイレクト
  - URL が `https://billing.stripe.com/...` に変わる
  - または Stripe ページに遷移

- [ ] ✅ 支払い方法・サブスクリプション情報が表示

#### エラー対応
- ❌ エラーメッセージが表示される
  - → Step 2-1 と 2-2 を確認
  - → デプロイが Ready 状態か確認
  - → ブラウザキャッシュをクリア（Ctrl+F5）してリロード

- [ ] **✅ テスト成功**

---

### Test C: テナント分離確認（重要）

**テスト内容**: RLS ポリシーが正常に機能しているか（最重要）

#### 準備（2つのテストアカウント必要）
- [ ] テストアカウント A: `salonA@example.com`（サロンA）
- [ ] テストアカウント B: `salonB@example.com`（サロンB）
- [ ] 各アカウントで少なくとも1つ顧客を作成

#### テスト実行（ユーザーA）
- [ ] ブラウザ1（シークレット）でテストアカウント A でログイン
- [ ] ダッシュボード → **「顧客」タブ**
- [ ] ユーザーA のサロンの顧客一覧が表示される
- [ ] メモ: 顧客の名前・数を記録
  - 例: 「田中太郎」「佐藤花子」（合計2人）

#### テスト実行（ユーザーB）
- [ ] ブラウザ2（シークレット）でテストアカウント B でログイン
- [ ] ダッシュボード → **「顧客」タブ**
- [ ] ユーザーB のサロンの顧客一覧が表示される

#### テナント分離の確認
- [ ] **ユーザーA の顧客** がユーザーB で見えない ✅
  - 例: ユーザーA に「田中太郎」がいても、ユーザーB には見えない
  
- [ ] **ユーザーB の顧客** がユーザーA で見えない ✅
  - 完全に独立した顧客一覧が表示される

#### 結果

- [ ] **✅ 完全に分離されている** → RLS 成功
- [ ] ❌ 同じ顧客が見えている → RLS 失敗
  - → Step 1-2 をもう一度実行
  - → SQL エラーがなかったか確認
  - → ブラウザキャッシュをクリア

- [ ] **✅ テスト成功**

---

## フェーズ4: 最終確認

### Step 4-1: 本番キャッシュクリア

- [ ] Vercel Dashboard → Deployments → 最新デプロイ
- [ ] **「...」メニュ→ Purge Cache**

- [ ] キャッシュ削除完了を確認

---

### Step 4-2: ブラウザキャッシュクリア（ユーザー向け案内）

営業開始時にユーザーに通知:

```
🔄 ブラウザキャッシュをクリアしてください

Chrome/Edge:  Ctrl+Shift+Delete
Safari:       Cmd+Shift+Delete (プライベートモード推奨)
Firefox:      Ctrl+Shift+Delete

キャッシュ削除後、https://salonrink.com/dashboard を再度開いてください
```

---

### Step 4-3: 最終ヘルスチェック

各ページが正常に動作するか確認:

- [ ] **ホーム** (`/dashboard`)
  - KPI 表示（本日予約数・週間予約数・新規顧客）
  - 直近予約リスト

- [ ] **予約** (`/dashboard/booking`)
  - 予約一覧が表示される

- [ ] **顧客** (`/dashboard/customers`)
  - 顧客一覧が表示される
  - 新規顧客作成ボタンが機能する

- [ ] **連携** (`/dashboard/integrations`)
  - LINE連携
  - HPB設定
  - HPB同期ステータス
  - 小町（お多より）

- [ ] **その他** (`/dashboard/more`)
  - プラン管理
  - 設定
  - ログアウト

- [ ] **✅ 全ページが正常に動作**

---

## ✅ 営業解禁判定

### 全テスト成功時

```
[x] Step 1-1: テーブル作成 SQL 実行
[x] Step 1-2: RLS ポリシー SQL 実行
[x] Step 2-1: Vercel 環境変数設定
[x] Step 2-2: デプロイ再トリガー
[x] Test A: アドオン ON/OFF 成功
[x] Test B: Customer Portal 成功
[x] Test C: テナント分離 成功
[x] Step 4-1: キャッシュ削除
[x] Step 4-2: ユーザー通知
[x] Step 4-3: ヘルスチェック

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ 営業解禁 OK
```

---

## ❌ トラブルシューティング

### SQL 実行エラー

| エラー | 原因 | 解決策 |
|--------|------|-------|
| `syntax error` | SQL 文の形式エラー | ファイルから全文コピー直接貼り付け |
| `permission denied` | 認証権不足 | Supabase サービスロール確認 |
| `relation exists` | テーブル既存 | IF NOT EXISTS があるので無視 |

### テスト失敗

| テスト | 失敗内容 | 確認項目 |
|--------|---------|---------|
| A | salon_addons エラー | Step 1-1 を再実行 |
| B | Portal エラー | Step 2 完了・デプロイ Ready 確認 |
| C | 他店データが見える | Step 1-2 を再実行 |

---

## 📞 サポート連絡先

問題が発生した場合:

1. 本ドキュメントの「トラブルシューティング」を確認
2. `docs/launch-checklist.md` の詳細を確認
3. Supabase Dashboard のログを確認
4. Vercel Dashboard のデプロイログを確認

---

## 記入欄

```
実行日時: _____________
実行者:   _____________

Step 1-1 完了時刻: _____________ ✅
Step 1-2 完了時刻: _____________ ✅
Step 2-1 完了時刻: _____________ ✅
Step 2-2 完了時刻: _____________ ✅
Test A 完了時刻:   _____________ ✅
Test B 完了時刻:   _____________ ✅
Test C 完了時刻:   _____________ ✅
Step 4 完了時刻:   _____________ ✅

営業解禁判定:       ✅ OK / ❌ NG
判定実行者:        _____________
判定完了日時:       _____________
```

---

**全チェック完了 → SalonRink の営業開始を宣言できます** 🎉

---

*Last Updated: 2026-04-27*  
*Created by: Claude Code (Haiku 4.5)*
