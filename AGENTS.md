<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:salonrink-rules -->

## SalonRink Prompt Template v2.2

このルールは Claude Code が SalonRink プロジェクトで作業する際の絶対遵守事項。
構造は MECE(Mutually Exclusive, Collectively Exhaustive)に基づく。

---

## A. 個人情報・倫理 (Privacy & Ethics)

### A1. 本人情報保護
- Osamu さんの本名・住所・電話番号などの個人情報を出力・コミット禁止
- コード内に発見した場合は即座に作業中止 → 報告
- "AOKAE 合同会社" / "AOKAE LLC" の表記のみ使用

### A2. 顧客情報保護
- 顧客名は生名(姓名形式)禁止
- イニシャル化必須(例: 佐藤結衣 → S.Y、田中良子 → T.R)
- testimonial 等のファイル名も個人特定不可な命名(a/b/c 等)
- 内部のデモデータ(/salon, /customer 等)も同様

### A3. 第三者(競合)への配慮
- 競合実名禁止
  - 「サロンコネクト」→「A 社」
  - 「リピッテ」→「B 社」
  - 「リザービア」→「C 社」
- ベンチマーク表記でも実名は避ける

### A4. 法的リスク回避
- 警告表現禁止
  - 「警告」/「アラート」/「危険」→「注意」/「お知らせ」/「確認」
  - ただし機能名(例: 「失客アラート」)として定着している場合は変更不可
- 過剰な効果保証禁止(「必ず売上 X% UP」等)
- 薬機法に触れる表現禁止(「アレルギー診断」→「アレルギー注意」)

### A5. API キー・トークン保護
- API キー類のコード内・ログ・コミット出力禁止
- 対象: Vercel API token / Anthropic API key / Supabase service_role
- 対象: LINE channel access token / Stripe secret key
- 発見した場合は即座に作業中止 → 私に報告
- 過去事故: Vercel API token 2回露出(発見後即 revoke)
- 対策: 全ファイルで grep 必須、`*sk_*`, `*pk_*`, `*token*` 等

### A6. 環境変数の取り扱い
- `.env`, `.env.local`, `.env.production` は絶対 commit しない
- `.gitignore` で除外確認
- `NEXT_PUBLIC_` プレフィックスのみクライアント露出 OK
- `SUPABASE_SERVICE_ROLE_KEY` 等はサーバー専用
- 環境変数の値を console.log で出力禁止

---

## B. 機能保護 (Functionality Protection)

### B1. 認証・セッション(絶対変更禁止)
- `supabase.auth.*` 関数
- `signInWithOtp` / Magic Link ロジック
- LINE OAuth リダイレクト URL
- セッション管理(cookie, JWT 等)
- `middleware.ts` のセッションチェックロジック

### B2. データベース構造(別タスク扱い)
- Supabase migrations
- テーブル定義
- RLS (Row Level Security)
- 既存テーブル構造への依存(変更必要なら別タスク)

### B3. ビジネスロジック(変更時は私の Yes 必須)
- `useState`, `useEffect`, `useReducer` 等の hook
- `fetch` / API 呼び出しの引数・処理
- Supabase クエリ
- イベントハンドラーの中身(`onClick={() => {...}}` の `{}` 内)
- 計算ロジック(価格計算、スコアリング等)

### B4. 重要な数値・期間
- 価格表記:`¥1,980`, `¥2,780`, `¥4,580` 等は改変禁止
- 期間:`14日`(無料体験)、`30日`(削除されているはず、見つけたら修正)
- 数値変更が必要な場合は私の Yes 必須

### B5. 課金・決済(Stripe)
- `stripe.subscriptions.*`, `stripe.checkout.*` 関連は機能ロジック
- 価格 ID(`price_xxx`)変更禁止(Stripe 側と紐づき)
- Webhook ハンドラー触らない
- 顧客削除・サブスク解約のロジック触らない
- これらに触れる場合は私の Yes 必須

### B7. ルーティング・URL
- 既存ページパス変更禁止(SEO/外部リンク影響)
- `middleware.ts` の routing rule
- `next.config.ts` の rewrite/redirect
- アプリ ルート構造変更は私の Yes 必須
- /dashboard/* の URL 変更も同様

### B8. ビルド設定
- `next.config.ts`, `tsconfig.json`, `package.json` 変更禁止
- 新規依存関係追加は私の Yes 必須
- バージョンアップは別タスク
- ESLint, Prettier 設定変更も同様

---

## C. 操作権限 (Operation Permission)

### C1. 自動実行 OK(私の Yes 不要、連続実行可能)

#### 読み取り系
- `view`, `grep`, `find`, `ls`, `cat`
- `pwd`, `wc`, `xxd`, `file`

#### 検証系
- `npm run build`
- `npm run lint`, `npm run test`
- `git status`, `git diff`(コミット前確認用)
- `git log --oneline`

#### 修正系(条件付き)
- 同一ファイル内の同一パターン修正(連続 `str_replace`)
- 1ファイル内で完結する修正
- ファイル mv(`git mv`)
- sed -i.bak(macOS、バックアップ自動作成)
- ファイル新規作成(タスクで宣言済みのもの)

### C2. 私の Yes 必須

- `git commit && git push`(常に必須)
- 機能ロジックの変更(B3 の項目)
- 認証ロジックの変更(B1)が必要と判断したとき
- データベース構造の変更(B2)が必要と判断したとき
- 課金ロジックの変更(B5)が必要と判断したとき
- ルーティング・URL の変更(B7)が必要と判断したとき
- ビルド設定の変更(B8)が必要と判断したとき
- 想定外のスコープ拡大が必要と判断したとき
- 大規模な構造変更(コンポーネント分離等)
- 新規外部ライブラリの導入

### C3. 中止して報告(自分の判断で進めない)

- A1 の本人情報をコード内で発見
- A2 の顧客生名を発見(修正対象でない場合)
- A5 の API キー・トークンをコード内で発見
- B1 の認証ロジックに触れる必要が出た
- B2 の DB 構造変更が必要
- ビルドエラーが発生(自動 revert 後に報告)
- "Yes, allow all edits" を求められた状況

### C4. 緊急停止条件(即座に作業中止して報告)

1. API キーをコード内で発見
2. 個人情報をコミットしそうになった
3. 本番 DB(Supabase production)に直接アクセスしそうになった
4. 認証ロジックの変更が必要
5. 課金ロジックの変更が必要
6. データ削除を伴う操作
7. 大量ファイル削除(10ファイル以上)
8. node_modules 削除
9. .git ディレクトリへの操作

---

## D. 検証・運用 (Verification & Operation)

### D1. 修正前の検証

#### 必須実行
- 該当ファイルの `view` で構造確認
- 修正対象の `grep` で件数確認(複数箇所修正時)
- 既存の依存関係確認(import 等)

#### 文字コード確認(絵文字キー等)
- `grep + xxd` で hex 確認
- 末尾スペース、不可視文字検出

### D2. 修正後の検証

#### 必須実行
1. `npm run build` でビルド成功確認
2. `git diff --stat` で修正範囲確認
3. `git diff` で実差分確認
4. 該当パターンの残存 `grep`(一括置換時)

#### 自己チェック(機能ロジック保護)
- 機能ロジック触っていないか?
- 認証ロジック触っていないか?
- DB 構造触っていないか?
- 個人情報を含んでいないか?

### D3. 失敗時の自動回復

#### ビルドエラー時
1. `git restore --staged --worktree <該当ファイル>` で revert
2. エラー内容を私に報告
3. 次のアクションは私が判断

#### 想定外の差分
1. `git diff` で確認
2. 想定外なら revert
3. 私に報告

#### file mv 失敗時
1. 参照コードが未更新なら revert
2. 状態を元に戻す

### D4. 報告フォーマット

機能完了時に以下を必ず報告:

```
## ステップ完了報告

### 修正ファイル一覧
| ファイル | 行数差分 | 修正内容 |
|---------|---------|---------|
| ... | +X / -Y | ... |

### git diff --stat 結果
[コマンド出力をそのまま]

### ビルド結果
✅ 成功 / ❌ 失敗

### 機能ロジック確認(自己チェック)
- [ ] 機能ロジック触っていない (B3)
- [ ] 認証ロジック触っていない (B1)
- [ ] DB 構造触っていない (B2)
- [ ] 個人情報含んでいない (A1, A2)
- [ ] API キー含んでいない (A5)

### 反映期待動作
- 動作1
- 動作2

### Yes 待ち
commit & push を実行しますか?
```

### D7. デプロイ後確認

git push 後の確認:
1. Vercel auto deploy 完了確認(2-5分)
2. salonrink.com で反映確認
3. ブラウザキャッシュクリア(Cmd+Shift+R)
4. ビルドエラー有無(Vercel ダッシュボード)
5. 反映エラーは私に即報告

---

## E. コミット規約 (Commit Convention)

### E1. Conventional Commits

フォーマット:
```
<type>(<scope>): <subject>
```

type:
- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメント
- `style`: コード整形(機能変更なし)
- `refactor`: リファクタリング
- `test`: テスト
- `chore`: 雑務
- `perf`: パフォーマンス

例:
- `feat(lp): Industries 画像差し替え`
- `fix(iconMap): SVG サイズを 1em 化`
- `refactor: iconMap を共通化`
- `docs: SalonRink プロンプト雛形 v2.2 追加`

### E2. 1 commit = 1 機能

- 関連性のないファイルは別 commit
- 例: LP 修正と dashboard 修正は分離
- ただし、横断的な修正(警告→注意の統一等)は 1 commit OK

### E3. メッセージのフォーマット

- subject は 50文字以内、句点なし
- 日本語 OK
- scope は省略可、推奨
- body は必要時のみ、空行で区切る

### E4. NG なメッセージ例

❌ NG:
- `update`
- `fix`
- `wip`
- `color change`
- `実装`
- `プッシュ`

✅ OK:
- `feat(lp): Hero text-shadow ヘビー版`
- `fix(iconMap): '⏰' エントリー破損修正`
- `refactor: iconMap を共通化`

---

## 運用思想

1. **1機能単位で連続実行**: ファイル単位の細かい確認はしない
2. **中間確認は最小限**: 私の Yes は commit & push 直前のみ
3. **失敗は自動回復**: 私の介入なしで安全な状態に戻る
4. **報告は標準フォーマット**: D4 のテンプレート使用
5. **不明な状況は中止**: C3, C4 の判断で進めない

このルールは v2.2、運用フィードバックで改訂される。

<!-- END:salonrink-rules -->
