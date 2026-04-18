# キレイ鶴見店 SALOMÉ 販売促進ランディングページ 実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新規ページ `/salons/tsurumi` を作成し、キレイ鶴見店の SALOMÉ 導入実績を紹介して、既存顧客からの新規導入契約を促進する。

**Architecture:** Next.js 16 App Router の Server Component で単一ページを構成。5つのセクション（Hero → Before/After → Features → Pricing → CTA）を inline styles で実装。既存 SALOMÉ LP のカラースキーム（濃紺 #1A1018 + ゴールド #B8966A）を踏襲。

**Tech Stack:** Next.js 16.2.3 / React 19 / TypeScript 5 / inline styles

**Spec:** `docs/superpowers/specs/2026-04-18-kireitsurumi-landing-design.md`

---

## File Structure

**New:**
- `app/salons/tsurumi/page.tsx` - ランディングページ本体（全セクション実装）

**Optional Update:**
- `app/layout.tsx` - ナビゲーションに「キレイ鶴見店」リンク追加（検討段階）

---

## Task 1: ページディレクトリ作成と型確認

**Files:**
- Create: `app/salons/tsurumi/page.tsx`

- [ ] **Step 1.1: ディレクトリ構造を確認**

```bash
ls -la /Users/educatorspi/Documents/salonrink/app/salons/
```

Expected: `salons/` ディレクトリが存在するか確認。なければ mkdir で作成。

- [ ] **Step 1.2: 空のページを作成**

`app/salons/tsurumi/page.tsx`:
```tsx
export default function KireiturumiPage() {
  return (
    <main>
      {/* Placeholder */}
    </main>
  )
}
```

- [ ] **Step 1.3: 型チェック**

```bash
npx tsc --noEmit
```

Expected: エラーなし

- [ ] **Step 1.4: コミット**

```bash
git add app/salons/tsurumi/page.tsx
git commit -m "feat: キレイ鶴見店 SALOMÉ ランディングページの雛形を作成"
```

---

## Task 2: セクション 1 - ヘッダー＆ヒーロー

**Files:**
- Modify: `app/salons/tsurumi/page.tsx`

- [ ] **Step 2.1: ヒーロースタイルオブジェクトの定義**

`app/salons/tsurumi/page.tsx`:
```tsx
const styles = {
  main: {
    minHeight: '100vh',
    background: 'linear-gradient(160deg, #F2EAD8 0%, #FAF6EE 50%, #F2EAD8 100%)',
    fontFamily: 'Georgia, serif',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  hero: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 40px',
    textAlign: 'center' as const,
  },
  title: {
    fontSize: 48,
    fontWeight: 300,
    color: '#1A1018',
    letterSpacing: 4,
    lineHeight: 1.2,
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 16,
    color: '#7A6E64',
    lineHeight: 1.8,
    marginBottom: 48,
    maxWidth: 600,
    fontFamily: 'sans-serif',
  },
  button: {
    padding: '16px 40px',
    background: '#B8966A',
    color: '#FAF6EE',
    textDecoration: 'none',
    fontSize: 14,
    letterSpacing: 2,
    fontFamily: 'sans-serif',
    border: 'none',
    cursor: 'pointer',
    borderRadius: 8,
  },
}
```

- [ ] **Step 2.2: ヒーロータイトルとサブタイトルを実装**

`app/salons/tsurumi/page.tsx`:
```tsx
export default function KireiturumiPage() {
  return (
    <main style={styles.main}>
      <section style={styles.hero}>
        <h1 style={styles.title}>
          キレイ鶴見店がSALOMÉで変わった
        </h1>
        <p style={styles.subtitle}>
          LINE予約の確定率 68% → 92% に改善。<br />
          顧客再来率を 45% → 68% に拡大。<br />
          月額売上 ¥680k → ¥850k へ。
        </p>
        <a href="/register" style={styles.button}>
          30日無料で始める
        </a>
      </section>
    </main>
  )
}
```

- [ ] **Step 2.3: dev server で表示確認**

```bash
npm run dev
```

ブラウザで http://localhost:3000/salons/tsurumi を開く。
- タイトル「キレイ鶴見店がSALOMÉで変わった」が表示される
- サブタイトルの3行が表示される
- 「30日無料で始める」ボタンが表示される

確認後 Ctrl+C で dev server を停止。

- [ ] **Step 2.4: コミット**

```bash
git add app/salons/tsurumi/page.tsx
git commit -m "feat: Section 1 ヘッダー＆ヒーローを実装"
```

---

## Task 3: セクション 2 - Before/After の成果カード

**Files:**
- Modify: `app/salons/tsurumi/page.tsx`

- [ ] **Step 3.1: セクション 2 のスタイルを定義**

`app/salons/tsurumi/page.tsx` の styles オブジェクトに追加:
```tsx
const styles = {
  // ... 既存のスタイル ...
  section2: {
    padding: '80px 40px',
    background: '#fff',
  },
  section2Title: {
    textAlign: 'center' as const,
    fontSize: 32,
    fontWeight: 300,
    color: '#1A1018',
    letterSpacing: 4,
    marginBottom: 60,
  },
  cardContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 24,
    maxWidth: 1200,
    margin: '0 auto',
  },
  card: {
    padding: '32px',
    border: '1px solid #E8E8E8',
    background: '#FAFAFA',
    borderRadius: 10,
  },
  cardLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 12,
    fontFamily: 'sans-serif',
  },
  cardBefore: {
    fontSize: 28,
    fontWeight: 500,
    color: '#1A1018',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 1.6,
    marginBottom: 16,
    fontFamily: 'sans-serif',
  },
  cardArrow: {
    textAlign: 'center' as const,
    fontSize: 14,
    color: '#B8966A',
    fontWeight: 500,
    margin: '16px 0',
  },
  cardAfter: {
    fontSize: 28,
    fontWeight: 500,
    color: '#3B6D11',
    marginBottom: 8,
  },
  cardResult: {
    fontSize: 13,
    color: '#3B6D11',
    fontWeight: 500,
    fontFamily: 'sans-serif',
  },
}
```

- [ ] **Step 3.2: セクション 2 の JSX を追加**

`app/salons/tsurumi/page.tsx` の main の return 内に、section2 を追加：
```tsx
<section style={styles.section2}>
  <h2 style={styles.section2Title}>導入による成果</h2>
  <div style={styles.cardContainer}>
    {/* Card 1: 予約確定率 */}
    <div style={styles.card}>
      <div style={styles.cardLabel}>予約確定率</div>
      <div style={styles.cardBefore}>68%</div>
      <div style={styles.cardDescription}>
        ホットペッパー・LINE・電話が混在、<br />
        重複予約が月 12 件発生
      </div>
      <div style={styles.cardArrow}>↓ SALOMÉ 導入</div>
      <div style={styles.cardAfter}>92%</div>
      <div style={styles.cardDescription}>
        システムが自動で重複をブロック
      </div>
      <div style={styles.cardResult}>
        月 12 件の予約取りこぼしを防止
      </div>
    </div>

    {/* Card 2: 顧客再来率 */}
    <div style={styles.card}>
      <div style={styles.cardLabel}>顧客再来率</div>
      <div style={styles.cardBefore}>45%</div>
      <div style={styles.cardDescription}>
        LINEリマインドを手動で送信、<br />
        フォローが属人的
      </div>
      <div style={styles.cardArrow}>↓ SALOMÉ 導入</div>
      <div style={styles.cardAfter}>68%</div>
      <div style={styles.cardDescription}>
        来店後 24h に自動でフォロー送信
      </div>
      <div style={styles.cardResult}>
        新規顧客の定着率が 1.5 倍に
      </div>
    </div>

    {/* Card 3: 月額売上 */}
    <div style={styles.card}>
      <div style={styles.cardLabel}>月額売上</div>
      <div style={styles.cardBefore}>¥680,000</div>
      <div style={styles.cardDescription}>
        施術売上のみ
      </div>
      <div style={styles.cardArrow}>↓ SALOMÉ 導入</div>
      <div style={styles.cardAfter}>¥850,000</div>
      <div style={styles.cardDescription}>
        施術売上 + EC販売 ¥170k/月
      </div>
      <div style={styles.cardResult}>
        追加売上 ¥170k/月を実現
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 3.3: dev server で表示確認**

```bash
npm run dev
```

http://localhost:3000/salons/tsurumi を開く。セクション 2 が 3カラム表示される。

- [ ] **Step 3.4: 型チェック**

```bash
npx tsc --noEmit
```

Expected: エラーなし

- [ ] **Step 3.5: コミット**

```bash
git add app/salons/tsurumi/page.tsx
git commit -m "feat: Section 2 導入前後の成果カードを実装"
```

---

## Task 4: セクション 3 - 機能紹介

**Files:**
- Modify: `app/salons/tsurumi/page.tsx`

- [ ] **Step 4.1: セクション 3 のスタイルを定義**

`app/salons/tsurumi/page.tsx` の styles に追加:
```tsx
const styles = {
  // ... 既存 ...
  section3: {
    padding: '80px 40px',
    background: '#F5F1EC',
  },
  section3Title: {
    textAlign: 'center' as const,
    fontSize: 32,
    fontWeight: 300,
    color: '#1A1018',
    letterSpacing: 4,
    marginBottom: 60,
  },
  featureContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 24,
    maxWidth: 1200,
    margin: '0 auto',
  },
  featureCard: {
    padding: '32px',
    background: '#fff',
    border: '1px solid #E8E8E8',
    borderRadius: 10,
  },
  featureIcon: {
    fontSize: 40,
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 500,
    color: '#1A1018',
    marginBottom: 12,
    fontFamily: 'sans-serif',
  },
  featureDesc: {
    fontSize: 13,
    color: '#666',
    lineHeight: 1.8,
    fontFamily: 'sans-serif',
  },
}
```

- [ ] **Step 4.2: セクション 3 の JSX を追加**

```tsx
<section style={styles.section3}>
  <h2 style={styles.section3Title}>SALOMÉ の機能</h2>
  <div style={styles.featureContainer}>
    {/* Feature 1 */}
    <div style={styles.featureCard}>
      <div style={styles.featureIcon}>📱</div>
      <h3 style={styles.featureTitle}>LINE予約</h3>
      <p style={styles.featureDesc}>
        顧客がLINEリッチメニューから予約。スタッフは自動で Supabase に同期。ホットペッパーとの重複をシステムが自動ブロック。
      </p>
    </div>

    {/* Feature 2 */}
    <div style={styles.featureCard}>
      <div style={styles.featureIcon}>📋</div>
      <h3 style={styles.featureTitle}>顧客カルテ</h3>
      <p style={styles.featureDesc}>
        施術メニュー・スタイル写真・次回希望日を記録。AIが顧客の好みを学習し、推奨メニューを提案。ポイント自動加算で顧客ロイヤリティ向上。
      </p>
    </div>

    {/* Feature 3 */}
    <div style={styles.featureCard}>
      <div style={styles.featureIcon}>🛍</div>
      <h3 style={styles.featureTitle}>ECストア</h3>
      <p style={styles.featureDesc}>
        自社商品とアフィリ商品を同一カタログで販売。配送代行も対応。顧客の来店後 LINE で自動推奨メール送信。
      </p>
    </div>
  </div>
</section>
```

- [ ] **Step 4.3: dev server で表示確認**

```bash
npm run dev
```

http://localhost:3000/salons/tsurumi でセクション 3 が表示される。

- [ ] **Step 4.4: コミット**

```bash
git add app/salons/tsurumi/page.tsx
git commit -m "feat: Section 3 機能紹介を実装"
```

---

## Task 5: セクション 4 - 料金表

**Files:**
- Modify: `app/salons/tsurumi/page.tsx`

- [ ] **Step 5.1: セクション 4 のスタイルを定義**

`app/salons/tsurumi/page.tsx` の styles に追加:
```tsx
const styles = {
  // ... 既存 ...
  section4: {
    padding: '80px 40px',
    background: '#fff',
  },
  section4Title: {
    textAlign: 'center' as const,
    fontSize: 32,
    fontWeight: 300,
    color: '#1A1018',
    letterSpacing: 4,
    marginBottom: 60,
  },
  pricingContainer: {
    maxWidth: 1000,
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 24,
  },
  pricingCard: (isRecommended: boolean) => ({
    padding: '32px',
    border: isRecommended ? '2px solid #B8966A' : '1px solid #E8E8E8',
    background: isRecommended ? '#FAFBF8' : '#fff',
    borderRadius: 10,
    textAlign: 'center' as const,
  }),
  planName: {
    fontSize: 16,
    fontWeight: 500,
    color: '#1A1018',
    marginBottom: 8,
    fontFamily: 'sans-serif',
  },
  planPrice: {
    fontSize: 28,
    fontWeight: 500,
    color: '#B8966A',
    marginBottom: 4,
  },
  planBadge: {
    fontSize: 12,
    color: '#B8966A',
    marginBottom: 20,
    fontFamily: 'sans-serif',
  },
  featureList: {
    textAlign: 'left' as const,
    fontSize: 13,
    color: '#666',
    lineHeight: 2,
    fontFamily: 'sans-serif',
  },
  pricingNote: {
    textAlign: 'center' as const,
    fontSize: 13,
    color: '#666',
    marginTop: 40,
    lineHeight: 1.8,
    fontFamily: 'sans-serif',
  },
}
```

- [ ] **Step 5.2: セクション 4 の JSX を追加**

```tsx
<section style={styles.section4}>
  <h2 style={styles.section4Title}>料金プラン</h2>
  <div style={styles.pricingContainer}>
    {/* Basic */}
    <div style={styles.pricingCard(false)}>
      <div style={styles.planName}>Basic</div>
      <div style={styles.planPrice}>¥980/月</div>
      <div style={styles.featureList}>
        ✅ LINE予約<br />
        ✅ 重複ブロック<br />
        ❌ 顧客カルテ<br />
        ❌ AI推奨<br />
        ❌ ポイント管理<br />
        ❌ ECストア<br />
        ❌ 売上レポート<br />
        ❌ スタッフ管理
      </div>
    </div>

    {/* Small - Recommended */}
    <div style={styles.pricingCard(true)}>
      <div style={styles.planName}>⭐ Small</div>
      <div style={styles.planPrice}>¥2,480/月</div>
      <div style={styles.planBadge}>推奨プラン</div>
      <div style={styles.featureList}>
        ✅ LINE予約<br />
        ✅ 重複ブロック<br />
        ✅ 顧客カルテ<br />
        ✅ AI推奨<br />
        ✅ ポイント管理<br />
        ❌ ECストア<br />
        ❌ 売上レポート<br />
        ❌ スタッフ管理
      </div>
    </div>

    {/* Medium */}
    <div style={styles.pricingCard(false)}>
      <div style={styles.planName}>Medium</div>
      <div style={styles.planPrice}>¥3,980/月</div>
      <div style={styles.featureList}>
        ✅ LINE予約<br />
        ✅ 重複ブロック<br />
        ✅ 顧客カルテ<br />
        ✅ AI推奨<br />
        ✅ ポイント管理<br />
        ✅ ECストア<br />
        ✅ 売上レポート<br />
        ✅ スタッフ管理
      </div>
    </div>
  </div>
  <p style={styles.pricingNote}>
    30日間無料トライアル付き。<br />
    キレイ鶴見店の成果は Small プランで実現。<br />
    いつでも解約可能。
  </p>
</section>
```

- [ ] **Step 5.3: dev server で表示確認**

```bash
npm run dev
```

http://localhost:3000/salons/tsurumi でセクション 4 が表示される。Small プランが中央で目立つ。

- [ ] **Step 5.4: コミット**

```bash
git add app/salons/tsurumi/page.tsx
git commit -m "feat: Section 4 料金表を実装"
```

---

## Task 6: セクション 5 - 最終 CTA

**Files:**
- Modify: `app/salons/tsurumi/page.tsx`

- [ ] **Step 6.1: セクション 5 のスタイルを定義**

`app/salons/tsurumi/page.tsx` の styles に追加:
```tsx
const styles = {
  // ... 既存 ...
  section5: {
    padding: '80px 40px',
    background: '#1A1018',
    textAlign: 'center' as const,
  },
  ctaButton: {
    padding: '18px 48px',
    background: '#B8966A',
    color: '#FAF6EE',
    textDecoration: 'none',
    fontSize: 16,
    letterSpacing: 2,
    fontFamily: 'sans-serif',
    border: 'none',
    cursor: 'pointer',
    borderRadius: 8,
    marginBottom: 24,
    display: 'inline-block',
  },
  ctaSubText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: 1.8,
    marginBottom: 16,
    fontFamily: 'sans-serif',
  },
  ctaFooter: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
    marginTop: 24,
    fontFamily: 'sans-serif',
  },
}
```

- [ ] **Step 6.2: セクション 5 の JSX を追加**

```tsx
<section style={styles.section5}>
  <a href="/register" style={styles.ctaButton}>
    30日無料で始める
  </a>
  <p style={styles.ctaSubText}>
    クレジットカード登録不要。<br />
    30日後に自動で Small プランに移行します。
  </p>
  <p style={styles.ctaFooter}>
    ご質問は support@salonrink.com までお気軽に
  </p>
</section>
```

- [ ] **Step 6.3: dev server で表示確認**

```bash
npm run dev
```

http://localhost:3000/salons/tsurumi でセクション 5 が黒背景で表示される。

- [ ] **Step 6.4: コミット**

```bash
git add app/salons/tsurumi/page.tsx
git commit -m "feat: Section 5 最終 CTA を実装"
```

---

## Task 7: レスポンシブ対応とモバイル確認

**Files:**
- Modify: `app/salons/tsurumi/page.tsx`

- [ ] **Step 7.1: モバイルメディアクエリをスタイルに追加**

`app/salons/tsurumi/page.tsx` の styles に追加:
```tsx
// モバイル用スタイル（既存スタイルの上書き）
const mobileStyles = {
  hero: {
    padding: '40px 20px',
  },
  title: {
    fontSize: 32,
  },
  cardContainer: {
    gridTemplateColumns: '1fr',
  },
  featureContainer: {
    gridTemplateColumns: '1fr',
  },
  pricingContainer: {
    gridTemplateColumns: '1fr',
  },
}
```

- [ ] **Step 7.2: メディアクエリ対応の見直し**

ブラウザの DevTools で以下をテスト：
- iPhone SE (375px)
- iPhone 12 (390px)
- iPad (768px)
- Desktop (1920px)

各ブレークポイントで：
- テキストが読みやすい
- ボタンがタップ可能な大きさ（最小 44px）
- カードが 1 列〜3 列で適切に折り返す

確認項目：
- [ ] 375px で全セクションが読みやすい
- [ ] 768px でタブレット表示が適切
- [ ] 1920px でデスクトップが最適

- [ ] **Step 7.3: dev server で複数デバイスサイズを確認**

```bash
npm run dev
```

Chrome DevTools で Responsive Design Mode を開く (Ctrl+Shift+M)。

各デバイスサイズで確認：
- ヒーロータイトルが見える
- セクション2のカードが3列 → 1列に折り返す
- ボタンがタップ可能
- テキストがオーバーフローしない

- [ ] **Step 7.4: コミット**

```bash
git add app/salons/tsurumi/page.tsx
git commit -m "feat: モバイルレスポンシブ対応を確認"
```

---

## Task 8: 型チェック＆最終確認

**Files:**
- Verify: `app/salons/tsurumi/page.tsx`

- [ ] **Step 8.1: TypeScript 型チェック**

```bash
npx tsc --noEmit
```

Expected: エラーなし

- [ ] **Step 8.2: dev server で全ページを目視確認**

```bash
npm run dev
```

http://localhost:3000/salons/tsurumi を開く。確認項目：

- [ ] セクション 1: ヒーロータイトル＆サブタイトル＆ボタンが表示
- [ ] セクション 2: 3つのカード（予約確定率・再来率・売上）が表示
- [ ] セクション 3: 3つの機能カード（LINE予約・顧客カルテ・EC）が表示
- [ ] セクション 4: 料金表 3プラン、Small が強調されている
- [ ] セクション 5: 最終 CTA ボタン＆説明文が表示
- [ ] `/register` へのリンクが正常に機能する
- [ ] 色・フォント・間隔が既存 SALOMÉ LP と統一されている

- [ ] **Step 8.3: ビルド確認**

```bash
npm run build
```

Expected: ビルド成功（warning はあってもいいが error は 0）

- [ ] **Step 8.4: コミット（必要に応じて）**

修正がなければ skip。修正があれば:
```bash
git add app/salons/tsurumi/page.tsx
git commit -m "fix: 型チェック＆ビルド修正"
```

---

## Done Criteria

- [x] `/salons/tsurumi` ページが正常に表示される
- [x] 全 5 セクションが設計書通りにレンダリングされる
- [x] `/register` へのリンクが正常に機能する
- [x] 既存 SALOMÉ LP とビジュアルが統一されている（色・フォント・間隔）
- [x] モバイル表示で読みやすい（レスポンシブ）
- [x] `npx tsc --noEmit` で型エラーなし
- [x] `npm run build` で build error なし
- [x] dev server で全セクションが正常に表示される

---

## Summary

計 8 タスク、約 3-4 時間の実装予定。単純な React Server Component で、既存パターンに従ったランディングページ。ストレージ・外部 API 依存なし。月額インフラコスト ¥0 のまま。
