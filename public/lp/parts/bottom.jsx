/* global React, Icon, FadeUp */
const { useState } = React;

// ============ COMPARE TABLE ============
const COMPARE_ROWS = [
  ["AIカルテ自動生成", true, false, false],
  ["LINE LIFFカウンセリング", true, false, true],
  ["アレルギー情報自動表示", true, false, false],
  ["予約・売上の一元管理", true, true, false],
  ["初期費用", "0円〜", "数千円〜", "0円〜"],
  ["最短契約期間", "なし", "あり", "なし"],
  ["月額（税込）", "¥1,980〜", "¥3,000〜¥10,000", "¥3,000〜¥5,000"],
];
const Cell = ({ v }) => {
  if (v === true)  return <Icon name="check" size={18} stroke={2.4} />;
  if (v === false) return <span style={{ color: "var(--c-fg-4)" }}>—</span>;
  return <span style={{ fontWeight: 600 }}>{v}</span>;
};
const CompareSection = () => (
  <section className="section section-cream">
    <div className="container">
      <FadeUp>
        <div className="eyebrow" style={{ textAlign: "center", display: "block" }}>COMPARE</div>
      </FadeUp>
      <FadeUp delay={80}>
        <h2 className="h2" style={{ marginTop: 14, textAlign: "center" }}>
          他社サービスとの比較
        </h2>
      </FadeUp>
      <FadeUp delay={140}>
        <div className="compare-wrap" style={{ marginTop: 36, overflowX: "auto" }}>
          <table className="compare-table">
            <thead>
              <tr>
                <th></th>
                <th className="ours-col">SalonRink</th>
                <th>従来型A社</th>
                <th>予約系B社</th>
              </tr>
            </thead>
            <tbody>
              {COMPARE_ROWS.map((row, i) => (
                <tr key={i}>
                  <td>{row[0]}</td>
                  <td className="ours-col"><Cell v={row[1]} /></td>
                  <td><Cell v={row[2]} /></td>
                  <td><Cell v={row[3]} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ fontSize: 11, color: "var(--c-fg-3)", marginTop: 16, textAlign: "center", lineHeight: 1.7 }}>
            ※ 他社の価格・機能は各社公開情報をもとにした参考値です<br />
            ※ プラン構成は各社改定の可能性があります。最新情報は各社公式サイトをご確認ください
          </div>
        </div>
      </FadeUp>
    </div>
  </section>
);
window.CompareSection = CompareSection;

// ============ TRUST BADGES ============
const TRUST = [
  { i: "lock", t: "暗号化保存", d: "AES-256で個人情報を保護" },
  { i: "card", t: "決済はStripe", d: "PCI DSS Level 1認証" },
  { i: "shield", t: "サロン別データ分離", d: "RLSによる厳格な分離" },
  { i: "key", t: "Magic Link認証", d: "パスワードレス認証" },
];
const TrustSection = () => (
  <section className="section section-soft">
    <div className="container">
      <FadeUp>
        <h2 className="h2" style={{ textAlign: "center", fontSize: "clamp(22px, 4vw, 32px)" }}>
          安心して使える、確かなセキュリティ
        </h2>
      </FadeUp>
      <div className="grid-4" style={{ marginTop: 32 }}>
        {TRUST.map((t, i) => (
          <FadeUp key={i} delay={i * 60}>
            <div className="trust-card">
              <span className="trust-icon"><Icon name={t.i} size={20} /></span>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{t.t}</div>
              <div style={{ fontSize: 11, color: "var(--c-fg-3)" }}>{t.d}</div>
            </div>
          </FadeUp>
        ))}
      </div>
    </div>
  </section>
);
window.TrustSection = TrustSection;

// ============ PERSONA ============
const PERSONAS = [
  { ph: "個人美容師がスマホを見ている写真", t: "個人事業主・フリーランス美容師", d: "シンプルなプランから始めて、自分のペースで運用できます。" },
  { ph: "中規模サロンチームの集合写真", t: "中規模サロン（4〜10名）", d: "スタッフ間の引き継ぎとカルテ共有を一元化。" },
  { ph: "コンサルが店舗運営を分析している写真", t: "経営コンサル・複数店舗", d: "店舗横断の数値比較・経営判断をサポート。" },
];
const PersonaSection = () => (
  <section className="section section-cream">
    <div className="container">
      <FadeUp>
        <div className="eyebrow" style={{ textAlign: "center", display: "block" }}>FOR WHO</div>
      </FadeUp>
      <FadeUp delay={80}>
        <h2 className="h2" style={{ marginTop: 14, textAlign: "center" }}>
          こんなサロンに、<br />選ばれています。
        </h2>
      </FadeUp>
      <div className="grid-3" style={{ marginTop: 40 }}>
        {PERSONAS.map((p, i) => (
          <FadeUp key={i} delay={i * 80}>
            <div className="prob">
              <div className="prob-img">
                <image-slot id={`persona-${i}`} placeholder={p.ph} />
              </div>
              <div className="prob-body" style={{ textAlign: "left", padding: 22 }}>
                <div className="h3" style={{ fontSize: 18, marginBottom: 8 }}>{p.t}</div>
                <p style={{ color: "var(--c-fg-3)", fontSize: 13, lineHeight: 1.85, margin: 0, fontFamily: "var(--f-body)", fontWeight: 400 }}>{p.d}</p>
              </div>
            </div>
          </FadeUp>
        ))}
      </div>
    </div>
  </section>
);
window.PersonaSection = PersonaSection;

// ============ PRICING ============
const PricingSection = ({ onCta }) => (
  <section className="section section-soft" id="pricing">
    <div className="container">
      <FadeUp>
        <div className="eyebrow" style={{ textAlign: "center", display: "block" }}>PRICING</div>
      </FadeUp>
      <FadeUp delay={80}>
        <h2 className="h2" style={{ marginTop: 14, textAlign: "center" }}>
          シンプルで、わかりやすい料金。
        </h2>
      </FadeUp>
      <FadeUp delay={140}>
        <div className="price-card" style={{ marginTop: 40 }}>
          <div>
            <div className="eyebrow">All-in-one</div>
            <div className="price-name" style={{ marginTop: 8 }}>Standard プラン</div>
            <div style={{ fontSize: 13, color: "var(--c-fg-3)", marginTop: 6 }}>
              全機能フル装備・スタッフ無制限
            </div>
          </div>
          <div className="price-amount">
            <span className="num">1,980</span><span className="yen">円 / 月</span>
            <span className="tax">税込</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {["AIカルテ・LINE連携 すべて", "初期費用 0円・契約期間なし", "14日間 無料トライアル"].map(t => (
              <div key={t} style={{ display: "flex", gap: 8, fontSize: 13, color: "var(--c-fg-2)" }}>
                <span className="checkrow-dot"><Icon name="check" size={12} stroke={2.4}/></span>{t}
              </div>
            ))}
            <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={onCta}>
              無料ではじめる <Icon name="arrowRight" size={14} />
            </button>
          </div>
        </div>
      </FadeUp>
    </div>
  </section>
);
window.PricingSection = PricingSection;

// ============ FAQ ============
const FAQS = [
  { q: "Core プラン¥1,980で何ができますか？", a: "Coreプランは予約管理・基本AIカルテ・LINE連携の基本機能をご提供します。ホットペッパー連携やAdvanced AI などはADD-onとして追加可能です。Set B(¥2,980)が独立サロン様には人気です。" },
  { q: "途中で解約できますか？", a: "いつでも解約可能です。最低契約期間はなく、解約手数料もかかりません。" },
  { q: "既存の予約システムから移行できますか？", a: "CSVでのインポートに対応しています。専任スタッフが移行をサポートしますのでご安心ください。" },
  { q: "セキュリティは大丈夫ですか？", a: "AES-256での暗号化、Stripeによる決済（PCI DSS Level 1認証）、サロン単位での厳格なデータ分離（RLS）を採用しています。" },
  { q: "対応OS・端末は？", a: "iOS / Android / PC（Chrome, Safari, Edge最新版）に対応。お客様側はLINEのみで利用可能です。" },
  { q: "サポートはありますか？", a: "LINEチャットサポートを平日10:00-19:00で提供。導入時は専任スタッフがオンラインでセットアップをご案内します。" },
];
const FaqSection = () => {
  const [open, setOpen] = useState(0);
  return (
    <section className="section section-cream" id="faq">
      <div className="container" style={{ maxWidth: 820 }}>
        <FadeUp>
          <div className="eyebrow" style={{ textAlign: "center", display: "block" }}>FAQ</div>
        </FadeUp>
        <FadeUp delay={80}>
          <h2 className="h2" style={{ marginTop: 14, textAlign: "center" }}>よくあるご質問</h2>
        </FadeUp>
        <div style={{ marginTop: 40 }}>
          {FAQS.map((f, i) => (
            <FadeUp key={i} delay={i * 40}>
              <div className={`faq-item ${open === i ? "open" : ""}`} onClick={() => setOpen(open === i ? -1 : i)}>
                <div className="faq-q">
                  <span>Q. {f.q}</span>
                  <span className="faq-toggle"><Icon name="plus" size={14} stroke={2.4}/></span>
                </div>
                <div className="faq-a">A. {f.a}</div>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
};
window.FaqSection = FaqSection;

// ============ FINAL CTA ============
const FinalCta = ({ onCta }) => (
  <section className="section section-soft" style={{ paddingBottom: 120 }}>
    <div className="container" style={{ maxWidth: 760, textAlign: "center" }}>
      <FadeUp>
        <div className="eyebrow">START FREE</div>
      </FadeUp>
      <FadeUp delay={80}>
        <h2 className="h2" style={{ marginTop: 16, fontSize: "clamp(28px, 6vw, 48px)" }}>
          サロンの未来を、<br />
          いま、はじめる。
        </h2>
      </FadeUp>
      <FadeUp delay={140}>
        <p className="lede" style={{ marginTop: 18 }}>
          14日間の無料トライアル。最短契約期間なし。
        </p>
      </FadeUp>
      <FadeUp delay={200}>
        <div style={{ display: "flex", gap: 12, marginTop: 32, justifyContent: "center", flexWrap: "wrap" }}>
          <button className="btn btn-primary btn-lg" onClick={onCta}>
            14日間無料で試す <Icon name="arrowRight" size={14} />
          </button>
          <button className="btn btn-ghost btn-lg" onClick={onCta}>
            <span className="btn-line-icon" style={{ background: "#06c755" }}>L</span> LINEで相談する
          </button>
        </div>
      </FadeUp>
    </div>
  </section>
);
window.FinalCta = FinalCta;

// ============ FOOTER ============
const Footer = () => (
  <footer className="footer">
    <div className="container" style={{ display: "grid", gap: 32, gridTemplateColumns: "1fr" }}>
      <div style={{ display: "grid", gap: 28, gridTemplateColumns: "1fr" }}>
        <div>
          <div className="nav-logo" style={{ color: "var(--c-bg)" }}>
            <span className="logo-mark" /> SalonRink<small>.com</small>
          </div>
          <p style={{ color: "var(--c-fg-4)", marginTop: 14, lineHeight: 1.85, fontSize: 13 }}>
            美容室のためのAIカルテSaaS。<br />サロンとお客様を、もっと近くに。
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 24 }}>
          <div>
            <div style={{ fontWeight: 600, marginBottom: 12, color: "var(--c-bg)", fontSize: 13 }}>Product</div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              <li><a href="#features">機能</a></li>
              <li><a href="#plans">プラン</a></li>
              <li><a href="#pricing">料金</a></li>
              <li><a href="#faq">FAQ</a></li>
              <li><a href="#">導入事例</a></li>
            </ul>
          </div>
          <div>
            <div style={{ fontWeight: 600, marginBottom: 12, color: "var(--c-bg)", fontSize: 13 }}>Company</div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              <li><a href="/company">運営会社</a></li>
              <li><a href="/legal/tokushoho">特定商取引法に基づく表記</a></li>
              <li><a href="/legal/privacy">プライバシーポリシー</a></li>
              <li><a href="/legal/terms">利用規約</a></li>
              <li><a href="/contact">お問い合わせ</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div style={{ borderTop: "1px solid #322a21", paddingTop: 20, fontSize: 11, color: "var(--c-fg-4)", lineHeight: 1.85 }}>
        <strong style={{ color: "var(--c-bg)" }}>運営会社：</strong> AOKAE合同会社 / 〒{"{POSTAL_CODE}"} {"{ADDRESS}"} / 代表社員 {"{REPRESENTATIVE_NAME}"} / お問い合わせ: support@salonrink.com / 営業時間 {"{BUSINESS_HOURS}"}
      </div>
    </div>
    <div className="container" style={{ marginTop: 32, paddingTop: 20, borderTop: "1px solid #322a21", fontSize: 12, color: "var(--c-fg-4)", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
      <span>© 2026 AOKAE合同会社 All rights reserved.</span>
      <span>Made with care in Tokyo</span>
    </div>
  </footer>
);
window.Footer = Footer;

// ============ STICKY CTA + FAB ============
const StickyCta = ({ onCta }) => (
  <div className="sticky-cta">
    <button className="btn btn-ghost" onClick={onCta}>
      <span className="btn-line-icon">L</span>LINE相談
    </button>
    <button className="btn btn-primary" onClick={onCta}>
      無料ではじめる <Icon name="arrowRight" size={14} />
    </button>
  </div>
);
const FabLine = ({ onCta }) => (
  <button className="fab" onClick={onCta} aria-label="LINE">
    <Icon name="line" size={28} />
  </button>
);
window.StickyCta = StickyCta;
window.FabLine = FabLine;
