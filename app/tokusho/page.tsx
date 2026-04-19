export default function TokushoPage() {
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
        fontWeight: '400',
        letterSpacing: '0.1em',
        borderBottom: '1px solid #c8a97e',
        paddingBottom: '16px',
        marginBottom: '40px',
        color: '#3d2b1f',
      }}>
        特定商取引法に基づく表記
      </h1>

      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '15px',
      }}>
        {[
          ['販売業者', 'AOKAE合同会社'],
          ['運営責任者', '桒原 理'],
          ['所在地', '〒158-0092 東京都世田谷区野毛2丁目28-11 207'],
          ['電話番号', '090-3220-7783（受付時間：平日10:00〜18:00）'],
          ['メールアドレス', 'aokae2020@gmail.com'],
          ['サービス名', 'SALOMÉ（サロメ）- LINE予約自動化SaaS'],
          ['サービスURL', 'https://salonrink.com'],
          ['販売価格', 'ベーシックプラン：¥980/月\nスモールプラン：¥2,480/月\nミディアムプラン：¥3,980/月\n（税込）'],
          ['支払方法', 'クレジットカード（Visa / Mastercard / American Express / JCB）'],
          ['支払時期', 'サブスクリプション登録時および毎月の更新日に自動決済'],
          ['サービス提供時期', 'お支払い完了後、即時利用可能'],
          ['無料トライアル', '初回登録から14日間無料でご利用いただけます。トライアル期間中はいつでもキャンセル可能です。'],
          ['解約・キャンセルについて', 'マイページよりいつでも解約可能です。解約後は次回更新日まで引き続きサービスをご利用いただけます。日割り返金は行っておりません。'],
          ['返金ポリシー', '原則として返金は承っておりません。ただし、サービスに重大な瑕疵があった場合はご相談ください。'],
          ['動作環境', 'インターネット接続環境・LINEアプリが必要です。推奨ブラウザ：Chrome / Safari 最新版'],
        ].map(([label, value]) => (
          <tr key={label} style={{ borderBottom: '1px solid #e8ddd4' }}>
            <th style={{
              textAlign: 'left',
              padding: '16px 20px 16px 0',
              width: '200px',
              verticalAlign: 'top',
              fontWeight: '500',
              fontSize: '14px',
              color: '#8b6fa0',
              whiteSpace: 'nowrap',
            }}>
              {label}
            </th>
            <td style={{
              padding: '16px 0',
              whiteSpace: 'pre-line',
            }}>
              {value}
            </td>
          </tr>
        ))}
      </table>

      <p style={{
        marginTop: '48px',
        fontSize: '13px',
        color: '#888',
        borderTop: '1px solid #e8ddd4',
        paddingTop: '24px',
      }}>
        最終更新日：2026年4月17日
      </p>
    </main>
  );
}
