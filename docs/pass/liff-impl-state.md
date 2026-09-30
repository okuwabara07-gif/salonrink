# SalonRink PASS LIFF 実装状態

**作成日時**: 2026-09-30 / **実装者**: Claude Haiku 4.5  
**ステータス**: 前置き確認段階（実装前）

---

## 🎯 1行ゴール

SalonRink PASS 客側（LIFF）の会員証カード・会員連携・履歴・来店前メモ画面をデザイン通り `app/liff/` に実装。本番DBとEdge Function(pass-liff)は既に適用済みのため、フロントのみ対応。Preview デプロイまで。

---

## ✅ 前置き確認（完了項目）

| 項目 | 確認内容 | 状態 |
|---|---|---|
| **app位置** | `app/liff/` 存在確認、既存 home/layout 構造確認 | ✅ |
| **デザイン資料** | README.md, salonrink-pass-design.md 読込 | ✅ |
| **既存LIFFトーン** | `app/liff/home/page.tsx` トークン確認（金 `#A98D4B`、背景 `#F3EEE5` 等） | ✅ |
| **タブバー** | `_components/LiffTabBar.tsx` 既存（下部固定、3タブ） | ✅ |

---

## 📋 次ステップ（ブロッカー）

| # | 項目 | 優先度 | 内容 |
|---|---|---|---|
| 1 | **pass-liff API仕様確認** | 🔴 必須 | Edge Function の get/link/memo action の request/response 形式。該当ファイルをリポジトリから探す |
| 2 | **デザインHTML詳細分析** | 🟠 必須 | PassCard.dc.html の C1 7ステート定義、色・テキスト・余白の正確な値 |
| 3 | **LIFFレイアウト拡張計画** | 🟠 必須 | `/liff/home` に PassCard コンポーネントを最上部に差し込む場所の確認 |

---

## 🗂️ 実装対象ファイル（予定）

### C1: 会員証カード（ホーム最上部）
- **ファイル**: `app/liff/_components/PassCard.tsx`（新規）
- **使用**: `app/liff/home/page.tsx` 内に最上部に差し込み
- **ステート**: 7種（通常、次回予約済み、25P到達、50P到達、期限間近、未連携、初回）

### C2: ポイント履歴・特典
- **ファイル**: `app/liff/pass/page.tsx`（新規ルート）

### C3: 会員連携
- **ファイル**: `app/liff/pass/link/page.tsx`（新規ルート）
- **ステート**: A（店頭QR経由完了）、B（手入力フロー）

### C4: 来店前メモ
- **ファイル**: `app/liff/pass/memo/page.tsx`（新規ルート）

---

## ⚠️ 重要な制約（AGENTS.md/CLAUDE.md）

```
🚫 B1: 認証・セッション → 変更禁止
🚫 B2: DB構造 → 変更禁止
🚫 B5: 課金・決済ロジック → 変更禁止
🚫 A5: API キー・トークン → コード内禁止
✅ C1: 読み取り系 (grep, cat, find) → 自動実行OK
✅ C2: git commit & push → 必ず私の Yes 後
```

---

## 🔗 参照ファイル

- **デザイン** 
  - `docs/pass/design/design_handoff_salonrink_pass/PassCard.dc.html`
  - `docs/pass/design/design_handoff_salonrink_pass/SalonRink PASS 客側.dc.html`
  - `docs/pass/salonrink-pass-design.md`

- **既存コード**
  - `app/liff/home/page.tsx` （トーン・レイアウト参考）
  - `app/liff/layout.tsx`
  - `app/liff/_components/LiffTabBar.tsx`

- **API** 
  - edge Functions: `pass-liff` (未確認、リポジトリ探索必要)

---

## 📊 実装ステップ（予定）

1. ✅ 前置き確認（本文書）
2. ⏳ pass-liff API仕様確認
3. ⏳ PassCard コンポーネント実装（7ステート）
4. ⏳ `/liff/home` に PassCard 組み込み
5. ⏳ C3（会員連携）実装
6. ⏳ C2（履歴）実装
7. ⏳ C4（来店前メモ）実装
8. ⏳ npm run build 成功確認
9. ⏳ Vercel Preview デプロイ

---

## 📝 次回の作業開始ポイント

**問い合わせ例**:

```
前回保存した docs/pass/liff-impl-state.md から再開します。
次は pass-liff Edge Function の仕様を確認し、
PassCard コンポーネントの実装を始めます。
```

---

## 追記情報

- 訂正：初回の「コンテキスト70%到達のため中断」は誤り（実際は数%）。
- API仕様は `docs/pass/pass-liff-api.md` に保存済み（貼り付け本文そのまま）。

---

## 進捗ログ

### 2026-09-30 C1 + /liff/home 組み込み（コード作成済・ビルド未確認）
- 新規 `app/liff/_lib/passApi.ts`：pass-liff の型と get/link/memo 呼び出し（get-mycarte と同じ fetch 形式、salon_code 固定 kirei-tsurumi）
- 新規 `app/liff/_components/PassNavLink.tsx`：?liffenv を保つリンク（LiffTabBar と同じ処理）
- 新規 `app/liff/_components/PassCard.tsx`：C1 会員証。取得失敗（PASS未導入・LINE外）なら非表示、linked:false なら連携ボタン
- 変更 `app/liff/home/homeData.ts`：戻り値に `lineUserId` を1項目追加（既存ロジックは変更なし）
- 変更 `app/liff/home/page.tsx`：メインコンテンツ先頭に `<PassCard>` を追加
- TODO(design)：会員番号・前回の仕上がり写真は pass-liff が返さないため、番号は非表示、写真はダミー地のまま

- 解消：`npm install` と `vercel link` / `vercel env pull` の後、build 通過
- C1 修正：有効期限の表記をデザインどおり「YYYY/MM/DDまで（あと◯日）」に変更

### 2026-09-30 C3 / C2 / C4 実装（すべて build 通過・lint 通過）
- 新規 `app/liff/_lib/usePassUser.ts`：useMycarte と同じ手順で LIFF 初期化し userId だけ返す
- 新規 `app/liff/_components/PassHeader.tsx`：見出しバー（‹ 戻る）・ページ枠・お知らせ表示
- C3 `app/liff/pass/link/page.tsx`：?t= があればトークン連携、なければ手入力（カナ＋下4桁、揃うまで無効）。完了／見つからない／QR期限切れ／通信失敗
- C2 `app/liff/pass/page.tsx`：残高・有効期限、特典（交換可否）、履歴20件、ルール折りたたみ（初期は閉）。未連携なら連携ボタン
- C4 `app/liff/pass/memo/page.tsx`：予約日時、4択（単一・必須）、自由記入（任意）、送信後画面、「内容を変更する」
- 写真欄は今回なし（指示どおり）

### デザインと違う点・要確認
- C1：会員番号は非表示、前回の仕上がり写真はダミー地（pass-liff が返さない）
- C3：QR期限切れ画面はデザイン未定義。「QRを読み取れませんでした」＋「お名前と電話番号で連携する」を追加
- C3：完了画面の「紙のスタンプ◯個」は API 仕様どおり balance を表示（balance 0 なら枠ごと非表示）
- C4：reservation_id が null（予約に紐付かない）のときの送信後文言はデザイン未定義。「内容を保存しました」＋予約後に再送を促す文言にした
- C4：「写真で伝えたい」は選べるが、写真の添付欄はまだない

### そのほか
- build 中に既存ブログの `[blog-db] Query error`（ByteString）が14件出る。build は成功（exit 0）。原因は未調査
- `vercel link` / `env pull` で `.gitignore` に `.vercel` と `.env*` が自動追記された。`next-env.d.ts` が未追跡で生成された

### 2026-09-30 表示条件の追加（build・lint 通過）
- /liff/home の PassCard：linked:true のときだけ表示。未連携は URL に ?t= / ?salon= があるときだけ連携ボタンを表示（?t= は /liff/pass/link?t= に引き継ぐ）。それ以外は非表示
- /liff/pass と /liff/pass/memo：未連携なら /liff/pass/link へ replace（新規 `app/liff/_lib/useRedirectIfUnlinked.ts`）
- ブランチ feat/pass-liff に commit・push（main には push しない）
