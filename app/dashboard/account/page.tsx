'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import styles from './page.module.css';

/* ============================================================
   /dashboard/account — アカウント設定ページ v2
   - salons テーブルと連携
   - プロフィール / 店舗情報 / アバター / Export / Delete
   ============================================================ */

interface SalonRow {
  id: string;
  name: string | null;
  owner_name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  website: string | null;
}

export default function AccountPage() {
  // === Form fields ===
  const [salonId, setSalonId] = useState<string | null>(null);
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [salonName, setSalonName] = useState('');
  const [address, setAddress] = useState('');
  const [website, setWebsite] = useState('');

  // === UI state ===
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // === Avatar ===
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // === Export ===
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');

  // === Delete ===
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isSubmittingDelete, setIsSubmittingDelete] = useState(false);

  // Load salon data
  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoadError('ログインが必要です');
        setLoading(false);
        return;
      }

      // avatar
      if (user.user_metadata?.avatar_url) {
        setAvatarUrl(user.user_metadata.avatar_url as string);
      }

      // salon
      const { data: salon, error } = await supabase
        .from('salons')
        .select('id, name, owner_name, phone, email, address, website')
        .eq('owner_user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('salon load:', error);
        setLoadError(`サロンデータ取得失敗: ${error.message}`);
      } else if (!salon) {
        setLoadError('このアカウントに紐付くサロンレコードがありません');
      } else {
        const s = salon as SalonRow;
        setSalonId(s.id);
        setSalonName(s.name ?? '');
        setOwnerName(s.owner_name ?? '');
        setPhone(s.phone ?? '');
        setEmail(s.email ?? '');
        setAddress(s.address ?? '');
        setWebsite(s.website ?? '');
      }
    } catch (e) {
      console.error(e);
      setLoadError('予期しないエラーが発生しました');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async () => {
    if (!salonId) {
      alert('サロン情報が取得できていないため保存できません');
      return;
    }
    if (!salonName.trim()) {
      alert('店舗名は必須です');
      return;
    }
    if (!email.trim()) {
      alert('メールアドレスは必須です');
      return;
    }
    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('salons')
        .update({
          name: salonName.trim(),
          owner_name: ownerName.trim() || null,
          phone: phone.trim() || null,
          email: email.trim(),
          address: address.trim() || null,
          website: website.trim() || null,
        })
        .eq('id', salonId);

      if (error) throw error;
      alert('保存しました');
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : '不明なエラー';
      alert(`保存に失敗しました: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (confirm('編集内容を破棄して、保存済みデータに戻しますか?')) {
      loadData();
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('画像ファイルを選択してください');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('5MB以下の画像を選択してください');
      return;
    }
    setIsUploadingAvatar(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('unauthorized');

      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
      const path = `${user.id}/avatar.${ext}`;

      const { error: upErr } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(path);
      const finalUrl = `${publicUrl}?t=${Date.now()}`;

      const { error: updErr } = await supabase.auth.updateUser({
        data: { avatar_url: finalUrl },
      });
      if (updErr) throw updErr;

      setAvatarUrl(finalUrl);
    } catch (err) {
      console.error(err);
      alert('アバターの更新に失敗しました');
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const res = await fetch(`/api/account/export?format=${exportFormat}`);
      if (!res.ok) throw new Error('export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `salonrink-export-${new Date().toISOString().slice(0, 10)}.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('エクスポートに失敗しました。時間をおいて再試行してください。');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteRequest = async () => {
    setIsSubmittingDelete(true);
    try {
      const res = await fetch('/api/account/delete-request', { method: 'POST' });
      if (!res.ok) throw new Error('delete request failed');
      alert('削除リクエストを受け付けました。\n登録メールアドレスに確認リンクを送信しました。48時間以内に承認してください。');
      setShowDeleteModal(false);
    } catch (err) {
      console.error(err);
      alert('リクエスト送信に失敗しました。');
    } finally {
      setIsSubmittingDelete(false);
    }
  };

  // Avatar initial: salons.name の頭文字 or salons.owner_name の頭文字 or 'A'
  const avatarInitial = (salonName?.[0] || ownerName?.[0] || 'A').toUpperCase();

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

      {loadError && (
        <div style={{
          padding: '12px 14px',
          background: '#fdf5f3',
          border: '1px solid #e8b8b0',
          borderRadius: '8px',
          color: '#c4392e',
          fontSize: '13px',
        }}>
          ⚠ {loadError}
        </div>
      )}

      <div className={styles.grid} style={loading ? { opacity: 0.5, pointerEvents: 'none' } : undefined}>
        {/* Profile */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>プロフィール</h2>
          <div className={styles.avatarRow}>
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt="avatar"
                className={styles.avatarLarge}
                style={{ objectFit: 'cover' }}
              />
            ) : (
              <div className={styles.avatarLarge}>{avatarInitial}</div>
            )}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              style={{ display: 'none' }}
            />
            <button
              type="button"
              className={styles.btnSmall}
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingAvatar}
            >
              {isUploadingAvatar ? 'アップロード中…' : 'アバターを変更'}
            </button>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>オーナー名</label>
            <input
              type="text"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              placeholder="例: 山田太郎"
              className={styles.input}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>メールアドレス</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="例: owner@example.com"
              className={styles.input}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>電話番号</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="例: 090-0000-0000"
              className={styles.input}
            />
          </div>
        </section>

        {/* Salon info */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>店舗情報</h2>
          <div className={styles.field}>
            <label className={styles.label}>店舗名</label>
            <input
              type="text"
              value={salonName}
              onChange={(e) => setSalonName(e.target.value)}
              placeholder="例: キレイ 鶴見店"
              className={styles.input}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>住所</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="例: 神奈川県横浜市鶴見区..."
              className={styles.input}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>店舗電話</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="例: 045-000-0000"
              className={styles.input}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>ウェブサイト</label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="例: https://kirei-tsurumi.com"
              className={styles.input}
            />
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
        <button type="button" className={styles.btnGhost} onClick={handleCancel} disabled={saving || loading}>
          キャンセル
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || loading || !salonId}
          className={styles.btnPrimary}
        >
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
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as 'csv' | 'json')}
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: '1px solid #d9c8a8',
                  background: '#fff',
                  fontSize: '12px',
                  fontFamily: 'inherit',
                  color: '#2a1f15',
                }}
              >
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
              </select>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={handleExport}
                disabled={isExporting}
              >
                {isExporting ? 'エクスポート中…' : 'エクスポート'}
              </button>
            </div>
          </div>
          <div className={styles.dangerRow}>
            <div>
              <div className={styles.dangerLabel}>アカウント削除</div>
              <div className={styles.dangerSub}>すべてのデータが完全に削除されます(復元不可)</div>
            </div>
            <button
              type="button"
              className={styles.btnDanger}
              onClick={() => setShowDeleteModal(true)}
            >
              削除リクエスト
            </button>
          </div>
        </div>
      </section>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => !isSubmittingDelete && setShowDeleteModal(false)}
        >
          <div
            style={{
              background: '#faf5e9',
              border: '1px solid #e4d5b8',
              borderRadius: '10px',
              maxWidth: '440px',
              width: '100%',
              padding: '24px',
              fontFamily: '"Zen Kaku Gothic New", "Noto Sans JP", system-ui, sans-serif',
              color: '#2a1f15',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{
              fontFamily: '"Shippori Mincho", "Noto Serif JP", serif',
              fontSize: '16px',
              color: '#c4392e',
              margin: '0 0 16px',
              fontWeight: 500,
            }}>
              アカウント削除リクエスト
            </h3>
            <p style={{ fontSize: '13px', margin: '0 0 8px' }}>
              この操作を承認すると、以下のデータがすべて完全に削除されます:
            </p>
            <ul style={{ fontSize: '12.5px', color: '#4a3a28', paddingLeft: '20px', margin: '0 0 16px', lineHeight: 1.7 }}>
              <li>顧客情報・予約履歴</li>
              <li>AIカルテ・写真</li>
              <li>サブスクリプション(自動解約)</li>
              <li>ログイン情報</li>
            </ul>
            <p style={{ fontSize: '12.5px', color: '#c4392e', fontWeight: 600, margin: '0 0 12px' }}>
              この操作は取り消せません。
            </p>
            <p style={{ fontSize: '11.5px', color: '#8a7860', margin: '0 0 20px', lineHeight: 1.6 }}>
              確認リンクをメールでお送りします。48時間以内にリンクをクリックすると削除が確定します。
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className={styles.btnGhost}
                onClick={() => setShowDeleteModal(false)}
                disabled={isSubmittingDelete}
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleDeleteRequest}
                disabled={isSubmittingDelete}
                style={{
                  padding: '8px 14px',
                  borderRadius: '6px',
                  border: '1px solid #c4392e',
                  background: '#c4392e',
                  color: '#fff',
                  fontSize: '12px',
                  fontFamily: 'inherit',
                  cursor: isSubmittingDelete ? 'not-allowed' : 'pointer',
                  opacity: isSubmittingDelete ? 0.6 : 1,
                }}
              >
                {isSubmittingDelete ? '送信中…' : '確認メールを送る'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
