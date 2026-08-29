/* global React, Icon, FadeUp, AnimatedNum */
const { useState, useRef, useEffect } = React;

// ============ LOGO STRIP ============
// 実導入サロン名・メディア掲載は書面許諾取得後に追加
const LOGOS = []; // 実導入サロンから書面許諾取得後に追加
const LogoStrip = () => {
  if (LOGOS.length === 0) return null;
  return (
    <section className="logo-strip">
      <div className="container">
        <div className="logo-strip-label">導入サロン例</div>
        <div className="logo-strip-inner">
          {LOGOS.map(l => <span key={l} className="logo-pill">{l}</span>)}
        </div>
      </div>
    </section>
  );
};
window.LogoStrip = LogoStrip;

// ============ FEATURE BENTO ============
// 上段=大2 / 中段=中3 / 下段=小3 + その他リスト
const FEAT_LARGE = [
  {
    i: "brain", t: "AIカルテ自動生成", d: "会話から自動でカルテを整理",
    ph: "iPadでAIカルテを操作する美容師（左に人物、右にUI画面）"
  },
  {
    i: "chat", t: "LINEカウンセリング", d: "事前回答でカウンセリングを時短に",
    ph: "iPhoneでLINE LIFFを開く美容師（左に人物、右にチャット画面）"
  },
];
const FEAT_MID = [
  { i: "shield", t: "アレルギー情報自動表示", d: "施術リスクを事前に確認", ph: "iPadでアレルギー情報を確認する美容師" },
  { i: "calendar", t: "予約管理", d: "ダブルブッキングを防止し\nスムーズな予約運用を実現", ph: "予約カレンダーUI（2024年6月）" },
  { i: "folder", t: "顧客履歴一元管理", d: "写真・施術履歴・メモを\nすべて一元管理", ph: "顧客プロフィール画面 / 山田 花子" },
];
const FEAT_SMALL_LEFT = {
  i: "chart", t: "売上ダッシュボード", d: "リアルタイムでサロンの状況を可視化",
  ph: "売上推移グラフ・売上¥1,250,000・新規342名・リピート62%・リターン62%"
};
const FEAT_SMALL_MID = {
  i: "spark", t: "AIメニュー提案", d: "次回施術の提案を自動でサポート",
  ph: "おすすめメニューカード: 髪質改善トリートメント"
};
const FEAT_OTHERS = [
  { i: "card", t: "オンライン決済", d: "Stripe連携" },
  { i: "menu", t: "リマインド配信", d: "LINE自動送信" },
  { i: "lock", t: "権限管理", d: "スタッフ別アクセス" },
  { i: "star", t: "口コミ収集", d: "Google連動" },
  { i: "arrowRight", t: "API連携", d: "他SaaSと接続" },
];

const FeatCard = ({ f, size, slotId, children }) => (
  <div className={`feat-bento feat-bento-${size}`}>
    <div className="feat-bento-head">
      <span className="feat-bento-icon"><Icon name={f.i} size={18}/></span>
      <div>
        <div className="feat-bento-title">{f.t}</div>
        <div className="feat-bento-desc">{f.d.split("\n").map((l, i) => <div key={i}>{l}</div>)}</div>
      </div>
    </div>
    {children ?? (
      <div className="feat-bento-media">
        <image-slot id={slotId} placeholder={f.ph} />
      </div>
    )}
  </div>
);

const FeatureGrid = () => (
  <section className="section section-cream">
    <div className="container">
      <FadeUp>
        <div className="eyebrow" style={{ textAlign: "center", display: "block" }}>FEATURES</div>
      </FadeUp>
      <FadeUp delay={80}>
        <h2 className="h2" style={{ marginTop: 14, textAlign: "center" }}>
          サロン運営に必要な機能、<br />すべてが一つに。
        </h2>
      </FadeUp>
      <FadeUp delay={120}>
        <p style={{ textAlign: "center", marginTop: 18, color: "var(--c-fg-3)", lineHeight: 1.85 }}>
          サロンワークの悩みを、もっと自然に。<br />LINEだけで、ここまで変わる。
        </p>
      </FadeUp>

      {/* 上段：大2 */}
      <div className="feat-bento-row feat-bento-row-large" style={{ marginTop: 48 }}>
        {FEAT_LARGE.map((f, i) => (
          <FadeUp key={i} delay={200 + i * 180}>
            <FeatCard f={f} size="lg" slotId={`feat-lg-${i}`} />
          </FadeUp>
        ))}
      </div>

      {/* 中段：中3 */}
      <div className="feat-bento-row feat-bento-row-mid" style={{ marginTop: 24 }}>
        {FEAT_MID.map((f, i) => (
          <FadeUp key={i} delay={600 + i * 150}>
            <FeatCard f={f} size="md" slotId={`feat-md-${i}`} />
          </FadeUp>
        ))}
      </div>

      {/* 下段：小3 (売上 / AI提案 / その他リスト) */}
      <div className="feat-bento-row feat-bento-row-small" style={{ marginTop: 24 }}>
        <FadeUp delay={1100}>
          <FeatCard f={FEAT_SMALL_LEFT} size="sm" slotId="feat-sm-0" />
        </FadeUp>
        <FadeUp delay={1250}>
          <FeatCard f={FEAT_SMALL_MID} size="sm" slotId="feat-sm-1" />
        </FadeUp>
        <FadeUp delay={1400}>
          <div className="feat-bento feat-bento-sm feat-bento-list">
            <div className="feat-bento-head">
              <span className="feat-bento-icon"><Icon name="menu" size={18}/></span>
              <div>
                <div className="feat-bento-title">その他の機能</div>
                <div className="feat-bento-desc">サロン運営を支える機能群</div>
              </div>
            </div>
            <ul className="feat-bento-ul">
              {FEAT_OTHERS.map((o, i) => (
                <li key={i}>
                  <span className="feat-bento-ul-icon"><Icon name={o.i} size={12}/></span>
                  <span className="feat-bento-ul-t">{o.t}</span>
                  <span className="feat-bento-ul-d">（{o.d}）</span>
                </li>
              ))}
            </ul>
          </div>
        </FadeUp>
      </div>
    </div>
  </section>
);
window.FeatureGrid = FeatureGrid;

// ============ BEFORE / AFTER SLIDER ============
const BeforeAfter = () => {
  const [pos, setPos] = useState(50);
  const [editing, setEditing] = useState(null);
  const wrapRef = useRef(null);
  const dragging = useRef(false);

  const updateFromEvent = (e) => {
    const rect = wrapRef.current.getBoundingClientRect();
    const x = (e.touches?.[0]?.clientX ?? e.clientX) - rect.left;
    setPos(Math.max(4, Math.min(96, (x / rect.width) * 100)));
  };
  useEffect(() => {
    const move = (e) => { if (dragging.current) updateFromEvent(e); };
    const up = () => { dragging.current = false; };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    window.addEventListener("touchmove", move);
    window.addEventListener("touchend", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", up);
    };
  }, []);

  return (
    <section className="section section-soft">
      <div className="container">
        <FadeUp>
          <div className="eyebrow" style={{ textAlign: "center", display: "block" }}>BEFORE / AFTER</div>
        </FadeUp>
        <FadeUp delay={80}>
          <h2 className="h2" style={{ marginTop: 14, textAlign: "center" }}>
            紙のカルテと、AIカルテ。<br />差は、これくらい違う。
          </h2>
        </FadeUp>
        <FadeUp delay={140}>
          <div
            ref={wrapRef}
            className="ba-wrap"
            style={{ "--ba-pos": `${pos}%`, marginTop: 40 }}
          >
            <div
              className={`ba-side ba-before ${editing === "before" ? "ba-edit" : ""}`}
              onClick={() => setEditing("before")}
            >
              <img src="assets/ba-before.png" alt="紙のカルテ" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </div>
            <div
              className={`ba-side ba-after ${editing === "after" ? "ba-edit" : ""}`}
              onClick={() => setEditing("after")}
            >
              <img src="assets/ba-after.png" alt="AIカルテ" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </div>
            <div className="ba-label l" onClick={() => setEditing(editing === "before" ? null : "before")} style={{ cursor: "pointer" }}>BEFORE 紙カルテ</div>
            <div className="ba-label r" onClick={() => setEditing(editing === "after" ? null : "after")} style={{ cursor: "pointer" }}>AFTER SalonRink</div>
            <div
              className="ba-handle"
              onMouseDown={(e) => { e.stopPropagation(); dragging.current = true; setEditing(null); updateFromEvent(e); }}
              onTouchStart={(e) => { e.stopPropagation(); dragging.current = true; setEditing(null); updateFromEvent(e); }}
            />
          </div>
        </FadeUp>
        <FadeUp delay={200}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 28, maxWidth: 720, marginLeft: "auto", marginRight: "auto" }}>
            {[
              { v: 15, s: "分→3分", l: "カウンセリング時間 ※1" },
              { v: 0, s: "→大幅減", l: "聞き漏れリスク ※1" },
              { v: 75, s: "%", l: "業務時間削減 ※1" },
            ].map((k, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div className="num" style={{ fontFamily: "var(--f-num)", fontSize: 32, color: "var(--c-accent-2)" }}>
                  <AnimatedNum value={k.v} /><small style={{ fontSize: 14, marginLeft: 2 }}>{k.s}</small>
                </div>
                <div style={{ fontSize: 11, color: "var(--c-fg-3)", marginTop: 4 }}>{k.l}</div>
              </div>
            ))}
          </div>
        </FadeUp>
        <FadeUp delay={260}>
          <div style={{ fontSize: 11, color: "var(--c-fg-3)", marginTop: 20, textAlign: "center", lineHeight: 1.7, maxWidth: 720, marginLeft: "auto", marginRight: "auto" }}>
            ※1 ベータ参加サロンへの聞き取りに基づくモデル値です。<br />実際の効果はサロン規模・運用方法により異なり、結果を保証するものではありません。
          </div>
        </FadeUp>
      </div>
    </section>
  );
};
window.BeforeAfter = BeforeAfter;

// ============ ROI SIMULATOR ============
const RoiSim = ({ onCta }) => {
  const [staff, setStaff] = useState(5);
  const [revenue, setRevenue] = useState(300);
  // assumption: 75% time saved on counseling/karte = ~10h/week per stylist
  // hourly cost ~3000円 → savings/month ~3000*10*4 per staff
  const monthlySavings = staff * 3000 * 10 * 4;
  const monthlyCost = 1980;
  const repeatLift = revenue * 10000 * 0.15; // 15% repeat lift
  const total = monthlySavings + repeatLift - monthlyCost;
  return (
    <section className="section section-cream">
      <div className="container">
        <FadeUp>
          <div className="eyebrow" style={{ textAlign: "center", display: "block" }}>ROI SIMULATOR</div>
        </FadeUp>
        <FadeUp delay={80}>
          <h2 className="h2" style={{ marginTop: 14, textAlign: "center" }}>
            あなたのサロンで、<br />どれくらい変わる？
          </h2>
        </FadeUp>
        <FadeUp delay={140}>
          <div className="roi-card" style={{ marginTop: 40 }}>
            <div>
              <div className="roi-input-row">
                <label>スタッフ数 <span className="val" style={{ whiteSpace: "nowrap", display: "inline-flex", alignItems: "baseline" }}>{staff}<small style={{fontSize: 12, marginLeft: 2, color: "var(--c-fg-3)"}}>名</small></span></label>
                <input className="roi-slider" type="range" min={1} max={20} value={staff} onChange={e => setStaff(+e.target.value)} />
              </div>
              <div className="roi-input-row">
                <label>月商 <span className="val" style={{ whiteSpace: "nowrap", display: "inline-flex", alignItems: "baseline" }}>{revenue}<small style={{fontSize: 12, marginLeft: 2, color: "var(--c-fg-3)"}}>万円</small></span></label>
                <input className="roi-slider" type="range" min={50} max={2000} step={10} value={revenue} onChange={e => setRevenue(+e.target.value)} />
              </div>
              <div style={{ fontSize: 11, color: "var(--c-fg-3)", marginTop: 18, lineHeight: 1.7 }}>
                ※ 業務時間削減（時給3,000円換算）+ リピート率15%向上 を仮定した試算値です<br />
                ※ 実際の効果はサロン規模・運用方法により異なり、結果を保証するものではありません<br />
                ※ 時給単価および向上率はベータ期間中の検証データに基づくモデル値
              </div>
            </div>
            <div className="roi-divider" />
            <div className="roi-result">
              <div style={{ fontSize: 12, color: "var(--c-fg-3)", letterSpacing: "0.16em" }}>月間メリット試算</div>
              <div className="roi-big">
                +¥<AnimatedNum value={Math.round(total / 1000) * 1000} />
              </div>
              <div style={{ fontSize: 12, color: "var(--c-fg-3)", textAlign: "center", lineHeight: 1.7 }}>
                時間削減: ¥{monthlySavings.toLocaleString()}<br />
                売上UP: ¥{Math.round(repeatLift).toLocaleString()}<br />
                月額: -¥{monthlyCost.toLocaleString()}
              </div>
              <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={onCta}>
                14日間無料で試す <Icon name="arrowRight" size={14}/>
              </button>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
};
window.RoiSim = RoiSim;

// ============ MULTIPLE PLANS (v6.1) ============
const PLANS = [
  {
    name: "Light",
    desc: "シンプルに始めたいサロン向け",
    monthly: 1980, yearly: 1584,
    feats: ["予約管理・顧客管理", "LINE公式アカウント連携", "基本AIカルテ", "前日リマインド自動配信"]
  },
  {
    name: "Standard",
    desc: "売上を伸ばしたいサロン向け",
    monthly: 2980, yearly: 2384,
    featured: true,
    feats: ["Lightの全機能", "AIカルテ自動生成・提案", "ホットペッパー Beauty 連携", "AI接客スクリプト", "ケア事項お知らせ"]
  },
  {
    name: "Premium",
    desc: "本格的に運用したいサロン向け",
    monthly: 4580, yearly: 3664,
    feats: ["Standardの全機能", "全機能フル装備", "マルチ店舗管理対応", "スタッフ無制限", "優先サポート"]
  },
];
const PlansSection = ({ onCta }) => {
  const [yearly, setYearly] = useState(false);
  return (
    <section className="section section-soft" id="plans">
      <div className="container">
        <FadeUp>
          <div className="eyebrow" style={{ textAlign: "center", display: "block" }}>PLANS</div>
        </FadeUp>
        <FadeUp delay={80}>
          <h2 className="h2" style={{ marginTop: 14, textAlign: "center" }}>
            規模にあわせて、選べる3プラン。
          </h2>
        </FadeUp>
        <FadeUp delay={140}>
          <div style={{ textAlign: "center", marginTop: 32 }}>
            <div className="plan-tabs">
              <button className={`plan-tab ${!yearly ? "active" : ""}`} onClick={() => setYearly(false)}>月払い</button>
              <button className={`plan-tab ${yearly ? "active" : ""}`} onClick={() => setYearly(true)}>年払い -20%</button>
            </div>
          </div>
        </FadeUp>
        <FadeUp delay={200}>
          <div className="plans-grid" style={{ marginTop: 24 }}>
            {PLANS.map(p => (
              <div key={p.name} className={`plan-card ${p.featured ? "featured" : ""}`}>
                {p.featured && <div className="plan-badge">おすすめ</div>}
                <div>
                  <div className="plan-name">{p.name}</div>
                  <div className="plan-desc" style={{ marginTop: 6 }}>{p.desc}</div>
                </div>
                <div className="plan-price">
                  <span style={{ fontSize: 14, marginRight: 4 }}>¥</span>
                  <span className="num">{(yearly ? p.yearly : p.monthly).toLocaleString()}</span>
                  <span style={{ fontSize: 13, color: "var(--c-fg-3)", marginLeft: 4 }}>/月（税込）</span>
                </div>
                <div className="plan-feats">
                  {p.feats.map(f => (
                    <div key={f} className="plan-feat-row">
                      <span className="checkrow-dot" style={{ width: 16, height: 16, flexShrink: 0 }}>
                        <Icon name="check" size={10} stroke={2.6}/>
                      </span> {f}
                    </div>
                  ))}
                </div>
                <button className={`btn ${p.featured ? "btn-primary" : "btn-ghost"} btn-block`} onClick={onCta}>
                  {p.featured ? "無料ではじめる" : "このプランを選ぶ"}
                </button>
              </div>
            ))}
          </div>
        </FadeUp>
        <FadeUp delay={260}>
          <div style={{ textAlign: "center", marginTop: 24, fontSize: 12, color: "var(--c-fg-3)" }}>
            すべてのプランに14日間無料トライアルが付帯。
          </div>
        </FadeUp>
      </div>
    </section>
  );
};
window.PlansSection = PlansSection;

// ============ INTEGRATIONS ============
// 実装済み: LINE / Stripe
// 実装中: ホットペッパー Beauty (近日対応)
// それ以外は API・Webhook 経由で接続可能
const INTEGS = [
  { n: "LINE", s: "available" },
  { n: "Stripe", s: "available" },
  { n: "ホットペッパー Beauty", s: "soon" },
];
const Integrations = () => (
  <section className="section section-cream">
    <div className="container">
      <FadeUp>
        <div className="eyebrow" style={{ textAlign: "center", display: "block" }}>INTEGRATIONS</div>
      </FadeUp>
      <FadeUp delay={80}>
        <h2 className="h2" style={{ marginTop: 14, textAlign: "center" }}>
          いま使っているツールと、シームレスに。
        </h2>
      </FadeUp>
      <FadeUp delay={140}>
        <div className="integ-grid" style={{ marginTop: 36 }}>
          {INTEGS.map(({ n, s }) => (
            <div key={n} className="integ-cell" style={{ position: "relative" }}>
              {n}
              {s === "soon" && (
                <span style={{ position: "absolute", top: 6, right: 6, fontSize: 9, padding: "2px 6px", borderRadius: 999, background: "var(--c-cream)", color: "var(--c-accent-2)", fontWeight: 600, letterSpacing: "0.04em" }}>近日対応</span>
              )}
            </div>
          ))}
        </div>
      </FadeUp>
      <FadeUp delay={200}>
        <div style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: "var(--c-fg-3)" }}>
          その他のサービスは API・Webhook 経由で接続可能です。
        </div>
      </FadeUp>
    </div>
  </section>
);
window.Integrations = Integrations;

// ============ CASE STUDIES ============
const CASES = []; // 実顧客導入後・書面許諾取得後に追加
const CasesSection = () => {
  if (CASES.length === 0) return null;
  return (
  <section className="section section-soft">
    <div className="container">
      <FadeUp>
        <div className="eyebrow" style={{ textAlign: "center", display: "block" }}>CASE STUDIES</div>
      </FadeUp>
      <FadeUp delay={80}>
        <h2 className="h2" style={{ marginTop: 14, textAlign: "center" }}>
          導入事例
        </h2>
      </FadeUp>
      <div className="grid-3" style={{ marginTop: 40 }}>
        {CASES.map((c, i) => (
          <FadeUp key={i} delay={i * 80}>
            <div className="case-card">
              <div className="case-img"><image-slot id={`case-${i}`} placeholder={c.ph} /></div>
              <div className="case-body">
                <div className="case-tag">{c.tag}</div>
                <h3 className="h3" style={{ fontSize: 18 }}>{c.title}</h3>
                <div style={{ fontSize: 12, color: "var(--c-fg-3)" }}>{c.salon}</div>
                <div className="case-stats">
                  {c.stats.map(([v, l], j) => (
                    <div key={j}>
                      <div className="case-stat-num">{v}</div>
                      <div className="case-stat-label">{l}</div>
                    </div>
                  ))}
                </div>
                <a href="#" style={{ color: "var(--c-accent-2)", fontSize: 12, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
                  事例の続きを読む <Icon name="arrowRight" size={12} stroke={2}/>
                </a>
              </div>
            </div>
          </FadeUp>
        ))}
      </div>
    </div>
  </section>
  );
};
window.CasesSection = CasesSection;

// ============ VIDEO DEMO ============
const VideoDemo = ({ onCta }) => (
  <section className="section section-cream">
    <div className="container">
      <FadeUp>
        <div className="eyebrow" style={{ textAlign: "center", display: "block" }}>VIDEO TOUR</div>
      </FadeUp>
      <FadeUp delay={80}>
        <h2 className="h2" style={{ marginTop: 14, textAlign: "center" }}>
          90秒で分かる、SalonRink。
        </h2>
      </FadeUp>
      <FadeUp delay={140}>
        <div style={{ marginTop: 36, maxWidth: 980, margin: "36px auto 0" }}>
          <div className="video-frame">
            <video
              src="assets/video-tour.mp4"
              autoPlay
              muted
              loop
              playsInline
              controls
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", position: "absolute", inset: 0 }}
            />
          </div>
          <div style={{ textAlign: "center", marginTop: 20 }}>
            <button className="btn btn-ghost" onClick={onCta}>担当者によるオンラインデモを予約 <Icon name="arrowRight" size={14}/></button>
          </div>
        </div>
      </FadeUp>
    </div>
  </section>
);
window.VideoDemo = VideoDemo;

// ============ LEAD GEN BANNER (資料DL + ウェビナー) ============
const LeadBanner = ({ onCta }) => (
  <section className="section section-soft">
    <div className="container">
      <FadeUp>
        <div className="lead-banner">
          <div>
            <div className="eyebrow" style={{ color: "var(--c-bg)", opacity: 0.6 }}>FREE RESOURCES</div>
            <h3 style={{ marginTop: 12 }}>
              3分でわかる資料 & <br />
              週次オンライン説明会も開催中。
            </h3>
            <p style={{ color: "var(--c-fg-4)", fontSize: 13, lineHeight: 1.85, marginTop: 14 }}>
              機能・料金・導入事例をまとめた32ページ資料を無料配布。毎週水曜 14:00 から30分のオンライン説明会も開催しています。
            </p>
          </div>
          <div className="lead-banner-actions">
            <button className="btn btn-primary btn-lg" onClick={onCta}>
              📄 資料を無料DLする
            </button>
            <button className="btn btn-ghost btn-lg" onClick={onCta}>
              📅 ウェビナーに申し込む
            </button>
          </div>
        </div>
      </FadeUp>
    </div>
  </section>
);
window.LeadBanner = LeadBanner;
