# SalonRink Concierge — Design Brief for Design Claude

> このドキュメントは別のClaudeセッション(以下「Design Claude」)に渡すための独立した指示書です。
> このファイル1つだけ読めば、SalonRink Conciergeの管理画面デザイン作業に着手できる構成になっています。
>
> あなたは美容業界B2B向けSaaSのフロントエンドデザインを担当します。
> 既存実装の修正ではなく、新規にデザインシステムと画面群を構築します。
> 成果物は **そのまま実装に渡せるレベルの精度** で作成してください。

---

## 0. プロジェクト概要

| 項目 | 内容 |
|---|---|
| プロダクト | **SalonRink Concierge** — LINEに住む、サロンのAIスタッフ |
| プロダクト形態 | LINE公式アカウントのアドオン業務システム + LIFF管理画面 |
| 運営 | AOKAE合同会社 |
| LP | salonrink.com(リデザイン進行中) |
| 今回の作業範囲 | **4画面の管理面UIデザイン**(SaaS本体のUI、LP本体ではない) |
| 納品形式 | Reactコンポーネント(TypeScript + Tailwind CSS) |
| 想定環境 | Next.js 14+ App Router、LIFF SDK、Supabase |

---

## 1. プロダクトの位置づけ

SalonRink Conciergeは「**画面のないSaaS**」を志向しています。
美容師は新しい管理画面を学ばずに、いつもの仕事をしているだけでカルテ・予約・販促が完了する状態を目指す、というのが核心の体験原則です。

そのため、デザインの主役は次の2つ:

1. **LINE上のbot体験**(美容師向けの自動配信、リッチメニュー)
2. **LIFF管理画面**(LINE内ブラウザで動く、最低限の編集UI)

サロンオーナーがブラウザ管理画面を頻繁に開く必要がなく、月1〜2回程度の設定で済む構造を作ります。

### ターゲット3ペルソナ

| ペルソナ | 属性 | UI上の配慮 |
|---|---|---|
| **ハナ** | 28歳・フリーランス美容師 | 直感的、片手操作、最小タップ数 |
| **タカシ** | 38歳・個人サロン経営者(スタッフ1-3名) | KPIが一目で分かる、効率重視 |
| **キョウコ** | 45歳・小規模店舗経営者(スタッフ4-10名) | 読みやすい文字サイズ、フォーマル寄り、見出し重視 |

3ペルソナ全員に対応するため、**読みやすさ・操作性・フォーマル感**のバランスを最優先します。子供っぽい・カジュアルすぎるデザインは避けます。

---

## 2. デザイン哲学(必読)

### 哲学1: 機能ではなく結果を見せる

❌ 「AIカルテ自動生成機能」  
✅ 「あなたが寝ている間に、明日の準備が終わっています」

すべての要素を「機能名」ではなく「美容師にとって何が嬉しいか」で表現します。
ボタンラベル、見出し、空状態のメッセージ、すべてが対象。

### 哲学2: 和モダン × LINEグリーン

- ベース: warm cream (#faf8f3) + 墨 (#1a1814)
- アクセント: LINEグリーン (#06C755) **のみ**
- セカンダリアクセント: コーラル (#D85A30) — 顧客向け要素にのみ使用
- 装飾は最小限、余白で価値を演出
- 見出しは明朝体(Noto Serif JP)で品格、本文はゴシック(Noto Sans JP)で可読性

### 哲学3: AIスロップを徹底排除

❌ 過剰な絵文字(🚀✨🎉等)、装飾的アイコンの羅列、グラデーションを多用したヒーロー  
✅ 静謐で抑制された画面、必要なところにだけアクセント色

### 哲学4: 美容師向けと顧客向けでトーンを分ける

| | 美容師向け(LINE OA + LIFF) | 顧客向け(各サロン公式LINE) |
|---|---|---|
| アクセント色 | LINEグリーン(#06C755) | コーラル(#D85A30) |
| トーン | プロフェッショナル、効率重視 | 親しみ、ワクワク感 |
| ヘッダー | 緑のLINEヘッダー | コーラルのLINEヘッダー |

今回の作業範囲は **美容師向けがメイン**。顧客向けは参考画面1枚のみ。

### 哲学5: スマホファースト、片手操作前提

- 主要なCTAは画面下部に配置
- タップ領域は最低44×44pt
- 重要情報は画面上半分(指を伸ばさないと見えない位置に置かない)
- iPhone 14/15サイズ(390×844)を基準

---

## 3. デザイントークン(完全版)

### カラー

```css
:root {
  /* テキスト */
  --ink:        #1a1814;  /* 主要テキスト、ダーク背景 */
  --ink-2:      #3d3833;  /* 本文 */
  --ink-3:      #6f6a62;  /* 補助テキスト、ラベル */
  --ink-4:      #9c968c;  /* 微弱テキスト、キャプション */

  /* 背景 */
  --bg-warm:    #faf8f3;  /* ページベース(warm cream) */
  --bg-warm-2:  #f2eee4;  /* 偶数セクション、強調背景 */
  --paper:      #FBF8F3;  /* LIFFヘッダー、カード上の紙白 */
  --card:       #ffffff;  /* 白カード */

  /* 区切り */
  --line:       #e6e1d6;  /* 通常の境界線 */
  --line-soft:  #f0ebe0;  /* セル間の薄い境界線 */

  /* アクセント(LINEグリーン) — 美容師向けのみ */
  --accent:     #06C755;
  --accent-hv:  #05a648;
  --accent-soft:#e6f7ec;
  --accent-ink: #054d22;

  /* セカンダリアクセント(コーラル) — 顧客向けのみ */
  --coral:      #D85A30;
  --coral-soft: #FBEAF0;
  --coral-ink:  #993556;

  /* バッジ系 */
  --badge-am:   #FAEEDA;  /* 注意 */
  --badge-am-i: #854F0B;
  --badge-gr:   #EAF3DE;  /* 成功 */
  --badge-gr-i: #3B6D11;
  --badge-bl:   #E6F1FB;  /* 情報 */
  --badge-bl-i: #0C447C;

  /* 強調(ゴールド) — 稀に使う */
  --gold:       #a37a35;
}
```

### タイポグラフィ

```css
/* 見出し: 和の品格 */
font-family: "Noto Serif JP", "Yu Mincho", serif;
font-weight: 500 (Medium) / 600 (SemiBold);
letter-spacing: 0.2-0.3px;

/* 本文: 可読性 */
font-family: "Noto Sans JP", "Hiragino Sans", sans-serif;
font-weight: 400 (Regular) / 500 (Medium) / 700 (Bold);

/* 数値・ラベル: 信頼感のあるモノスペース */
font-family: "JetBrains Mono", "SF Mono", monospace;
font-weight: 400 / 500 / 600;
letter-spacing: 0.4px (UPPERCASE時);
```

### フォントサイズ階層

| 用途 | サイズ |
|---|---|
| ページタイトル(LIFFヘッダー) | 15-16px / Noto Serif JP 500 |
| セクション見出し | 12-13px / Noto Serif JP 500 |
| 本文 | 12-13px / Noto Sans JP 400 |
| 補助テキスト | 10-11px / Noto Sans JP 400 |
| KPI数値 | 15-20px / JetBrains Mono 600 |
| ラベル(UPPERCASE) | 9-10px / JetBrains Mono 500 + tracking |
| ボタン | 12-13px / Noto Sans JP 500 |

### スペーシング

```
xs:  4px
sm:  7-8px
md:  11-12px
lg:  16px
xl:  22px
xxl: 32-40px
```

セクション間: 16-18px / カード内padding: 11-13px

### 角丸

```
small:   8px   (バッジ、小カード)
medium:  10-12px (標準カード、入力)
large:   14-18px (大カード、モーダル)
round:   50%   (アバター、FAB)
xxl:     28-38px (iPhoneモック枠)
```

### 影

```
card:    0 1px 2px rgba(0,0,0,0.04)
phone:   0 6px 24px rgba(26,24,20,0.18)
fab:     0 3px 10px rgba(6,199,85,0.35)
modal:   0 -4px 16px rgba(0,0,0,0.08)
```

---

## 4. 画面構成(4シーン)

実装優先度の高い順:

### Scene 4: LIFFメニュー編集 — `/liff/menu` ★最優先

salon_menusテーブル直結のCRUD画面。既存最優先タスク(menuToPrice廃止)に直結。

### Scene 3: LIFFダッシュボード — `/liff/dashboard`

LIFF起動時のホーム。KPI3枚 + 今日の予約 + 承認待ちカード。

### Scene 2: 美容師向けLINE OA日常運用

@salonrink-concierge公式アカウントでの朝/夜自動配信 + 6マスリッチメニュー。

### Scene 1: オンボーディングBot会話ウィザード

LP「LINEで始める」→ 5分でセットアップ完了する初回体験。

---

## 5. 各画面の詳細仕様

各画面について、**Reactコンポーネントとして実装可能なレベルの詳細**を以下に記載します。

### Scene 4: LIFFメニュー編集 詳細仕様

**目的**: サロンオーナーがメニューを追加・編集・削除・並べ替えできる。

**画面サイズ**: 390×844 (iPhone 14想定)

**画面構成(縦順)**:

1. **ヘッダー**(高さ約60px、sticky top)
   - 背景: `--paper` (#FBF8F3)
   - 下border: `--line` (#e6e1d6)
   - 左: 戻るアイコン(chevron-left、18px、`--ink`)
   - 中央: タイトル「メニュー編集」(Noto Serif JP 500、15-16px、`--ink`)
   - 右: 保存リンク(12px、`--accent`、500)

2. **カテゴリタブ**(高さ約42px)
   - 背景: `--card` (#ffffff)
   - 下border: `--line`
   - タブ: カット / カラー / トリートメント / セット
   - 各タブ: padding 9px 11px、font 11.5px、Noto Sans JP
   - active: 文字色 `--ink`、下に1.5px solid `--accent`、font-weight 500
   - inactive: 文字色 `--ink-3`、border transparent
   - カテゴリ名の後ろに件数バッジ(`--ink-4`、xs)

3. **メニューリスト**(`<main>` flex-1、padding 12px、pb-24)
   - 背景: `--bg-warm` (#faf8f3)
   - 各アイテムカード:
     - 背景: `--card`、border 0.5px solid `--line`、border-radius 10px
     - padding 11px 13px
     - 横並び flex: [grip] [info(flex-1)] [編集]
     - grip: 縦の点々アイコン(grip-vertical、12px、`--ink-4`/`#d9d3c6`)
     - info:
       - 1行目: メニュー名(12.5px、500、`--ink`)
       - 2行目(margin-top 3px、flex gap-10px、10.5px):
         - 価格 `¥4,000`(`--ink`、500、JetBrains Mono)
         - 所要時間 `60分`(`--ink-3`)
     - 編集リンク: 11.5px、`--accent`、500
   - **空状態**: 中央12.5px `--ink-3`「『{カテゴリ名}』カテゴリにまだメニューがありません」、下に11px `--ink-4`「右下の + から追加してください」

4. **FAB**(右下、bottom: 80px、right: 18px)
   - 円形 44×44px
   - 背景: `--accent`、shadow: fab
   - アイコン: plus(22px、white)
   - クリックで新規追加モーダル(Drawer)を開く

5. **ボトムナビ**(高さ約56px、fixed bottom)
   - 背景: `--card`、上border: `--line`
   - padding 6px 0 10px
   - 5タブ均等配置: ホーム / カルテ / 顧客 / メニュー / 設定
   - 各タブ: アイコン(18px)上 + ラベル(9.5px)下、gap 2px
   - active: `--accent`
   - inactive: `--ink-4`
   - 現画面では「メニュー」がactive

6. **編集モーダル(Bottom Sheet)**
   - 画面下から立ち上がる
   - 背景: 半透明黒(rgba(0,0,0,0.4))のオーバーレイ
   - sheet: 背景 `--bg-warm`、上角丸 28px、padding 20px、pb 32px
   - max-height 85vh、スクロール可
   - ヘッダー: タイトル「メニュー編集」または「新規メニュー」(Noto Serif JP 500、16px)+ 右上に × ボタン
   - フォーム要素:
     - **メニュー名**: text input、padding 10px 12px、border 0.5px `--line`、bg white、radius 8px、focus border `--accent`
     - **カテゴリ**: ピル型ボタン群(4個並列、flex-wrap)。選択時 bg `--accent` + text white、非選択時 bg white + border `--line` + text `--ink`
     - **料金 / 所要時間**: 2カラムグリッド(grid-cols-2 gap-12px)
       - 料金: 左に¥プレフィックス、右にinput(JetBrains Mono、12px)
       - 所要時間: 右に「分」サフィックス
     - 数値入力は `type="number"`
   - CTAボタン: full-width、12px font、500、padding 12px、radius 8px
     - 「更新する」または「追加する」: bg `--accent`、text white
     - 「削除する」(編集時のみ): bg transparent、border + text `--coral`
   - フォームラベル: 11px、`--ink-3`、margin-bottom 5px、letter-spacing 0.2px

**インタラクション**:
- カードタップ → 編集モーダル開く
- + FAB タップ → 新規モーダル開く(activeカテゴリがdefault)
- カテゴリタブ切替 → リストフィルタリング(再フェッチではない)
- 削除 → confirm prompt → DELETE API → 一覧再取得
- 並べ替え(将来): grip長押し → ドラッグ → reorder API

**状態管理**:
- loading: スピナー or「読み込み中…」テキスト
- empty: 空状態メッセージ
- error: トーストで通知(後述の Toast コンポーネント)

---

### Scene 3: LIFFダッシュボード 詳細仕様

**目的**: LIFFを開いた美容師が3秒で「今日の状態」を把握できる。

**画面構成(縦順)**:

1. **ヘッダー**(高さ約60px、sticky)
   - 背景: `--paper`、下border `--line`
   - 左: 戻る(chevron-left)
   - 中央: 「SalonRink Console」(Noto Serif JP 500、15px、letter-spacing 0.3px)
   - 右: ベルアイコン(18px、`--ink-3`)

2. **KPIグリッド**(grid-cols-3 gap-7px)
   - 各カード: 背景 white、border 0.5px `--line`、radius 10px、padding 9px 8px
   - ラベル(UPPERCASE): 9.5px、`--ink-3`、JetBrains Mono、letter-spacing 0.3px、margin-bottom 3px
     - 例: "今月売上" / "新規予約" / "リピート率"
   - 数値: 15-16px、600、`--ink`、JetBrains Mono、margin 0
     - 例: `¥412k` / `14` / `68%`
   - トレンド: 9.5px、`--badge-gr-i`、flex gap 2px、icon (trending-up 11px) + テキスト
     - 例: `↑+18%` / `↑+3` / `↑+5pt`

3. **「今日の予約」セクション**
   - セクションヘッダー(flex justify-between margin-bottom 5px):
     - タイトル「今日の予約」(Noto Serif JP 500、12px、`--ink`)
     - 件数+「›」(11px、`--ink-3`)
   - リストカード(背景 white、border 0.5px `--line`、radius 10px、overflow hidden):
     - 各行(padding 9px 11px、下border 0.5px `--line-soft`、最終行はborder無し):
       - 時刻(11px、500、JetBrains Mono、`--ink`、width 36px)
       - 情報(flex-1):
         - 顧客名(12px、500、`--ink`、line-height 1.3)
         - メニュー(10.5px、`--ink-3`、margin-top 1px)
       - タグ: 9.5px、padding 1.5px 6px、radius 6px、500
         - HPB: `--badge-bl` / `--badge-bl-i`
         - LINE: `--badge-gr` / `--badge-gr-i`
         - 新規: `--coral-soft` / `--coral-ink`

4. **「承認待ち」セクション**
   - ダークカード: gradient `linear-gradient(135deg, #1a1814, #3d3833)`、radius 10px、padding 11px 13px、text white、flex gap 11px
   - アイコン円: 34×34px、bg rgba(255,255,255,0.13)、円形、中央にnotebookアイコン(17px、`--accent`)
   - テキスト(flex-1):
     - 「AIカルテ 3件」(11.5px、500、letter-spacing 0.2px)
     - 「自動生成済み・要確認」(10px、opacity 0.7、margin-top 1px)
   - CTAボタン: 「一括承認」(bg `--accent`、text white、10.5px、500、padding 5px 11px、radius 8px)

5. **ボトムナビ**(同上、現画面ではホームがactive)

---

### Scene 2: 美容師向けLINE OA日常運用 詳細仕様

**目的**: 朝7時に届く自動配信を介して、リッチメニューで日常操作を完結させる。

**画面構成(LINE OA画面の模倣)**:

1. **LINEヘッダー**(緑)
   - 背景: `--accent` (#06C755)
   - text white、padding 26px 14px 11px
   - flex gap 10px
   - 左: chevron-left (18px)
   - 中央(flex-1):
     - ライン1: 「SalonRink Concierge」(13.5px、500、letter-spacing 0.2px)
     - ライン2: 「公式アカウント」(11px、opacity 0.92、margin-top 1px)
   - 右: 電話 + メニュー(18px、gap 12px)

2. **チャットエリア**(flex-1、padding 12px 8px、gap 7px、背景 `--bg-warm-2`系: #F5EFE8)
   - 日付チップ: align-self center、10.5px white、bg rgba(0,0,0,0.22)、padding 2.5px 12px、radius 12px
   - メッセージ行:
     - bot側(左): アバター30×30px円形、bg `--accent`、アイコン白15px(sparkles/sun/robot)
     - bot吹き出し: 背景 white、radius 14px、padding 7px 11px、font 12px、line-height 1.5、`--ink`
     - max-width 74%
   - **Flex Message** (Bot応答に埋め込み):
     - 背景 white、radius 12px、border 0.5px #eee、shadow card
     - width 230px、font 11px
     - hero部分: 背景色付き(`--accent` / `--gold` / `--ink`)、padding 9px 12px、white、500、flex gap 6px、アイコン + テキスト
     - body部分: padding 11px 13px、`--ink`
       - タイトル: 12.5px、500、Noto Serif JP
       - サブ: 11px、`--ink-3`、margin-bottom 8px
       - 行: flex justify-between、padding 5px 0、下border 0.5px `--line-soft`、最終行border無し
       - ラベル: `--ink-3` / 値: `--ink` 500
     - foot部分: 上border 0.5px `--line-soft`、flex
       - 各ボタン: flex-1、padding 9px、center、11.5px、500、右border 0.5px `--line-soft`
       - 色: `--accent` / `--coral` / `--ink` のいずれか

3. **リッチメニュー**(高さ約108px、画面下部)
   - 背景: `--ink` (#1a1814)
   - grid 3×2、gap 1px、padding 1px
   - 各セル: 背景 `--paper` (#FBF8F3)、flex-col center、gap 4px、font 10.5px、`--ink`
   - アイコン: 18px、`--accent`
   - 6マス:
     | 今日の予約 (calendar) | AIカルテ (notebook) | 顧客検索 (search) |
     | メニュー (list) | レポート (chart-bar) | 設定 (settings) |

**朝の配信内容(Flex Message例)**:
- Hero: 緑 + calendar-event「本日のサマリー」
- Body:
  - タイトル「5/23 (金) の営業」
  - サブ「予測売上 ¥48,000」
  - 行: 予約 / 3件
  - 行: カウンセリング待ち / `1件`(amberバッジ)
  - 行: リピート提案 / `2件`(pinkバッジ)
- Foot: [予約詳細] [提案を送る] (両方 `--accent`)

**Quick Reply**(必要時):
- padding 4px 8px 2px
- 各ボタン: 背景 white、border 1px `--accent`、`--accent` text、11.5px、padding 5px 12px、radius 14px

---

### Scene 1: オンボーディングBot会話ウィザード 詳細仕様

**目的**: LP「LINEで始める」CTAから5分でセットアップ完了。

**画面構成**: Scene 2と同じLINEヘッダー + チャットエリア + リッチメニューなし。

**会話フロー(順序通り)**:

1. 日付チップ「2026/5/22 (木) 11:24」
2. Bot吹き出し「ようこそ、SalonRink Concierge へ」
3. Bot吹き出し「5分でセットアップ完了します。サロン名を教えてください」
4. **ユーザー吹き出し**(右、bg `--accent`、white、radius 14px 14px 4px 14px)「キレイ鶴見店」
5. Bot吹き出し「HotPepper Beautyは使っていますか?」
6. **Quick Reply**: [✓はい] [いいえ] [後で]
7. Bot吹き出し → **Flex Message: プラン選択カード**
   - Hero: 黒(`--ink`) + crownアイコン「プランを選んでください」
   - Body: 横並び2カード(flex gap 8px、padding 11px 13px)
     - Soloカード: 中央寄せ、border 1px `--line`、bg `--paper`、radius 8px、padding 9px 8px
       - 「Solo」(11px、`--ink-3`)
       - 「¥1,980」(14px、600、`--ink`、JetBrains Mono)
       - 「/月 税込」(9px、`--ink-3`)
     - Salonカード(推奨): border 1px `--accent`、bg `--accent-soft`、上記+「推奨」バッジ(bg `--accent`、white、9px、padding 1px 6px、radius 6px、margin-top 3px)
       - 「¥2,980」(同上)
   - Foot: [Soloで開始] [Salonで開始](右側 `--accent`)
8. Bot吹き出し → **Stripe Checkout カード**(ダーク)
   - 背景 `--ink`、radius 12px、width 230px
   - Hero(padding 11px 13px、下border rgba(255,255,255,0.08)):
     - lockアイコン(14px、`--accent`)
     - 「お支払い情報を登録」(11.5px、500、white)
   - Body(padding 11px 13px):
     - 「SalonRink Concierge Salon」(11px、rgba(255,255,255,0.65))
     - 「¥2,980」(20px、600、white、JetBrains Mono) + 「/月」(11px、rgba(255,255,255,0.5))
     - 「✓ 14日間無料 — いつでも解約可能」(10px、`--accent`、margin-top 3px)
   - CTA: 「決済へ進む →」(bg `--accent`、white、center、padding 9px、11.5px、500、flex center gap 5px)

---

## 6. 共通コンポーネント

以下を再利用可能なReactコンポーネントとして実装してください:

### PhoneFrame
iPhone 14風モック枠。子要素を内包し、notch・角丸・shadowを適用。
```
props: { children: React.ReactNode, screenBg?: 'cream' | 'paper' }
```

### LineHeader
LINE風ヘッダー(緑 or コーラル)。
```
props: { variant: 'salon' | 'customer', accountName: string, subtitle?: string }
```

### LiffHeader
LIFF画面の上部ヘッダー。
```
props: { title: string, onBack?: () => void, rightAction?: React.ReactNode }
```

### ChatBubble
LINEチャット吹き出し。
```
props: { variant: 'bot' | 'self', children: React.ReactNode, accent?: 'green' | 'coral' }
```

### QuickReply
Quick Replyボタン群。
```
props: { options: { label: string, icon?: string, value: string }[], onSelect: (v) => void }
```

### FlexMessage
LINE Flex Message。
```
props: {
  heroVariant: 'green' | 'gold' | 'ink' | 'coral',
  heroIcon: string,
  heroTitle: string,
  rows: { label: string, value: string | React.ReactNode }[],
  buttons: { label: string, accent?: 'green' | 'coral' | 'ink', onClick: () => void }[]
}
```

### RichMenu
LINE OA下部の6マスメニュー。
```
props: {
  items: { icon: string, label: string, action: () => void }[]  // 必ず6個
}
```

### KpiCard
ダッシュボードのKPIカード。
```
props: { label: string, value: string, trend?: { value: string, direction: 'up' | 'down' } }
```

### BookingItem
予約リストの1行。
```
props: { time: string, customerName: string, menu: string, source: 'hpb' | 'line' | 'new' }
```

### BottomSheet
モーダル(下から立ち上がる)。
```
props: { open: boolean, onClose: () => void, title: string, children: React.ReactNode }
```

### FAB
Floating Action Button。
```
props: { icon: string, onClick: () => void, accent?: 'green' | 'coral' }
```

### BottomNav
LIFF画面の下部ナビ。
```
props: { active: 'home' | 'karte' | 'customers' | 'menu' | 'settings' }
```

### Badge
ステータスバッジ。
```
props: { variant: 'amber' | 'green' | 'blue' | 'pink', children: React.ReactNode }
```

---

## 7. アイコン

### 採用ライブラリ
**Tabler Icons React** を使用。`npm i @tabler/icons-react`

理由: 線が細く、和モダンUIとの相性が良い。Lucideでも代替可能だが、Tablerの方が線が繊細。

### 主要アイコンマッピング

| 用途 | Tabler Icon |
|---|---|
| 戻る | IconChevronLeft |
| 前進 | IconChevronRight |
| メニュー | IconList |
| カレンダー | IconCalendar / IconCalendarEvent |
| カルテ | IconNotebook |
| 顧客 | IconUsers / IconSearch |
| レポート | IconChartBar / IconChartLine |
| 設定 | IconSettings |
| ホーム | IconHome |
| 通知 | IconBell |
| 編集 | IconEdit |
| 削除 | IconTrash |
| 追加 | IconPlus |
| 確定 | IconCheck |
| Bot | IconSparkles / IconRobot / IconSun(朝) / IconMoon(夜) |
| 予約 | IconCalendarPlus |
| クーポン | IconDiscount2 |
| マップ | IconMapPin |
| メッセージ | IconMessage |
| グリップ | IconGripVertical |
| 鍵(セキュリティ) | IconLock |
| クラウン(プラン) | IconCrown |
| トレンド | IconTrendingUp / IconTrendingDown |
| はさみ(サロン) | IconScissors |

### 禁止
- 絵文字を本実装で使わない(モックアップの絵文字はTabler Iconに置換)
- 装飾的な複数アイコン羅列を避ける(1つの要素に1つのアイコン)

---

## 8. インタラクション・アニメーション

### 基本方針
**控えめに、ただし反応はすぐに**。アニメーションは200-300msに収める。

### 必須トランジション

| 要素 | 動き |
|---|---|
| ボタンhover | opacity or backgroundのみ変化(150ms ease) |
| カードtap | scale 0.98(100ms)→1.0(200ms) |
| モーダル登場 | translateY(100%) → 0(300ms cubic-bezier) |
| モーダル退場 | 同上逆(200ms) |
| タブ切替 | content fade-in(150ms) |
| トースト | 上から slide-down(200ms)、自動消去(3000ms) |
| FAB | 着地時に微かな bounce |

### マイクロインタラクション
- 数値カウントアップ(KPI): ページ初期表示時のみ、500-800ms
- 承認ボタンtap: 一瞬グレーアウト後、成功アイコン → トースト
- Quick Replyタップ: 選択肢が一瞬光ってフェードアウト、新しいbot応答が降りてくる

### 禁止
- 画面全体を覆うローディングスピナー(代わりにskeletonまたはinline loading)
- 派手なパーティクル、紙吹雪、confetti
- 自動再生される動画/GIF

---

## 9. アクセシビリティ

| 項目 | 基準 |
|---|---|
| 文字色コントラスト | 通常テキスト4.5:1以上、大きいテキスト3:1以上 |
| タップ領域 | 最低44×44pt |
| フォーカス可視化 | キーボードフォーカスは `--accent` 2pxアウトライン |
| aria-label | アイコンのみのボタンには必須 |
| alt属性 | 装飾画像は alt="" |
| 動的更新 | 重要な変更は aria-live="polite" でアナウンス |
| モーダル | role="dialog" + aria-modal="true" + focus trap |

---

## 10. レスポンシブ

### 基準サイズ
**iPhone 14 (390×844)** を主要ターゲット。

### ブレークポイント
- Mobile: 〜640px(95%のユーザー)
- Tablet: 640-1024px(LIFFはほぼ無関係、管理者がPCで開く場合の想定)
- Desktop: 1024px+(LIFF外。salonrink.com Webアプリ用)

### LIFFの特殊事情
- LIFF内ブラウザは縦持ち固定
- 画面下に LINE のシステムバー領域があるため、ボトムナビは bottom: 0 + safe-area-inset-bottom 対応

---

## 11. 書き出し物(納品物リスト)

以下を `app/liff/` および `components/` 配下に納品してください。

### コンポーネント

```
components/
├── primitives/
│   ├── PhoneFrame.tsx
│   ├── Badge.tsx
│   ├── KpiCard.tsx
│   └── BottomSheet.tsx
├── line/
│   ├── LineHeader.tsx
│   ├── ChatBubble.tsx
│   ├── QuickReply.tsx
│   ├── FlexMessage.tsx
│   └── RichMenu.tsx
└── liff/
    ├── LiffHeader.tsx
    ├── BottomNav.tsx
    ├── BookingItem.tsx
    └── FAB.tsx

app/liff/
├── menu/page.tsx         ← Scene 4
├── menu/MenuClient.tsx
├── menu/types.ts
├── dashboard/page.tsx    ← Scene 3
└── _components/          ← LIFF共通
```

### スタイル

- **Tailwind CSS** を主軸
- `tailwind.config.ts` でデザイントークンを定義(extend.colors / fontFamily)
- グローバルCSSは最小限(`globals.css` にフォント読み込みのみ)

### Storybook(任意だが推奨)
各コンポーネントの状態を一覧できるStorybook stories。

### スクリーンショット
完成後、4シーン分のフルスクリーンショット(PNG)を `design/screenshots/` に納品。

---

## 12. デザイン Do / Don't

### Do
- ✅ 余白を恐れずに使う(密度より静寂)
- ✅ 数値は JetBrains Mono で揃える(¥4,000 / 60分 / 14日)
- ✅ 見出しは Noto Serif JP で品格を出す
- ✅ アクセント色は1画面に2〜3要素まで
- ✅ 空状態にも丁寧な案内文を書く
- ✅ エラーメッセージは「何が起きたか」+「どうすればいいか」セット

### Don't
- ❌ 過剰な絵文字、装飾アイコン
- ❌ グラデーション(`--ink` to `--ink-2` の微弱なものを除く)
- ❌ 「サロンに、専属コンシェルジュを」のような顧客向けに見えるコピー
- ❌ AI技術用語(「自動構造化」「ベクトル検索」など)を画面上に出す
- ❌ 派手なアニメーション、ローディングのキャラクター演出
- ❌ 暗色ダークモードのデフォルト化(現状は warm light モードのみ)
- ❌ 機能を平等に並列表示(優先度のないUIは選択疲れを生む)

---

## 13. 参照すべき外部リソース

| リソース | 用途 |
|---|---|
| salonrink.com | 既存のブランド世界観(LP書き換え中) |
| INSTRUCTIONS_v2.md | LP・全体構想の根拠 |
| IMPLEMENTATION_SPRINT.md | 実装スケジュール、機能要件 |
| day01_salon_menus_rls.sql | DBスキーマ(salon_menus等の構造) |
| day02_03_menus_api.ts | API契約(リクエスト/レスポンス形式) |
| day03_liff_menu_page.tsx | Scene 4のリファレンス実装(これをベースに磨く) |

---

## 14. 確認事項(作業開始前にOsamuに確認してほしい)

作業着手前に、以下のいずれかが不明確であれば確認してください:

- [ ] Tabler Icons の採用OK(または別ライブラリ希望)
- [ ] shadcn/ui を導入するか、素のJSX + Tailwindで進めるか
- [ ] Storybookを納品物に含めるか
- [ ] 顧客向け画面(コーラル系)も今回の範囲に含めるか
- [ ] アイコン以外でブランドロゴ(SalonRink)が必要か → 必要なら別途SVG提供する

---

## 15. レビュー基準

完成物は以下の観点でレビューします:

1. **デザイン哲学への忠実度**: 和モダン × LINEグリーン、機能の隠蔽、3ペルソナへの配慮
2. **デザイントークンの徹底**: 色・フォント・スペーシングがトークン定義に従っているか
3. **コンポーネントの再利用性**: 同じ要素は1コンポーネントに集約されているか
4. **アクセシビリティ**: コントラスト、タップ領域、aria属性
5. **コードの清潔さ**: TypeScript strict、命名、コメント
6. **完成度**: 空状態、エラー状態、ローディング状態まで作り込まれているか

---

## 16. 質問・確認の連絡先

設計判断に迷ったら、以下の優先順で判断してください:

1. このドキュメントを読み返す
2. INSTRUCTIONS_v2.md を参照する
3. それでも不明なら、**勝手に決めずに質問**する

特にコピーライティングは「機能ではなく結果を見せる」哲学に従って **複数案を出してOsamuに選ばせる** のが安全です。

---

**最終更新**: 2026.05.21
**バージョン**: v1.0
**作成**: SalonRink Concierge デザイン指示書
**対象**: Design Claude(別Claudeセッション)
**ベースモック**: salonrink_concierge_admin_design_mockup
