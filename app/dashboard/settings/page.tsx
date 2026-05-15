'use client';

import React, { useState } from 'react';
import styles from './page.module.css';

/* ============================================================
   /dashboard/settings — サロン設定ページ
   ============================================================ */

type Tab = 'business' | 'staff' | 'menu' | 'notifications' | 'holidays';

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>('business');

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.head}>
        <div className={styles.headIcon}>⚙️</div>
        <div>
          <h1 className={styles.headTitle}>設定</h1>
          <p className={styles.headSub}>サロン運営の各種設定</p>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {[
          { k: 'business' as Tab, label: '営業時間' },
          { k: 'staff' as Tab, label: 'スタッフ' },
          { k: 'menu' as Tab, label: 'メニュー' },
          { k: 'notifications' as Tab, label: '通知' },
          { k: 'holidays' as Tab, label: '定休日' },
        ].map(t => (
          <button
            key={t.k}
            type="button"
            onClick={() => setTab(t.k)}
            className={`${styles.tab} ${tab === t.k ? styles.tabActive : ''}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === 'business' && (
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>営業時間</h2>
          <div className={styles.fieldGrid}>
            <div className={styles.field}>
              <label className={styles.label}>開店時間</label>
              <input type="time" defaultValue="10:00" className={styles.input} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>閉店時間</label>
              <input type="time" defaultValue="20:00" className={styles.input} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>最終受付</label>
              <input type="time" defaultValue="19:00" className={styles.input} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>予約間隔</label>
              <select defaultValue="30" className={styles.input}>
                <option value="15">15分刻み</option>
                <option value="30">30分刻み</option>
                <option value="60">60分刻み</option>
              </select>
            </div>
          </div>
          <button type="button" className={styles.saveBtn}>保存する</button>
        </section>
      )}

      {tab === 'staff' && (
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>スタッフ管理 (4名)</h2>
          <div className={styles.staffList}>
            {[
              { name: 'テスト太郎', role: 'オーナー', status: 'アクティブ' },
              { name: 'さつき', role: 'スタイリスト', status: 'アクティブ' },
              { name: 'みなみ', role: 'スタイリスト', status: 'アクティブ' },
              { name: 'ゆう', role: 'アシスタント', status: 'アクティブ' },
            ].map((s, i) => (
              <div key={i} className={styles.staffRow}>
                <div className={styles.staffAvatar}>{s.name[0]}</div>
                <div className={styles.staffMain}>
                  <div className={styles.staffName}>{s.name}</div>
                  <div className={styles.staffRole}>{s.role}</div>
                </div>
                <span className={styles.statusBadge}>{s.status}</span>
                <button type="button" className={styles.editBtn}>編集</button>
              </div>
            ))}
          </div>
          <button type="button" className={styles.addBtn}>+ スタッフを追加</button>
        </section>
      )}

      {tab === 'menu' && (
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>施術メニュー</h2>
          <div className={styles.menuList}>
            {[
              { name: 'カット', price: 4800, duration: 60 },
              { name: 'カラー', price: 6800, duration: 90 },
              { name: '白髪染め', price: 7200, duration: 90 },
              { name: 'パーマ', price: 8800, duration: 120 },
              { name: 'トリートメント', price: 2800, duration: 30 },
              { name: 'ヘッドスパ', price: 3500, duration: 30 },
              { name: 'ハイライト', price: 9800, duration: 120 },
            ].map((m, i) => (
              <div key={i} className={styles.menuRow}>
                <div className={styles.menuName}>{m.name}</div>
                <div className={styles.menuMeta}>
                  <span>¥{m.price.toLocaleString()}</span>
                  <span>{m.duration}分</span>
                </div>
                <button type="button" className={styles.editBtn}>編集</button>
              </div>
            ))}
          </div>
          <button type="button" className={styles.addBtn}>+ メニューを追加</button>
        </section>
      )}

      {tab === 'notifications' && (
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>通知設定</h2>
          <div className={styles.toggleList}>
            {[
              { label: '新規予約があったとき', sub: 'LINE通知 + メール', enabled: true },
              { label: '予約キャンセル時', sub: 'LINE通知', enabled: true },
              { label: '24時間以内の予約リマインド', sub: 'プッシュ通知', enabled: true },
              { label: '休眠顧客の検知(60日以上)', sub: '週次まとめメール', enabled: true },
              { label: '在庫アラート', sub: 'ダッシュボード通知のみ', enabled: false },
            ].map((n, i) => (
              <label key={i} className={styles.toggleRow}>
                <div className={styles.toggleMain}>
                  <div className={styles.toggleLabel}>{n.label}</div>
                  <div className={styles.toggleSub}>{n.sub}</div>
                </div>
                <input
                  type="checkbox"
                  defaultChecked={n.enabled}
                  className={styles.toggle}
                />
              </label>
            ))}
          </div>
          <button type="button" className={styles.saveBtn}>保存する</button>
        </section>
      )}

      {tab === 'holidays' && (
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>定休日設定</h2>
          <div className={styles.field}>
            <label className={styles.label}>毎週の定休日</label>
            <div className={styles.weekdayChips}>
              {['月', '火', '水', '木', '金', '土', '日'].map((d, i) => (
                <label key={d} className={`${styles.weekdayChip} ${i === 2 ? styles.weekdayChipActive : ''}`}>
                  <input type="checkbox" defaultChecked={i === 2} hidden />
                  {d}
                </label>
              ))}
            </div>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>祝日も休業</label>
            <label className={styles.toggleRow}>
              <div className={styles.toggleMain}>
                <div className={styles.toggleSub}>日本の祝日に合わせて自動的に休業日として設定</div>
              </div>
              <input type="checkbox" className={styles.toggle} />
            </label>
          </div>
          <button type="button" className={styles.saveBtn}>保存する</button>
        </section>
      )}
    </div>
  );
}
