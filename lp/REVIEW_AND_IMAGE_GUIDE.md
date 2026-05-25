# SalonRink LP — 2案レビュー + 画像指示書

> **A案 = 私（Claude）が作った HTML 10セクション**
> **B案 = ChatGPT が生成した完成形ビジュアル（PNG 11枚）**
>
> ご依頼: A案・B案のメリット/デメリット、必要画像、画像生成プロンプト、Claude Code 向け画像指示書

---

## 1. 全体比較

### A案（私の HTML）の特徴
- セクション分割 + 独立 HTML ファイル
- **動くプロトタイプ**（HTML + CSS で実装そのまま）
- レビューブロック付き（実装メモ）
- **写真ゼロ**（グラデーション・SVG のみ）

### B案（ChatGPT のビジュアル）の特徴
- 完成形に近い**ピクセル品質**
- 実データ（キレイ鶴見店、AOKAE、HPB H000501100 等）
- 競合実名（リピッテ / LIME / サロンコネクト）
- **写真をふんだんに使用**（女性顧客・美容師・サロン店内）
- 構造が **より具体的・現場的**

---

## 2. セクション別 比較表

| # | セクション | A案 (HTML) | B案 (ChatGPT) | 推奨 |
|---|---|---|---|---|
| 01 | Hero | ◎ ほぼ同じ | ◎ ほぼ同じ | **A 採用 / B はリファレンス** |
| 02 | Problem | ◎ ほぼ同じ | ◎ ほぼ同じ | **A 採用** |
| 03 | Solution | ◎ ほぼ同じ | ◎ ほぼ同じ | **A 採用** |
| 04 | For Everyone | △ プレースホルダー写真 | ◎ 実写女性写真 + 温度感 | **A 構造 + B の写真** |
| 05 | In Action | △ 4シーン縦タイムライン | ◎ 3列横並び (朝/夜/顧客) + 具体UI | **B の構造に作り直し推奨** |
| 06 | AI Karte | △ 顧客との会話寄り | ◎ Before/After (スタッフメモ→カルテ) | **B の構造に作り直し推奨** |
| 07 | Numbers | △ −42% / +28% / +18% | ◎ 15min→3min / 75% / 0件（具体的） | **B 採用（数字が現場的）** |
| 08 | Case 01 | △ 架空「Atelier Lumière」 | ◎ **実在のキレイ鶴見店** | **B 採用（実データ）** |
| 09 | Onboarding | △ 4ステップ | ◎ 3ステップ（より洗練） | **B 採用** |
| 10 | Compare | △ 一般カテゴリ比較 | ◎ 実競合名（リピッテ等） | **B 採用** |

### 結論
**A案 01-03 を採用 / 04-10 を B案の構造に作り直し** が最適です。
B案には実際の運用データ（キレイ鶴見店）が入っており、信頼性が圧倒的に高い。

---

## 3. メリット・デメリット詳細

### A案 (HTML 10枚)
**メリット**
- そのまま Next.js 実装に移行できる（コードがある）
- HANDOFF.md / COPY_DICTIONARY.md が完備
- レスポンシブ対応済み
- デザイントークンが整理されている

**デメリット**
- 写真ゼロでビジュアル温度感が低い
- 数字や事例が**架空**（売り込みの説得力に欠ける）
- セクション 05-10 が B案より構造が弱い
- 競合比較がジェネリック

### B案 (ChatGPT PNG)
**メリット**
- 完成形のクオリティが高く、見て即「これで行きたい」と判断できる
- **実データ**（キレイ鶴見店、AOKAE、HPB ID）が入っており説得力 大
- 写真の使い方がうまい（人物 + UI モック + 数字の3バランス）
- 競合名が具体（営業資料としてもそのまま使える）

**デメリット**
- **画像なので実装には使えない**（HTML 化が必要）
- レスポンシブ・hover 等の挙動が不明
- フォントサイズ / 余白の正確な値が画像から推定になる
- 修正のたびに ChatGPT に再生成依頼が必要

### 推奨アプローチ
**B案を「正」として、A案の HTML を B案の構造に書き直す**。
具体的には:
1. A案 01-03 はそのまま
2. **A案 04-10 を B案画像準拠で作り直し** (構造・数字・写真位置)
3. 必要な実写画像を生成（後述）
4. Claude Code への HANDOFF を B案準拠に更新

---

## 4. 必要な実写画像リスト

LP 全体で **8〜10枚の実写**が必要です。
全て **白〜アイボリー背景 / LINE グリーン #06C755 を差し色** の世界観で統一。

| ID | 用途 | サイズ目安 | セクション |
|---|---|---|---|
| `IMG-01` | Hero スタイル提案カード（前回のヘアスタイル写真） | 480×320 | 01 Hero |
| `IMG-02` | 女性顧客（30代 / スマホを見て微笑む） | 480×600 | 04 ForEveryone CUSTOMERS |
| `IMG-03` | 女性美容師（30代 / エプロン / スマホ手元） | 480×600 | 04 ForEveryone STAFF |
| `IMG-04` | 女性顧客プロフィール写真（カルテ用 / 笑顔ポートレート） | 200×200 | 06 AI Karte カルテ部分 |
| `IMG-05` | 女性美容師チャットアバター（4枚同一人物 / 同サイズ） | 80×80 | 06 AI Karte BEFORE 部分 |
| `IMG-06` | 田中さま アバター（顧客）小サイズ | 80×80 | 05 In Action 配信メッセージ |
| `IMG-07` | **キレイ鶴見店** サロン店内写真（暖色照明・グレイヘア専門の上品な店内） | 800×600 | 08 Case 01 |
| `IMG-08` | iPhone モック内に重ねる UI 用ダッシュボード画像 (3枚) | 600×900 | 04, 05 |

### 補足 — 自前で撮影できるもの
- IMG-07: **既にキレイ鶴見店があるなら実物を撮影**（ChatGPT 生成より価値が高い）
- IMG-02, 03: **実在スタッフの撮影**が理想（許可と肖像権確認の上）

撮影が難しい場合は AI 生成 or Unsplash 等のストック写真も可。

---

## 5. 画像生成プロンプト集

ChatGPT / Midjourney / Stable Diffusion / 各種AIお絵描きツール向け。
**全画像共通**: 自然光、上品、白〜アイボリー基調、過剰な彩度なし、日本人女性、サロンの雰囲気。

### IMG-01 — Hero スタイル提案カード
```
A close-up shot of a Japanese woman in her late 20s with shoulder-length 
pink-beige layered hair, soft natural lighting, looking slightly away from 
camera, head and shoulders only, soft beige and cream studio background, 
high-end hair salon photography style, magazine quality, soft focus on hair 
texture, no makeup heavy, natural skin, photorealistic, 4:3 ratio
```

### IMG-02 — For Customers
```
A Japanese woman in her early 30s, sitting in a bright cafe by a window, 
casually holding a smartphone with both hands, looking at the screen with 
a warm gentle smile, natural daylight, soft cream and white tones, shoulder 
length brown hair, simple beige sweater, candid lifestyle photography, 
shallow depth of field, no logos, photorealistic, vertical 4:5 ratio
```

### IMG-03 — For Staff
```
A Japanese female hairstylist in her late 20s, wearing a black apron over 
a white shirt, standing in a modern minimalist hair salon, holding a 
smartphone in her hands, looking down at the screen with a focused 
expression, warm natural lighting, soft blurred salon background with 
hanging lights and plants, candid documentary style, photorealistic, 
vertical 4:5 ratio
```

### IMG-04 — Customer profile (AI Karte)
```
Studio portrait of a Japanese woman in her mid 30s with soft shoulder 
length brown hair, gentle smile, looking directly at camera, neutral 
beige background, soft frontal lighting, simple cream colored top, 
professional headshot style for digital profile, photorealistic, 
1:1 square ratio
```

### IMG-05 — Staff avatar (small)
```
Same Japanese female hairstylist as IMG-03, friendly headshot only, 
soft smile, looking at camera, white background, even lighting, 
black apron visible at shoulders, professional staff photo style, 
photorealistic, 1:1 square ratio
```

### IMG-06 — 田中さま avatar (small)
```
Same Japanese woman as IMG-02, friendly headshot only, looking at 
camera with soft smile, neutral background, professional avatar 
photography, photorealistic, 1:1 square ratio
```

### IMG-07 — キレイ鶴見店 store interior
```
Interior of a high-end Japanese hair salon specializing in gray hair, 
warm pendant lighting hanging from ceiling, several styling stations 
with large round mirrors, dark wood and concrete floor, lush green 
plants, vintage industrial-style chairs, evening atmosphere with 
amber glow, no people, architectural interior photography, deep 
focus, photorealistic, 4:3 ratio
```

### IMG-08 — Dashboard UI (in-phone overlay)
※実装時は実機スクショ推奨。生成する場合:
```
A clean white smartphone screen UI mockup showing a salon management 
dashboard, top section has "本日のサマリー" header with 3 large 
metrics displayed in Noto Serif JP style, accent color LINE green 
#06C755, today's reservation list below, modern minimal SaaS design, 
sharp clean lines, 1080×1920 mobile UI ratio
```

---

## 6. Claude Code 用 画像指示書

> 下記をそのまま `lp/IMAGE_GUIDE.md` として渡してください。

```markdown
# SalonRink LP — 画像指示書 (IMAGE_GUIDE.md)

## ディレクトリ構造
public/
├── images/
│   ├── hero/
│   │   └── style-card.jpg          ← IMG-01
│   ├── everyone/
│   │   ├── customer.jpg            ← IMG-02
│   │   └── staff.jpg               ← IMG-03
│   ├── karte/
│   │   ├── customer-profile.jpg    ← IMG-04
│   │   └── staff-avatar.jpg        ← IMG-05
│   ├── in-action/
│   │   └── tanaka-avatar.jpg       ← IMG-06
│   ├── case/
│   │   └── kirei-tsurumi.jpg       ← IMG-07
│   ├── ui/
│   │   ├── dashboard-morning.png   ← IMG-08a
│   │   ├── dashboard-night.png     ← IMG-08b
│   │   └── line-customer.png       ← IMG-08c
│   └── placeholder/
│       └── default.jpg             ← 未配置時のフォールバック

## 実装ルール
1. すべて `next/image` を使用。`<img>` 直書きは禁止。
2. `priority` は Hero 内の画像のみ true。残りは false（遅延読込）。
3. `alt` は必須。装飾画像でも空文字 `""` を入れる。
4. WebP + フォールバック JPG を Next が自動生成。
5. CDN 経由を想定し、画像最適化は Next の自動処理に任せる。
6. **画像未配置時は `public/images/placeholder/default.jpg` を表示**し、
   コンソールに警告を出す HOC ラッパー `<SafeImage>` を作成。

## 各セクションの画像差し込み箇所

### 01 Hero
- 配置: 右カラム iPhone 内の「おすすめのスタイル」カード内
- ファイル: `/images/hero/style-card.jpg`
- alt: "前回のヘアスタイル — ピンクベージュ × レイヤー"
- 比率: 4:3、レスポンシブ可

### 04 ForEveryone — Customers
- 配置: カード左下、スマホを見る女性
- ファイル: `/images/everyone/customer.jpg`
- alt: "LINEで予約・相談できるお客様"
- 角丸: rounded-2xl
- 比率: 4:5 縦

### 04 ForEveryone — Staff
- 配置: 中央カード、スマホを見る美容師
- ファイル: `/images/everyone/staff.jpg`
- alt: "LINEでカルテを確認するスタッフ"
- 角丸: rounded-2xl
- 比率: 4:5 縦

### 04 ForEveryone — Owners
- 配置: 右カード、iPhone モック内 UI（実写不要、UI モックで OK）
- ファイル: `/images/ui/dashboard-morning.png`
- alt: "朝のサマリー通知"

### 05 In Action
- 中央列 (NIGHT) の「自動で送信したメッセージ」内
- ファイル: `/images/in-action/tanaka-avatar.jpg`
- alt: "田中さま"
- 比率: 1:1 円形

### 06 AI Karte
- 左カラム BEFORE の各メッセージアバター (4箇所)
- ファイル: `/images/karte/staff-avatar.jpg`
- alt: "山田 美容師"
- 比率: 1:1 円形 48×48
- 右カラム AFTER の顧客カード写真
- ファイル: `/images/karte/customer-profile.jpg`
- alt: "田中様 (30代後半)"
- 比率: 1:1 円形 80×80

### 08 Case 01
- 大きな店内写真
- ファイル: `/images/case/kirei-tsurumi.jpg`
- alt: "キレイ鶴見店 — 横浜・グレイヘア専門サロン"
- 比率: 4:3
- フィルター: 必要に応じて 5% アンバートーン

## レスポンシブ画像サイズ指定
- Hero: `sizes="(max-width: 980px) 100vw, 50vw"`
- ForEveryone カード: `sizes="(max-width: 980px) 100vw, 33vw"`
- Case 01 ヒーロー: `sizes="(max-width: 980px) 100vw, 50vw"`
- アバター類: `sizes="80px"` で fix

## 画像のないセクション（プレースホルダー不要）
- 02 Problem (チャット風 UI のみ)
- 03 Solution (機能タグのみ)
- 07 Numbers (数字 + グラフのみ)
- 09 Onboarding (アイコンのみ)
- 10 Compare (テーブルのみ)

## アクセシビリティ
- すべての装飾画像は `aria-hidden="true"` + `alt=""`
- 情報を伝える画像は具体的 alt（人名や役割を含む）
- カルテ内の顧客写真は「お客様 — 例として表示しています」と注記

## Lighthouse スコア目標
- LCP < 2.5s
- CLS < 0.1
- 画像ファイルサイズ: Hero 200KB以下 / その他 100KB以下
```

---

## 7. 次のアクション提案

優先度順:

### 即座にやれること
1. **B案準拠で 04-10 を作り直す** (HTML 5〜6セクション)
2. `IMAGE_GUIDE.md` を `lp/` に追加
3. `DELEGATION_PROMPT.md` に画像指示書を追記

### ユーザー側にお願いすること
1. **キレイ鶴見店の実物写真**があれば送ってください（差替えます）
2. **実競合の価格情報**が公開情報として正確か再確認
   - リピッテ ¥9,800〜、LIME ¥5,000〜、サロンコネクト ¥4,400〜
   - SalonRink Concierge ¥1,980〜
3. AOKAE / キレイ鶴見店の名前公開 OK？（事例として表に出すなら社内承認が必要）

### 画像生成の進め方
- まず IMG-07（キレイ鶴見店）を ChatGPT / 実写の 2案で揃える
- 次に IMG-02〜06 の人物写真を**同一モデル感**で生成
  - 一貫性が大切（バラバラの顔だと信頼感が下がる）
- 最後に IMG-08 の UI モックは Figma で作るか、実機スクショで OK

---

## 8. 質問

1. **B案 04-10 を A案の HTML に取り込んで作り直しますか？**
   → Yes なら、私が今から書きます
2. **キレイ鶴見店の名前を表に出す承諾は取れていますか？**
3. **競合名（リピッテ / LIME / サロンコネクト）を実名で出すリスクは検討済み？**
4. **画像生成は ChatGPT 任せでよいか、それとも実写を準備するか？**
