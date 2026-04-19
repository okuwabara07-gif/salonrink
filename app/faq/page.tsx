import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'よくあるご質問 | SalonRink',
  description: 'SalonRink導入・運用に関するよくあるご質問。料金・解約・LINE連携・データ移行・サポートまで、サロンオーナー様からの疑問にお答えします。',
  alternates: { canonical: 'https://salonrink.com/faq' },
};

const categories = [
  {
    name: '料金・契約',
    items: [
      { q: '14日間無料トライアルにクレジットカードは必要ですか?', a: '必要です。トライアル期間中に解約されれば一切課金は発生しません。カード登録によって、トライアル期間終了後もスムーズに継続利用いただけます。' },
      { q: 'プランの変更はできますか?', a: 'いつでも可能です。アップグレードは即時反映、ダウングレードは次回更新日に反映されます。マイページから手続きできます。' },
      { q: '解約手続きはどうすればよいですか?', a: 'マイページの「契約情報」から1クリックで解約できます。次回更新日まではご利用いただけ、それ以降の課金は発生しません。' },
      { q: '返金はありますか?', a: '日割り返金は原則行っておりません。ただし、サービスの重大な瑕疵による場合はご相談ください。' },
      { q: '契約期間の縛りはありますか?', a: 'ありません。全プラン月額課金・いつでも解約OKです。' },
      { q: '複数サロンで利用したい場合は?', a: '店舗ごとに契約が必要です。複数店舗割引（3店舗以上で10%OFF）をご用意しています。お問い合わせください。' },
    ],
  },
  {
    name: 'LINE・予約',
    items: [
      { q: 'LINE公式アカウントは自前で用意する必要がありますか?', a: 'はい。既存のアカウントを連携するか、無料で新規作成いただけます。登録サポートも提供しています。' },
      { q: 'ホットペッパービューティーとの連携はできますか?', a: 'ミディアムプラン以上で可能です。ダブルブッキングを自動防止します。' },
      { q: '予約変更・キャンセルの通知はどうなりますか?', a: 'LINEで自動通知されます。サロン側のLINEにも即時に反映されます。' },
      { q: 'LINEリッチメニューのデザインは?', a: 'テンプレートから選択いただくか、オリジナルデザインに対応（ミディアムプラン）。' },
    ],
  },
  {
    name: '顧客管理・カルテ',
    items: [
      { q: '既存の顧客データ（紙カルテ等）を移行できますか?', a: 'CSVインポート機能で一括移行可能です。ご契約後、データ移行サポートも承ります。' },
      { q: '顧客情報の保管期限は?', a: '契約期間中は無制限。解約後は30日間データ保管、その後削除されます。' },
      { q: 'プライバシー・個人情報保護は?', a: '個人情報保護法に則り、AWS東京リージョンで暗号化保管。プライバシーポリシーをご確認ください。' },
    ],
  },
  {
    name: '機能・使い方',
    items: [
      { q: 'スマホでも利用できますか?', a: 'はい、スマホ・タブレットからもWebブラウザでフル機能利用可能です。専用アプリは不要です。' },
      { q: '複数スタッフでの利用は可能?', a: 'スモールプラン（3名まで）・ミディアムプラン（10名まで）で対応。権限管理も可能です。' },
      { q: '売上レポートはどのような形式で?', a: '日次・月次・年次のグラフ表示、CSV出力、freee/マネーフォワード連携対応（ミディアムプラン）。' },
      { q: '初期設定のサポートはありますか?', a: '全プランにメールサポートあり。ミディアムプランは専属担当による初期設定サポートを含みます。' },
    ],
  },
  {
    name: 'サポート・その他',
    items: [
      { q: '障害発生時の対応は?', a: 'ステータスページで稼働状況を公開。重大な障害は30分以内に一次連絡、12時間以内に復旧を目指します。' },
      { q: '問い合わせの返信速度は?', a: 'ベーシック・スモール: 平日24時間以内。ミディアム: 平日4時間以内（緊急時は営業時間内即時）。' },
      { q: '海外のサロンでも使えますか?', a: '現在は日本国内のみ対応です。将来的に多言語対応を計画しています。' },
    ],
  },
];

export default function FaqPage() {
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

      <article style={{ maxWidth: 820, margin: '0 auto', padding: '60px 24px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <p style={{ fontSize: 12, letterSpacing: 4, color: '#B8966A', fontFamily: 'sans-serif', textTransform: 'uppercase', marginBottom: 12 }}>FAQ</p>
          <h1 style={{ fontSize: 36, fontWeight: 300, letterSpacing: 3, color: '#1A1018', marginBottom: 12 }}>よくあるご質問</h1>
          <p style={{ fontSize: 14, color: '#7A6E64', fontFamily: 'sans-serif' }}>
            サロンオーナー様からよくいただくご質問をまとめました
          </p>
        </div>

        {categories.map((cat) => (
          <section key={cat.name} style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 20, fontWeight: 400, letterSpacing: 3, marginBottom: 20, color: '#3d2b1f', paddingBottom: 10, borderBottom: '1px solid #c8a97e' }}>
              {cat.name}
            </h2>
            <div style={{ display: 'grid', gap: 10 }}>
              {cat.items.map((item, i) => (
                <details key={i} style={{ padding: 18, background: '#fff', borderRadius: 10, border: '1px solid #e8ddd4' }}>
                  <summary style={{ fontSize: 14, fontWeight: 600, color: '#1A1018', cursor: 'pointer', fontFamily: 'sans-serif' }}>
                    {item.q}
                  </summary>
                  <p style={{ fontSize: 13, lineHeight: 1.8, color: '#5a4a3f', marginTop: 12, fontFamily: 'sans-serif' }}>
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </section>
        ))}

        <section style={{ marginTop: 48, padding: 32, background: '#1A1018', borderRadius: 12, textAlign: 'center', color: '#FAF6EE' }}>
          <h2 style={{ fontSize: 18, fontWeight: 400, letterSpacing: 2, marginBottom: 12 }}>解決しないご質問は</h2>
          <p style={{ fontSize: 13, opacity: 0.85, marginBottom: 20, fontFamily: 'sans-serif', lineHeight: 1.8 }}>
            上記に記載のない内容は、お気軽にお問い合わせください。
          </p>
          <a href="/contact" style={{
            display: 'inline-block', padding: '12px 28px', background: '#FAF6EE', color: '#1A1018',
            textDecoration: 'none', fontSize: 13, fontWeight: 600, fontFamily: 'sans-serif', borderRadius: 6,
          }}>お問い合わせ →</a>
        </section>
      </article>
    </main>
  );
}
