# Claude Code への委任プロンプト

> このファイルの内容を **そのまま Claude Code に貼り付けて** ください。
> 添付ファイル: `lp/` フォルダ一式（HTML 10枚 + tokens.css + HANDOFF.md + COPY_DICTIONARY.md）

---

## 貼り付け用プロンプト（コピーここから）

```
SalonRink.com の LP を、添付モックアップに沿って Next.js (App Router) + TypeScript で実装してください。

【入力ファイル】
- lp/HANDOFF.md           … 実装仕様書（必読）
- lp/COPY_DICTIONARY.md   … コピー辞書 / 用語統一表 / 置換表
- lp/shared/tokens.css    … デザイントークン
- lp/01_hero.html 〜 10_compare.html … 各セクション モックアップ（HTML+CSS、ピクセル準拠）
- lp/index.html           … モックアップ一覧（実装不要）

【スタック】
- Next.js 14+ (App Router) / TypeScript strict
- Tailwind CSS（tokens.css の値を theme に展開）
- next/font/google（Noto Serif JP / Noto Sans JP / JetBrains Mono）
- next/image（画像は /public/images/placeholder/ で仮置き）
- アイコンは inline SVG（Lucide も可、currentColor必須）

【ファイル構成】
app/
├── page.tsx                  ← セクションを順に並べる
├── globals.css               ← tokens.css の :root を取り込み
├── _sections/
│   ├── Nav.tsx
│   ├── Hero.tsx              (01_hero.html)
│   ├── Problem.tsx           (02_problem.html)
│   ├── Solution.tsx          (03_solution.html)
│   ├── ForEveryone.tsx       (04_for_everyone.html)
│   ├── InAction.tsx          (05_in_action.html)
│   ├── AiKarte.tsx           (06_ai_karte.html)
│   ├── Numbers.tsx           (07_numbers.html)
│   ├── Case.tsx              (08_case.html)
│   ├── Onboarding.tsx        (09_onboarding.html)
│   ├── Compare.tsx           (10_compare.html)
│   └── Footer.tsx
└── _components/
    ├── Eyebrow.tsx           ← .sr-eyebrow 相当
    ├── SectionHead.tsx
    ├── Button.tsx            ← .sr-btn 相当（primary / outline / ghost）
    ├── PhoneMock.tsx         ← 共通 iPhone モックフレーム
    ├── ChatBubble.tsx
    └── StatCard.tsx

【セクション順序】
Nav → Hero(01) → Problem(02) → Solution(03) → ForEveryone(04)
→ VideoTour(現行) → InAction(05) → AiKarte(06) → Numbers(07)
→ Case(08) → Integrations(現行) → Onboarding(09) → Compare(10)
→ Plans(現行) → Faq(現行) → CTA(現行) → Footer(現行)

【既存セクション】
VIDEO TOUR / INTEGRATIONS / PLANS / FAQ / 最終CTA は現行 salonrink.com から
コードを再利用し、COPY_DICTIONARY.md §5「置換表」に従って文言のみ更新。
コピー内で「専属コンシェルジュ」「LLM」「プロンプト」などの NG 表現は
COPY_DICTIONARY.md §2 に従って必ず置換してください。

【アニメーション】
- IntersectionObserver で fade-in + 8px translate-Y
- prefers-reduced-motion でアニメ無効化
- Numbers の数字はカウントアップ（任意）

【レスポンシブ】
- ブレイクポイント 980px で 1カラム化
- iPhoneモック / 比較表 / タイムラインは特に注意

【画像】
- すべて /public/images/placeholder/{name}.jpg を仮置き
- HANDOFF.md §6 の画像差替表に対応するパスで保存

【実装手順】
1. tokens.css を globals.css に取り込み + Tailwind theme 設定
2. _components/ の共通部品を実装
3. _sections/ を 01 → 10 の順に実装（各 HTML を React に置換）
4. 既存セクションを置換表に従って更新
5. page.tsx で全セクションを並べ、スクロール挙動を確認

完了後、各セクションの実装状況をチェックリスト形式で報告してください。
不明点は実装前に質問してください。
```

（コピーここまで）

---

## 渡し方の選択肢

### A. プロジェクト一式を ZIP で渡す（推奨）
プロジェクトの「ダウンロード」ボタンから `lp/` フォルダ一式を ZIP 化 → Claude Code に添付 → 上のプロンプトを貼り付け。

### B. ファイル単位で渡す
最低限必要な4ファイル:
- `lp/HANDOFF.md`
- `lp/COPY_DICTIONARY.md`
- `lp/shared/tokens.css`
- `lp/01_hero.html`〜`10_compare.html`（10枚）

### C. リポジトリ経由で渡す
1. このプロジェクトの内容を GitHub リポジトリに push
2. Claude Code でそのリポジトリを開く
3. 上のプロンプトを貼って実装スタート

---

## 委任前のチェックリスト

- [ ] 各セクションの数値（−42% / +28% / +18% など）は最新で良い？
- [ ] 導入事例の店名「Atelier Lumière 表参道」は仮で OK？
- [ ] 月額料金（¥4,800〜）は実際のプラン価格に合致？
- [ ] 既存 salonrink.com の VIDEO TOUR / INTEGRATIONS / PLANS / FAQ のコードは
      Claude Code が読める場所（リポジトリ等）に置いてある？

上記が問題なければ、そのまま委任できます。
