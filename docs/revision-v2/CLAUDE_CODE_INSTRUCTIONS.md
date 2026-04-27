# Claude Code 実装指示書 — SalonRink ダッシュボード改訂 v2

**作成日:** 2026-04-27
**対象リポジトリ:** salonrink (okuwabara07-gif's projects / Vercel Pro)
**本番URL:** https://salonrink.com
**Supabase:** fmpmgilgvvfezursmyic

---

## 目的

既存の SalonRink ダッシュボード9画面構成を スマホファースト5タブ構成 に再設計し、新しい「おたより配信」機能を実装する。AOKAE記事自動配信は廃止し、サロン主導のメッセージ配信に置き換える。

完成判定: 既存サロン（キレイ鶴見）が iPhone Safari からダッシュボード全機能を片手で操作でき、自店顧客に「おたより」を配信できる状態。

---

## 絶対ルール

### 既存資産を壊さない
- 認証・Stripe・LINE Webhook・メール認証は本番稼働中
- 既存テーブル salons / subscriptions / invite_codes / customers / reservations / kartes のカラム削除・型変更は禁止（追加は可）
- 本番Supabaseで直接SQLを実行する場合は必ず確認

### Vercel設定を変更しない
- Build Machine = Standard固定
- okuwabara07-gif's projects / salonrink で運用中
- Spend Management = $30/月設定済み

### マルチテナント分離（最重要）
- 全テーブルに salon_id カラムが存在することを確認
- RLS（Row Level Security）ポリシーが salon_id でフィルタしていることを確認
- フロント側でも useSalonContext() フックで取得した salon_id でAPI呼び出し
- 他店のデータが1ピクセルも見えてはいけない

### プライバシー絶対ルール
- Osamu の本名（桒原・栗原・奥原・その他のバリエーション）はコード・コメント・サンプルデータの一切で使用禁止
- サロンオーナー名のサンプルは「テスト太郎」「山田花子」など完全な架空名のみ使用

---

## 実装スコープ

### Phase A: ダッシュボード構造改訂（必須・最優先）

5タブ構成への再編：

旧構成（9画面・サイドバー縦並び）
- /dashboard, /booking, /line, /hotpepper, /karte, /richmenu, /plan, /settings, /shop

新構成（5タブ・スマホファースト）
- ホーム → /dashboard
- 予約 → /dashboard/booking
- 顧客 → /dashboard/customers   (旧 /karte を統合)
- 連携 → /dashboard/integrations (旧 /line, /hotpepper, /richmenu, おたより配信を統合)
- その他 → /dashboard/more         (旧 /plan, /settings, /shop へのナビゲーション)

実装手順:

1. app/dashboard/layout.tsx を全面書き換え
   - 既存サイドバー削除
   - 下部タブバー（モバイル）/ サイドバー（PC）の切替コンポーネント TabBar 追加
   - メディアクエリ @media (min-width: 768px) で切替

2. ルーティング再配置
   - 旧URLは redirect() で新URLへリダイレクト（既存ブックマーク対策）
   - /dashboard/karte/* → /dashboard/customers/*
   - /dashboard/line → /dashboard/integrations/line
   - /dashboard/hotpepper → /dashboard/integrations/hotpepper
   - /dashboard/richmenu → /dashboard/integrations/richmenu
   - /dashboard/plan → /dashboard/more/plan
   - /dashboard/settings → /dashboard/more/settings

3. /dashboard（ホーム）画面の再設計
   - KPIカード2枚: 「本日の予約」「今月売上」
   - 「次の予約」リスト（直近3件）
   - クイック操作ボタン: 「予約を追加」「カルテ作成」

4. /dashboard/integrations（連携）画面の新規作成
   - LINE / HPB / リッチメニュー / おたより配信を1画面に集約
   - 各カードにステータス表示（接続中・同期中・設定済み）と直近の数字
   - タップで個別画面へ遷移

5. /dashboard/customers（顧客）画面の再設計
   - 検索バー + カテゴリピル（全員 / VIP / 休眠）
   - 顧客リスト（アバター + 名前 + 前回来店日 + 来店回数）
   - タップでカルテ詳細へ遷移
   - 既存 /karte/* のロジックは保持

6. /dashboard/more（その他）画面の新規作成
   - リスト形式: プラン / 設定 / 店販EC（カミングスーン） / ログアウト

---

### Phase B: おたより配信機能（必須・新規実装）

機能概要:
- 送信元: サロン公式LINEアカウント（salons.line_account_id）
- 配信先: 自店顧客（customers.salon_id 一致）のみ
- コンテンツ: テキスト本文 + クーポン・キャンペーン告知

新規テーブル: docs/revision-v2/migration_phase_b.sql 参照

API Routes:
- POST   /api/otayori                      - おたより作成（下書き）
- GET    /api/otayori                      - おたより一覧
- GET    /api/otayori/[id]                 - 個別取得
- PUT    /api/otayori/[id]                 - 編集
- DELETE /api/otayori/[id]                 - 削除
- POST   /api/otayori/[id]/send            - 配信実行（同期）
- POST   /api/otayori/[id]/schedule        - 配信予約
- POST   /api/coupons                      - クーポン作成
- GET    /api/coupons                      - クーポン一覧
- PUT    /api/coupons/[id]                 - 編集
- DELETE /api/coupons/[id]                 - 削除

配信ジョブの実装ルール（最重要）:

POST /api/otayori/[id]/send の処理は以下の5ステップを必ず遵守:
1. salon_id バインディング検証（otayori.salon_id = session.salon_id）
2. 配信対象は自店顧客のみ（customers.salon_id = session.salon_id AND otayori_opt_in = true）
3. サロン情報を都度取得（salons.name をハードコード禁止）
4. LINE Push送信（顧客名差し込み）
5. ステータス更新（status='sent', sent_at=now, recipient_count）

LINE Push メッセージの構造:
- altText: ${salon_name}からのおたより
- 冒頭: ${customer_name}さま、こんにちは。${salon_name}です。
- 本文: ${otayori.body}
- クーポンカード（添付がある場合）
- 締め: ${salon_name}

---

### Phase C: 美容コラム配信アドオン（任意・後回しOK）

仕様:
- アドオン名: 美容コラム配信
- 価格: +¥300/月
- Stripe Price ID: STRIPE_PRICE_ID_BEAUTY_COLUMN（環境変数）
- 機能: おたより作成画面に「コラムを添付」ボタンが追加される

新規テーブル:
- beauty_columns（haircolor-lab記事キャッシュ）
- otayori_columns（おたより × コラムの紐付け）

Cron実装:
- 週1回 haircolor-lab.com のRSSをクロール → beauty_columns に追加
- アドオン契約サロンのみが選択画面で参照可能

廃止項目:
- 旧「広告非表示」アドオン（+¥500）は完全廃止（Stripe側でarchive済み）
- 旧「クーポン」+¥300 アドオン（無料化のため廃止）
- AOKAE記事配信の自動Cronは削除

---

## テスト要件

### テナント分離テスト（最重要）

シナリオ1: 他店データが見えないこと
1. キレイ鶴見でログイン
2. /dashboard/customers で表示される顧客が全員 salon_id = kirei であること
3. ブラウザのDevToolsで /api/customers のレスポンスを確認
4. 別サロンB のIDを直接URLに指定してアクセス → 404 or 403

シナリオ2: 他店の「おたより」が顧客に届かないこと
1. キレイ鶴見でおたより作成・配信
2. サロンB の顧客のLINE側を確認 → 何も届いていない
3. キレイ鶴見の顧客のLINEを確認 → 届いている、送信元「キレイ鶴見」表示

シナリオ3: salon_id バインディングの検証
1. SQLで otayori_deliveries.salon_id を全件確認
2. 配信先 customers.salon_id と一致していることを確認

### スマホUI/UXテスト

1. iPhone Safari で /dashboard を開く
2. 下部タブバー5項目すべてタップで遷移
3. 各画面が片手操作で完結すること（重要操作が画面上半分にない）
4. iOS Safari のセーフエリア（ホームバー）に被らない padding-bottom

### 既存機能の非破壊テスト

1. 既存の Stripe Live 決済が動く（テスト課金）
2. 既存の HPB 同期Botが動く（ConoHa VPS連携）
3. 既存の LINE Webhook が動く
4. 既存の Magic Link 認証が動く

---

## 実装の優先順位

P0（必須・即着手）:
- Phase A: ダッシュボード5タブ構造
- Phase B: おたより配信（テキスト+クーポン）
- テナント分離テスト全合格

P1（営業解禁前に完了）:
- Phase C: 美容コラム配信アドオン
- 旧アドオン廃止処理

P2（営業解禁後でOK）:
- Phase D: 削除・アーカイブ作業

---

## 環境変数（追加分）

既存（変更なし）:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- STRIPE_SECRET_KEY (sk_live_...)
- STRIPE_WEBHOOK_SECRET (whsec_...)
- LINE_CHANNEL_ACCESS_TOKEN
- LINE_CHANNEL_SECRET
- RESEND_API_KEY
- NEXT_PUBLIC_SITE_URL=https://salonrink.com
- CRON_SECRET

追加:
- STRIPE_PRICE_ID_BEAUTY_COLUMN  (美容コラム配信アドオン +¥300/月・Vercelに登録済み)
- HAIRCOLOR_LAB_RSS_URL=https://haircolor-lab.com/feed

---

## 完成判定チェックリスト

### Phase A 完了条件
- [ ] 下部タブバー5項目すべて遷移可能（モバイル）
- [ ] サイドバー5項目すべて遷移可能（PC）
- [ ] 旧URL（/dashboard/karte 等）が新URLにリダイレクト
- [ ] /dashboard/integrations で4機能すべてのステータスが表示
- [ ] /dashboard/customers で顧客リストとカルテ詳細が機能

### Phase B 完了条件
- [ ] おたより作成 → 下書き保存 → 配信実行が動く
- [ ] クーポン作成 → おたよりに添付 → LINE届く
- [ ] LINE届いたメッセージの送信元が「○○サロン公式」
- [ ] 顧客名差し込みが動く（「田中さま、こんにちは」）
- [ ] テナント分離テスト3シナリオ全合格

### Phase C 完了条件（後回しOK）
- [ ] アドオン契約者のみコラム添付ボタンが表示
- [ ] haircolor-lab記事一覧から選択可能
- [ ] LINE届いたメッセージにコラムリンクが含まれる

### 最終検証（キレイ鶴見で実施）
- [ ] iPhone Safari からダッシュボード全機能を片手操作
- [ ] 自店顧客に「おたより」を配信し、LINE届くことを確認
- [ ] 他店のデータが一切見えないことをDevToolsで検証

---

## 不明点があれば実装を止めて報告

推測で進めない。以下のような場合は必ず Osamu に確認:

- 既存テーブルの構造が指示書と異なる
- LINE Messaging API の仕様変更でFlexメッセージが届かない
- Stripeのアドオン課金のproration（日割り）でエラー
- RLSポリシーが既存の認証フローと衝突

---

Generated: 2026-04-27
