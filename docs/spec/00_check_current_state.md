# SalonRink ダッシュボード実装前 現状確認

## Claude Codeへの最初の指示

実装着手前に、以下のコマンドでSupabaseの現状を確認してください。

---

## STEP 1: Supabase既存テーブル確認

プロジェクトディレクトリ `~/Documents/salonrink` で確認。

確認用SQL（Supabase Dashboard で実行）:

```sql

---

## STEP 2: 確認すべきテーブル

| テーブル名 | 期待する状態 | 用途 |
|-----------|------------|------|
| salons | ✓ 存在・owner_user_id有 | サロン情報 |
| subscriptions | ✓ 存在 | Stripe連動 |
| invite_codes | ✓ 存在 | 招待コード |
| customers | ✓ 存在 | 顧客 |
| reservations | ✓ 存在 | 予約 |
| kartes | 新規作成 | カルテ |
| karte_photos | 新規作成 | カルテ写真 |
| karte_recipes | 新規作成 | 処方レシピ |
| salon_addons | 新規作成 | アドオン管理 |
| line_accounts | 新規作成 | LINE連携 |
| hpb_integrations | 新規作成 | HPB連携 |
| articles_queue | 新規作成 | AOKAE記事配信 |

---

## STEP 3: 環境変数確認

`.env.local` に以下が設定されているか確認：

---

## 報告フォーマット

この結果が出揃ったら、STEP 1 完了です。
