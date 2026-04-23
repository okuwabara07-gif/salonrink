import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '導入事例: キレイ鶴見店 | SalonRink',
  description: 'AOKAE合同会社運営の美容サロン「キレイ鶴見店」における SalonRink 導入事例。LINE予約自動化・顧客カルテ・失客防止を実装した成果レポート。',
  alternates: { canonical: 'https://salonrink.com/case-studies/kirei-tsurumi' },
};

const metrics = [
  { label: 'LINE予約率', before: '-', after: '68%', unit: '全予約中' },
  { label: '電話応対時間', before: '月40h', after: '月12h', unit: '70%削減' },
  { label: 'ノーショー率', before: '12%', after: '4%', unit: '67%改善' },
  { label: '3ヶ月離反率', before: '38%', after: '22%', unit: '42%改善' },
];

const timeline = [
  { week: 'Week 0', title: '導入前準備', detail: '既存顧客リストをCSVエクスポート。LINE公式アカウント作成（無料プラン）。' },
  { week: 'Week 1', title: 'SalonRink 初期設定', detail: 'スモールプラン契約（¥2,480/月）。リッチメニュー・予約フロー設定。顧客カルテCSVインポート。' },
  { week: 'Week 2', title: '試験運用', detail: '既存顧客にLINE友だち追加を案内。予約30件をLINE経由で受付成功。' },
  { week: 'Week 3-4', title: '本格稼働', detail: '電話予約を段階的に縮小。リマインド自動送信で無断キャンセル激減。' },
  { week: 'Month 2', title: '失客アラート活用開始', detail: '3ヶ月未来店顧客に自動クーポン配信。再来店率40%を達成。' },
  { week: 'Month 3', title: 'ROI 黒字化', detail: '月額費用¥2,480に対し、電話応対削減 + ノーショー削減で月¥20,000の実質収益改善。' },
];

const comments = [
  {
    name: 'オーナー（仮名）',
    role: '美容師歴12年',
    text: '一番の変化は "夜の電話対応" が消えたこと。営業後に10件以上の予約電話が鳴っていたのがウソのよう。スタッフの定着率も上がりました。',
  },
  {
    name: 'スタイリスト A さん',
    role: '新人1年目',
    text: 'お客様の過去の施術がカルテですぐ見られるので、新人でも安心して接客できます。お客様も "前回と同じ" の一言で伝わるので喜んでます。',
  },
  {
    name: 'リピーター様',
    role: '来店歴2年',
    text: '予約がLINEで完結するのがラク。仕事の合間に片手で予約できるし、リマインドで直前にキャンセルする罪悪感も減りました（笑）',
  },
];

export default function CaseStudyPage() {
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

      <article style={{ maxWidth: 860, margin: '0 auto', padding: '60px 24px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <p style={{ fontSize: 12, letterSpacing: 4, color: '#B8966A', fontFamily: 'sans-serif', textTransform: 'uppercase', marginBottom: 12 }}>Case Study</p>
          <h1 style={{ fontSize: 34, fontWeight: 300, letterSpacing: 3, color: '#1A1018', marginBottom: 12, lineHeight: 1.3 }}>
            キレイ鶴見店<br />
            <span style={{ fontSize: 16, color: '#B8966A', fontFamily: 'sans-serif', letterSpacing: 2 }}>
              ノーショー率を12%→4%に改善した3ヶ月
            </span>
          </h1>
        </div>

        {/* 概要カード */}
        <section style={{ padding: 28, background: '#fff', borderRadius: 12, border: '1px solid #e8ddd4', marginBottom: 40 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: '#3d2b1f', fontFamily: 'sans-serif' }}>サロン概要</h2>
          <dl style={{ fontSize: 13, lineHeight: 2, margin: 0, fontFamily: 'sans-serif' }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <dt style={{ minWidth: 100, color: '#8b6fa0' }}>運営会社</dt>
              <dd style={{ margin: 0 }}>AOKAE合同会社</dd>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <dt style={{ minWidth: 100, color: '#8b6fa0' }}>所在地</dt>
              <dd style={{ margin: 0 }}>東京都</dd>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <dt style={{ minWidth: 100, color: '#8b6fa0' }}>業態</dt>
              <dd style={{ margin: 0 }}>美容サロン（カット・カラー・トリートメント）</dd>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <dt style={{ minWidth: 100, color: '#8b6fa0' }}>スタッフ</dt>
              <dd style={{ margin: 0 }}>3名</dd>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <dt style={{ minWidth: 100, color: '#8b6fa0' }}>導入プラン</dt>
              <dd style={{ margin: 0 }}>スモールプラン（¥2,480/月）</dd>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <dt style={{ minWidth: 100, color: '#8b6fa0' }}>導入時期</dt>
              <dd style={{ margin: 0 }}>2026年2月</dd>
            </div>
          </dl>
        </section>

        {/* 導入前の課題 */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 22, fontWeight: 400, letterSpacing: 3, marginBottom: 20, color: '#3d2b1f' }}>導入前の課題</h2>
          <div style={{ padding: 24, background: '#fff', borderRadius: 12, border: '1px solid #e8ddd4', fontSize: 14, lineHeight: 1.9, fontFamily: 'sans-serif' }}>
            <ul style={{ margin: 0, paddingLeft: 20, color: '#5a4a3f' }}>
              <li>営業時間外の予約電話が深夜まで続き、スタッフの疲弊が蓄積</li>
              <li>当日キャンセル・ノーショーが月10件以上発生、売上機会損失</li>
              <li>紙カルテの管理が煩雑で、スタッフ間の情報共有不全</li>
              <li>3ヶ月以上来店がない顧客の追跡ができず、離反率38%</li>
              <li>ホットペッパーと自社予約のダブルブッキング事故</li>
            </ul>
          </div>
        </section>

        {/* 成果（数値） */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 22, fontWeight: 400, letterSpacing: 3, marginBottom: 20, color: '#3d2b1f' }}>成果</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16 }}>
            {metrics.map((m) => (
              <div key={m.label} style={{ padding: 20, background: '#fff', borderRadius: 12, border: '1px solid #e8ddd4', textAlign: 'center' }}>
                <p style={{ fontSize: 11, color: '#8b6fa0', fontFamily: 'sans-serif', marginBottom: 8, letterSpacing: 1 }}>{m.label}</p>
                <div style={{ fontSize: 13, color: '#a89e94', fontFamily: 'sans-serif', marginBottom: 4 }}>
                  <span>{m.before}</span>
                  <span style={{ margin: '0 6px', color: '#B8966A' }}>→</span>
                  <span style={{ color: '#7A3550', fontSize: 18, fontWeight: 600 }}>{m.after}</span>
                </div>
                <p style={{ fontSize: 11, color: '#B8966A', fontFamily: 'sans-serif' }}>{m.unit}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 導入タイムライン */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 22, fontWeight: 400, letterSpacing: 3, marginBottom: 20, color: '#3d2b1f' }}>3ヶ月の導入プロセス</h2>
          <div style={{ display: 'grid', gap: 12 }}>
            {timeline.map((t, i) => (
              <div key={i} style={{ padding: 20, background: '#fff', borderRadius: 10, border: '1px solid #e8ddd4', borderLeft: '4px solid #8B7BAA' }}>
                <p style={{ fontSize: 11, color: '#8b6fa0', fontFamily: 'sans-serif', letterSpacing: 2, marginBottom: 4 }}>{t.week}</p>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1A1018', margin: '0 0 6px' }}>{t.title}</h3>
                <p style={{ fontSize: 13, lineHeight: 1.7, color: '#5a4a3f', margin: 0, fontFamily: 'sans-serif' }}>{t.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* コメント */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 22, fontWeight: 400, letterSpacing: 3, marginBottom: 20, color: '#3d2b1f' }}>現場の声</h2>
          <div style={{ display: 'grid', gap: 16 }}>
            {comments.map((c, i) => (
              <div key={i} style={{ padding: 24, background: '#F5E8EE', borderRadius: 12 }}>
                <p style={{ fontSize: 14, lineHeight: 1.9, color: '#3d2b1f', marginBottom: 12, fontFamily: 'sans-serif' }}>「{c.text}」</p>
                <p style={{ fontSize: 12, color: '#7A3550', fontFamily: 'sans-serif', fontWeight: 600 }}>
                  {c.name} <span style={{ color: '#a89e94', fontWeight: 400, marginLeft: 8 }}>/ {c.role}</span>
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: 36, background: '#1A1018', borderRadius: 16, textAlign: 'center', color: '#FAF6EE' }}>
          <h2 style={{ fontSize: 22, fontWeight: 400, letterSpacing: 3, marginBottom: 12 }}>あなたのサロンでも同じ成果を</h2>
          <p style={{ fontSize: 14, opacity: 0.85, marginBottom: 24, fontFamily: 'sans-serif', lineHeight: 1.8 }}>
            14日間無料トライアルで、キレイ鶴見店と同じ機能をお試しください。<br />
            ¥2,480/月のスモールプランで、月¥20,000以上の効率化が見込めます。
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/pricing" style={{
              padding: '14px 32px', background: '#FAF6EE', color: '#1A1018',
              textDecoration: 'none', fontSize: 13, fontWeight: 600, fontFamily: 'sans-serif', borderRadius: 6, letterSpacing: 2,
            }}>料金プラン →</a>
            <a href="/contact" style={{
              padding: '14px 32px', background: 'transparent', color: '#B8966A',
              border: '1px solid #B8966A', textDecoration: 'none', fontSize: 13, fontWeight: 600, fontFamily: 'sans-serif', borderRadius: 6, letterSpacing: 2,
            }}>導入相談する</a>
          </div>
        </section>

        <p style={{ marginTop: 32, fontSize: 12, color: '#999', textAlign: 'center', fontFamily: 'sans-serif' }}>
          ※ 数値は2026年2月〜4月の実測値。サロンの規模・顧客層により成果は異なります。
        </p>
      </article>
    </main>
  );
}
