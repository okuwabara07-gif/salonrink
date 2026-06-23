/* global React, Icon, FadeUp */

// ============ COMPARE (D1) ============
const COMPARE_ROWS = [
  { label: "月額（最小プラン）", us: "¥1,980", a: "¥18,000〜", b: "¥9,800〜" },
  { label: "初期費用", us: "0円", a: "¥50,000", b: "¥30,000" },
  { label: "AIカルテ提案", us: "✓ 標準搭載", a: "—", b: "オプション" },
  { label: "LINE LIFF事前カウンセリング", us: "✓ 標準搭載", a: "—", b: "—" },
  { label: "HPB / 既存予約サイト連携", us: "✓ 双方向同期", a: "片方向のみ", b: "✓" },
  { label: "サポート対応", us: "LINE / 平日24h以内", a: "メール / 3営業日", b: "電話のみ" },
  { label: "解約金", us: "なし", a: "あり（残月数分）", b: "なし" },
];
const Cell = ({ children, kind }) => {
  if (children === "—") return <td style={{ color: "var(--c-fg-4)" }}>—</td>;
  if (kind === "ours") return <td className="ours">{children}</td>;
  return <td>{children}</td>;
};
const CompareSection = () => (
  <section className="section section-soft">
    <div className="container">
      <FadeUp><span className="eyebrow">Compare</span></FadeUp>
      <FadeUp delay={80}>
        <h2 className="h2" style={{ marginTop: 14 }}>正直に、比べてください。</h2>
      </FadeUp>
      <FadeUp delay={140}>
        <p className="lede" style={{ maxWidth: 560 }}>
          競合各社（A社・B社）は実名を伏せています。詳細は資料請求にてお渡しします。
        </p>
      </FadeUp>

      <FadeUp delay={200}>
        <div style={{ marginTop: 32, overflowX: "auto", borderRadius: 16, border: "1px solid var(--c-border)", background: "var(--c-bg-card)" }}>
          <table className="compare-table" style={{ minWidth: 560 }}>
            <thead>
              <tr>
                <th style={{ minWidth: 160 }}> </th>
                <th className="ours-head">SALONRINK</th>
                <th>競合 A社</th>
                <th>競合 B社</th>
              </tr>
            </thead>
            <tbody>
              {COMPARE_ROWS.map((r, i) => (
                <tr key={i}>
                  <td>{r.label}</td>
                  <Cell kind="ours">{r.us}</Cell>
                  <Cell>{r.a}</Cell>
                  <Cell>{r.b}</Cell>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </FadeUp>
      <p style={{ marginTop: 12, fontSize: 11, color: "var(--c-fg-4)" }}>
        ※ 2026年4月時点の各社公式情報を元にSALONRINKが作成。プラン変更により実額と異なる場合があります。
      </p>
    </div>
  </section>
);
window.CompareSection = CompareSection;

// ============ TRUST BADGES (A4) ============
const TRUST = [
  { icon: "lock", t: "SSL / TLS暗号化", d: "全通信を256bit暗号化。" },
  { icon: "card", t: "Stripe決済", d: "PCI DSS Level 1準拠。" },
  { icon: "shield", t: "個人情報保護", d: "プライバシーマーク取得。" },
  { icon: "chat", t: "LINEサポート", d: "平日24時間以内に返信。" },
];
const TrustSection = () => (
  <section className="section">
    <div className="container">
      <FadeUp><span className="eyebrow">Trust & Safety</span></FadeUp>
      <FadeUp delay={80}>
        <h2 className="h2" style={{ marginTop: 14 }}>顧客データを預かるという、責任。</h2>
      </FadeUp>
      <div className="grid-4" style={{ marginTop: 28 }}>
        {TRUST.map((b, i) => (
          <FadeUp key={i} delay={i * 80}>
            <div className="trust">
              <span className="trust-icon"><Icon name={b.icon} size={18} /></span>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{b.t}</div>
              <div style={{ fontSize: 11, color: "var(--c-fg-3)", lineHeight: 1.6 }}>{b.d}</div>
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
  {
    avatar: "個",
    tag: "個人 / 1〜3名",
    h: "ひとりサロンオーナー",
    pains: ["予約の取りこぼしを減らしたい", "事務作業に時間を取られたくない", "高機能ソフトは予算が合わない"],
    sol: "月1,980円 + LINE自動応答で、ひとりでも回るサロンへ。",
  },
  {
    avatar: "中",
    tag: "中規模 / 4〜10名",
    h: "店長・サロンマネージャー",
    pains: ["スタッフ間の情報共有が属人的", "顧客の指名状況を可視化したい", "リピート施策を仕組み化したい"],
    sol: "AIカルテ + ダッシュボードで、店全体の顧客理解を底上げ。",
  },
  {
    avatar: "委",
    tag: "業務委託 / 面貸し",
    h: "フリーランス美容師",
    pains: ["自分の顧客は自分で管理したい", "確定申告の売上集計が大変", "次の独立に備えたい"],
    sol: "個人ID単位で完全独立。データはあなたの資産として持ち出し可能。",
  },
  {
    avatar: "経",
    tag: "複数店舗 / コンサル",
    h: "経営者・FCオーナー",
    pains: ["全店の数字を統合管理したい", "店舗間の比較分析がしたい", "多店舗展開のKPIを揃えたい"],
    sol: "店舗横断ダッシュボードで、ブランド全体の経営判断を一元化。",
  },
];
const PersonaSection = () => (
  <section className="section section-soft">
    <div className="container">
      <FadeUp><span className="eyebrow">For Whom</span></FadeUp>
      <FadeUp delay={80}>
        <h2 className="h2" style={{ marginTop: 14 }}>あなたのサロンに、合いますか？</h2>
      </FadeUp>
      <div style={{
        marginTop: 32,
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: 12,
      }}>
        <div className="grid-2" style={{ gap: 12 }}>
          {PERSONAS.map((p, i) => (
            <FadeUp key={i} delay={i * 80}>
              <div className="persona" style={{ height: "100%" }}>
                <div className="persona-head">
                  <div className="persona-avatar">{p.avatar}</div>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--c-fg-3)", fontWeight: 600 }}>{p.tag}</div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{p.h}</div>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {p.pains.map(x => (
                    <div key={x} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "var(--c-fg-2)" }}>
                      <Icon name="minus" size={14} stroke={2.4} />
                      <span>{x}</span>
                    </div>
                  ))}
                </div>
                <div style={{
                  marginTop: 4, padding: 12,
                  background: "var(--c-accent-soft)", color: "var(--c-accent-strong)",
                  borderRadius: 10, fontSize: 13, fontWeight: 600, lineHeight: 1.6,
                }}>
                  → {p.sol}
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </div>
  </section>
);
window.PersonaSection = PersonaSection;

// ============ PRICING ============
const PRICING = [
  {
    name: "Lite",
    price: "1,980",
    sub: "個人サロン向け",
    feat: ["LINE予約 / カウンセリング", "顧客カルテ（手動）", "売上サマリ", "メール・LINEサポート"],
    cta: "Liteで始める",
  },
  {
    name: "Standard",
    price: "4,980",
    sub: "もっとも選ばれているプラン",
    feat: ["Liteの全機能", "AIカルテ自動構造化", "ダッシュボード（リアルタイム）", "スタッフ無制限", "HPB双方向連携"],
    cta: "Standardで始める",
    featured: true,
  },
  {
    name: "Pro",
    price: "9,800",
    sub: "複数店舗・コンサル向け",
    feat: ["Standardの全機能", "店舗横断レポート", "API / Webhook", "専任CS担当", "SLA 99.9%"],
    cta: "問い合わせる",
  },
];
const PricingSection = ({ onCta }) => (
  <section className="section" id="pricing">
    <div className="container">
      <FadeUp><span className="eyebrow">Pricing</span></FadeUp>
      <FadeUp delay={80}>
        <h2 className="h2" style={{ marginTop: 14 }}>シンプルな、3プラン。</h2>
      </FadeUp>
      <FadeUp delay={140}>
        <p className="lede" style={{ maxWidth: 560 }}>
          すべてのプランで14日間無料体験。期間中の解約は無料・データは即座に削除します。
        </p>
      </FadeUp>

      <div className="grid-3" style={{ marginTop: 32 }}>
        {PRICING.map((p, i) => (
          <FadeUp key={p.name} delay={i * 100}>
            <div className={`price ${p.featured ? "price-featured" : ""}`} style={{ height: "100%", display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 12, color: "var(--c-fg-3)", fontWeight: 700 }}>{p.sub}</div>
              <div style={{ fontWeight: 800, fontSize: 24, marginTop: 4 }}>{p.name}</div>
              <div style={{ marginTop: 16, display: "flex", alignItems: "baseline", gap: 4 }}>
                <span className="num" style={{ fontSize: 14, fontWeight: 700 }}>¥</span>
                <span className="num" style={{ fontSize: 44, fontWeight: 800, lineHeight: 1, letterSpacing: "-0.04em" }}>
                  {p.price}
                </span>
                <span style={{ fontSize: 12, color: "var(--c-fg-3)" }}>/ 月（税抜）</span>
              </div>
              <div style={{ height: 1, background: "var(--c-border)", margin: "20px 0" }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
                {p.feat.map(f => (
                  <div key={f} style={{ display: "flex", gap: 10, fontSize: 13, color: "var(--c-fg-2)" }}>
                    <Icon name="check" size={16} stroke={2.4} /> {f}
                  </div>
                ))}
              </div>
              <button onClick={onCta}
                className={`btn ${p.featured ? "btn-primary" : "btn-ghost"} btn-block btn-lg`}
                style={{ marginTop: 20 }}>
                {p.cta}
              </button>
            </div>
          </FadeUp>
        ))}
      </div>
    </div>
  </section>
);
window.PricingSection = PricingSection;

// ============ FAQ ============
const FAQ = [
  { q: "本当に無料体験中の請求はありませんか？", a: "はい。14日経過後、自動課金は一切発生せず、継続のご意思をいただいた場合のみ有料プランに移行します。" },
  { q: "既存のLINE公式アカウントで使えますか？", a: "もちろんです。1クリックでお持ちのLINE公式アカウントと連携できます。アカウントをお持ちでない場合も、無料発行を専任CSがサポートします。" },
  { q: "ホットペッパービューティーとの併用はできますか？", a: "はい。HPB側の予約データは双方向で同期されます。HPB経由のお客様もSALONRINKのAIカルテで一元管理できます。" },
  { q: "顧客データの所有権は？退会時はどうなりますか？", a: "顧客データの所有権はサロン様に帰属します。退会時はCSV / JSONで全データを書き出し、サーバ上のデータは7日以内に物理削除します。" },
  { q: "スタッフが何人でも、料金は変わりませんか？", a: "Standardプラン以上は、スタッフ何人でも追加料金なしです。Liteプランは3名までです。" },
  { q: "導入の研修・サポートはありますか？", a: "Standard以上は、Zoomオンボーディング（60分）が無料で付きます。導入後もLINE / メールで平日24時間以内に返信する専任サポートが伴走します。" },
];
const FaqSection = () => {
  const [open, setOpen] = React.useState(0);
  return (
    <section className="section section-soft" id="faq">
      <div className="container">
        <FadeUp><span className="eyebrow">FAQ</span></FadeUp>
        <FadeUp delay={80}>
          <h2 className="h2" style={{ marginTop: 14 }}>よくあるご質問</h2>
        </FadeUp>
        <div style={{ marginTop: 24, maxWidth: 800 }}>
          {FAQ.map((f, i) => (
            <FadeUp key={i} delay={i * 40}>
              <div className={`faq-item ${open === i ? "open" : ""}`} onClick={() => setOpen(open === i ? -1 : i)}>
                <div className="faq-q">
                  <span>{f.q}</span>
                  <span className="faq-toggle">+</span>
                </div>
                <div className="faq-a">{f.a}</div>
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
  <section className="section section-dark">
    <div className="container" style={{ textAlign: "center" }}>
      <FadeUp>
        <span className="eyebrow" style={{ color: "var(--c-accent)" }}>Get Started</span>
      </FadeUp>
      <FadeUp delay={80}>
        <h2 className="h2" style={{ marginTop: 14, color: "#fafafa", fontSize: "clamp(28px, 6vw, 48px)" }}>
          紙カルテと電話の往復は、<br />
          今夜で終わりにしませんか？
        </h2>
      </FadeUp>
      <FadeUp delay={140}>
        <p className="lede" style={{ color: "#bcbcc4", maxWidth: 560, margin: "16px auto 0" }}>
          14日間、すべての機能を無料でお試しいただけます。
        </p>
      </FadeUp>
      <FadeUp delay={220}>
        <div style={{ marginTop: 32, display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <button className="btn btn-primary btn-lg" onClick={onCta}>
            無料ではじめる <Icon name="arrow" size={16} />
          </button>
          <button className="btn btn-lg" style={{
            background: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,0.25)",
          }}>
            <Icon name="line" size={16} /> LINEで相談する
          </button>
        </div>
      </FadeUp>
    </div>
  </section>
);
window.FinalCta = FinalCta;

// ============ FOOTER ============
const Footer = () => (
  <footer style={{
    background: "var(--c-bg)",
    borderTop: "1px solid var(--c-border)",
    padding: "48px 0 32px",
    fontSize: 13,
  }}>
    <div className="container" style={{ display: "grid", gridTemplateColumns: "1fr", gap: 32 }}>
      <div>
        <div className="nav-logo" style={{ fontSize: 18 }}>
          <span className="nav-logo-mark">S</span> SALONRINK
        </div>
        <p style={{ marginTop: 12, color: "var(--c-fg-3)", lineHeight: 1.7, maxWidth: 360 }}>
          サロン運営に必要なすべてを、ひとつのLINEに。
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 32 }}>
        {[
          { t: "プロダクト", l: ["機能一覧", "料金", "アップデート", "ロードマップ"] },
          { t: "リソース", l: ["導入事例", "ヘルプセンター", "ブログ", "API ドキュメント"] },
          { t: "会社", l: ["会社概要", "採用情報", "ニュース", "お問い合わせ"] },
          { t: "法務", l: ["利用規約", "プライバシーポリシー", "特商法表記", "セキュリティ"] },
        ].map(c => (
          <div key={c.t}>
            <div style={{ fontWeight: 700, fontSize: 12, color: "var(--c-fg-3)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              {c.t}
            </div>
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
              {c.l.map(x => <a key={x} href="#" style={{ color: "var(--c-fg-2)" }}>{x}</a>)}
            </div>
          </div>
        ))}
      </div>
    </div>
    <div className="container" style={{
      marginTop: 32, paddingTop: 24, borderTop: "1px solid var(--c-border)",
      display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12,
      color: "var(--c-fg-4)", fontSize: 11,
    }}>
      <span>© 2026 SALONRINK Inc.</span>
      <span>Designed in Tokyo · Made for Salons.</span>
    </div>
  </footer>
);
window.Footer = Footer;

// ============ FIXED UI ============
const StickyCTA = ({ onCta }) => (
  <div className="sticky-cta">
    <button className="btn btn-ghost" style={{ flex: 1 }}>
      <Icon name="line" size={16} /> LINEで相談
    </button>
    <button className="btn btn-primary" style={{ flex: 1 }} onClick={onCta}>
      14日間無料 <Icon name="arrow" size={14} />
    </button>
  </div>
);
window.StickyCTA = StickyCTA;

const FloatingLine = () => (
  <a className="fab" href="#"
    style={{ background: "var(--c-accent)" }}
    aria-label="LINEで相談">
    <Icon name="line" size={28} />
  </a>
);
window.FloatingLine = FloatingLine;
