# Day 2: メニュー CRUD API 設計書

**目標**: `lib/menuPricing.ts` と `lib/menuAlias.server.ts` の既存読み取り動作を保証しながら、新規メニュー作成・編集・削除 API を実装

---

## 設計原則

### 1. READ 用 API（既存システム維持）
- **用途**: `lib/menuPricing.ts` / `lib/menuAlias.server.ts` / dashboard から呼び出し
- **形式**: Supabase RLS に任せる（Auth + RLS で salon_id を自動フィルタ）
- **変更**: なし（既存クエリがそのまま動く）

### 2. WRITE 用 API（Day 2 新規実装）
- **用途**: LIFF メニュー編集 UI から呼び出し
- **権限**: RLS に加えて API 側で owner 確認（多重防御）
- **操作**: POST / PATCH / DELETE

---

## エンドポイント設計

### `GET /api/menus`
**既存読み取り互換性確保**

```typescript
// リクエスト（パラメータなし、RLS が salon_id を自動フィルタ）
GET /api/menus

// レスポンス
{
  "data": [
    {
      "id": "uuid",
      "salon_id": "uuid",
      "name": "オーガニックカラー 毛先15cm〜",
      "price": 3900,
      "duration": 30,
      "category": "カラー",
      "sort_order": 0,
      "created_at": "2026-04-15T10:00:00Z"
    },
    ...
  ],
  "error": null
}
```

**実装パターン**:
```typescript
// app/api/menus/route.ts (GET)
export async function GET(req: Request) {
  const supabase = await createClient();
  
  // RLS が自動的に auth.uid() → owner_user_id → salon_id でフィルタ
  const { data, error } = await supabase
    .from('salon_menus')
    .select('id, salon_id, name, price, duration, category, sort_order, created_at')
    .order('sort_order', { ascending: true });

  if (error) return Response.json({ data: null, error: error.message }, { status: 500 });
  return Response.json({ data, error: null });
}
```

**呼び出し側（既存、変更不要）**:
```typescript
// lib/menuPricing.ts などで使用
const { data: menus } = await supabase.from('salon_menus').select('...');
// または
const res = await fetch('/api/menus');
const { data } = await res.json();
```

---

### `POST /api/menus`
**メニュー新規作成（LIFF 側）**

```typescript
// リクエスト
{
  "name": "プレミアムカラー",
  "price": 5500,
  "duration": 60,
  "category": "カラー",
  "sort_order": 11  // 既存10行 + 1
}

// レスポンス (201)
{
  "data": {
    "id": "uuid",
    "salon_id": "uuid",
    "name": "プレミアムカラー",
    "price": 5500,
    "duration": 60,
    "category": "カラー",
    "sort_order": 11,
    "created_at": "2026-05-22T14:30:00Z"
  },
  "error": null
}
```

**実装パターン**:
```typescript
// app/api/menus/route.ts (POST)
import { z } from 'zod';

const CreateMenuSchema = z.object({
  name: z.string().min(1).max(200),
  price: z.number().int().min(0),
  duration: z.number().int().min(15),
  category: z.string().optional(),
  sort_order: z.number().int().optional(),
});

export async function POST(req: Request) {
  const supabase = await createClient();
  
  // ユーザー認証確認
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  // ユーザーのサロン取得（multiple defense: RLS + code）
  const { data: salon } = await supabase
    .from('salons')
    .select('id')
    .eq('owner_user_id', user.id)
    .single();
  
  if (!salon) return Response.json({ error: 'Forbidden' }, { status: 403 });

  // リクエスト検証
  const body = await req.json();
  const validated = CreateMenuSchema.parse(body);

  // sort_order が指定されなければ最大値 + 1
  let sortOrder = validated.sort_order;
  if (sortOrder === undefined) {
    const { data: maxMenu } = await supabase
      .from('salon_menus')
      .select('sort_order')
      .eq('salon_id', salon.id)
      .order('sort_order', { ascending: false })
      .limit(1)
      .single();
    sortOrder = (maxMenu?.sort_order ?? -1) + 1;
  }

  // 挿入
  const { data, error } = await supabase
    .from('salon_menus')
    .insert({
      salon_id: salon.id,
      name: validated.name,
      price: validated.price,
      duration: validated.duration,
      category: validated.category || null,
      sort_order: sortOrder,
    })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ data, error: null }, { status: 201 });
}
```

---

### `PATCH /api/menus/[id]`
**メニュー編集**

```typescript
// リクエスト
{
  "name": "プレミアムカラー（オーガニック）",
  "price": 5800,
  "duration": 75,
  "category": "カラー"
  // sort_order は含めない（ドラッグ並べ替えは別エンドポイント）
}

// レスポンス (200)
{
  "data": {
    "id": "uuid",
    "salon_id": "uuid",
    "name": "プレミアムカラー（オーガニック）",
    "price": 5800,
    "duration": 75,
    "category": "カラー",
    "sort_order": 11,
    "created_at": "2026-05-22T14:30:00Z",
    "updated_at": "2026-05-22T15:00:00Z"
  },
  "error": null
}
```

**実装パターン**:
```typescript
// app/api/menus/[id]/route.ts (PATCH)
const UpdateMenuSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  price: z.number().int().min(0).optional(),
  duration: z.number().int().min(15).optional(),
  category: z.string().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  
  // 認証 + サロン確認
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: salon } = await supabase
    .from('salons')
    .select('id')
    .eq('owner_user_id', user.id)
    .single();
  
  if (!salon) return Response.json({ error: 'Forbidden' }, { status: 403 });

  // メニュー所有権確認
  const { data: menu } = await supabase
    .from('salon_menus')
    .select('id')
    .eq('id', params.id)
    .eq('salon_id', salon.id)
    .single();
  
  if (!menu) return Response.json({ error: 'Not found' }, { status: 404 });

  // 更新
  const body = await req.json();
  const validated = UpdateMenuSchema.parse(body);

  const { data, error } = await supabase
    .from('salon_menus')
    .update({
      ...(validated.name && { name: validated.name }),
      ...(validated.price !== undefined && { price: validated.price }),
      ...(validated.duration && { duration: validated.duration }),
      ...(validated.category !== undefined && { category: validated.category }),
    })
    .eq('id', params.id)
    .eq('salon_id', salon.id)
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ data, error: null });
}
```

---

### `DELETE /api/menus/[id]`
**メニュー削除**

```typescript
// リクエスト（本体なし）
DELETE /api/menus/[id]

// レスポンス (204 No Content)
```

**実装パターン**:
```typescript
// app/api/menus/[id]/route.ts (DELETE)
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  
  // 認証 + サロン確認（重複コード は utils に抽出）
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: salon } = await supabase
    .from('salons')
    .select('id')
    .eq('owner_user_id', user.id)
    .single();
  
  if (!salon) return Response.json({ error: 'Forbidden' }, { status: 403 });

  // 削除
  const { error } = await supabase
    .from('salon_menus')
    .delete()
    .eq('id', params.id)
    .eq('salon_id', salon.id);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return new Response(null, { status: 204 });
}
```

---

### `PATCH /api/menus/reorder` (将来)
**ドラッグ並べ替え（Day 3 の LIFF UI 実装後に追加）**

```typescript
// リクエスト
{
  "updates": [
    { "id": "uuid1", "sort_order": 0 },
    { "id": "uuid2", "sort_order": 1 },
    { "id": "uuid3", "sort_order": 2 }
  ]
}

// レスポンス
{
  "data": { "updated_count": 3 },
  "error": null
}
```

---

## 実装チェックリスト（Day 2）

- [ ] `lib/menus/schema.ts` 作成（Zod スキーマ集約）
- [ ] `app/api/menus/route.ts` 実装（GET / POST）
- [ ] `app/api/menus/[id]/route.ts` 実装（PATCH / DELETE）
- [ ] エラーハンドリング（401/403/404/500）網羅
- [ ] POST 成功時 sort_order 自動計算
- [ ] PATCH で部分更新（指定フィールドのみ）
- [ ] curl または Postman で動作確認
- [ ] 既存 lib/menuPricing.ts が変更なしで動作確認

---

## 既存システムとの互換性

### menuPricing.ts（読み取り専用、変更なし）
```typescript
// 既存の呼び出しがそのまま動く
const masters = menus.map(toMenuMaster);
const price = resolveMenuPrice(hpbMenuName, masters);
```

✅ **互換性**: 完全。API GET /menus でも Supabase 直接クエリでも両方動作

### menuAlias.server.ts（読み取り専用、変更なし）
```typescript
// HPB menu_name ↔ salon_menus マッピング
const { data: aliases } = await supabase
  .from('hpb_menu_alias')
  .select('hpb_raw_name, status, salon_menus!salon_menu_id(...)')
```

✅ **互換性**: 完全。JOIN が引き続き有効

### dashboard/page.tsx（読み取り + RLS の二重フィルタ）
```typescript
// 既存クエリ + API 化の選択肢
const { data: menus } = await supabase
  .from('salon_menus')
  .select('...')
  // または
const res = await fetch('/api/menus');
```

✅ **互換性**: 完全。RLS が保証するため API 経由でも安全

---

## まとめ

**Day 2 API の原則**:
1. **READ**: RLS に完全に任せる（既存互換性 100%）
2. **WRITE**: API + RLS の二重防御（所有権確認）
3. **Zod**: スキーマ集約で型安全化
4. **Sort**: 自動計算で LIFF UI 負荷削減
5. **Future**: ドラッグ並べ替え（Day 3 後に追加可能）

**次**: Day 1 SQL 実行 → Day 2 実装開始
