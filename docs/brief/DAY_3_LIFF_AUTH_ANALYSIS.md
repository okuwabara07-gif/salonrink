# Day 3: LIFF 認証パターン分析

## 📊 既存 LIFF の認証方式確認

### Pre-Counseling LIFF (`/liff/pre-counseling`)

**認証フロー**:

```
LINE ユーザー(顧客)
  ↓
LIFF 起動 (token パラメータ付き URL)
  ↓
page.tsx: liff.init({ liffId })
  ↓
liff.isLoggedIn() チェック → ない場合 liff.login()
  ↓
liff.getProfile() で LINE profile 取得
  ↓
token パラメータで /api/pre-counseling/{token}/get を呼び出し
  ↓
Supabase Auth 不使用（token ベースの一時アクセス）
```

**認証の特徴**:
- ✅ **LIFF SDK のみ使用** (`@line/liff`)
- ✅ **Supabase Auth 不使用** (顧客向けの一時的フロー)
- ✅ **TOKEN ベースのセキュアアクセス** (pre_counselings テーブルの token で権限管理)
- ✅ **line_customer_links テーブル不使用** (顧客 ID は URL パラメータから)

**API 側の認証**:
```typescript
// app/api/pre-counseling/[token]/get
const { data: preCounseling } = await supabase
  .from('pre_counselings')
  .select('*')
  .eq('token', token)  // ← token で権限チェック（RLS なし）
  .single()
```

---

## ⚠️ 重要: 認証要件の違い

### Pre-Counseling LIFF （顧客向け、現在の実装）

| 要素 | 内容 |
|---|---|
| **ターゲット** | 顧客（美容師ではなく）|
| **認証** | LIFF SDK のみ（ログイン必須）|
| **Supabase Auth** | 不使用 |
| **権限管理** | token ベース（pre_counselings.token）|
| **user_id** | Supabase user 不要、LINE userId で十分 |

### Menu LIFF （美容師向け、Day 3 で実装）

| 要素 | 内容 |
|---|---|
| **ターゲット** | 美容師（サロンオーナー） |
| **認証** | ❓ どう実装すべき？ |
| **Supabase Auth** | ❓ 必要か不要か？ |
| **権限管理** | ❓ salon_id ベースか user_id ベースか？ |
| **user_id** | ❓ LIFF userId を Supabase に紐付けするか？ |

---

## 🔍 分析結果: 3つの実装オプション

### **Option A: Pre-Counseling と同じ TOKEN ベース（顧客向けフロー）**

```typescript
// app/liff/menu/page.tsx
useEffect(() => {
  const token = searchParams.get('token')  // ← URL パラメータから token 取得
  
  await liff.init({ liffId })
  
  // Supabase Auth 不使用
  // 直接 /api/menus?token={token} 呼び出し
}, [])
```

**利点**: シンプル、pre-counseling と同じパターン  
**課題**: メニュー編集は「オーナーが管理画面から」想定なので token 方式は不自然

---

### **Option B: Supabase Auth で user を確立（美容師向けフロー）**

```typescript
// app/liff/menu/page.tsx
useEffect(() => {
  const liffId = process.env.NEXT_PUBLIC_LIFF_ID_MENU
  
  await liff.init({ liffId })
  
  if (!liff.isLoggedIn()) {
    liff.login()
    return
  }
  
  // LIFF userId を取得
  const profile = await liff.getProfile()
  const liffUserId = profile.userId
  
  // ✅ Step 1: LIFF ID Token を取得して Supabase に送信
  // const idToken = await liff.getIDToken()
  // await supabase.auth.signInWithIdToken({ idToken })
  
  // ✅ Step 2: その後 Supabase user が確立
  // const { data: { user } } = await supabase.auth.getUser()
  // user.id でサロン権限チェック可能
  
}, [])
```

**利点**: 
- Supabase RLS で自動的に salon_id をフィルタ
- 既存 API (Day 2) をそのまま使用可能
- 美容師向けのセキュアなフロー

**課題**: 
- LIFF ID Token と Supabase Auth の統合が必要（現在のコードに実装なし）
- LINE Developers の BOT アカウント設定が必要

---

### **Option C: Hybrid（LIFF ログイン + token ベース）**

```typescript
// LIFF ログインはするが、Supabase Auth はしない
// /api/menus API 呼び出し時に token パラメータを渡す

const menus = await fetch('/api/menus?liffToken={token}')
```

**利点**: 現在の API を最小限修正  
**課題**: API を token ベースに変更する必要がある（Day 2 設計と矛盾）

---

## 🚨 Osamu への判断要請

以下のいずれかの判断をお願いします:

### Question 1: LIFF 認証要件

**Q**: Menu LIFF にアクセスするのは誰か？
- A: 顧客（Pre-Counseling と同じ顧客向け）→ **Token ベース (Option A)**
- B: 美容師/サロンオーナー（Supabase user として管理） → **Supabase Auth (Option B)**

### Question 2: LIFF ID Token サポート

**Q**: LINE Developers 側で、このメニュー LIFF を「Bot アカウント」として設定できるか？
- Yes → Option B 実装可能（Supabase auth サポート）
- No → Option A または Option C で実装（Token ベース）

---

## 📋 現在の判断

### 推定シナリオ: **Option B（Supabase Auth）**

**根拠**:
1. Day 2 API は `supabase.auth.getUser()` で user.id → owner_user_id → salon_id 解決
2. Menu 画面は「サロンオーナー向けの管理画面」（美容師が見る）
3. Pre-Counseling は「顧客向けの一時フロー」なので異なる要件

**実装上の注意点**:
- LIFF ID Token を Supabase に送信する仕組みが必要
- 現在のコードには実装がないため、新規追加
- `liff.getIDToken()` と `supabase.auth.signInWithIdToken()` の統合が必須

---

## 🎯 待機事項

Osamu からの回答を待つ:

1. Menu LIFF の対象ユーザー（顧客 vs 美容師）
2. LINE Developers の Bot アカウント設定
3. Option A / B / C のいずれを採用すべきか

**判断後、page.tsx の構造案を出します。**

---

**作成日**: 2026-05-22  
**Status**: Osamu 判断待機中
