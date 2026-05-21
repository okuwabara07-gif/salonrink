# Day 2 → Day 3: API 動作確認・テスト方式の判断

## 📊 テスト方式の比較

| 方式 | 実施内容 | 利点 | 課題 | 推奨 |
|---|---|---|---|---|
| **A: curl** | API 単体テスト | 早い、API だけ確認 | LIFF 認証クッキー入手が複雑 | ❌ |
| **B: LIFF UI** | UI 経由のE2E テスト | 実際の利用フロー、認証自然 | UI 実装を同時並行 | ✅ |

---

## ✅ 推奨: 方式 B（LIFF UI 先行）

**理由**:
1. LIFF 認証経由でしか API が正常動作しない（user.id → owner_user_id で salon 解決）
2. どうせ Day 3 で作る LIFF UI を早期に実装
3. UI 経由の E2E テストで API の実際の動作を確認できる
4. curl で認証クッキーを手動で入手・管理するより効率的

---

## 🚀 Day 3 着手前のチェックリスト

### 1. 環境変数確認

```bash
# .env.local に以下が必要か確認
NEXT_PUBLIC_LIFF_ID_PRE_COUNSELING=xxxx  # 既存
NEXT_PUBLIC_LIFF_ID_MENU=????            # 新規必要（Osamu が LINE Developers で取得）
```

**Osamu へのお願い**:
- LINE Developers Console で新規 LIFF 作成
- LIFF ID を取得 → `.env.local` に `NEXT_PUBLIC_LIFF_ID_MENU=取得したID` で追加

### 2. 既存 LIFF パターンの確認

```typescript
// app/liff/pre-counseling/page.tsx L247
const liffId = process.env.NEXT_PUBLIC_LIFF_ID_PRE_COUNSELING

useEffect(() => {
  liff.init({ liffId }).then(() => {
    // リダイレクト or スキップ処理
  })
}, [])
```

**Day 3 で再利用する内容**:
- ✅ `liff.init({ liffId })` 初期化パターン
- ✅ `.env.local` からの環境変数読み込み
- ✅ `useEffect` での初期化タイミング

### 3. DESIGN_BRIEF.md の Scene 4 仕様確認

**確認すべき項目**:
- [ ] デザイントークン（色・タイポ・スペーシング）
- [ ] コンポーネント構成（メニュー一覧・編集モーダル・作成FAB）
- [ ] インタラクション（クリック・ドラッグ・フォーム送信）
- [ ] 空状態・ローディング・エラー状態

**対象セクション**: `docs/brief/DESIGN_BRIEF.md` §4（メニュー管理画面）

---

## 📝 Day 3 実装フロー

### Phase 1: 基礎ページ作成（30 min）
```
app/liff/menu/
├── page.tsx                  (LIFF 初期化 + レイアウト)
└── _components/
    ├── MenuList.tsx          (メニュー一覧表示)
    ├── MenuEditor.tsx        (編集モーダル)
    └── MenuCreate.tsx        (作成FAB)
```

### Phase 2: API 連携（60 min）
- GET /api/menus で一覧取得
- POST /api/menus で新規作成
- PATCH /api/menus/[id] で更新
- DELETE /api/menus/[id] で削除

### Phase 3: UI 仕上げ（30 min）
- デザイントークン適用（Tailwind + CSS variables）
- エラーハンドリング（トースト・アラート）
- ローディング状態・スケルトン

### Phase 4: 実機テスト（30 min）
- iPhone 14/15 で LIFF 経由アクセス
- 全 CRUD 操作確認
- キレイ鶴見店でメニュー編集が動くか確認

---

## 🔧 Day 3 前に確認すべき詳細

### DESIGN_BRIEF.md 必読セクション

#### §2.3 メニュー管理画面（Scene 4）
- ページ構成：ヘッダー・タブ（全て/カラー/パーマ等）・一覧・新規FAB
- 各メニュー行：メニュー名・価格・所要時間・カテゴリ・操作ボタン

#### §3 デザイントークン（必須）
```css
/* カラー */
--ink: #1a1814;           /* テキスト主要 */
--bg-warm: #faf8f3;       /* ページベース */
--paper: #FBF8F3;         /* カード */
--card: #ffffff;          /* 白カード */
--line: #e6e1d6;          /* 境界線 */
--accent: #06C755;        /* LINEグリーン */

/* タイポグラフィ */
font-family: "Noto Serif JP", "Noto Sans JP"
/* 見出し: Noto Serif, 500-600w, 28-20px */
/* 本文: Noto Sans, 400-500w, 14px */
/* 数値: JetBrains Mono, 12-16px */
```

#### §4.5 エラー表示
- 空状態：「メニューがまだ登録されていません」
- ローディング：スケルトンまたはスピナー
- エラー：トースト通知（赤/オレンジ）

---

## ✅ Day 3 実装時の統一事項（再掲）

| 項目 | 内容 |
|---|---|
| **LIFF SDK** | `@line/liff` 経由で user.id 取得 → API で salon_id 自動解決 |
| **レスポンス形式** | API から `{ data, error: null }` / `{ data: null, error }` |
| **UI 状態** | ローディング・エラー・空状態を必ず実装 |
| **デザイン** | DESIGN_BRIEF.md のトークン完全準拠 |
| **Tailwind** | tailwind.config.ts で color tokens 拡張 |
| **アイコン** | @tabler/icons-react のみ（shadcn/ui 不使用） |
| **commit** | 各ステップで細かく commit（feat/fix/refactor） |

---

## 📌 Day 3 着手時のファイル構成

```
app/liff/menu/
├── page.tsx                         # LIFF init + レイアウト root
├── _components/
│   ├── MenuList.tsx                # 一覧表示
│   ├── MenuEditor.tsx              # 編集モーダル
│   ├── MenuCreate.tsx              # 新規FAB
│   ├── MenuCategory.tsx            # カテゴリフィルタ（optional）
│   └── MenuItemCard.tsx            # メニュー行コンポーネント
├── hooks/
│   └── useMenuList.ts              # fetch /api/menus, キャッシュ・再フェッチ
└── styles/
    └── menu.module.css             # 固有スタイル（optional）

lib/menus/
├── schema.ts                        # ✅ 既にある
└── client.ts                        # 新規：UI 側の API client wrapper
```

---

## 🎯 Next Steps

1. ✅ **Day 2 commit 完了**
2. 📋 **方式判断**: 方式 B（LIFF UI）に決定
3. 🔧 **Day 3 前準備**:
   - Osamu: LINE Developers で LIFF ID 取得 → `.env.local` に追加
   - Claude Code: DESIGN_BRIEF.md Scene 4 読み込み
4. 🚀 **Day 3 着手**: `app/liff/menu/page.tsx` から実装開始

---

**status**: Day 2 完了、Day 3 準備段階  
**commit**: f8baeb9
