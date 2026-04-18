export default function PrivacyPage() {
  const sections: { title: string; body: string | string[] }[] = [
    {
      title: '1. 事業者情報',
      body: [
        '事業者名：AOKAE LLC',
        '所在地：〒158-0092 東京都世田谷区野毛2丁目28-11 207',
        '連絡先：aokae2020@gmail.com',
      ],
    },
    {
      title: '2. 取得する個人情報',
      body: [
        '当社が運営するSALOMÉ（以下「本サービス」）では、以下の情報を取得します。',
        '・サロン事業者情報：サロン名、担当者名、電話番号、メールアドレス、ホットペッパービューティーのサロンページURL、サロンボードのiCal URL',
        '・顧客情報：氏名、来店日時、施術メニュー、施術履歴、LINE ID、ポイント残高',
        '・決済情報：Stripe社を通じた決済状況（カード番号は当社では保持しません）',
        '・利用情報：アクセスログ、Cookie、IPアドレス、ブラウザ種別、利用機能の履歴',
      ],
    },
    {
      title: '3. 利用目的',
      body: [
        '・本サービスの提供、運営、改善',
        '・予約データの同期およびLINEを通じた自動メッセージ送信',
        '・顧客カルテ、ポイント、売上レポート等の生成',
        '・料金の請求および決済処理',
        '・お問い合わせへの対応',
        '・サービス品質向上のための統計分析（個人を特定しない形で行います）',
        '・重要なお知らせ、メンテナンス情報、アップデート情報の通知',
      ],
    },
    {
      title: '4. 第三者提供',
      body: [
        '当社は、以下の場合を除き、取得した個人情報を第三者に提供しません。',
        '・ご本人の同意がある場合',
        '・法令に基づく場合',
        '・人の生命・身体・財産の保護のために必要な場合',
        '・業務委託先（Stripe、Supabase、Vercel、LINE、Railway等）に利用目的の達成に必要な範囲で委託する場合',
      ],
    },
    {
      title: '5. 業務委託先',
      body: [
        '本サービスの運営にあたり、以下の事業者に一部業務を委託しています。',
        '・Stripe, Inc.（決済処理）',
        '・Supabase Inc.（データベース、認証）',
        '・Vercel Inc.（ホスティング）',
        '・LINEヤフー株式会社（LINE Messaging API）',
        '・Railway Corporation（バックエンドAPI）',
        '・Google LLC（解析、広告配信）',
      ],
    },
    {
      title: '6. Cookie・広告配信',
      body: [
        '本サービスでは、利便性向上およびアクセス解析のためCookieを使用します。',
        'また、第三者配信の広告サービス（Google AdSense）を利用しており、Cookieを使用して閲覧情報に基づく広告を配信する場合があります。',
        'Cookieの無効化はブラウザの設定から行えますが、一部機能が利用できなくなる場合があります。',
      ],
    },
    {
      title: '7. 安全管理措置',
      body: [
        '取得した個人情報は、不正アクセス、漏えい、滅失、き損の防止のために必要かつ適切な技術的・組織的な安全管理措置を講じます。',
        '通信はTLSで暗号化し、データベースへのアクセスは権限管理により制限されます。',
      ],
    },
    {
      title: '8. 開示・訂正・削除',
      body: [
        'ご本人からの個人情報の開示、訂正、利用停止、削除のご請求には、法令に基づき適切に対応します。',
        'ご請求は本ページ記載の連絡先までお問い合わせください。',
      ],
    },
    {
      title: '9. 免責事項',
      body: [
        '本サービスは、ホットペッパービューティーおよびサロンボード（株式会社リクルート提供）の運営会社とは一切関係ありません。',
        '本サービスのご利用にあたり、各外部サービスの利用規約の遵守はお客様ご自身の責任となります。',
      ],
    },
    {
      title: '10. 改定',
      body: [
        '本プライバシーポリシーの内容は、法令の変更やサービス内容の変更等に伴い、予告なく変更する場合があります。',
        '重要な変更があった場合は、本サービス上で通知します。',
      ],
    },
    {
      title: '11. お問い合わせ',
      body: [
        '個人情報の取扱いに関するお問い合わせは、下記までご連絡ください。',
        'AOKAE LLC',
        'メール：aokae2020@gmail.com',
        '電話：090-3220-7783（受付時間：平日10:00〜18:00）',
      ],
    },
  ]

  return (
    <main style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '60px 24px',
      fontFamily: 'Georgia, "Noto Serif JP", serif',
      color: '#2d2d2d',
      lineHeight: '1.8',
    }}>
      <h1 style={{
        fontSize: '22px',
        fontWeight: 400,
        letterSpacing: '0.1em',
        borderBottom: '1px solid #c8a97e',
        paddingBottom: '16px',
        marginBottom: '32px',
        color: '#3d2b1f',
      }}>
        プライバシーポリシー
      </h1>

      <p style={{ fontSize: 14, color: '#555', marginBottom: 40 }}>
        AOKAE LLC（以下「当社」）は、本サービス「SALOMÉ」（SalonRink）におけるお客様の個人情報の取扱いについて、以下のとおりプライバシーポリシーを定めます。
      </p>

      {sections.map(s => (
        <section key={s.title} style={{ marginBottom: 32 }}>
          <h2 style={{
            fontSize: 15,
            fontWeight: 500,
            color: '#8b6fa0',
            marginBottom: 12,
            letterSpacing: '0.05em',
          }}>
            {s.title}
          </h2>
          {Array.isArray(s.body) ? (
            s.body.map((line, i) => (
              <p key={i} style={{ fontSize: 14, margin: '6px 0', whiteSpace: 'pre-line' }}>{line}</p>
            ))
          ) : (
            <p style={{ fontSize: 14, whiteSpace: 'pre-line' }}>{s.body}</p>
          )}
        </section>
      ))}

      <p style={{
        marginTop: 48,
        fontSize: 13,
        color: '#888',
        borderTop: '1px solid #e8ddd4',
        paddingTop: 24,
      }}>
        制定日：2026年4月18日
      </p>

      <p style={{ marginTop: 24, fontSize: 12 }}>
        <a href="/" style={{ color: '#8b6fa0', textDecoration: 'none' }}>← トップページに戻る</a>
      </p>
    </main>
  )
}
