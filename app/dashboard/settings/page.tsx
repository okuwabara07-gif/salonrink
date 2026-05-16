'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import styles from './page.module.css';

/* ============================================================
   /dashboard/settings — サロン設定ページ(完全動的化)
   ============================================================ */

type Tab = 'business' | 'staff' | 'menu' | 'notifications' | 'holidays';

type StaffRow = { id: string; name: string; role: string; status: string };
type MenuRow = { id: string; name: string; price: number; duration: number };
type AliasCandidate = { hpb_raw_name: string; occ: number };
type SettingsRow = {
  open_time: string;
  close_time: string;
  last_order_time: string;
  slot_minutes: number;
  closed_weekdays: number[];
  close_on_holidays: boolean;
  notif_new_reservation: boolean;
  notif_cancel: boolean;
  notif_reminder: boolean;
  notif_dormant: boolean;
  notif_inventory: boolean;
};

const DEFAULT_SETTINGS: SettingsRow = {
  open_time: '10:00',
  close_time: '20:00',
  last_order_time: '19:00',
  slot_minutes: 30,
  closed_weekdays: [],
  close_on_holidays: false,
  notif_new_reservation: true,
  notif_cancel: true,
  notif_reminder: true,
  notif_dormant: true,
  notif_inventory: false,
};

const WEEKDAYS = ['月', '火', '水', '木', '金', '土', '日'];

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>('business');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [salonId, setSalonId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  const [settings, setSettings] = useState<SettingsRow>(DEFAULT_SETTINGS);
  const [staff, setStaff] = useState<StaffRow[]>([]);
  const [menus, setMenus] = useState<MenuRow[]>([]);
  const [unmapped, setUnmapped] = useState<AliasCandidate[]>([]);
  const [aliasPick, setAliasPick] = useState<Record<string, string>>({});
  const [aliasBusy, setAliasBusy] = useState<string | null>(null);

  // ─── データ取得 ───────────────────────────────
  useEffect(() => {
    (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setLoadError('ログインが必要です'); setLoading(false); return; }

        const { data: salon } = await supabase
          .from('salons').select('id').eq('owner_user_id', user.id).maybeSingle();
        if (!salon) { setLoadError('サロン情報が見つかりません'); setLoading(false); return; }
        setSalonId(salon.id);

        const { data: st } = await supabase
          .from('salon_settings').select('*').eq('salon_id', salon.id).maybeSingle();
        if (st) {
          setSettings({
            open_time: st.open_time ?? DEFAULT_SETTINGS.open_time,
            close_time: st.close_time ?? DEFAULT_SETTINGS.close_time,
            last_order_time: st.last_order_time ?? DEFAULT_SETTINGS.last_order_time,
            slot_minutes: st.slot_minutes ?? DEFAULT_SETTINGS.slot_minutes,
            closed_weekdays: Array.isArray(st.closed_weekdays) ? st.closed_weekdays : [],
            close_on_holidays: !!st.close_on_holidays,
            notif_new_reservation: st.notif_new_reservation ?? true,
            notif_cancel: st.notif_cancel ?? true,
            notif_reminder: st.notif_reminder ?? true,
            notif_dormant: st.notif_dormant ?? true,
            notif_inventory: st.notif_inventory ?? false,
          });
        }

        const { data: stf } = await supabase
          .from('staff').select('*').eq('salon_id', salon.id).order('sort_order');
        setStaff((stf || []).map((s) => ({ id: s.id, name: s.name, role: s.role, status: s.status })));

        const { data: mn } = await supabase
          .from('salon_menus').select('*').eq('salon_id', salon.id).order('sort_order');
        setMenus((mn || []).map((m) => ({ id: m.id, name: m.name, price: m.price, duration: m.duration })));
      } catch (e) {
        console.error(e);
        setLoadError('予期しないエラーが発生しました');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ② HPB予約メニューの未マッピング一覧（追加のみ・既存不変）
  useEffect(() => {
    if (!salonId) return;
    (async () => {
      try {
        const supabase = createClient();
        const [aliasRes, resvRes] = await Promise.all([
          supabase.from('hpb_menu_alias').select('hpb_raw_name').eq('salon_id', salonId),
          supabase.from('hpb_reservations').select('menu_name').eq('salon_id', salonId),
        ]);
        const handled = new Set(
          ((aliasRes.data ?? []) as { hpb_raw_name: string | null }[])
            .map((r) => (r.hpb_raw_name || '').trim()),
        );
        const tally = new Map<string, number>();
        for (const r of ((resvRes.data ?? []) as { menu_name: string | null }[])) {
          const n = (r.menu_name || '').trim();
          if (!n || handled.has(n)) continue;
          tally.set(n, (tally.get(n) ?? 0) + 1);
        }
        const list: AliasCandidate[] = Array.from(tally.entries())
          .map(([hpb_raw_name, occ]) => ({ hpb_raw_name, occ }))
          .sort((a, b) => b.occ - a.occ);
        setUnmapped(list);
      } catch (e) {
        console.error('unmapped load:', e);
      }
    })();
  }, [salonId]);

  const flashSaved = useCallback(() => {
    setSavedMsg('保存しました ✓');
    setTimeout(() => setSavedMsg(''), 2000);
  }, []);

  async function saveSettings() {
    if (!salonId) return;
    setSaving(true);
    try {
      const supabase = createClient();
      await supabase.from('salon_settings').upsert({
        salon_id: salonId,
        ...settings,
        updated_at: new Date().toISOString(),
      });
      flashSaved();
    } catch (e) {
      console.error('save settings:', e);
      alert('保存に失敗しました');
    } finally {
      setSaving(false);
    }
  }

  async function addStaff() {
    if (!salonId) return;
    const name = prompt('スタッフ名を入力');
    if (!name?.trim()) return;
    const role = prompt('役割(例: スタイリスト)', 'スタイリスト') || 'スタイリスト';
    try {
      const supabase = createClient();
      const { data } = await supabase.from('staff')
        .insert({ salon_id: salonId, name: name.trim(), role, sort_order: staff.length })
        .select('*').single();
      if (data) setStaff((s) => [...s, { id: data.id, name: data.name, role: data.role, status: data.status }]);
    } catch (e) { console.error(e); alert('追加に失敗しました'); }
  }

  async function editStaff(row: StaffRow) {
    const name = prompt('スタッフ名', row.name);
    if (name === null) return;
    const role = prompt('役割', row.role);
    if (role === null) return;
    try {
      const supabase = createClient();
      await supabase.from('staff').update({ name: name.trim(), role: role.trim(), updated_at: new Date().toISOString() }).eq('id', row.id);
      setStaff((s) => s.map((x) => x.id === row.id ? { ...x, name: name.trim(), role: role.trim() } : x));
    } catch (e) { console.error(e); }
  }

  async function deleteStaff(id: string) {
    if (!confirm('このスタッフを削除しますか?')) return;
    try {
      const supabase = createClient();
      await supabase.from('staff').delete().eq('id', id);
      setStaff((s) => s.filter((x) => x.id !== id));
    } catch (e) { console.error(e); }
  }

  async function addMenu() {
    if (!salonId) return;
    const name = prompt('メニュー名');
    if (!name?.trim()) return;
    const price = parseInt(prompt('料金(円)', '5000') || '0', 10);
    const duration = parseInt(prompt('所要時間(分)', '60') || '60', 10);
    try {
      const supabase = createClient();
      const { data } = await supabase.from('salon_menus')
        .insert({ salon_id: salonId, name: name.trim(), price, duration, sort_order: menus.length })
        .select('*').single();
      if (data) setMenus((m) => [...m, { id: data.id, name: data.name, price: data.price, duration: data.duration }]);
    } catch (e) { console.error(e); alert('追加に失敗しました'); }
  }

  async function editMenu(row: MenuRow) {
    const name = prompt('メニュー名', row.name);
    if (name === null) return;
    const price = parseInt(prompt('料金(円)', String(row.price)) || String(row.price), 10);
    const duration = parseInt(prompt('所要時間(分)', String(row.duration)) || String(row.duration), 10);
    try {
      const supabase = createClient();
      await supabase.from('salon_menus').update({ name: name.trim(), price, duration }).eq('id', row.id);
      setMenus((m) => m.map((x) => x.id === row.id ? { ...x, name: name.trim(), price, duration } : x));
    } catch (e) { console.error(e); }
  }

  async function deleteMenu(id: string) {
    if (!confirm('このメニューを削除しますか?')) return;
    try {
      const supabase = createClient();
      await supabase.from('salon_menus').delete().eq('id', id);
      setMenus((m) => m.filter((x) => x.id !== id));
    } catch (e) { console.error(e); }
  }

  async function mapAlias(hpbRawName: string) {
    if (!salonId) return;
    const salonMenuId = aliasPick[hpbRawName];
    if (!salonMenuId) { alert('紐付けるメニューを選択してください'); return; }
    setAliasBusy(hpbRawName);
    try {
      const supabase = createClient();
      const { error } = await supabase.from('hpb_menu_alias').insert({
        salon_id: salonId,
        hpb_raw_name: hpbRawName,
        salon_menu_id: salonMenuId,
        status: 'mapped',
        match_source: 'manual',
      });
      if (error) throw error;
      setUnmapped((u) => u.filter((x) => x.hpb_raw_name !== hpbRawName));
    } catch (e) {
      console.error('map alias:', e);
      alert('紐付けに失敗しました');
    } finally {
      setAliasBusy(null);
    }
  }

  async function ignoreAlias(hpbRawName: string) {
    if (!salonId) return;
    if (!confirm('この予約メニューを「価格対象外」にします？')) return;
    setAliasBusy(hpbRawName);
    try {
      const supabase = createClient();
      const { error } = await supabase.from('hpb_menu_alias').insert({
        salon_id: salonId,
        hpb_raw_name: hpbRawName,
        salon_menu_id: null,
        status: 'ignored',
        match_source: 'manual',
      });
      if (error) throw error;
      setUnmapped((u) => u.filter((x) => x.hpb_raw_name !== hpbRawName));
    } catch (e) {
      console.error('ignore alias:', e);
      alert('操作に失敗しました');
    } finally {
      setAliasBusy(null);
    }
  }

  function toggleWeekday(i: number) {
    setSettings((s) => ({
      ...s,
      closed_weekdays: s.closed_weekdays.includes(i)
        ? s.closed_weekdays.filter((x) => x !== i)
        : [...s.closed_weekdays, i],
    }));
  }

  if (loading) {
    return <div style={{ padding: 40, color: 'var(--muted)', fontSize: 13 }}>読み込み中...</div>;
  }
  if (loadError) {
    return (
      <div style={{ padding: 40 }}>
        <div style={{ padding: '14px 18px', background: 'rgba(168,90,62,0.08)', border: '1px solid rgba(168,90,62,0.30)', borderRadius: 8, color: '#7a3030', fontSize: 13 }}>
          ⚠ {loadError}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.head}>
        <div className={styles.headIcon}>⚙️</div>
        <div>
          <h1 className={styles.headTitle}>設定</h1>
          <p className={styles.headSub}>サロン運営の各種設定</p>
        </div>
        {savedMsg && (
          <span style={{ marginLeft: 'auto', fontSize: 12.5, color: '#5b8c5a', fontWeight: 600 }}>{savedMsg}</span>
        )}
      </div>

      <div className={styles.tabs}>
        {[
          { k: 'business' as Tab, label: '営業時間' },
          { k: 'staff' as Tab, label: 'スタッフ' },
          { k: 'menu' as Tab, label: 'メニュー' },
          { k: 'notifications' as Tab, label: '通知' },
          { k: 'holidays' as Tab, label: '定休日' },
        ].map(t => (
          <button key={t.k} type="button" onClick={() => setTab(t.k)}
            className={`${styles.tab} ${tab === t.k ? styles.tabActive : ''}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'business' && (
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>営業時間</h2>
          <div className={styles.fieldGrid}>
            <div className={styles.field}>
              <label className={styles.label}>開店時間</label>
              <input type="time" value={settings.open_time}
                onChange={(e) => setSettings((s) => ({ ...s, open_time: e.target.value }))}
                className={styles.input} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>閉店時間</label>
              <input type="time" value={settings.close_time}
                onChange={(e) => setSettings((s) => ({ ...s, close_time: e.target.value }))}
                className={styles.input} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>最終受付</label>
              <input type="time" value={settings.last_order_time}
                onChange={(e) => setSettings((s) => ({ ...s, last_order_time: e.target.value }))}
                className={styles.input} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>予約間隔</label>
              <select value={String(settings.slot_minutes)}
                onChange={(e) => setSettings((s) => ({ ...s, slot_minutes: parseInt(e.target.value, 10) }))}
                className={styles.input}>
                <option value="15">15分刻み</option>
                <option value="30">30分刻み</option>
                <option value="60">60分刻み</option>
              </select>
            </div>
          </div>
          <button type="button" className={styles.saveBtn} onClick={saveSettings} disabled={saving}>
            {saving ? '保存中...' : '保存する'}
          </button>
        </section>
      )}

      {tab === 'staff' && (
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>スタッフ管理 ({staff.length}名)</h2>
          <div className={styles.staffList}>
            {staff.length === 0 && (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
                スタッフが登録されていません。「+ スタッフを追加」から登録してください。
              </div>
            )}
            {staff.map((s) => (
              <div key={s.id} className={styles.staffRow}>
                <div className={styles.staffAvatar}>{s.name[0]}</div>
                <div className={styles.staffMain}>
                  <div className={styles.staffName}>{s.name}</div>
                  <div className={styles.staffRole}>{s.role}</div>
                </div>
                <span className={styles.statusBadge}>{s.status}</span>
                <button type="button" className={styles.editBtn} onClick={() => editStaff(s)}>編集</button>
                <button type="button" className={styles.editBtn} onClick={() => deleteStaff(s.id)}>削除</button>
              </div>
            ))}
          </div>
          <button type="button" className={styles.addBtn} onClick={addStaff}>+ スタッフを追加</button>
        </section>
      )}

      {tab === 'menu' && (
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>施術メニュー ({menus.length}件)</h2>
          <div className={styles.menuList}>
            {menus.length === 0 && (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
                メニューが登録されていません。「+ メニューを追加」から登録してください。
              </div>
            )}
            {menus.map((m) => (
              <div key={m.id} className={styles.menuRow}>
                <div className={styles.menuName}>{m.name}</div>
                <div className={styles.menuMeta}>
                  <span>¥{m.price.toLocaleString()}</span>
                  <span>{m.duration}分</span>
                </div>
                <button type="button" className={styles.editBtn} onClick={() => editMenu(m)}>編集</button>
                <button type="button" className={styles.editBtn} onClick={() => deleteMenu(m.id)}>削除</button>
              </div>
            ))}
          </div>
          <button type="button" className={styles.addBtn} onClick={addMenu}>+ メニューを追加</button>

          <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid rgba(0,0,0,0.08)' }}>
            <h2 className={styles.cardTitle}>HPB予約メニューの紐付け ({unmapped.length}件 未割当)</h2>
            <p style={{ fontSize: 12, color: 'var(--muted)', margin: '4px 0 14px' }}>
              HPB予約のメニュー名を上の施術メニューに紐付けると正しい価格・時間で表示されます。対象外は「無視」。
            </p>
            {unmapped.length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
                未割当のHPB予約メニューはありません。
              </div>
            ) : (
              <div className={styles.menuList}>
                {unmapped.map((u) => (
                  <div key={u.hpb_raw_name} className={styles.menuRow}>
                    <div className={styles.menuName} title={u.hpb_raw_name}>
                      {u.hpb_raw_name}
                      <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--muted)' }}>×{u.occ}</span>
                    </div>
                    <select
                      className={styles.input}
                      style={{ maxWidth: 220 }}
                      value={aliasPick[u.hpb_raw_name] ?? ''}
                      onChange={(e) =>
                        setAliasPick((p) => ({ ...p, [u.hpb_raw_name]: e.target.value }))
                      }
                    >
                      <option value="">メニューを選択…</option>
                      {menus.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}（¥{m.price.toLocaleString()}）
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className={styles.editBtn}
                      disabled={aliasBusy === u.hpb_raw_name}
                      onClick={() => mapAlias(u.hpb_raw_name)}
                    >
                      {aliasBusy === u.hpb_raw_name ? '...' : '紐付け'}
                    </button>
                    <button
                      type="button"
                      className={styles.editBtn}
                      disabled={aliasBusy === u.hpb_raw_name}
                      onClick={() => ignoreAlias(u.hpb_raw_name)}
                    >
                      無視
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {tab === 'notifications' && (
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>通知設定</h2>
          <div className={styles.toggleList}>
            {([
              { key: 'notif_new_reservation', label: '新規予約があったとき', sub: 'LINE通知 + メール' },
              { key: 'notif_cancel', label: '予約キャンセル時', sub: 'LINE通知' },
              { key: 'notif_reminder', label: '24時間以内の予約リマインド', sub: 'プッシュ通知' },
              { key: 'notif_dormant', label: '休眠顧客の検知(60日以上)', sub: '週次まとめメール' },
              { key: 'notif_inventory', label: '在庫アラート', sub: 'ダッシュボード通知のみ' },
            ] as const).map((n) => (
              <label key={n.key} className={styles.toggleRow}>
                <div className={styles.toggleMain}>
                  <div className={styles.toggleLabel}>{n.label}</div>
                  <div className={styles.toggleSub}>{n.sub}</div>
                </div>
                <input type="checkbox"
                  checked={settings[n.key] as boolean}
                  onChange={(e) => setSettings((s) => ({ ...s, [n.key]: e.target.checked }))}
                  className={styles.toggle} />
              </label>
            ))}
          </div>
          <button type="button" className={styles.saveBtn} onClick={saveSettings} disabled={saving}>
            {saving ? '保存中...' : '保存する'}
          </button>
        </section>
      )}

      {tab === 'holidays' && (
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>定休日設定</h2>
          <div className={styles.field}>
            <label className={styles.label}>毎週の定休日</label>
            <div className={styles.weekdayChips}>
              {WEEKDAYS.map((d, i) => (
                <label key={d}
                  className={`${styles.weekdayChip} ${settings.closed_weekdays.includes(i) ? styles.weekdayChipActive : ''}`}
                  onClick={(e) => { e.preventDefault(); toggleWeekday(i); }}>
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
              <input type="checkbox"
                checked={settings.close_on_holidays}
                onChange={(e) => setSettings((s) => ({ ...s, close_on_holidays: e.target.checked }))}
                className={styles.toggle} />
            </label>
          </div>
          <button type="button" className={styles.saveBtn} onClick={saveSettings} disabled={saving}>
            {saving ? '保存中...' : '保存する'}
          </button>
        </section>
      )}
    </div>
  );
}
