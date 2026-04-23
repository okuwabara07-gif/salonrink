# SalonRink ダッシュボード完全実装仕様書

## プロジェクト情報

- GitHub: okuwabara07-gif/salonrink
- Vercel: okuwabara07-gifs-projects/salonrink
- Supabase: fmpmgilgvvfezursmyic
- 本番: https://salonrink.com
- デザイン: Provence Natural / Paris Cream

---

## 実装順序（依存関係考慮）

---

## カラーパレット（Provence Natural）

---

## ダッシュボード画面設計

### /dashboard/layout.tsx
- 認証チェック
- 共通ナビゲーション（8項目）
- サロン情報フェッチ
- RLS対応

### /dashboard（メイン）
- 本日予約数
- 今週予約数
- 新規顧客数
- 売上予測
- 本日の予約一覧
- お知らせ

### /dashboard/settings
- サロン名・住所
- 営業時間
- 連絡先
- ロゴアップロード

### /dashboard/line
- LINE連携状態表示
- salon_code表示
- 紐付き顧客数
- 直近紐付き一覧

### /dashboard/hotpepper
- iCal URL設定
- 同期状態表示
- メニュー連動設定
- 手動同期ボタン

### /dashboard/booking
- 日/週/月表示切り替え
- フィルタ（ソース・ステータス）
- 予約カード表示（バッジ付き）
- 予約詳細モーダル

### /dashboard/karte
- 顧客一覧（検索・フィルタ）
- 個別カルテ（施術履歴・処方・写真）
- 新規顧客登録
- カルテ作成フロー

### /dashboard/richmenu
- テンプレート選択
- ボタン6個の設定
- プレビュー表示
- 適用ボタン

### /dashboard/plan
- 現在のプラン表示
- プラン変更UI
- アドオン8個のトグル
- Stripe Customer Portal リンク

---

## API Routes

---

## 完成判定チェックリスト

- [ ] ダッシュボード8画面全稼働
- [ ] キレイ鶴見で1週間ノートラブル
- [ ] Stripe Live決済3件以上成功
- [ ] LINE予約3件以上成功
- [ ] カルテ3件以上記録
- [ ] HPB同期24時間連続成功
- [ ] プライバシーポリシー公開
- [ ] 利用規約公開
- [ ] サポートメール稼働
