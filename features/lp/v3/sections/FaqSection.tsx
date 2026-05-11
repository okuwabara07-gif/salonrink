'use client';

import { useState } from 'react';
import Icon from '@/features/lp/v3/components/Icon';
import FadeUp from '@/features/lp/v3/components/FadeUp';

const FAQS = [
  { q: 'Light プラン ¥1,980 で何ができますか？', a: 'AIカルテ・LINE連携・予約管理・顧客管理・前日リマインド・基本機能をご提供します。Standard では HotPepper Beauty 連携と AI カルテ自動生成、Premium では複数店舗管理が追加されます。' },
  { q: '途中で解約できますか？', a: 'いつでも解約可能です。最低契約期間はなく、解約手数料もかかりません。' },
  { q: '既存の予約システムから移行できますか？', a: 'CSVでのインポートに対応しています。導入セットアップは個別にサポートいたしますのでご安心ください。' },
  { q: 'セキュリティは大丈夫ですか？', a: 'AES-256 による暗号化、TLS 1.3 通信、サロン別データ分離（RLS）、Stripe による決済（PCI DSS Level 1 認証）を採用しています。お客様の個人情報を安全にお預かりします。' },
  { q: '対応OS・端末は？', a: 'iOS / Android / PC（Chrome, Safari, Edge 最新版）に対応。お客様側は LINE のみで利用可能です。' },
  { q: 'サポートはありますか？', a: 'メールサポート（support@salonrink.com）にて承ります。導入時は個別にオンラインでセットアップをご案内します。' },
];

export default function FaqSection() {
  const [open, setOpen] = useState(0);
  return (
    <section className="section section-cream" id="faq">
      <div className="container" style={{ maxWidth: 820 }}>
        <FadeUp>
          <div className="eyebrow" style={{ textAlign: 'center', display: 'block' }}>FAQ</div>
        </FadeUp>
        <FadeUp delay={80}>
          <h2 className="h2" style={{ marginTop: 14, textAlign: 'center' }}>
            よくあるご質問
          </h2>
        </FadeUp>
        <div style={{ marginTop: 40 }}>
          {FAQS.map((f, i) => (
            <FadeUp key={i} delay={i * 40}>
              <div className={`faq-item ${open === i ? 'open' : ''}`} onClick={() => setOpen(open === i ? -1 : i)}>
                <div className="faq-q">
                  <span>Q. {f.q}</span>
                  <span className="faq-toggle"><Icon name="plus" size={14} stroke={2.4} /></span>
                </div>
                <div className="faq-a">A. {f.a}</div>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
