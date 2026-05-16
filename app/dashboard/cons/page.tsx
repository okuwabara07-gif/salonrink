'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import styles from './page.module.css';

/* ============================================================
   /dashboard/cons — コンシェルジュ(Step1: 実KPIダッシュボード)
   ============================================================
   Supabase から reservations + hpb_reservations + customers を
   取得し、当月の経営KPIを実集計して表示する。
   - 偽データは一切表示しない(実データ or 0)
   - Claude API は使わない(コスト ¥0 / APIキー不使用)
   - AI経営アドバイス(Haiku 生成)は Step2 で追加予定
   ============================================================ */

// メニュー名 → price の lookup(home/booking と統一)
const MENU_PRICE: Record<string, number> = {
  'カット': 4800,
  'カラー': 6800,
  '白髪染め': 7200,
  'パーマ': 8800,
  'トリートメント': 2800,
  'ヘッドスパ': 3500,
  'ハイライト': 9800,
};
const DEFAULT_PRICE = 5000;

function menuToPrice(menu: string | null | undefined): number {
  if (!menu) return DEFAULT_PRICE;
  const items = menu.split(/[,、+＋\s/]/).map((s) => s.trim()).filter(Boolean);
  let total = 0;
  for (const item of items) {
    if (MENU_PRICE[item] != null) {
      total += MENU_PRICE[item];
    } else {
      const matched = Object.keys(MENU_PRICE).find((k) => item.includes(k));
      total += matched ? MENU_PRICE[matched] : DEFAULT_PRICE;
    }
  }
  return items.length === 0 ? DEFAULT_PRICE : total;
}

interface ResvRow {
  datetime: string;
  menu: string | null;
  status: string | null;
}

interface CustRow {
  last_visit: string | null;
  visit_count: number | null;
  created_at: string | null;
}

interface Kpis {
  monthCount: number;
  monthRevenue: number;
  newCustomers: number;
  dormantCustomers: number;
  repeatRate: number; // 0-100
  avgSpend: number;
  totalCustomers: number;
}

function yen(n: number): string {
  return '¥' + Math.round(n).toLocaleString('ja-JP');
}

function yenK(n: number): string {
  if (n >= 10000) return '¥' + (n / 10000).toFixed(1) + '万';
  return '¥' + Math.round(n).toLocaleString('ja-JP');
}

export default function ConsPage() {
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // AI 経営分析
  interface AiSuggestion {
    title: string;
    body: string;
    category: string;
  }
  const [aiNarrative, setAiNarrative] = useState<string | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<AiSuggestion[]>([]);
  const [aiCached, setAiCached] = useState(false);
  const [aiGeneratedAt, setAiGeneratedAt] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const today = new Date();
  const dateStr = `${today.getFullYear()}年 ${today.getMonth() + 1}月 ${today.getDate()}日(${'日月火水木金土'[today.getDay()]})`;

  const generateAi = useCallback(async (force: boolean) => {
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch('/api/cons/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 429) {
          setAiError(
            `今月のAI利用上限に達しました(${data.used}/${data.limit}回・${data.plan}プラン)。プランのアップグレードで上限が増えます。`
          );
        } else {
          setAiError(data.error || 'AI分析の生成に失敗しました');
        }
        return;
      }
      setAiNarrative(data.narrative ?? '');
      setAiSuggestions(Array.isArray(data.suggestions) ? data.suggestions : []);
      setAiCached(data.cached === true);
      setAiGeneratedAt(data.generated_at ?? null);
    } catch (e) {
      console.error('AI分析エラー:', e);
      setAiError('AI分析の生成中にエラーが発生しました');
    } finally {
      setAiLoading(false);
    }
  }, []);

  const loadKpis = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoadError('ログインが必要です');
        setLoading(false);
        return;
      }

      const { data: salon, error: salonErr } = await supabase
        .from('salons')
        .select('id')
        .eq('owner_user_id', user.id)
        .maybeSingle();
      if (salonErr || !salon) {
        setLoadError('サロン情報が取得できません');
        setLoading(false);
        return;
      }

      // 当月の範囲
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      const [resRes, hpbRes, custRes] = await Promise.all([
        supabase
          .from('reservations')
          .select('datetime, menu, status')
          .eq('salon_id', salon.id)
          .gte('datetime', monthStart.toISOString())
          .lt('datetime', monthEnd.toISOString()),
        supabase
          .from('hpb_reservations')
          .select('start_time, menu_name, status')
          .eq('salon_id', salon.id)
          .gte('start_time', monthStart.toISOString())
          .lt('start_time', monthEnd.toISOString()),
        supabase
          .from('customers')
          .select('last_visit, visit_count, created_at')
          .eq('salon_id', salon.id),
      ]);

      if (resRes.error) console.error('reservations:', resRes.error);
      if (hpbRes.error) console.error('hpb_reservations:', hpbRes.error);
      if (custRes.error) console.error('customers:', custRes.error);

      // 予約を統合(キャンセル除外)
      const manual: ResvRow[] = ((resRes.data as ResvRow[]) ?? []).filter(
        (r) => r.status !== 'canceled'
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const hpb: ResvRow[] = ((hpbRes.data as any[]) ?? [])
        .filter((r) => r.start_time && r.status !== 'canceled')
        .map((r) => ({
          datetime: r.start_time,
          menu: r.menu_name ?? null,
          status: r.status ?? null,
        }));
      const allResv = [...manual, ...hpb];

      const monthCount = allResv.length;
      const monthRevenue = allResv.reduce((s, r) => s + menuToPrice(r.menu), 0);
      const avgSpend = monthCount > 0 ? monthRevenue / monthCount : 0;

      // 顧客集計
      const customers = (custRes.data as CustRow[]) ?? [];
      const totalCustomers = customers.length;

      const newCustomers = customers.filter((c) => {
        if (!c.created_at) return false;
        const d = new Date(c.created_at);
        return d >= monthStart && d < monthEnd;
      }).length;

      const DORMANT_DAYS = 60;
      const dormantThreshold = new Date();
      dormantThreshold.setDate(dormantThreshold.getDate() - DORMANT_DAYS);
      const dormantCustomers = customers.filter((c) => {
        if (c.last_visit) return new Date(c.last_visit) < dormantThreshold;
        // 来店履歴が無く、登録から60日以上経過
        if (c.created_at) return new Date(c.created_at) < dormantThreshold;
        return false;
      }).length;

      const repeatCount = customers.filter(
        (c) => (c.visit_count ?? 0) >= 2
      ).length;
      const repeatRate =
        totalCustomers > 0 ? (repeatCount / totalCustomers) * 100 : 0;

      setKpis({
        monthCount,
        monthRevenue,
        newCustomers,
        dormantCustomers,
        repeatRate,
        avgSpend,
        totalCustomers,
      });
    } catch (e) {
      console.error(e);
      setLoadError('予期しないエラーが発生しました');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadKpis();
  }, [loadKpis]);

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.head}>
        <div className={styles.headIcon} aria-hidden>
          ✦
        </div>
        <div>
          <h1 className={styles.headTitle}>コンシェルジュ</h1>
          <p className={styles.headSub}>経営ダッシュボード · {dateStr} 時点</p>
        </div>
        <span className={styles.newBadge}>NEW</span>
      </div>

      {loading && (
        <section
          className={styles.card}
          style={{ textAlign: 'center', padding: '48px 24px' }}
        >
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>
            経営データを集計中…
          </p>
        </section>
      )}

      {!loading && loadError && (
        <section
          className={styles.card}
          style={{ textAlign: 'center', padding: '48px 24px' }}
        >
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>{loadError}</p>
        </section>
      )}

      {!loading && !loadError && kpis && (
        <>
          {/* KPI grid(全て当月実データ) */}
          <section className={styles.kpiGrid}>
            <div className={styles.kpiCard}>
              <div className={styles.kpiLeft}>
                <p className={styles.kpiLabel}>今月の予約件数</p>
                <p className={styles.kpiVal}>
                  {kpis.monthCount}
                  <span className={styles.kpiUnit}>件</span>
                </p>
                <p className={styles.kpiDelta}>確定 · キャンセル除く</p>
              </div>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiLeft}>
                <p className={styles.kpiLabel}>今月の売上見込</p>
                <p className={styles.kpiVal}>{yenK(kpis.monthRevenue)}</p>
                <p className={styles.kpiDelta}>メニュー単価から算出</p>
              </div>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiLeft}>
                <p className={styles.kpiLabel}>平均客単価</p>
                <p className={styles.kpiVal}>{yen(kpis.avgSpend)}</p>
                <p className={styles.kpiDelta}>当月予約ベース</p>
              </div>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiLeft}>
                <p className={styles.kpiLabel}>今月の新規顧客</p>
                <p className={styles.kpiVal}>
                  {kpis.newCustomers}
                  <span className={styles.kpiUnit}>名</span>
                </p>
                <p className={styles.kpiDelta}>顧客登録日ベース</p>
              </div>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiLeft}>
                <p className={styles.kpiLabel}>リピート率</p>
                <p className={styles.kpiVal}>
                  {kpis.repeatRate.toFixed(1)}
                  <span className={styles.kpiUnit}>%</span>
                </p>
                <p className={styles.kpiDelta}>
                  2回以上来店 / 全{kpis.totalCustomers}名
                </p>
              </div>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiLeft}>
                <p className={styles.kpiLabel}>休眠顧客(60日+)</p>
                <p className={styles.kpiVal}>
                  {kpis.dormantCustomers}
                  <span className={styles.kpiUnit}>名</span>
                </p>
                <p
                  className={`${styles.kpiDelta} ${
                    kpis.dormantCustomers > 0 ? styles.kpiDeltaDown : ''
                  }`}
                >
                  来店促進の対象
                </p>
              </div>
            </div>
          </section>

          {/* データに基づく着眼点(ルールベース・AI非使用) */}
          <section className={styles.card}>
            <div className={styles.cardHead}>
              <h2 className={styles.cardTitle}>着眼点</h2>
              <span className={styles.cardSub}>
                当月の実データから自動抽出
              </span>
            </div>
            <div style={{ padding: '4px 2px', display: 'grid', gap: 12 }}>
              {kpis.dormantCustomers > 0 && (
                <p style={{ fontSize: 13.5, lineHeight: 1.7, color: 'var(--ink-2)' }}>
                  休眠顧客が <strong>{kpis.dormantCustomers}名</strong>{' '}
                  います。「DM配信」から来店促進メッセージを送ると再来店が見込めます。
                </p>
              )}
              {kpis.totalCustomers > 0 && kpis.repeatRate < 40 && (
                <p style={{ fontSize: 13.5, lineHeight: 1.7, color: 'var(--ink-2)' }}>
                  リピート率が <strong>{kpis.repeatRate.toFixed(1)}%</strong>{' '}
                  です。来店後フォローや次回予約の声かけで改善余地があります。
                </p>
              )}
              {kpis.monthCount === 0 && (
                <p style={{ fontSize: 13.5, lineHeight: 1.7, color: 'var(--ink-2)' }}>
                  今月の予約データがまだありません。予約が入ると、ここに経営の着眼点が表示されます。
                </p>
              )}
              {kpis.monthCount > 0 &&
                kpis.dormantCustomers === 0 &&
                kpis.repeatRate >= 40 && (
                  <p
                    style={{
                      fontSize: 13.5,
                      lineHeight: 1.7,
                      color: 'var(--ink-2)',
                    }}
                  >
                    休眠顧客が少なく、リピート率も良好です。この調子で来店後フォローを継続しましょう。
                  </p>
                )}
            </div>
          </section>

          {/* AI経営アドバイス(Claude Haiku 生成・日次キャッシュ) */}
          <section className={styles.card}>
            <div className={styles.cardHead}>
              <h2 className={styles.cardTitle}>AI経営アドバイス</h2>
              <span className={styles.cardSub}>
                上記KPIをもとに具体的な打ち手を提案(1日1回まで・自動キャッシュ)
              </span>
            </div>

            {/* 未生成 & 非ローディング: 生成ボタン */}
            {!aiNarrative && !aiLoading && !aiError && (
              <div
                style={{
                  textAlign: 'center',
                  padding: '28px 16px 8px',
                }}
              >
                <p
                  style={{
                    margin: '0 auto 18px',
                    maxWidth: 460,
                    fontSize: 12.5,
                    lineHeight: 1.7,
                    color: 'var(--muted)',
                  }}
                >
                  当月の実データをAIが分析し、空き枠対策・客単価向上・リピート改善などの打ち手を提案します。
                </p>
                <button
                  type="button"
                  onClick={() => generateAi(false)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '11px 22px',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    background: 'var(--ink)',
                    color: '#f0e6d2',
                  }}
                >
                  ✦ AI分析を生成する
                </button>
              </div>
            )}

            {/* ローディング */}
            {aiLoading && (
              <div
                style={{
                  textAlign: 'center',
                  padding: '40px 16px',
                  color: 'var(--muted)',
                  fontSize: 13,
                }}
              >
                AIが当月の経営データを分析中です…(最大20秒程度)
              </div>
            )}

            {/* エラー */}
            {aiError && !aiLoading && (
              <div
                style={{
                  padding: '20px 16px',
                  textAlign: 'center',
                }}
              >
                <p
                  style={{
                    margin: '0 0 16px',
                    fontSize: 13,
                    lineHeight: 1.7,
                    color: 'var(--ink-2)',
                  }}
                >
                  {aiError}
                </p>
                <button
                  type="button"
                  onClick={() => generateAi(false)}
                  style={{
                    padding: '9px 18px',
                    borderRadius: 8,
                    fontSize: 12.5,
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: '1px solid var(--line-2)',
                    background: 'transparent',
                    color: 'var(--ink-2)',
                  }}
                >
                  再試行
                </button>
              </div>
            )}

            {/* 結果表示 */}
            {aiNarrative && !aiLoading && (
              <div style={{ padding: '4px 2px' }}>
                <p
                  style={{
                    margin: '0 0 20px',
                    fontSize: 13.5,
                    lineHeight: 1.8,
                    color: 'var(--ink-2)',
                  }}
                >
                  {aiNarrative}
                </p>

                <div style={{ display: 'grid', gap: 12 }}>
                  {aiSuggestions.map((s, i) => (
                    <div
                      key={i}
                      className={`${styles.rec} ${
                        i > 0 ? styles.recBorder : ''
                      }`}
                      style={{ display: 'block', padding: '14px 2px' }}
                    >
                      <div
                        className={styles.recTitleRow}
                        style={{ marginBottom: 6 }}
                      >
                        <span className={styles.tag}>{s.category}</span>
                        <h3
                          className={styles.recTitle}
                          style={{ display: 'inline' }}
                        >
                          {s.title}
                        </h3>
                      </div>
                      <p
                        className={styles.recBody}
                        style={{ margin: 0, lineHeight: 1.75 }}
                      >
                        {s.body}
                      </p>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 10,
                    marginTop: 20,
                    paddingTop: 14,
                    borderTop: '1px solid var(--line-2)',
                  }}
                >
                  <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                    {aiCached
                      ? '本日生成済みのキャッシュを表示しています'
                      : 'AIが新規生成しました'}
                    {aiGeneratedAt &&
                      ` · ${new Date(aiGeneratedAt).toLocaleString('ja-JP', {
                        month: 'numeric',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => generateAi(true)}
                    style={{
                      padding: '7px 14px',
                      borderRadius: 7,
                      fontSize: 11.5,
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: '1px solid var(--line-2)',
                      background: 'transparent',
                      color: 'var(--ink-2)',
                    }}
                  >
                    再生成(本日の利用回数を消費)
                  </button>
                </div>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
