'use client';

import React, { useState, useEffect } from 'react';
import styles from './NewReservationModal.module.css';

/* ============================================================
   NewReservationModal — 新規予約モーダル
   ============================================================
   ステップ式: 顧客選択 → 日時選択 → メニュー選択 → 確認
   ============================================================ */

export type ReservationDraft = {
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  isNewCustomer?: boolean;
  date?: string;
  startTime?: string;
  duration?: number;
  staffId?: string;
  staffName?: string;
  menus?: { id: string; name: string; price: number; duration: number }[];
  totalPrice?: number;
  notes?: string;
};

export interface NewReservationModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (draft: ReservationDraft) => Promise<void> | void;
  /** 既存予約から事前入力(編集モード) */
  initial?: Partial<ReservationDraft>;
}

const MENU_OPTIONS = [
  { id: 'cut', name: 'カット', price: 4800, duration: 60 },
  { id: 'color', name: 'カラー', price: 6800, duration: 90 },
  { id: 'gray', name: '白髪染め', price: 7200, duration: 90 },
  { id: 'perm', name: 'パーマ', price: 8800, duration: 120 },
  { id: 'treatment', name: 'トリートメント', price: 2800, duration: 30 },
  { id: 'headspa', name: 'ヘッドスパ', price: 3500, duration: 30 },
  { id: 'highlight', name: 'ハイライト', price: 9800, duration: 120 },
];

const STAFF_OPTIONS = [
  { id: 's1', name: 'テスト太郎(オーナー)' },
  { id: 's2', name: 'さつき' },
  { id: 's3', name: 'みなみ' },
  { id: 's4', name: 'ゆう' },
];

const TIME_SLOTS = (() => {
  const slots: string[] = [];
  for (let h = 10; h <= 20; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`);
    slots.push(`${String(h).padStart(2, '0')}:30`);
  }
  return slots;
})();

export default function NewReservationModal({
  open,
  onClose,
  onSubmit,
  initial,
}: NewReservationModalProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [draft, setDraft] = useState<ReservationDraft>(initial || {});
  const [searchQuery, setSearchQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // ESC でクローズ
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // 状態リセット
  useEffect(() => {
    if (open) {
      setStep(1);
      setDraft(initial || {});
      setSearchQuery('');
      setSubmitting(false);
    }
  }, [open, initial]);

  if (!open) return null;

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // 合計
  const totalPrice = (draft.menus || []).reduce((s, m) => s + m.price, 0);
  const totalDuration = (draft.menus || []).reduce((s, m) => s + m.duration, 0);

  const canProceed1 = !!draft.customerName;
  const canProceed2 = !!draft.date && !!draft.startTime && !!draft.staffId;
  const canProceed3 = (draft.menus || []).length > 0;

  const toggleMenu = (m: typeof MENU_OPTIONS[number]) => {
    setDraft(prev => {
      const exists = (prev.menus || []).find(x => x.id === m.id);
      if (exists) {
        return { ...prev, menus: (prev.menus || []).filter(x => x.id !== m.id) };
      }
      return { ...prev, menus: [...(prev.menus || []), m] };
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const finalDraft: ReservationDraft = {
        ...draft,
        totalPrice,
        duration: totalDuration,
      };
      if (onSubmit) {
        await onSubmit(finalDraft);
      }
      onClose();
    } catch (err) {
      console.error('予約作成エラー:', err);
      alert('予約の作成に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="新規予約"
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>新規予約</h2>
            <div className={styles.stepper}>
              {[1, 2, 3, 4].map(n => (
                <div
                  key={n}
                  className={`${styles.step} ${step >= n ? styles.stepActive : ''} ${step === n ? styles.stepCurrent : ''}`}
                >
                  <span className={styles.stepNum}>{n}</span>
                  <span className={styles.stepLabel}>
                    {n === 1 ? '顧客' : n === 2 ? '日時' : n === 3 ? 'メニュー' : '確認'}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <button type="button" onClick={onClose} className={styles.closeBtn} aria-label="閉じる">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className={styles.body}>
          {step === 1 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>顧客を選択</h3>
              <input
                type="text"
                placeholder="顧客名・電話番号で検索"
                className={styles.input}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <p className={styles.hint}>
                検索結果から既存顧客を選択するか、下から新規顧客として入力できます。
              </p>

              <div className={styles.searchResults}>
                <p className={styles.searchResultsEmpty}>該当する顧客が見つかりません</p>
              </div>

              <div className={styles.dividerLabeled}>または</div>

              <h4 className={styles.subTitle}>新規顧客として登録</h4>
              <div className={styles.formGrid}>
                <div className={styles.field}>
                  <label className={styles.label}>顧客名 <span className={styles.required}>*</span></label>
                  <input
                    type="text"
                    placeholder="例: 山田 花子"
                    className={styles.input}
                    value={draft.customerName || ''}
                    onChange={(e) => setDraft({ ...draft, customerName: e.target.value, isNewCustomer: true })}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>電話番号</label>
                  <input
                    type="tel"
                    placeholder="例: 090-0000-0000"
                    className={styles.input}
                    value={draft.customerPhone || ''}
                    onChange={(e) => setDraft({ ...draft, customerPhone: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>日時とスタッフを選択</h3>

              <div className={styles.formGrid}>
                <div className={styles.field}>
                  <label className={styles.label}>日付 <span className={styles.required}>*</span></label>
                  <input
                    type="date"
                    className={styles.input}
                    min={todayStr}
                    value={draft.date || ''}
                    onChange={(e) => setDraft({ ...draft, date: e.target.value })}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>開始時間 <span className={styles.required}>*</span></label>
                  <select
                    className={styles.input}
                    value={draft.startTime || ''}
                    onChange={(e) => setDraft({ ...draft, startTime: e.target.value })}
                  >
                    <option value="">選択してください</option>
                    {TIME_SLOTS.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>担当スタッフ <span className={styles.required}>*</span></label>
                <div className={styles.chipGroup}>
                  {STAFF_OPTIONS.map(s => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setDraft({ ...draft, staffId: s.id, staffName: s.name })}
                      className={`${styles.chip} ${draft.staffId === s.id ? styles.chipActive : ''}`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>メニューを選択(複数可)</h3>

              <div className={styles.menuGrid}>
                {MENU_OPTIONS.map(m => {
                  const selected = (draft.menus || []).some(x => x.id === m.id);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => toggleMenu(m)}
                      className={`${styles.menuCard} ${selected ? styles.menuCardActive : ''}`}
                    >
                      <div className={styles.menuName}>{m.name}</div>
                      <div className={styles.menuMeta}>
                        <span className={styles.menuPrice}>¥{m.price.toLocaleString()}</span>
                        <span className={styles.menuDuration}>{m.duration}分</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {(draft.menus || []).length > 0 && (
                <div className={styles.totalBox}>
                  <div className={styles.totalRow}>
                    <span>所要時間</span>
                    <span className={styles.totalDuration}>{totalDuration}分</span>
                  </div>
                  <div className={styles.totalRow}>
                    <span>合計金額</span>
                    <span className={styles.totalPrice}>¥{totalPrice.toLocaleString()}</span>
                  </div>
                </div>
              )}

              <div className={styles.field}>
                <label className={styles.label}>メモ(任意)</label>
                <textarea
                  className={styles.textarea}
                  rows={3}
                  placeholder="例: ご友人紹介、ヘッドスパ追加検討中など"
                  value={draft.notes || ''}
                  onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>内容を確認</h3>

              <div className={styles.summary}>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>顧客</span>
                  <span className={styles.summaryValue}>
                    {draft.customerName}
                    {draft.isNewCustomer && <span className={styles.newTag}>新規</span>}
                  </span>
                </div>
                {draft.customerPhone && (
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>電話</span>
                    <span className={styles.summaryValue}>{draft.customerPhone}</span>
                  </div>
                )}
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>日時</span>
                  <span className={styles.summaryValue}>{draft.date} {draft.startTime}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>担当</span>
                  <span className={styles.summaryValue}>{draft.staffName}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>メニュー</span>
                  <span className={styles.summaryValue}>
                    {(draft.menus || []).map(m => m.name).join(' / ')}
                  </span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>所要時間</span>
                  <span className={styles.summaryValue}>{totalDuration}分</span>
                </div>
                <div className={`${styles.summaryRow} ${styles.summaryRowTotal}`}>
                  <span className={styles.summaryLabel}>合計</span>
                  <span className={styles.summaryValueLarge}>¥{totalPrice.toLocaleString()}</span>
                </div>
                {draft.notes && (
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>メモ</span>
                    <span className={styles.summaryValue}>{draft.notes}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button
            type="button"
            onClick={() => {
              if (step === 1) onClose();
              else setStep((step - 1) as 1 | 2 | 3);
            }}
            className={styles.btnGhost}
            disabled={submitting}
          >
            {step === 1 ? 'キャンセル' : '戻る'}
          </button>

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep((step + 1) as 2 | 3 | 4)}
              disabled={
                (step === 1 && !canProceed1) ||
                (step === 2 && !canProceed2) ||
                (step === 3 && !canProceed3)
              }
              className={styles.btnPrimary}
            >
              次へ →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className={styles.btnPrimary}
            >
              {submitting ? '保存中…' : '予約を確定する'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
