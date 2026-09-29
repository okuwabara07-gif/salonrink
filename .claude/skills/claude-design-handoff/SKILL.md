---
name: claude-design-handoff
description: Claude Design から Claude Code に渡された handoff bundle を、AOKAE 4事業（SalonRink / キレイ鶴見店 / aokae.net / soccer-selection.jp）の既存 Next.js リポジトリへ実装する受け口。「Claude Design」「handoff」「デザイン反映」「デザインを実装」などの語、または handoff bundle を受け取った時点で必ず発動。目的のズレ・置き場所ミス・本番誤デプロイを防ぐ。aokae-tech-conventions と併用する。
---

# Claude Design ハンドオフ受け口

**デザインの意図を変えずに、既存コードへ最短で載せる**のが唯一の目的。機能追加・リデザインはしない。

## 0. 開始
- vault_notes を読む。
- bundle の「デザイン意図」を1行ゴールに要約し最初に宣言。以降これから外れる作業はしない。

## 1. 置き場所の確定
| サイト | app の位置 |
|---|---|
| soccer-selection.jp | `src/app/` |
| aokae.net | ルート `app/` |
| salonrink | リポジトリで実確認 |
| kirei-tsurumi.com | リポジトリで実確認 |
- 実確認結果を宣言してから配置。推測で置かない。対象不明なら止めて確認。

## 2. 分解ルール
- ページ: `<app>/<route>/page.tsx`
- コンポーネント: `components/design/<feature>/`
- アセット: `public/design/<feature>/`
- トークンは既存 Tailwind / CSS 変数に統合。重複定義しない。
- 既存コンポーネントで代替可能なら流用し報告。
- ダミー文言は `TODO(design):` で明示。勝手に置換しない。

## 3. バックエンド差分
- 必要な Supabase テーブル / RLS / Edge Function を一覧化してから着手。
- SalonRink は多テナント RLS 前提。
- マイグレーションは `supabase/migrations/` にファイル作成まで。本番適用は影響範囲を言語化し承認後。
- 秘密値は `app_secrets` 参照。直書き禁止。
- Stripe / LINE は既存実装を流用。

## 4. コミット前チェック
- 美容系文言は薬機法サニタイズ
- 運営者実名・前職企業名・実在競合名なし（競合は A社/B社）
- redirect は exact-match のみ（`/neo/*` を壊さない）
- 動的ルート `params` は await、SSG は `generateStaticParams` に含める
- `npm run build` 通過

## 5. デプロイ
- Preview まで。Production は承認後。
- Preview URL と再現できなかった点を報告。

## 6. 静的LP
既存リポジトリ不要なものは Claude Design → Share → Send to → Vercel で直接公開。

## 7. 終了
vault_notes に「対象サイト / 追加ルート / 追加テーブル / Preview URL / 未完了TODO」を書き戻す。
