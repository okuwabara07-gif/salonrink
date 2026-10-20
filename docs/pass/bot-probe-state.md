# Bot Probe State - SALON BOARD 会計データ検証
**Date:** 2026-10-07（最終更新）／調査開始 2026-09-29  
**Status:** 工程1〜6 完了。報告 A〜G は `docs/pass/bot-probe-report.md`。関門3（10/1 17:00 同期）は DB 側で正常完了を確認済み。指示待ち（未確認事項の追加調査の可否、スナップショット削除）

> 以下「Bot情報」〜「次にやること」は 9/29 時点の記録。最新の経過は末尾のセッション記録を参照。

---

## Bot情報

| 項目 | 値 |
|---|---|
| **プロセス名** | salonrink-sync |
| **cwd** | /root/salonrink-sync-bot |
| **起動コマンド** | xvfb-run -a node -r dotenv/config dist/server.js |
| **実行方式** | headful + xvfb ✓ |
| **同期間隔** | Cron: `*/30 * * * *` (毎時00分・30分) |
| **所要時間** | 約4分（14:03:56〜14:03:54 の実績） |
| **ステータス** | online、稼働 6h、再起動 132 回（過去ログ・現在は安定） |
| **最終同期** | 2026-09-29 14:33:49 JST ✓ |

---

## 工程1：状態確認 ✓

### システム状態
- **uptime:** 153 days
- **メモリ:** 960MB（利用 452MB、available 507MB）
- **ディスク:** 99GB（利用 12GB、13%）
- **リソース判定:** sb-probe 実行に問題なし

### pm2 状態
```
id: 0
name: salonrink-sync
status: online
uptime: 6h
restarts: 132
pid: 1449894
```

### bot ログ
- 最新ログ（9月29日 14:33）: **SUCCESS** ✓
- 直近エラー: 古い（6月）。再起動原因は OOM ではない
- 再起動頻度: 安定中（直近は正常同期のみ）

---

## 工程2：コード照合

### SHA256 比較結果

| ファイル | ローカル | VPS | 一致 |
|---|---|---|---|
| crypto.ts | 02e1... | 02e1... | ✓ |
| index.ts | cde36... | f791d... | ❌ |
| notify.ts | b9006... | b9006... | ✓ |
| scraper.ts | 56f0e... | c71dc... | ❌ |
| server.ts | 3f988... | 5227... | ❌ |
| supabase.ts | cda62... | cda62... | ✓ |

**不一致ファイル:** index.ts, scraper.ts, server.ts  
**判定:** VPS 側が正とする（本番版）

### 同期タイミング
- Cron: `*/30 * * * *`
- 最終同期: 14:33:49 JST
- 次回同期: 15:00 / 15:30 JST

---

## 追加確認：再起動原因と リソース（手順1 完了）

### 再起動原因
```
dmesg -T | grep -iE "oom|killed process" → なし
```
✓ **OOM 原因ではない**

### メモリ状態（free -m）
```
Mem:   960MB (利用: 452MB, 利用可能: 507MB)
Swap:  2GB   (利用: 148MB, 利用可能: 1899MB)
```
✓ **利用可能 507MB ≥ 400MB** ✓

### スワップ状態（swapon --show）
```
/var/spool/swap/swapfile file   2G 148.2M   -2
```
✓ **スワップあり** ✓

### Chrome 常駐
```
Xvfb :100 (メモリ: 15.6MB)
```
✓ Chrome は同期ごとに起動・終了（常駐なし）

**関門判定:** 
- available: 507 MB ≥ 400 MB ✓
- swap: あり ✓
- **結論: 工程3 実行可能 ✓**

---

## 禁止事項（工程3実行時）

### 絶対禁止
- [ ] pm2 stop / restart / delete / reload
- [ ] systemctl の stop / restart
- [ ] 既存bot ディレクトリの編集・git操作
- [ ] パッケージのインストール・更新
- [ ] .env の中身表示：`cat`, `grep`, `head`, `tail`, `less`, `pm2 env`, `printenv`, `env` 禁止
  - **例外のみ:** キー名だけが必要な場合は `ssh conoha-bot "sed 's/=.*//' /root/salonrink-sync-bot/.env"` のみ使用可
- [ ] 秘密値の出力
- [ ] SALON BOARD上で状態が変わる操作（会計確定・予約登録/変更/取消・顧客編集）
- [ ] ヘッドレス実行（headful + xvfb 必須）

### 実行してよい操作
- [ ] HTML/スクリーンショット取得
- [ ] DOM の読み取り
- [ ] 画面遷移・日付切替・検索

---

## 関門

### 関門1：botのオンライン状態確認 ✓
- ✓ bot がonline
- ✓ 直近ログにエラーの連続なし
- ✓ headful + xvfb で稼働

### 関門2：コード照合 ✓（VPS側が正）
- ✓ SHA256 比較完了
- ✓ 不一致ファイル: index.ts, scraper.ts, server.ts
- ✓ VPS 側コードを正とする

### 追加関門：リソース確認 ✓
- ✓ OOM キルなし
- ✓ 利用可能メモリ 507MB > 400MB
- ✓ sb-probe 実行条件満たす

---

## 次にやること

### 工程3：調査用スクリプト作成・実行

**実行ウィンドウ:**
- **開始:** 15:04 JST（15:00 同期完了確認後）
- **終了:** 15:20 JST
- **後ろ側ウィンドウ:** 15:34〜15:50（15:30 同期完了後）

**手順:**
1. VPS上 `~/sb-probe/` を作成
2. 既存bot のログイン処理をコピー
3. xvfb-run で headful 起動（Chrome 1タブのみ、画像読み込み無効化）
4. 前日分の画面保存：会計(売上)一覧 / 会計詳細2〜3件 / 予約詳細2〜3件 / 顧客詳細1件 / スケジュール1日分
5. HTML+スクリーンショット → `~/sb-probe/snapshots/` に保存（chmod 600）
6. 調査完了後、ブラウザを確実に閉じる
7. 15:30 同期が正常完了したことをログで確認

**関門3（調査中）:**
- セッション切れなし
- 既存bot の同期失敗なし

**関門3（調査後）:**
- 15:30 同期が正常完了したことを確認

---

## 工程4：特定と検証

**5項目の抽出:**
1. 顧客番号
2. 会計済み／取消フラグ
3. 会計額（税込）
4. 明細の区分（施術／店販／交換）と各金額
5. 予約受付日時

**確認項目:**
- 画面 URL とセレクタ
- セレクタの安定性（id・固定クラス vs 位置依存）
- ページ送りの有無
- 予約と会計の紐付け方法
- 前日会計額合計が SALON BOARD 日計と一致するか

---

## 禁止：代替手段の実装

> 取得できない項目があっても代替手段は実装しない。特に「スタッフの手入力で補う」方式は不可。報告で止める。

---

## マスクルール

| 項目 | ルール |
|---|---|
| 氏名 | 姓の1文字目のみ（例：田＊＊） |
| 電話番号 | 下4桁以外を＊（例：090-\*\*\*\*-1234） |
| 顧客番号 | 末尾3桁以外を＊（例：\*\*\*\*123） |

---

## 工程3 実行状況

### セッション1（2026-09-29 15:15 JST）
- ✓ 15:00 同期完了確認（15:04:19）
- ✓ sb-probe ディレクトリ作成（~/sb-probe/snapshots）
- ✓ probe.js 作成（初版）
- ✓ メモリ確認（available 527 MB — 安全）
- ✗ 実行失敗（.env 形式エラー：HPB_LOGIN_ID="..." 形式ではなく HPB_LOGIN_ID_ENC="..." 暗号化形式）

### セッション2（2026-09-29 15:18 JST）
- ✓ メモリ確認（available 537 MB — 安全）
- ✓ probe.js 修正：crypto.decrypt を実装、環境変数から暗号化された認証情報を復号
- ⏳ 15:30 同期完了を待機中（現在 15:18:38）
- 予定：15:34 以降に probe.js を実行（NODE_PATH 設定、xvfb-run headful）

### セッション3（2026-09-29 15:23 JST 再開確認）
- ✓ probe.js 修正内容確認：crypto.decrypt で HPB_LOGIN_ID_ENC/HPB_PASSWORD_ENC を復号
- ✓ 既存bot セッション：15:04:19 最新、エラーなし
- ✓ 既存bot 同期：15:00 成功、セッション切れなし
- ⏳ 15:30 同期：実行前（現在 15:23:45、15:30時点で確認予定）
- ✓ メモリ：available 539 MB（安全）
- 次：15:34 以降に probe.js 実行、工程4・5進行

### セッション4（2026-09-29 15:24 JST — コンテキスト 98% 逼迫）
- ✓ probe.js コード確認：秘密値（loginId, password）が console.log で出力されていない ✓
- ⏳ 15:30 同期ログ確認予定（現在 15:24:54 JST）
- **次セッション（セッション5）で実行予定：**
  1. 15:30 同期完了確認
  2. probe.js を実行（NODE_PATH 設定、xvfb-run headful）
  3. スナップショット取得（会計、売上、予約、顧客、スケジュール）
  4. 工程4・5（画面 URL・セレクタ特定、5項目抽出、日計照合）
  5. 16:00 同期完了確認
  6. 報告フォーマット A～I で報告

### 関門3（現在）
- ✓ 既存bot の 15:00 同期成功
- ✓ セッション切れなし
- ✓ メモリ安全（539 MB > 150 MB）
- ⏳ 15:30 同期実行待機中（コンテキスト逼迫、次セッションで確認・実行）

### セッション5（2026-09-29 15:45 JST — コンテキスト 80% 逼迫）

#### 確認事項
- ✓ 15:30 同期完了：15:34:00 に status updated（160 reservations）
- ✓ メモリ：available 513 MB（安全）
- ✓ probe.js コード：秘密値ログなし ✓

#### probe.js 実行エラー
- `.env` ファイル形式エラー：HPB_LOGIN_ID_ENC キーが見つからない
- 既存 bot は `.env` からではなく、**Supabase から credentials を取得**している
  - `getAllSalonCredentials()` → salon.hpb_login_id_enc, salon.hpb_password_enc
  - これらは DB に暗号化形式で保存

#### 次セッション（セッション6）のアクション
1. probe.js を修正：Supabase から credentials 取得ロジック追加
   - SUPABASE_URL, SUPABASE_SERVICE_KEY を環境変数から取得
   - `getAllSalonCredentials()` で hpb_login_id_enc/hpb_password_enc を取得
   - crypto.decrypt で復号
2. 15:50 ウィンドウ内（または次の 16:04〜16:20 ウィンドウ）で実行
3. スナップショット取得：会計、売上、予約、顧客、スケジュール
4. 工程4・5：URL・セレクタ特定、5項目抽出、日計照合
5. 16:30 同期完了確認
6. 報告フォーマット A～I

---

### セッション6（2026-09-30 14:41 JST）

#### 確認事項
- ✓ 14:30 同期完了：14:34:16（162 reservations）
- ✓ メモリ：available 494〜516 MB（安全）
- ✓ Bot status：online、正常稼働

#### probe.js 修正完了
- ✓ Supabase credentials 取得ロジック実装
  - `getAllSalonCredentials()` で DB から取得
  - `crypto.decrypt()` で復号（既存botモジュール流用）
  - 環境変数は dotenv で読み込み、秘密値は出力なし
- ✓ Playwright headful + xvfb 設定
- ✓ スナップショット保存先：~/sb-probe/snapshots/

#### probe.js 秘密値ログ検査 ✓
- ❌ loginId / password は console.log/writeFile で出力されない
- ✅ [PROBE] で始まる安全なメッセージのみ

#### probe.js 実行開始
- **開始時刻：** 2026-09-30 14:41 JST
- **実行ウィンドウ：** 14:44〜15:00（次の同期 15:00 直前）
- **バックグラウンド実行開始**（PID 33117）
- **次アクション：** probe.js 完了待機→スナップショット確認→工程4・5実行

### セッション7（2026-10-01 回収）
- /tmp/probe_monitor.log：14:57:59 開始 → `ERROR: 15:00 sync did not complete within 5 minutes` で probe 未起動（15:04〜15:20 窓は未実行）
- ~/sb-probe/probe.log：認証情報の取得・復号・ブラウザ起動までは成功。`page.goto: net::ERR_NAME_NOT_RESOLVED at https://salon-board.com/login` で失敗（ログイン前）
- ~/sb-probe/snapshots/：空（0件）
- 工程6・報告A〜G：未実施（スナップショットなし）
- 要報告：probe.log 冒頭に `[Supabase Init] KEY length / starts with: sb_secret_ / first 5 char codes` が出力されている（既存 dist/supabase.js 由来の可能性、未確認）
- 原因調査・再実行はしていない。指示待ち：15:00 同期の状況確認可否、probe.js の URL 修正、再実行の窓、キー情報ログの扱い

### セッション8（2026-10-01 11:44〜12:20）
- 既存botの URL：`https://salonboard.com/`、`https://salonboard.com/login/`（dist から grep）。スケジュール `/CLP/bt/schedule/salonSchedule/?date=YYYYMMDD`、予約詳細 `/CLP/bt/reserve/net/reserveDetail/?reserveId=`
- `[Supabase Init]` の出力元：/root/salonrink-sync-bot/dist/supabase.js 16〜18行目（bot は未修正）
- probe.js 書き換え（旧版は probe.js.v1）：ログインは dist/scraper.js の ensureLoggedIn と同じ手順・セレクタ、bot の .profiles は不使用。supabase.js の require 中だけ console.log を止める。前日スケジュール→予約詳細最大3→顧客詳細1→メニュー（売上/会計/レジ/顧客の文字）最大5。状態変更系の文言・URL は除外。PROBE_DEADLINE（既定 12:20）超過で終了。node --check OK
- 12:00 同期：`2026-10-01 12:04:08: ✓ Sync status updated`（正常）。ログの実体は salonrink-sync-out-0.log（salonrink-sync-out.log には書かれていない）
- 待機スクリプトが salonrink-sync-out.log を見ていたため完了を検知できず、12:04〜12:20 の窓を逃した。probe は未実行
- 次：指示された窓で、salonrink-sync-out-0.log の `✓ Sync status updated` を確認してから実行（PROBE_DEADLINE をその窓の終了時刻に設定）

### セッション9（2026-10-01 12:24〜13:15）
- run 2（12:34:15〜12:35:25）：素の playwright chromium・新規コンテキストで `page.goto: Timeout 60000ms exceeded`（ログイン画面）。保存なし
- 既存botとの差分：bot は playwright-extra + puppeteer-extra-plugin-stealth、launchPersistentContext(.profiles/1deea32a-…)、userAgent Mac Chrome120、viewport 1280x800、args 3つ（画像無効化なし）
- probe.js を bot と同じ起動に変更。プロファイルは同期完了直後に ~/sb-probe/profile へ cp -r（700）。goto は domcontentloaded / 120000、タイムアウト時は timeout_<label> を保存
- run 3（13:04:14〜13:04:45）：ログイン成功（/CLP/bt/top/）。保存：00_top、10_schedule_yesterday。予約詳細・顧客・メニューのリンク抽出は0件（抽出条件の問題とみられる、未調査）
- ナビ：売上管理 /CLP/bt/sales/salesTop/（会計候補）、振込・請求 /CLP/bt/adjust/pointResult/、onlinepay、お客様管理 /CLP/bt/customer/customerSearch/、本日の予約一覧 /CLS/hair/reservations/search/date/ ほか。新着予約・キャンセル一覧は既読化のおそれがあり開かない
- 関門：13:00 同期 13:04:09 正常（probe 前）。probe 後の 13:30 同期は未確認
- 次：指示待ち（売上管理を開くか、リンク抽出0件の原因調査の可否）

### セッション10（2026-10-01 13:15〜14:30）
- 予約IDの取り方：bot は div.panel_reserve の span.panel_reserve_id、無ければ要素 id `reserve_item_<ID>`。前日スケジュールに12件（id 形式、例 YH186*****）
- probe-sales.js 作成（ログインは probe.js と同じ。売上管理トップを開いて保存＋フォーム・ボタン・リンクを 50_sales_top_struct.json に書き出し）。run.sh は SCRIPT 環境変数で実行スクリプトを切替
- run 4：13:30 同期完了（13:34:05）後に実行し完了。保存：50_sales_top.html/png/struct.json（forms=1, clickables=42）
- 手元〜VPS の SSH が2本とも切断（Connection reset / not responding）。窓内に後半を実行できず。原因未調査
- 関門3：13:30（13:34:05）・14:00（14:04:16）同期とも正常。pm2 online、再起動回数 145（9/29 時点 132）、uptime 6h（probe 前の再起動、未調査）
- 次：指示待ち（struct を読んで日付切替と詳細リンクを特定 → 次の窓で後半。後半は nohup で VPS 上だけで実行する案）

### セッション11（2026-10-01 14:30〜15:00）
- 売上管理TOP のサブメニュー：売上報告 /CLP/bt/sales/salesReport/、売上明細 /CLP/bt/sales/salesDetailSearch/、レジ締め・レジ締め一覧・入出金（開かない）、日報出力 aggregateDaily?scopeDateFrom=（出力のため開かない）
- run 5（setsid nohup、14:30 同期 14:34:21 完了後、14:47:00〜14:47:30）：売上明細を保存（60_sales_detail_search）。日付欄 0件・検索 false（表示欄に日付値なし、ボタン文言は「検索する」）。一覧行・詳細リンクなし
- 売上明細の検索フォーム：POST /CLP/bt/sales/salesDetailSearch/。salesSearchKbn（rsvDate / salesCloseDate）、dispDateFrom/To、hidden searchDateFrom/To（YYYYMMDD）、stylistId・salesRoleKbn・rsvTypeCd・salesItemKbn・salesItemCategoryCd・salesItemId。ボタン：昨日 #yesterdaySet、検索する #search（押さない：CSV出力 #csvOutput、印刷 #print、条件をクリア）
- 待機コマンドが pgrep で自分自身に一致して終わらなかった（TaskStop で停止）。probe 自体は正常終了、プロセス残存なし
- 次：指示待ち（#yesterdaySet → #search で前日一覧を保存、行の詳細リンクがあれば会計詳細2〜3件→予約詳細→顧客詳細。salesSearchKbn を rsvDate にするかの確認、実行する窓）

### セッション12（2026-10-01 15:00〜15:10）
- run 6（15:00 同期 15:04:14 完了確認後、setsid、15:04:16〜15:04:46）：probe-c.js
- ラジオ：#rsvDate value=1「来店日」（既定で選択）、#salesCloseDate value=2「レジ締め日」。来店日を選択
- 昨日→検索：範囲 20260930-20260930。保存：70_sales_search_before、71_sales_list_yesterday（tr 34）
- 詳細トリガー 0件（行にリンク・onclick なし。表 class に linkLine。JS で後付けの可能性）→ 一覧保存で停止
- 一覧の列：お客様名＋会計日時 / 区分 / カテゴリ / メニュー・店販 / 担当スタイリスト / 施術担当者 / 単価 / 個数 / 金額。合計個数・合計金額の表あり。顧客番号・予約ID・会計状態の列なし
- 【A2 報告】一覧の解析出力でマスクが効かず、顧客氏名3名分がセッションのツール出力に表示された（「様」なしのため）。ファイル・リポジトリには未記載。以後の解析は氏名列を出さない方式に変更が必要
- 次：指示待ち（解析継続の可否と方式、行クリックを1件試すかどうか）。15:30 同期の確認は未了

### セッション13（2026-10-01 15:07〜）
- probe-d.js 作成・配置（一覧の1行クリック → 新タブ/遷移なら保存、モーダルならスクショのみ保存して Esc／閉じる×、ネイティブダイアログは dismiss。前日スケジュールで同氏名の予約ID → 予約詳細1〜2 → 顧客詳細1）。未実行
- 前日一覧の解析：12行×9列、区分はすべて「技術」（店販なし）、明細金額合計 34,280 ＝ 画面の合計金額 34,280、会計12件、行 class="mod_middle"（リンク・onclick なし）
- 【A2 報告 2回目】解析出力の「画面の合計」の抜き出しが明細行を拾い、顧客氏名1名分がツール出力に表示された。以後、VPS からの出力は数値・定型値・姓1文字マスク済みの値に限定
- 次：指示待ち（15:34〜15:50 で probe-d.js 実行の可否、店販ありの日を探すか）
- 15:30 同期：15:34:01 正常（run 6 後の関門3 OK）

### セッション14（2026-10-01 16:20〜）run 7
- 16:30 同期 16:34:06 完了確認後、setsid で 16:34:08〜16:34:59。保存：80_sales_row_noop、81_reserve_detail_1、83_sales_list_7days
- 売上明細の行クリック：遷移・モーダルなし（会計詳細画面は無い）
- 区分の選択肢 salesItemKbn：1:技術 / 2:店販 / 3:その他。過去7日（20260924-20260930）は技術=79、店販なし
- dispDateFrom の形式：9999年9月99日（曜）
- 予約詳細（/CLP/bt/reserve/net/reserveDetail/?reserveId=）に会計欄あり：会計日時、レジ担当者、ステータス=会計済み、支払い種別、合計金額、来店処理金額、お支払金額。「会計情報を修正する」/CLP/bt/sales/salesModify/?reserveId=（押さない）
- お客様番号の欄あり（今回の客は「-」、hidden customerId も空）。予約受付日時の欄は見当たらず
- 顧客詳細：予約詳細からのリンクは customerSearch のみで未保存
- 9/30 の明細金額合計 34,280 ＝ 一覧の合計金額 34,280
- 工程6・報告A〜G 提出済み。17:00 同期の確認待ち

### セッション15（2026-10-07）報告 A〜G 再作成
- 関門3：10/1 17:00 同期は DB 側で正常完了を確認済み（指示者確認）。確認待ちは解消
- VPS 上の ~/sb-probe/snapshots/ の HTML を読み取りのみで解析（probe 実行なし、SALON BOARD へのアクセスなし、VPS への書き込みなし。解析スクリプトは標準入力で渡し VPS に保存していない）。bot の dist/scraper.js は読み取りのみ
- 出力は数値・定型値・URLパターン・セレクタ・姓1文字に限定。氏名の表示なし
- 報告 A〜G を docs/pass/bot-probe-report.md に保存
- 新たに分かったこと：
  - 売上管理TOP `table#summaryTable td#sd_YYYYMMDD` に日別の金額・人数。9/24〜9/30 の6営業日、売上明細の合計・件数と全日一致
  - 予約詳細の合計に「(内消費税： …円)」の表記あり（税込）。hidden に salesId・customerNo・customerId
  - 予約詳細に明細行（tr.reserveSales）あり。区分の列はなし
  - 売上明細にページ送りあり（div.paging、7日分79行で 1/1ページ）
  - 同じ分に別の氏名が会計されている例が6営業日で4組（会計日時だけでは一意でない）
  - スケジュールの span.panel_reserve_update は最終更新日時とみられ、予約受付日時ではない
  - 既存 bot は全予約の予約詳細をすでに開いている（メニュー名のみ取得）
- 未了：スナップショットの削除（指示書の期限は取得から7日＝10/8）。未確認事項は報告末尾の7点

## セッション16（10/13）YH 予約の layout mismatch 調査

- 16:34 同期完了後の窓で probe-e.js（run 8）と probe-f.js（run 9）を各1回実行。読み取りのみ。開いた予約詳細は YH 1件（同じ予約を net URL と ext URL で1回ずつ）
- 原因：bot は全予約を `/CLP/bt/reserve/net/reserveDetail/` で開く。YH は SALON BOARD のエラー画面（BPCL010V01）になる。正しい URL は `/CLP/bt/reserve/ext/extReserveDetail/?reserveId=`（SALON BOARD の BPCL004V01.js は予約番号の先頭が B なら net、それ以外は ext）
- ext 画面には「合計金額」「来店処理金額」の th が無い。会計額は `div.mod_box_01` の「現計」。ステータス・salesId・salesDate・明細・電話番号は net と同じセレクタ
- 保存：snapshots/90_schedule_yh、91_yh_net_detail（エラー画面）、92_yh_ext_detail（各 html/png）
- `dist.bak-202610071620` は削除済み
- 修正は未着手（Yes 待ち）

## セッション17（10/13 夕〜10/14）YH 対応を dev で修正・検証

- 方針承認済み：先頭 B → net URL、それ以外 → ext URL。YH の paid_amount は書かない
- dev（/root/salonrink-sync-bot-dev）のみ変更：src/pass.ts（reserveDetailUrl 追加、isExtForm 追加、ext は合計金額 th 無しでも読む）、src/scraper.ts（URL を reserveDetailUrl に）。ビルド済み。変更前の2ファイルは ~/sb-probe/*.pre-yh
- 10/13 17:35 probe-g.js（run 10）で YH を2件追加保存（93 会計済み、94 未会計）。読み取りのみ
- 10/14 10:34 オフライン検証 pass-verify-yh.js：unit 12/12、YH 3件 layout=ok、BF は従来どおり、エラー画面は mismatch。従来の pass-verify.js も PASS
- 本番（dist・src）は未変更。dist.bak・配置は Yes 待ち

## セッション18（10/20）YH対応 2026-10-20 本番反映（ext URL切替、53/53取得）

- 12:13 本番 /root/salonrink-sync-bot に反映：dist → dist.bak、src → src.bak に退避、dev の src を同期して build、pm2 restart
- 反映前（12:00 同期）：parsed=131 layout_mismatch=53（すべて YH）
- 反映後 12:30 同期：parsed=184 checked_out=6 layout_mismatch=0
- 反映後 13:00 同期：parsed=184 checked_out=7 layout_mismatch=0。DB で YH 53/53 件に sb_status あり、うち checked_out 4
- dist.bak（今回）と dev（/root/salonrink-sync-bot-dev）は残す。戻すときは dist.bak を dist に戻して pm2 restart
