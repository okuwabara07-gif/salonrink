'use client';

import React, { useState } from 'react';
import styles from './page.module.css';

/* ============================================================
   /dashboard/account — アカウント設定ページ
   ============================================================ */

export default function AccountPage() {
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    alert('保存しました');
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.head}>
        <div className={styles.headIcon}>👤</div>
        <div>
          <h1 className={styles.headTitle}>アカウント</h1>
          <p className={styles.headSub}>プロフィール・店舗情報・パスワード</p>
        </div>
      </div>

      <div className={styles.grid}>
        {/* Profile */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>プロフィール</h2>
          <div className={styles.avatarRow}>
            <div className={styles.avatarLarge}>キ</div>
            <button type="button" className={styles.btnSmall}>アバターを変更</button>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>オーナー名</label>
            <input type="text" defaultValue="テスト太郎" className={styles.input} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>メールアドレス</label>
            <input type="email" defaultValue="test@example.com" className={styles.input} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>電話番号</label>
            <input type="tel" placeholder="例: 090-0000-0000" className={styles.input} />
          </div>
        </section>

        {/* Salon info */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>店舗情報</h2>
          <div className={styles.field}>
            <label className={styles.label}>店舗名</label>
            <input type="text" defaultValue="キレイ 鶴見店" className={styles.input} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>住所</label>
            <input type="text" placeholder="例: 神奈川県横浜市鶴見区..." className={styles.input} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>店舗電話</label>
            <input type="tel" placeholder="例: 045-000-0000" className={styles.input} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>ウェブサイト</label>
            <input type="url" placeholder="例: https://kirei-tsurumi.com" className={styles.input} />
          </div>
        </section>

        {/* Password */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>パスワード変更</h2>
          <div className={styles.field}>
            <label className={styles.label}>現在のパスワード</label>
            <input type="password" className={styles.input} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>新しいパスワード</label>
            <input type="password" className={styles.input} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>新しいパスワード(確認)</label>
            <input type="password" className={styles.input} />
          </div>
          <button type="button" className={styles.btnSecondary}>
            パスワードを変更
          </button>
        </section>

        {/* Security */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>セキュリティ</h2>
          <div className={styles.securityList}>
            <div className={styles.securityRow}>
              <div className={styles.securityMain}>
                <div className={styles.securityLabel}>2段階認証</div>
                <div className={styles.securitySub}>SMS or 認証アプリでの追加確認</div>
              </div>
              <button type="button" className={styles.btnSmall}>有効化</button>
            </div>
            <div className={styles.securityRow}>
              <div className={styles.securityMain}>
                <div className={styles.securityLabel}>セッション管理</div>
                <div className={styles.securitySub}>現在ログイン中のデバイス: 1台</div>
              </div>
              <button type="button" className={styles.btnSmall}>表示</button>
            </div>
            <div className={styles.securityRow}>
              <div className={styles.securityMain}>
                <div className={styles.securityLabel}>データ保護</div>
                <div className={styles.securitySub} style={{ color: '#7a8a5c' }}>AES-256 暗号化 有効</div>
              </div>
              <span className={styles.statusOk}>有効</span>
            </div>
          </div>
        </section>
      </div>

      {/* Save bar */}
      <div className={styles.saveBar}>
        <button type="button" className={styles.btnGhost}>キャンセル</button>
        <button type="button" onClick={handleSave} disabled={saving} className={styles.btnPrimary}>
          {saving ? '保存中...' : '変更を保存'}
        </button>
      </div>

      {/* Danger zone */}
      <section className={`${styles.card} ${styles.dangerCard}`}>
        <h2 className={styles.dangerTitle}>危険ゾーン</h2>
        <div className={styles.dangerList}>
          <div className={styles.dangerRow}>
            <div>
              <div className={styles.dangerLabel}>データのエクスポート</div>
              <div className={styles.dangerSub}>顧客・予約データを CSV / JSON で全件ダウンロード</div>
            </div>
            <button type="button" className={styles.btnSecondary}>エクスポート</button>
          </div>
          <div className={styles.dangerRow}>
            <div>
              <div className={styles.dangerLabel}>アカウント削除</div>
              <div className={styles.dangerSub}>すべてのデータが完全に削除されます(復元不可)</div>
            </div>
            <button type="button" className={styles.btnDanger}>削除リクエスト</button>
          </div>
        </div>
      </section>
    </div>
  );
}
