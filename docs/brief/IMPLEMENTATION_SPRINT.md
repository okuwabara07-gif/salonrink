# SalonRink Concierge 実装スプリント計画 (20日)

> モックアップ4シーンを最適順序で実装するためのスプリント計画。
> 既存メモリの最優先タスク(salon_menus RLS確認→メニューCRUD UI実装→menuToPrice廃止)から逆順に着手し、最後にオンボーディングを完成させる構成。

---

## 全体ロードマップ

| Sprint | 期間 | スコープ | 完了基準 |
|---|---|---|---|
| 1 | Day 1-3 | シーン4: メニューCRUD | キレイ鶴見店でメニュー編集が動く、menuToPrice廃止 |
| 2 | Day 4-7 | シーン3: LIFFダッシュボード | KPI3枚+予約一覧+承認待ちが表示される |
| 3 | Day 8-12 | シーン2: LINE OA + コンシェルジュ配信化 | @salonrink-concierge-owner朝7時に配信動作 |
| 4 | Day 13-17 | シーン1: オンボーディングBot | 友だち追加→5分でセットアップ完了 |
| 5 | Day 18-20 | 統合テスト + キレイ鶴見店実証 | LP→Bot→Setup→Daily Use が一貫動作 |

並行Track: LP書き換え(salonrink.com/concierge/)とLINEミニアプリ昇格はWeek 2-3で進める。

---

## Sprint 1 (Day 1-3): シーン4 — メニューCRUD

**目標**: salon_menusテーブル基盤の確立 + menuToPrice廃止

### Day 1: salon_menus RLS確認・修正

- [ ] `day01_salon_menus_rls.sql` をSupabase SQL Editorで実行
- [ ] RLSポリシー4種(SELECT/INSERT/UPDATE/DELETE)が適用されているか確認
- [ ] テストクエリで自分のサロンのメニューだけ取得できるか検証
- [ ] サンプルデータが入っているか確認、なければキレイ鶴見店のメニュー15件投入

### Day 2: メニューCRUD API実装

- [ ] `app/api/menus/route.ts` (GET/POST) 実装
- [ ] `app/api/menus/[id]/route.ts` (PATCH/DELETE) 実装
- [ ] Zodバリデーションスキーマ定義
- [ ] Postman/curlで動作確認
- [ ] エラーハンドリング(401/403/500)を網羅

### Day 3: LIFFメニュー編集ページ実装

- [ ] `app/liff/menu/page.tsx` (LIFF初期化)
- [ ] `app/liff/menu/MenuList.tsx` (一覧+カテゴリタブ)
- [ ] `app/liff/menu/MenuEditor.tsx` (編集モーダル)
- [ ] `app/liff/menu/MenuCreate.tsx` (新規追加FAB)
- [ ] ドラッグ並べ替え(sort_order更新、@dnd-kit/sortable)
- [ ] キレイ鶴見店のLINEから実機テスト

### Day 3-α: menuToPrice廃止

- [ ] 既存コードから `menuToPrice()` 呼び出し箇所を全検索
- [ ] `salon_menus` 部分一致ルックアップ関数 `findMenuByName(salonId, hpbMenuName)` 実装
- [ ] HPB同期Bot(VPS側)からの予約取込時にこの関数で価格解決
- [ ] HPBメニュー名のサンプル20件でマッチ率確認、80%以上目標

---

## Sprint 2 (Day 4-7): シーン3 — LIFFダッシュボード

**目標**: LIFFのホーム画面確立、日常の入口

### Day 4-5: KPIロジック実装

- [ ] `lib/kpi.ts` に集計関数: `getMonthlyRevenue` / `getNewBookings` / `getRepeatRate`
- [ ] `cons_daily_analysis` テーブルから日次データ取得、月次集計
- [ ] 前月比トレンド計算
- [ ] `app/api/kpi/route.ts` GET実装

### Day 6: ダッシュボードページ実装

- [ ] `app/liff/dashboard/page.tsx` 実装
- [ ] KPIカード3枚(売上・新規・リピート率)
- [ ] 「今日の予約」セクション(HPB/LINE/新規タグ付き)
- [ ] 「承認待ち」セクション(AIカルテ一括承認)

### Day 7: ボトムナビ + ルーティング

- [ ] `app/liff/_components/BottomNav.tsx` 共通コンポーネント
- [ ] 5タブ(ホーム/カルテ/顧客/メニュー/設定)
- [ ] 各タブの空ページ作成(後続で実装)
- [ ] LIFF基盤共通レイアウト整備

---

## Sprint 3 (Day 8-12): シーン2 — LINE OA + コンシェルジュ配信化

**目標**: @salonrink-concierge-owner 新設、朝7時/夜21時配信稼働

### Day 8: LINE Developers設定

- [ ] LINE Developers Console で `@salonrink-concierge-owner` チャネル作成
- [ ] Messaging API有効化、Webhook URL設定: `https://salonrink.com/api/line/owner-webhook`
- [ ] チャネルアクセストークン発行、Vercel環境変数登録
- [ ] LINE_OWNER_CHANNEL_TOKEN / LINE_OWNER_CHANNEL_SECRET

### Day 9: Webhook実装

- [ ] `app/api/line/owner-webhook/route.ts` 実装
- [ ] 署名検証(LINE_OWNER_CHANNEL_SECRET)
- [ ] イベントタイプ別ハンドラ: follow / message / postback
- [ ] エラー時のSlack通知

### Day 10: リッチメニュー設計・登録

- [ ] 6マスのリッチメニュー画像作成(2500x1686px)
- [ ] LINE Official Account Manager または API でアップロード
- [ ] postback action 6種設定: today / karte / customer / menu / report / settings
- [ ] LIFFへの遷移URL設定(menu→/liff/menu, settings→/liff/settings)

### Day 11: コンシェルジュ朝配信実装

- [ ] `lib/line/flex/morning-summary.ts` Flex Messageテンプレート
- [ ] 既存 `cons_daily_analysis` を入力にFlex Message生成
- [ ] `app/api/cron/morning-broadcast/route.ts` 実装
- [ ] `vercel.json` cron設定: `0 22 * * *` (UTC = JST 07:00)
- [ ] 全sale on salonsに対してpush message送信

### Day 12: 夜配信 + postbackハンドリング

- [ ] `lib/line/flex/evening-review.ts` テンプレート
- [ ] 夜配信cron: `0 12 * * *` (UTC = JST 21:00)
- [ ] postback「カルテ承認」「提案送信」のハンドラ実装
- [ ] 「送って」「却下」などの自由テキスト応答実装
- [ ] キレイ鶴見店で実機テスト、3日間連続動作確認

---

## Sprint 4 (Day 13-17): シーン1 — オンボーディングBot

**目標**: LP「LINEで始める」→ 5分でセットアップ完了する体験

### Day 13: 会話ステートマシン設計

- [ ] `lib/onboarding/state.ts` 状態管理(salon_name → hpb_url → plan → stripe)
- [ ] Supabase `onboarding_sessions` テーブル新設(line_user_id, state, data, expires_at)
- [ ] 各状態の遷移ロジック実装

### Day 14: 会話フロー実装

- [ ] follow イベントで初期メッセージ送信
- [ ] サロン名入力受付
- [ ] HPB利用Quick Reply (はい/いいえ/後で)
- [ ] HPB URL検証
- [ ] プラン選択Flex Message(Solo/Salon)

### Day 15: Stripe Checkout連携

- [ ] `app/api/stripe/onboarding-checkout/route.ts` 実装
- [ ] line_user_id をmetadataに保存
- [ ] Checkout完了Webhook で salons / staff_users 作成
- [ ] LINE Push messageで「セットアップ完了」通知

### Day 16: エラーケース対応

- [ ] セッションタイムアウト(24時間)
- [ ] 中断→再開フロー
- [ ] 入力ミス時の修正フロー
- [ ] サポート問い合わせへのエスカレーション

### Day 17: テスト

- [ ] テスト用 LINE OA で5回完走テスト
- [ ] 異常系(URL無効、決済失敗、二重登録)を網羅
- [ ] キレイ鶴見店アカウントで再オンボーディングできるか検証

---

## Sprint 5 (Day 18-20): 統合テスト + 実証

### Day 18: E2Eテスト

- [ ] LP CTA → 友だち追加 → Bot会話 → Stripe決済 → LIFFダッシュボード
- [ ] 翌朝7時のコンシェルジュ配信確認
- [ ] リッチメニューから全機能へのアクセス確認

### Day 19: パフォーマンス・コスト確認

- [ ] LINE Messaging API送信数モニタリング
- [ ] Claude Haiku API使用量
- [ ] Supabase行数・クエリ実行時間
- [ ] Vercel Functions実行時間・冷却

### Day 20: 営業解禁判断

- [ ] キレイ鶴見店で7日間連続動作実証完了
- [ ] LP公開済み(salonrink.com/concierge/)
- [ ] 商標出願検討開始(Cotobox)
- [ ] 営業先サロン候補リストアップ

---

## 並行Track: LP書き換え + LINEミニアプリ昇格

| 期間 | LP書き換え | ミニアプリ昇格 |
|---|---|---|
| Week 1 (Day 1-7) | feature/lp-marketin-v1ブランチ作業 | (準備) |
| Week 2 (Day 8-14) | LP仕上げ、In Actionセクション埋め込み | LINE Developersコンソール設定、規約整備 |
| Week 3 (Day 15-20) | salonrink.com/concierge/ 本番公開 | LIFF → ミニアプリ昇格、サービスメッセージAPI切替 |

---

## 完了の定義(Definition of Done)

各Sprintの完了基準:

- [ ] コード commit (commit messageに全角括弧使用しないこと)
- [ ] Vercel本番デプロイ
- [ ] キレイ鶴見店アカウントで実機動作確認
- [ ] エラー発生時のロールバック手順確認
- [ ] 次Sprintの開始条件が満たされている

---

## リスク管理

| リスク | 対策 |
|---|---|
| salon_menus RLS設定ミスでデータ取得できず | Day 1のSQLを段階適用、テストSELECT実行 |
| HPB同期Botとの整合性が崩れる | Day 3-α前にVPS側のmenuToPrice呼出箇所を完全洗い出し |
| LINE Webhook署名検証の落とし穴 | 開発初期にLINE Developers Consoleの検証ツールで疎通確認 |
| Stripe Webhook二重課金 | idempotency key導入、metadataで重複検知 |
| キレイ鶴見店データ汚染 | 本番投入前にステージング環境で検証 |

---

## Sprint 2 振り返り (2026/05/22)

### 実装完了サマリー

| Day | タスク | 成果 | Commit |
|---|---|---|---|
| 4-5 | KPI ロジック実装 | `getMonthlyRevenue` / `getNewBookingsCount` / `getRepeatRate` 完成 | a171730 |
| 5 | 「今日の予約」セクション | 予約一覧表示（時刻・顧客名・メニュー・価格・source バッジ） | 526098c |
| 6 | BottomNav 共通化 | Sprint 1 /liff/menu にも BottomNav を組み込み、UI 統一化 | e8768ed |
| 7 | タイムゾーン修正 | UTC → JST 統一（「今日」判定・時刻表示・月初判定） | 595d278 |

**本番稼働**: salonrink.com/liff で動作確認済み。iPhone 実機テスト OK。

### 主な学び（次 Sprint への知見）

1. **スキーマ確認は Supabase SQL 直接確認を優先**
   - Claude Code のスキーマ推測は信頼度が低い
   - `SELECT column_name, data_type FROM information_schema.columns WHERE table_name='hpb_reservations'` で確実に確認

2. **環境変数名は新規追加せず既存名を再利用**
   - LIFF 初期化で NEXT_PUBLIC_LIFF_ID_MENU を新たに作らず、既存 NEXT_PUBLIC_LIFF_ID に統一すべきだった
   - 但し、現状 NEXT_PUBLIC_LIFF_ID_MENU で動作しており、変更は不要

3. **タイムゾーン処理は最初から JST 統一**
   - サーバーが UTC で動作していても、クライアント側での変換は不十分
   - Supabase フィルタ時点で JST 基準に統一する（`new Date('YYYY-MM-DDTHH:MM:SS+09:00')`）
   - toLocaleString / toLocaleTimeString に `timeZone: 'Asia/Tokyo'` を明示

4. **salons の単一レコード取得は maybeSingle()を期待値として設計**
   - `maybeSingle()` は 0 件または 1 件を返す
   - 複数件が返される異常系は初期段階でテストして検出すべき

5. **hpb_reservations に price なし → salon_menus との JOIN が必須**
   - price は salon_menus.price で解決
   - menu_name のマッピングは現在のサンプルマッチで約 80% 精度
   - 残り 20% は HPB Bot 側の取得精度向上が必須

### 未対応事項（将来の別タスク）

#### A. 売上精度向上（中優先、2-3 日作業）
- **課題**: 57 件の空 menu_name 予約が平均単価補正対象
- **対策案①**: salon_menus の平均価格で補完（簡易版）
- **対策案②**: HPB Bot で menu_name を確実に取得（根本解決）
- **影響**: 月間売上精度 ±15% → ±5% への改善期待

#### B. リピート率正常化（低優先、運用課題）
- **現状**: リピート率 0.0%（原因：過去データ不足）
- **対策**: HPB Bot の取得範囲を 21 日 → 90 日以上に拡張
- **効果**: 90 日リピート率が実値で表示される
- **実装**: VPS 側 Bot 設定変更（Claude Code 側は不要）

#### C. BottomNav 残り 3 タブ（Sprint 3 スコープ）
- [ ] /liff/karte（カルテ一覧）
- [ ] /liff/customers（顧客一覧）
- [ ] /liff/settings（設定）

#### D. owner_user_id ユーザー検索 UI（Sprint 3 スコープ）
- サロン管理者の追加・変更画面
- 現在は owner_user_id でハードコードされている
- スタッフ管理機能で必要

### 次タスクの提案（Osamu の優先順位次第）

**収益直結タスクへの移行を推奨**:

1. **SalonRink 営業システム実機テスト**（2-3 日）
   - LP → Stripe 決済 → ダッシュボード のエンドツーエンド動作確認
   - キレイ鶴見店での実証期間設定

2. **salonrink.com/blog 美容業界向けコンテンツ 15 記事計画**（1-2 週間）
   - 現在 7 記事稼働中
   - 記事あたり 10-20 分で AI 生成可能
   - SEO 効果：3-6 ヶ月で月間 PV 500-1,000 アップ期待

3. **97 サイト英語版拡大**（2-3 週間）
   - 現在 haircolor-lab のみ英語版稼働
   - 他 96 サイトへの展開で CPC 5-10 倍効果期待
   - AI SDK で翻訳自動化可能

これらは別 Sprint または別案件として開始可能。

---

**最終更新**: 2026.05.22
**ベースモック**: salonrink_concierge_admin_design_mockup
**ベース指示書**: INSTRUCTIONS_v2.md
