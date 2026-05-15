'use client';

import React, { useState, useMemo } from 'react';
import styles from './page.module.css';

/* ============================================================
   /dashboard/messages — DM配信ページ
   ============================================================
   テンプレ選択 → 顧客フィルタ → プレビュー → 配信
   ============================================================ */

type TemplateKey = 'visit_reminder' | 'visit_promo' | 'thanks' | 'birthday' | 'campaign' | 'custom';

const TEMPLATES: Record<TemplateKey, { name: string; tag: string; body: string }> = {
  visit_reminder: {
    name: '来店リマインド',
    tag: '定期配信',
    body:
      '{{customerName}}様、いつもありがとうございます。\n前回のご来店から{{daysSinceVisit}}日が経過しました。\n\nそろそろメンテナンスのタイミングです✨\nご都合のよい日時でご予約お待ちしております。',
  },
  visit_promo: {
    name: '空き枠埋め(平日特典)',
    tag: '集客',
    body:
      '{{customerName}}様\nお得なご案内です🎁\n\n平日 16:00-18:00 限定で、カラーメニュー1,000円OFF。\n今月中のご予約に限ります。\n\nぜひこの機会にどうぞ。',
  },
  thanks: {
    name: '来店御礼',
    tag: 'CRM',
    body:
      '{{customerName}}様\n本日はご来店ありがとうございました。\n\n仕上がりはいかがでしたでしょうか?\nまた次回のご来店、お待ちしております。',
  },
  birthday: {
    name: 'お誕生月特典',
    tag: 'CRM',
    body:
      '{{customerName}}様\nお誕生月おめでとうございます🎂\n\nささやかですが、今月限定で全メニュー10%OFFのバースデー特典をご用意しました。\n\nぜひこの機会にお越しください。',
  },
  campaign: {
    name: 'キャンペーン告知',
    tag: 'プロモ',
    body:
      '{{customerName}}様\n\n新メニューのご案内です✨\n\n【期間限定】艶髪トリートメント\n通常 ¥4,800 → ¥3,800\n5月末まで。\n\n気になる方はお気軽にお問い合わせください。',
  },
  custom: {
    name: 'カスタム',
    tag: '',
    body: '',
  },
};

type Filter = 'all' | 'dormant_90' | 'dormant_60' | 'recent_30' | 'birthday_month' | 'new_customers';

const FILTERS: { key: Filter; label: string; count: number }[] = [
  { key: 'all', label: '全顧客', count: 247 },
  { key: 'recent_30', label: '直近30日来店', count: 56 },
  { key: 'dormant_60', label: '60日休眠', count: 32 },
  { key: 'dormant_90', label: '90日以上休眠', count: 18 },
  { key: 'birthday_month', label: '今月誕生月', count: 7 },
  { key: 'new_customers', label: '新規顧客(3ヶ月)', count: 28 },
];

export default function MessagesPage() {
  const [templateKey, setTemplateKey] = useState<TemplateKey>('visit_reminder');
  const [filter, setFilter] = useState<Filter>('dormant_60');
  const [messageBody, setMessageBody] = useState(TEMPLATES.visit_reminder.body);
  const [sending, setSending] = useState(false);
  const [history] = useState([
    { date: '2026/05/10', template: '来店リマインド', target: '60日休眠 (28名)', status: '配信済' },
    { date: '2026/05/03', template: 'キャンペーン告知', target: '全顧客 (247名)', status: '配信済' },
    { date: '2026/04/28', template: 'お誕生月特典', target: '4月誕生月 (12名)', status: '配信済' },
  ]);

  const targetCount = useMemo(() => FILTERS.find(f => f.key === filter)?.count || 0, [filter]);

  const switchTemplate = (k: TemplateKey) => {
    setTemplateKey(k);
    setMessageBody(TEMPLATES[k].body);
  };

  const previewBody = useMemo(() => {
    return messageBody
      .replace(/\{\{customerName\}\}/g, '山田 花子')
      .replace(/\{\{daysSinceVisit\}\}/g, '63');
  }, [messageBody]);

  const handleSend = async () => {
    if (!messageBody.trim()) {
      alert('配信内容を入力してください');
      return;
    }
    if (!confirm(`${FILTERS.find(f => f.key === filter)?.label}(${targetCount}名)に配信します。よろしいですか?`)) {
      return;
    }
    setSending(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert(`✅ ${targetCount}名への配信を予約しました(5分以内に順次配信されます)`);
    } catch (err) {
      console.error(err);
      alert('配信に失敗しました');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.head}>
        <div className={styles.headIcon}>📣</div>
        <div>
          <h1 className={styles.headTitle}>DM配信</h1>
          <p className={styles.headSub}>顧客への一斉メッセージ・自動リマインド配信</p>
        </div>
      </div>

      {/* Main grid */}
      <div className={styles.grid}>
        {/* Left: Compose */}
        <div className={styles.col}>
          {/* Template selector */}
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>1. テンプレート選択</h2>
            <div className={styles.templateGrid}>
              {(Object.keys(TEMPLATES) as TemplateKey[]).map(k => {
                const t = TEMPLATES[k];
                const active = templateKey === k;
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => switchTemplate(k)}
                    className={`${styles.templateCard} ${active ? styles.templateCardActive : ''}`}
                  >
                    <div className={styles.templateName}>{t.name}</div>
                    {t.tag && <div className={styles.templateTag}>{t.tag}</div>}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Customer filter */}
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>2. 配信対象を絞り込み</h2>
            <div className={styles.filterGrid}>
              {FILTERS.map(f => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFilter(f.key)}
                  className={`${styles.filterChip} ${filter === f.key ? styles.filterChipActive : ''}`}
                >
                  <span className={styles.filterLabel}>{f.label}</span>
                  <span className={styles.filterCount}>{f.count}名</span>
                </button>
              ))}
            </div>
          </section>

          {/* Message composer */}
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>3. メッセージ内容</h2>
            <p className={styles.cardSub}>
              <code className={styles.codeChip}>{'{{customerName}}'}</code>
              <code className={styles.codeChip}>{'{{daysSinceVisit}}'}</code>
              などの変数が利用できます
            </p>
            <textarea
              className={styles.textarea}
              rows={10}
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              placeholder="メッセージを入力..."
            />
            <div className={styles.charCount}>
              {messageBody.length} / 500 文字
            </div>
          </section>
        </div>

        {/* Right: Preview + Send */}
        <div className={styles.col}>
          {/* LINE preview */}
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>📱 プレビュー</h2>
            <p className={styles.cardSub}>顧客の LINE 画面でこのように表示されます</p>
            <div className={styles.linePreview}>
              <div className={styles.lineBubble}>
                {previewBody.split('\n').map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    {i < previewBody.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </div>
              <div className={styles.lineSender}>キレイ 鶴見店</div>
            </div>
          </section>

          {/* Send box */}
          <section className={`${styles.card} ${styles.cardCta}`}>
            <h2 className={styles.cardTitle}>4. 配信</h2>
            <div className={styles.sendInfo}>
              <div className={styles.sendInfoRow}>
                <span>配信対象</span>
                <strong>{FILTERS.find(f => f.key === filter)?.label}</strong>
              </div>
              <div className={styles.sendInfoRow}>
                <span>対象人数</span>
                <strong className={styles.sendInfoCount}>{targetCount}名</strong>
              </div>
              <div className={styles.sendInfoRow}>
                <span>配信媒体</span>
                <strong>LINE 公式</strong>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSend}
              disabled={sending || !messageBody.trim()}
              className={styles.sendBtn}
            >
              {sending ? '配信中...' : `${targetCount}名に配信する →`}
            </button>
            <p className={styles.sendHint}>
              配信は数分間隔で順次行われ、LINE側のスパム判定を回避します。
            </p>
          </section>

          {/* History */}
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>配信履歴</h2>
            <div className={styles.historyList}>
              {history.map((h, i) => (
                <div key={i} className={styles.historyItem}>
                  <div className={styles.historyMeta}>
                    <span className={styles.historyDate}>{h.date}</span>
                    <span className={styles.historyStatus}>{h.status}</span>
                  </div>
                  <div className={styles.historyTemplate}>{h.template}</div>
                  <div className={styles.historyTarget}>{h.target}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
