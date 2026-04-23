# Claude Code 実行指示書

## 🎯 目的

SalonRink ダッシュボード8画面の完全実装。
営業解禁の前提条件を満たす「完成」を達成する。

---

## ⚠️ 絶対ルール

1. **既存コードを壊さない**
   - 既存の認証・Stripe・Webhook・メール認証は稼働中
   - 既存テーブル（salons / subscriptions / invite_codes）は変更禁止

2. **Vercel設定を変更しない**
   - ビルドマシン: Standard固定
   - okuwabara07-gifs-projects/salonrink で運用中

3. **本番データを触らない**
   - 本番Supabaseで直接SQLを実行する場合は必ず確認

4. **セキュリティ**
   - LINE Webhook署名検証必須
   - Stripe Webhook署名検証必須
   - RLSポリシーを全テーブルに適用

---

## 📋 実行手順

### STEP 0: 現状確認
00_check_current_state.md を参照

### STEP 1: DBセットアップ
01_database_schema.sql をSupabaseで実行済み

### STEP 2: コンポーネント基盤作成

### STEP 3: 画面実装（優先順）

**Phase 1: 基盤**
1. app/dashboard/layout.tsx
2. app/dashboard/page.tsx
3. app/dashboard/settings/page.tsx

**Phase 2: 予約系**
4. app/dashboard/line/page.tsx
5. app/dashboard/hotpepper/page.tsx
6. app/dashboard/booking/page.tsx

**Phase 3: カルテ**
7. app/dashboard/karte/page.tsx
8. app/dashboard/karte/[customerId]/page.tsx
9. app/dashboard/richmenu/page.tsx

**Phase 4: プラン**
10. app/dashboard/plan/page.tsx

### STEP 4: API Routes実装

### STEP 5: Vercel設定
vercel.json で Cron Jobs設定

### STEP 6: テスト実施（キレイ鶴見で）
- LINE予約フロー
- カルテ作成
- HPB同期
- アドオン変更

---

## ✅ 完了報告

完成時：
