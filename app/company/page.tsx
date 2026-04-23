import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '会社概要 | AOKAE合同会社',
  description: 'AOKAE合同会社の会社概要・事業内容・提供サービス。美容サロン向けSaaS「SalonRink」、美容メディア「AOKAE」、実店舗「キレイ鶴見店」を運営。',
  alternates: { canonical: 'https://salonrink.com/company' },
};

const info: [string, string | React.ReactNode][] = [
  ['商号', 'AOKAE合同会社'],
  ['英文表記', 'AOKAE LLC'],
  ['代表者', '代表社員'],
  ['所在地', '東京都'],
  ['連絡先', 'info@aokae.net / （非公開）'],
  ['事業内容', 'SaaS開発・運営 / Webメディア運営 / 美容サロン運営'],
  ['設立', '2024年'],
];

const services = [
  {
    name: 'SalonRink / SALOMÉ',
    category: 'SaaS事業',
    url: 'https://salonrink.com',
    desc: '美容サロン向け統合管理プラットフォーム。LINE予約連動、顧客カルテ、売上分析、失客防止を一つに。月額¥980〜',
    color: '#7A3550',
  },
  {
    name: 'AOKAE メディア',
    category: 'メディア事業',
    url: 'https://aokae.net',
    desc: '美容・金融・ライフスタイル・フィットネスの厳選情報メディア。比較・検証で失敗しない選択をサポート。',
    color: '#B8966A',
  },
  {
    name: 'キレイ鶴見店',
    category: '実店舗事業',
    url: 'https://kirei-tsurumi.com',
    desc: '横浜市鶴見区の美容サロン。SALOMÉ プラットフォームのショーケース店舗として運営。',
    color: '#8B7BAA',
  },
];

const roadmap = [
  { id: '①', title: '収益予測AI', desc: 'サロン経営の月次収益を AI が予測。仕入れ・シフト最適化を支援', status: '開発予定 2026 Q3' },
  { id: '②', title: 'ノーショー対策', desc: '来店確率スコアリング + 自動リマインドで予約ドタキャンを削減', status: '開発予定 2026 Q3' },
  { id: '④', title: 'LTV / 離反分析', desc: '顧客生涯価値の可視化と、離反リスク顧客の早期検知', status: '開発予定 2026 Q4' },
  { id: '⑤', title: 'デジタルツイン', desc: '店舗運営をデジタル空間に再現。戦略シミュレーション可能', status: '開発予定 2027 Q1' },
  { id: '⑥', title: '予測API', desc: '需要予測 API を外部パートナー向けに提供', status: '開発予定 2027 Q2' },
];

export default function CompanyPage() {
  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #F2EAD8 0%, #FAF6EE 50%, #F2EAD8 100%)',
      fontFamily: 'Georgia, "Noto Serif JP", serif',
      color: '#2d2d2d',
    }}>
      <header style={{ padding: '24px 40px', borderBottom: '1px solid rgba(184,150,106,.3)' }}>
        <a href="/" style={{ textDecoration: 'none', lineHeight: 1, display: 'inline-block' }}>
          <div style={{ fontSize: 24, fontWeight: 300, letterSpacing: 6, color: '#1A1018' }}>
            Salon<span style={{ color: '#B8966A' }}>Rink</span>
          </div>
        </a>
      </header>

      <article style={{ maxWidth: '880px', margin: '0 auto', padding: '60px 24px 80px' }}>
        <h1 style={{
          fontSize: 32, fontWeight: 300, letterSpacing: '0.1em',
          borderBottom: '1px solid #c8a97e', paddingBottom: 16, marginBottom: 40, color: '#3d2b1f',
        }}>
          会社概要
        </h1>

        {/* 会社情報テーブル */}
        <section style={{ marginBottom: 60 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15, lineHeight: 1.8 }}>
            <tbody>
              {info.map(([label, value]) => (
                <tr key={label as string} style={{ borderBottom: '1px solid #e8ddd4' }}>
                  <th style={{
                    textAlign: 'left', padding: '16px 20px 16px 0', width: 160,
                    verticalAlign: 'top', fontWeight: 500, fontSize: 14, color: '#8b6fa0',
                  }}>{label}</th>
                  <td style={{ padding: '16px 0' }}>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* 提供サービス */}
        <section style={{ marginBottom: 60 }}>
          <h2 style={{ fontSize: 22, fontWeight: 400, letterSpacing: 4, marginBottom: 24, color: '#3d2b1f' }}>提供サービス</h2>
          <div style={{ display: 'grid', gap: 20 }}>
            {services.map((s) => (
              <a key={s.name} href={s.url} target={s.url.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer"
                style={{
                  display: 'block', padding: 24, background: '#fff', borderRadius: 12,
                  border: `1px solid ${s.color}33`, borderLeft: `4px solid ${s.color}`,
                  textDecoration: 'none', color: 'inherit',
                }}>
                <div style={{ fontSize: 11, color: s.color, fontWeight: 600, letterSpacing: 3, fontFamily: 'sans-serif', marginBottom: 6 }}>
                  {s.category}
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 500, color: '#1A1018', margin: '0 0 8px' }}>{s.name}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: '#5a4a3f', margin: 0 }}>{s.desc}</p>
                <p style={{ fontSize: 12, color: s.color, marginTop: 10, fontFamily: 'sans-serif' }}>{s.url} →</p>
              </a>
            ))}
          </div>
        </section>

        {/* ロードマップ */}
        <section style={{ marginBottom: 60 }}>
          <h2 style={{ fontSize: 22, fontWeight: 400, letterSpacing: 4, marginBottom: 16, color: '#3d2b1f' }}>
            製品ロードマップ
          </h2>
          <p style={{ fontSize: 13, color: '#7a6e64', marginBottom: 24, lineHeight: 1.7 }}>
            SalonRink は単なる予約管理を超え、サロン経営をデータで支援するプラットフォームへ進化します。
          </p>
          <div style={{ display: 'grid', gap: 12 }}>
            {roadmap.map((r) => (
              <div key={r.id} style={{
                padding: 20, background: '#fff', borderRadius: 10,
                border: '1px solid #e8ddd4', display: 'flex', gap: 16, alignItems: 'flex-start',
              }}>
                <div style={{
                  fontSize: 24, fontWeight: 300, color: '#B8966A',
                  minWidth: 36, textAlign: 'center',
                }}>{r.id}</div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 4px', color: '#1A1018' }}>{r.title}</h3>
                  <p style={{ fontSize: 13, lineHeight: 1.6, color: '#5a4a3f', margin: '0 0 6px' }}>{r.desc}</p>
                  <span style={{ fontSize: 11, color: '#B8966A', fontFamily: 'sans-serif', letterSpacing: 1 }}>{r.status}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 問い合わせ導線 */}
        <section style={{ marginBottom: 40, padding: 32, background: '#1A1018', borderRadius: 12, textAlign: 'center', color: '#FAF6EE' }}>
          <h2 style={{ fontSize: 18, fontWeight: 400, letterSpacing: 3, marginBottom: 12 }}>お問い合わせ</h2>
          <p style={{ fontSize: 13, opacity: 0.85, lineHeight: 1.7, marginBottom: 20, fontFamily: 'sans-serif' }}>
            サービスに関するお問い合わせ・取材・協業のご相談は下記より承ります。
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/contact" style={{
              padding: '12px 28px', background: '#FAF6EE', color: '#1A1018',
              textDecoration: 'none', fontSize: 13, fontWeight: 600, fontFamily: 'sans-serif', borderRadius: 6,
            }}>一般お問い合わせ</a>
            <a href="/agency" style={{
              padding: '12px 28px', background: 'transparent', color: '#B8966A',
              border: '1px solid #B8966A', textDecoration: 'none', fontSize: 13, fontWeight: 600, fontFamily: 'sans-serif', borderRadius: 6,
            }}>代理店希望</a>
          </div>
        </section>

        <p style={{ fontSize: 12, color: '#999', textAlign: 'center', fontFamily: 'sans-serif' }}>
          最終更新: 2026年4月19日
        </p>
      </article>
    </main>
  );
}
