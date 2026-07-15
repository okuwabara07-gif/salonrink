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
          ['運営責任者', '代表社員'],
          ['所在地', '東京都'],
          ['電話番号', '（非公開）（受付時間：平日10:00〜18:00）'],
          ['メールアドレス', 'info@aokae.net'],
          ['サービス名', 'SalonRink（サロンリンク）- LINE予約自動化SaaS'],
          ['サービス内容', '美容サロン向けのLINE予約自動化・顧客管理・リマインド送信機能を提供するクラウドサービス'],
          ['サービスURL', 'https://salonrink.com'],
          ['販売価格', '■ 月額プラン（税込・初期費用なし）\n  - Light（ライト）: 月額 ¥1,980\n  - Standard（スタンダード）: 月額 ¥2,980\n  - Premium（プレミアム）: 月額 ¥4,580\n\n■ 無料トライアル\n  全プラン14日間無料。期間中に解約された場合、料金は発生しません。\n\n※ 表示価格はすべて税込です。請求は登録時および毎月の更新日に自動決済されます。'],
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

      <h2 style={{
        fontSize: '18px',
        fontWeight: '400',
        letterSpacing: '0.1em',
        borderBottom: '1px solid #c8a97e',
        paddingBottom: '16px',
        marginTop: '60px',
        marginBottom: '40px',
        color: '#3d2b1f',
      }}>
        ■ 一般のお客様向けデジタルサービス（LINEミニアプリ）
      </h2>

      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '15px',
      }}>
        {[
          ['サービス名', 'AIビューティーコンシェルジュ（LINEミニアプリ）'],
          ['サービス内容', '髪質・白髪・ネイル・頭皮・パーソナルカラー診断、ビューティー占い、ケア記録、事前カルテ、診断連動EC。※一部の機能・商品は順次提供予定です。'],
          ['サービスURL', 'https://salonrink.com/neo/miniapp.html'],
          ['販売価格（税込）', '■ ご利用サービス\n  - AI相談（深掘り相談）: ¥110 / 1回\n  - クレジット（AI相談5回分）: ¥500\n  - ビューティー占い 1日券: ¥55 / 日（購入当日23:59 日本時間まで有効）\n\n■ ミニアプリ会員プラン（税込・初期費用なし）\n  - 月額: ¥480 / 月\n  - 年額: ¥3,980 / 年\n  - 特典: AI相談 月5回・診断結果の保存枠拡大・ビューティー占い全機能'],
          ['支払方法', 'クレジットカード（Stripe決済経由）'],
          ['支払時期', '申込時に決済。ミニアプリ会員プランは登録時および更新日（月額は毎月・年額は毎年）に自動決済されます'],
          ['サービス提供時期', '決済完了後、ただちに利用が可能になります'],
          ['返金ポリシー', '■ AI相談・クレジット・1日券\n  提供開始後の返金は承ることができません。\n\n■ ミニアプリ会員プラン\n  解約手続き完了後、次回更新日以降の請求が停止されます。日割り返金は行いません。'],
          ['クレジット有効期限', 'クレジット（AI相談5回分）の有効期限はありません'],
          ['サイト内Stripe物販', '■ 送料\n  ¥700（小計5,000円以上で無料・未満は一律）\n\n■ 引き渡し時期\n  決済確認後7日以内に発送\n\n■ 返品・不良品対応\n  不良品は商品到着後7日以内のご連絡で交換対応いたします。お客様都合の返品は承ることができません'],
          ['BASE販売', 'オンラインストア（BASE）での販売商品の送料・お届け時期・不良品対応については、BASE側の特定商取引法表示が適用されます'],
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

      <div style={{
        marginTop: '48px',
        fontSize: '13px',
        color: '#888',
        borderTop: '1px solid #e8ddd4',
        paddingTop: '24px',
      }}>
        <p>最終更新日：2026年7月15日</p>
        <p style={{marginTop: '12px'}}>
          個人情報保護方針については<a href="/privacy" style={{color: '#8b6fa0', textDecoration: 'underline'}}>プライバシーポリシー</a>をご覧ください。
        </p>
      </div>
    </main>
  );
}
