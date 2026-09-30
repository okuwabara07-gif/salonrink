# pass-liff API 仕様（客側 LIFF 用）

Edge Function：`POST https://fmpmgilgvvfezursmyic.supabase.co/functions/v1/pass-liff`
呼び方は既存の `get-mycarte` と同じ（verify_jwt=false。`app/liff/` 内で get-mycarte を呼んでいる箇所と同じヘッダー・fetch 方法を流用する）。
CORS 許可：salonrink.com / *.salonrink.com / liff.line.me / localhost

## 共通

リクエスト（JSON）
| フィールド | 型 | 必須 | 内容 |
|---|---|---|---|
| action | "get" \| "link" \| "memo" | 任意（既定 "get"） | 操作 |
| line_user_id | string | 必須 | LIFF の userId |
| salon_code | string | 任意（既定 "kirei-tsurumi"） | サロン識別子 |

共通エラー
| status | body | 意味 |
|---|---|---|
| 400 | `{error:"line_required", message}` | line_user_id が無い |
| 404 | `{error:"salon_not_found"}` | salon_code が不正 |
| 500 | `{error:"server_error", message}` | サーバー側エラー |

---

## action: "get" — 会員証の表示データ

### 未連携のとき
```json
{ "ok": true, "salon_code": "kirei-tsurumi", "linked": false }
```
→ C1 の「未連携」ステート（「お店の会員情報と連携する」ボタン）を表示。

### 連携済みのとき
```json
{
  "ok": true,
  "salon_code": "kirei-tsurumi",
  "linked": true,
  "customer_id": "uuid",
  "balance": 18,
  "expires_on": "2027-09-01",
  "has_pending_bonus": true,
  "next_reservation_at": "2026-10-27T01:00:00+00:00",
  "next_reward": { "name": "スタンダードトリートメント", "points_required": 25, "remaining": 7 },
  "redeemable": [ { "name": "…", "points_required": 25 } ],
  "rewards": [
    { "name": "スタンダードトリートメント", "points_required": 25 },
    { "name": "髪質改善トリートメント", "points_required": 50 }
  ],
  "last_visit": { "date": "2026-09-01", "menu": "リタッチ", "color_label": "ダークブラウン" },
  "history": [
    { "at": "2026-09-01T02:10:00+00:00", "reason": "purchase", "delta": 6, "amount_yen": 6600, "note": null },
    { "at": "…", "reason": "next_booking_bonus", "delta": 2, "amount_yen": null, "note": null },
    { "at": "…", "reason": "redeem", "delta": -25, "amount_yen": null, "note": "スタンダードトリートメント" },
    { "at": "…", "reason": "migration", "delta": 12, "amount_yen": null, "note": "紙スタンプ12個" }
  ],
  "rules": { "yen_per_point": 1000, "next_booking_bonus": 2, "expiry_months": 12, "include_retail": true }
}
```

フィールドの意味
| フィールド | 内容 | 画面 |
|---|---|---|
| balance | 現在のポイント | C1 大きく表示 |
| next_reward | 残高より上で最も近い特典（無ければ null＝50P到達） | C1「あと◯P」 |
| redeemable | 残高で交換できる特典（空配列なら無し） | C1 25P/50P到達ステート、C2 |
| rewards | 全特典（進捗バーの目盛り） | C1, C2 |
| has_pending_bonus | 次回予約ボーナス対象の予約がある | C1「◯/◯ ご予約済み：ご来店時に+2P」 |
| next_reservation_at | 次回予約日時（無ければ null） | C1 |
| last_visit | 前回の来店。null なら初回ステート | C1 |
| last_visit.color_label | 客に見せてよい色名だけ。配合は含まれない | C1 |
| expires_on | 有効期限（最終来店日+12ヶ月）。null は来店実績なし | C1 期限間近（30日以内）判定, C2 |
| history | 直近20件。reason の表示名は下表 | C2 |

history.reason の表示名
| reason | 表示 |
|---|---|
| purchase | ご来店（{amount_yen}円） |
| next_booking_bonus | 次回予約ボーナス |
| redeem | {note} 交換 |
| migration | 紙カードから移行 |
| adjust | 調整 |
| expire | 有効期限切れ |

C1 ステート判定（この順で評価）
1. `linked === false` → 未連携
2. `last_visit === null` → 初回
3. `redeemable` に 50P が含まれる → 50P到達
4. `redeemable` に 25P が含まれる → 25P到達
5. `has_pending_bonus` → 次回予約済み
6. `expires_on` が今日から30日以内 → 期限間近
7. それ以外 → 通常

---

## action: "link" — 会員連携

リクエスト（どちらか）
- 店頭QR経由：`{ action:"link", line_user_id, token }`（QR の URL パラメータ `?t=` の値）
- 手入力：`{ action:"link", line_user_id, kana:"ヤマダ", phone4:"1234" }`

レスポンス
```json
{ "ok": true, "linked": true, "method": "token" | "manual" | "existing", "customer_id": "uuid", "balance": 12 }
{ "ok": true, "linked": false, "reason": "token_invalid" | "not_found" | "ambiguous" | "missing_params" }
```
| reason | 画面 |
|---|---|
| token_invalid | 「QRの有効期限が切れています。お店でもう一度表示してもらってください」 |
| not_found / ambiguous | 「見つかりませんでした。次回ご来店時にスタッフが確認します」 |

完了画面の「紙のスタンプ◯個を移行」は `balance` を表示（移行済みなら残高に含まれている）。

---

## action: "memo" — 来店前メモ

リクエスト
```json
{ "action":"memo", "line_user_id", "choice":"same"|"brighter"|"gray_concern"|"photo", "memo_text":"…（任意）", "concerns":[] }
```
レスポンス
```json
{ "ok": true, "memo": { "id": "…", "created_at": "…" }, "reservation_id": "uuid|null" }
```
`reservation_id` が付いていれば次回予約に紐付いた。null なら予約なしで保存（店側の一覧には表示されない）。
写真添付は既存の mycarte-photos の仕組みで先にアップロードし、そのパスを `memo_text` に含めるか、後続で `consult_memos.diagnosis_ids` に入れる（MVPでは写真なしで可）。

---

## 実装上の注意
- 秘密鍵は不要。既存の get-mycarte と同じ呼び方（anon key）で呼べる
- 未連携（linked:false）は正常応答。エラー扱いにしない
- `salon_code` は当面固定 "kirei-tsurumi"。将来は line_customer_links からサロンを引く
