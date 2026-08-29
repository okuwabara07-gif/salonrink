# HANDOFF AMENDMENTS — SalonRink LP v2 → Claude Code

最終更新: 2026/05/25

このドキュメントは、LP v2(マーケットイン版)を本番反映する際に
**Claude Code が判断に迷った時の参照書**です。

---

## 🎯 反映の優先順位

1. **画像 9枚** を `public/images/` に配置 (apply.shで自動)
2. **tokens.css** を `styles/tokens-v2.css` として配置 (apply.shで自動)
3. **コピー差替え** (COPY_DICTIONARY_PATCH.md を参照)
4. **HTML構造変更** (このドキュメントを参照)

---

## 📐 LP本番のディレクトリ構造想定

```
salonrink/
├── public/
│   └── images/                 ← 画像9枚配置先
├── styles/
│   └── tokens-v2.css           ← 配色トークン
├── features/
│   └── lp-concierge/           ← LPソース (commit 4596c5c)
│       ├── sections/
│       │   ├── 01_Hero.tsx
│       │   ├── 02_Problem.tsx
│       │   ├── 03_Solution.tsx
│       │   ├── 04_ForEveryone.tsx
│       │   ├── 05_InAction.tsx
│       │   ├── 06_AiKarte.tsx
│       │   ├── 07_Numbers.tsx
│       │   ├── 08_Case.tsx
│       │   ├── 09_Onboarding.tsx
│       │   └── 10_Compare.tsx
│       ├── shared/
│       │   └── iconMap.tsx     (commit ec6d8b9, 16 SVGs)
│       └── lib/
└── docs/
    └── lp-v2/                  ← ドキュメント配置先
        ├── COPY_DICTIONARY_PATCH.md
        ├── HANDOFF_AMENDMENTS.md
        └── (mockup_v2/) ← 参考モック
```

**注:** 実構造が違う場合は `tree -L 3 features/` で確認後、適宜パスを調整してください。

---

## 🔧 HTML構造の主な変更

### 01 HERO
- **3 STAT カード**: 数値 → アイコン+定性に置換
  ```jsx
  // v2の3STAT
  <ul className="hero__stats">
    <li><Icon name="clock" />カルテ確認<br/>ゼロ秒</li>
    <li><Icon name="heart" />忘れない<br/>顧客管理</li>
    <li><Icon name="trending-up" />次の来店、<br/>自然に提案</li>
  </ul>
  ```
- **3 FLOAT BUBBLE** (Phone右側): HPB予約取込含む3つ

### 02 PROBLEM
- **ヘッダー右側にA802画像追加**
  ```jsx
  <div className="problem__head-with-image">
    <div className="problem__head-text">...</div>
    <div className="problem__head-image">
      <img src="/images/a802_problem.png" alt="..." />
    </div>
  </div>
  ```

### 03 SOLUTION
- **機能リスト最上部に「HPB予約もLINE予約も、一画面で」NEW pill追加**
  ```jsx
  <div className="feat feat--highlight">
    <span className="feat__pill-new">NEW</span>
    <span className="feat__title">HPB予約もLINE予約も、一画面で</span>
  </div>
  ```

### 04 FOR EVERYONE
- **FOR STAFFカードを A304画像1枚で置換**(他カードとデザイン不揃いを許容)
  ```jsx
  <article className="ecard ecard--image-only">
    <img src="/images/a304_staff.png" alt="..." className="ecard__full-image" />
  </article>
  ```
  - CSS: `.ecard--image-only { padding: 0; }` / `.ecard__full-image { width:100%; height:100%; object-fit:cover; }`

### 06 AI KARTE
- **ARROW PILL内容変更**: `AI` → `AUTO`
  ```jsx
  <div className="karte__arrow-pill">
    <svg>...</svg>
    <span className="label">AUTO</span>
  </div>
  ```

### 07 NUMBERS — **完全リニューアル**
- v1の数値カードを丸ごと削除し、3アイコンカードに置換
- `.ec--featured` クラスでCORE VALUEバッジ表示
- 末尾にTrust band + footnote追加

### 08 CASE 01 — **キレイ鶴見店反映**
- メイン背景画像: `/images/kirei_real_interior.jpg` (縦長 1200×1600)
- min-height: 540px (縦長対応)
- グラデーション: 上下両方
- REAL PHOTOバッジ + 外観イメージサムネ
- BEFORE/AFTER 実コピー反映
- 4指標 + シミュレーション注釈

---

## 🎨 配色トークン (tokens-v2.css)

`styles/tokens-v2.css` に配置済み。主要な変数:

```css
:root {
  /* Gold (ブランド装飾) */
  --brand: #C9A961;
  --brand-soft: #F4ECD8;
  --brand-ink: #4A3E20;

  /* Green (機能/CTA) */
  --accent: #06C755;
  --accent-soft: #E1F8E8;
  --accent-ink: #044F22;

  /* Coral (PROBLEM) */
  --coral: #D85A30;
  --coral-soft: #FBE8DC;

  /* Base */
  --bg: #FAF7F2;
  --bg-tint: #F5F1E8;
  --ivory: #FAF0E0;
  --ink: #1A1F1B;
  --ink-2: #4A524C;
  --ink-3: #888A82;
  --line: #E8E4DA;
  --line-soft: #F0EDE3;

  /* Typography */
  --serif: 'Noto Serif JP', serif;
  --sans: 'Noto Sans JP', sans-serif;
  --mono: 'JetBrains Mono', monospace;

  /* Layout */
  --radius: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --shadow-sm: 0 2px 6px rgba(0,0,0,0.04);
  --shadow-md: 0 8px 24px rgba(0,0,0,0.08);
  --shadow-lg: 0 16px 48px rgba(0,0,0,0.12);
}
```

---

## 🚨 注意事項

### 1. iconMap.tsx (commit ec6d8b9)
- 既存の `features/lp-concierge/shared/iconMap.tsx` を流用
- v2モックHTMLにある SVG はインラインなので、必要に応じて `iconMap` に追加

### 2. Stripe Live / LINE Webhook
- 既に本番稼働中(変更しない)
- LP変更で支払いフローに影響なし

### 3. Vercel 環境変数
- LP本番の `okuwabara07-gifs-projects` (Pro) で稼働
- 環境変数の追加は不要
- ⚠️ **Build machine: Standard 維持** (Elastic に切り替わっていないか確認)

### 4. SEO / metadata
- 主要なmetadata変更:
  - title: `SalonRink Concierge | LINEで、もう一度お客様と向き合う時間を`
  - description: `1人サロン特化のLINE業務レイヤー。予約・顧客情報・リピート対応をLINEに集約。月¥1,980〜。`
  - OG image: A100 未生成のため後日(または既存のものを継続使用)

### 5. ブログ準備 (salonrink.com/blog/)
- 5月中旬・営業後に15記事(比較5/AIカルテ活用5/トレンド5)予定
- 今回のv2反映に含めない(別タスク)

---

## 📊 反映後の動作確認

Vercel preview URLで以下を確認:

1. **デザイン崩れがないか** (特に 04 FOR EVERYONE のFOR STAFFカード)
2. **画像が全て表示されているか** (9枚すべて)
3. **モバイル表示が正常か** (Phone mock、レスポンシブ)
4. **CTAボタンが機能するか** (LINE連携ボタン)
5. **HPB訴求が見える位置にあるか** (03 SOLUTION / 09 ONBOARDING)
6. **「シミュレーション」明記が確認できるか** (08 CASE 01)
7. **数値が表示されていないか** (07 NUMBERS から完全撤去)

---

## 🛡 ロールバック手順

万一問題があれば:

```bash
# main に戻す
git checkout main

# ブランチ削除
git branch -D feature/lp-v2-marketing-in

# remote削除
git push origin --delete feature/lp-v2-marketing-in
```

Vercel側で自動的にmainのpreviewに戻ります。

---

## 💬 Claude Codeが判断に迷ったら

**Osamuに聞き返す前に、以下を確認:**

1. v2モック (`mockup_v2/v2/`) の該当HTMLを参照
2. COPY_DICTIONARY_PATCH.md の該当セクションを参照
3. 既存のLP本番コード (commit 4596c5c) の構造を尊重
4. 上記で判断できない場合のみOsamuに確認

---

## 📅 段階リリース戦略 (推奨)

最短だけでなく安全も担保するため、以下を推奨:

### Phase A: ブランチでpreview (apply.sh で実行)
- 所要時間: 2-5分
- リスク: なし
- 確認: Vercel preview URL

### Phase B: main merge (Osamu手動)
```bash
git checkout main
git merge feature/lp-v2-marketing-in --no-ff -m "merge: LP v2 marketing-in"
git push origin main
```
- 所要時間: 30秒
- リスク: 低 (失敗時はrevert可能)

### Phase C: 様子見 (24時間)
- LP訪問者の挙動確認
- エラーログ確認
- 問題なければ次のフェーズ(SNS発信、ブログ準備等)へ

---

## 📦 同梱ファイル

```
salonrink_lp_v2_handoff_FINAL.zip
├── CLAUDE_CODE_TASK.md          ← Claude Codeへの指示書 (これを読ませる)
├── apply.sh                     ← 一括実行スクリプト
├── COPY_DICTIONARY_PATCH.md     ← コピー差替え辞書
├── HANDOFF_AMENDMENTS.md        ← 本ドキュメント
├── images/                      ← 画像9枚
└── mockup/                      ← v2モック一式(参考)
    ├── index.html
    ├── shared/
    └── v2/
```
