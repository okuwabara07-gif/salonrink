# 他事業連携 抜け漏れ防止チェックリスト

## 目的

SalonRink完成時に、他のAOKAE事業と将来連携できる土台を仕込んでおく。

---

## 🔗 連携フック（完成時に仕込む）

### 1. AOKAE記事LINE配信（設計済み・未稼働）
- articles_queue テーブル作成（スキーマに含む）
- article_deliveries テーブル作成
- /api/cron/articles-deliver の Cron設定（週1）

後で実装: haircolor-lab → articles_queue → LINE配信

### 2. COLORPASS → SalonRink 連携
- salonsテーブルに colorpass_partner_code カラム追加（後で）
- /api/external/colorpass-webhook エンドポイント枠作成

### 3. haircolor-lab → SalonRink 送客
- 「最寄りのSalonRink加盟サロンを探す」 LPルート確保
- /salons 検索APIエンドポイント準備

### 4. キレイ鶴見 ↔ SalonRink 完全連携
最優先：
- キレイ鶴見を最初のテストサロンとして登録
- 招待コード KIREI-001 でログイン可能に
- 既存HPB iCal URLを設定

### 5. 共通メール基盤（Resend統一）
- lib/email/resend-client.ts 共通モジュール化
- 送信元 noreply@salonrink.com で統一

### 6. GA4統合トラッキング
- lib/analytics/ga4.ts 共通モジュール作成
- サロン管理画面で gtag 埋め込み

---

## 💰 収益連携の最大化

| 連携先 | 月収見込み |
|--------|----------|
| haircolor-lab AdSense | ¥10,000 |
| haircolor-lab アフィリ | ¥20,000 |
| COLORPASS 送客 | ¥15,000 |
| キレイ鶴見 実施術写真 | ¥5,000 |
| 加盟サロン LINE手数料 | ¥10,000 |

**合計: ¥60,000/月の間接収益**

---

## ✅ 完成判定チェックリスト

- [ ] ダッシュボード8画面全稼働
- [ ] キレイ鶴見で1週間ノートラブル
- [ ] Stripe Live決済3件以上成功
- [ ] LINE予約3件以上成功
- [ ] カルテ3件以上記録
- [ ] HPB同期24時間連続成功
- [ ] プライバシーポリシー公開
- [ ] 利用規約公開
- [ ] サポートメール稼働

完成宣言はOsamu自身が行う。
