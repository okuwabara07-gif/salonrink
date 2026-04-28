# VPS スクレイパー API セットアップガイド

## 概要

SalonRink ダッシュボール（Vercel）から VPS へ POST リクエストを受け取り、HPB スクレイピングを実行するための Flask/FastAPI エンドポイントをセットアップします。

```
ダッシュボード (Vercel)
    ↓ POST /api/hpb/sync
API (Vercel)
    ↓ POST http://160.251.213.197/sync
VPS (ConoHa Tokyo)
    ↓ 既存スクレイパーロジック実行
HPB データ取得 & DB 保存
```

---

## 環境

- **VPS**: ConoHa Tokyo (160.251.213.197)
- **OS**: Linux (推定 Ubuntu/CentOS)
- **既存**: Docker + Playwright + Stealth スクレイパー

---

## セットアップ手順

### 1. Flask アプリケーション作成

VPS上で以下のファイルを作成：

```bash
mkdir -p /app/salonrink-sync
cd /app/salonrink-sync
```

**`app.py`** を作成：

```python
#!/usr/bin/env python3
from flask import Flask, request, jsonify
import json
import os
import sys
import logging
from datetime import datetime

# 既存のスクレイパーモジュールをインポート
# from scraper import run_scraper  # 既存スクレイパーの関数

app = Flask(__name__)

# ログ設定
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/var/log/salonrink-sync.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

@app.route('/health', methods=['GET'])
def health():
    """ヘルスチェック"""
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()}), 200

@app.route('/sync', methods=['POST'])
def sync():
    """HPB スクレイピング同期エンドポイント"""
    try:
        # リクエストボディから salon_id を取得
        data = request.get_json()
        
        if not data or 'salon_id' not in data:
            logger.error('Missing salon_id in request')
            return jsonify({'error': 'Missing salon_id'}), 400
        
        salon_id = data['salon_id']
        
        logger.info(f'Sync request received for salon_id: {salon_id}')
        
        # 既存のスクレイパーロジックを実行
        # run_scraper(salon_id)
        
        # TODO: 実装手順
        # 1. Supabase から salon_hpb_credentials テーブルを読み取る
        # 2. hpb_login_id, hpb_password を復号化
        # 3. Playwright で HPB にログイン
        # 4. 予約データを取得
        # 5. reservations テーブルに保存/更新
        
        logger.info(f'Sync completed for salon_id: {salon_id}')
        
        return jsonify({
            'success': True,
            'salon_id': salon_id,
            'message': 'Scraping completed',
            'timestamp': datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f'Sync error: {str(e)}', exc_info=True)
        return jsonify({
            'error': 'Scraping failed',
            'details': str(e)
        }), 500

if __name__ == '__main__':
    # ポート 80 でリッスン（管理者権限が必要）
    # または環境変数で設定可能
    port = int(os.getenv('PORT', 80))
    app.run(host='0.0.0.0', port=port, debug=False)
```

### 2. 依存パッケージのインストール

```bash
pip install flask
# または
pip install fastapi uvicorn
```

**`requirements.txt`** を作成：

```
Flask==2.3.3
requests==2.31.0
python-dotenv==1.0.0
supabase==1.0.3
# 既存の依存パッケージを追加
# playwright==1.40.0
# asyncio==...
```

インストール：

```bash
pip install -r requirements.txt
```

### 3. Dockerfile でコンテナ化（推奨）

既存の Docker セットアップがあればそこに統合：

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY app.py .
COPY scraper/ ./scraper/

EXPOSE 80

CMD ["python", "app.py"]
```

ビルド & 実行：

```bash
docker build -t salonrink-sync .
docker run -d -p 80:80 --name salonrink-sync salonrink-sync
```

### 4. systemd サービス化（非Docker の場合）

**/etc/systemd/system/salonrink-sync.service** を作成：

```ini
[Unit]
Description=SalonRink HPB Sync Service
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/app/salonrink-sync
ExecStart=/usr/bin/python3 /app/salonrink-sync/app.py
Restart=on-failure
RestartSec=10

StandardOutput=append:/var/log/salonrink-sync.log
StandardError=append:/var/log/salonrink-sync.log

[Install]
WantedBy=multi-user.target
```

起動：

```bash
sudo systemctl daemon-reload
sudo systemctl enable salonrink-sync
sudo systemctl start salonrink-sync
sudo systemctl status salonrink-sync
```

### 5. Nginx リバースプロキシ（推奨）

Flask を直接ポート 80 で実行するのは本番環境では非推奨。Nginx 経由にする場合：

**/etc/nginx/sites-available/salonrink-sync** を作成：

```nginx
server {
    listen 80;
    server_name 160.251.213.197;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }
}
```

有効化：

```bash
sudo ln -s /etc/nginx/sites-available/salonrink-sync /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

Flask をポート 5000 で実行：

```bash
python app.py  # PORT=5000 python app.py
```

---

## テスト

### ローカルテスト（VPS上）

```bash
curl -X POST http://localhost/health
# 応答: {"status":"healthy","timestamp":"..."}

curl -X POST http://localhost/sync \
  -H "Content-Type: application/json" \
  -d '{"salon_id":"test-salon-123"}'
# 応答: {"success":true,"salon_id":"test-salon-123",...}
```

### リモートテスト（ダッシュボードから）

1. ダッシュボード: https://salonrink.com/dashboard/integrations/hpb-setup
   - HPB ID/パスワード入力 & 保存

2. ダッシュボード: https://salonrink.com/dashboard/integrations/hotpepper
   - 「手動同期」ボタンをクリック

3. 期待される結果：
   - ✅ 成功: "同期を開始しました。完了までお待ちください..."
   - ❌ 失敗: "同期エラー: ..." → VPS ログを確認

### VPS ログ確認

```bash
tail -f /var/log/salonrink-sync.log
# または
docker logs -f salonrink-sync
```

---

## 実装チェックリスト

### 最小実装（MVP）

- [x] Flask アプリケーション基本構造
- [x] `/sync` エンドポイント
- [ ] Supabase から認証情報取得
- [ ] 認証情報を復号化
- [ ] Playwright で HPB ログイン
- [ ] 予約データ取得
- [ ] `reservations` テーブルに保存
- [ ] エラーハンドリング
- [ ] ログ記録

### 本番環境化

- [ ] Nginx リバースプロキシ設定
- [ ] SSL/TLS 証明書（Let's Encrypt）
- [ ] systemd サービス化
- [ ] ログローテーション設定
- [ ] モニタリング（健全性チェック）
- [ ] リトライロジック
- [ ] タイムアウト管理

---

## トラブルシューティング

| 症状 | 原因 | 対応 |
|---|---|---|
| `Connection refused` | サービス未起動 | `systemctl start salonrink-sync` |
| `Port 80 already in use` | ポート競合 | `lsof -i :80` で確認、または別ポート使用 |
| `403 Forbidden` | 権限不足 | `sudo` で実行、または `sudo chown www-data:www-data /app` |
| `Timeout` | スクレイピング時間が長い | タイムアウト値を増やす（API側: 30s, Nginx側: proxy_read_timeout） |
| `HPB ログイン失敗` | 認証情報誤り | Supabase の復号化ロジック確認 |

---

## セキュリティ考慮事項

1. **ネットワーク**: VPS をセキュリティグループ/ファイアウォールで保護
   - Vercel IP からのみアクセス許可（可能であれば）
   - または VPN 経由

2. **認証**: リクエストの署名検証を追加（オプション）
   ```python
   import hmac
   import hashlib
   
   SHARED_SECRET = os.getenv('SYNC_SECRET', 'default-secret')
   
   @app.route('/sync', methods=['POST'])
   def sync():
       signature = request.headers.get('X-Sync-Signature')
       body = request.get_data()
       expected_signature = hmac.new(
           SHARED_SECRET.encode(),
           body,
           hashlib.sha256
       ).hexdigest()
       if not hmac.compare_digest(signature, expected_signature):
           return {'error': 'Invalid signature'}, 403
   ```

3. **認証情報**: VPS での復号化時に環境変数を使用
   ```python
   ENCRYPTION_KEY = os.getenv('ENCRYPTION_KEY')
   ```

4. **ログ**: 認証情報をログに出力しない
   ```python
   logger.info(f'Processing salon {salon_id}')  # OK
   logger.info(f'Password: {password}')  # NG
   ```

---

## 次のステップ

1. ✅ API 側実装完了（Vercel `/api/hpb/sync`）
2. ⏳ VPS 側エンドポイント実装（このドキュメント）
3. ⏳ ダッシュボール UI テスト
4. ⏳ 本番運用

---

**作成者**: Claude Code  
**作成日**: 2026-04-28  
**ステータス**: セットアップガイド（VPS側実装は別途）
