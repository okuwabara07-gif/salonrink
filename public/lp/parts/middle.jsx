/* global React, Icon, FadeUp, AnimatedNum */

// ============ PROBLEMS ============
const PROBLEMS_SMALL = [
  {
    icon: "users",
    ph: "引き継ぎで困っている美容師2人",
    t: "引き継ぎが\n毎回バラバラ",
    d: "口頭やメモだけの引き継ぎで、\n伝え漏れがないかいつも不安..."
  },
  {
    icon: "clock",
    ph: "LINE・紙・スマホで情報がバラバラな美容師",
    t: "LINE・紙・口頭管理で\n情報が散らばる",
    d: "お客様情報がバラバラで、\n伝えるのに時間がかかり、\n業務が止まってしまう..."
  },
];

const ProblemSection = () =>
<section className="section section-soft">
    <div className="container" style={{ maxWidth: 1080 }}>
      <FadeUp>
        <div className="eyebrow" style={{ textAlign: "center", display: "block" }}>PROBLEM</div>
      </FadeUp>
      <FadeUp delay={80}>
        <h2 className="h2" style={{ marginTop: 14, textAlign: "center" }}>
          毎日のサロンワーク、<br />
          こんな<span className="accent">不安</span>ありませんか？
        </h2>
      </FadeUp>
      <FadeUp delay={140}>
        <p style={{ textAlign: "center", marginTop: 18, color: "var(--c-fg-3)", lineHeight: 1.85 }}>
          多くの美容師さんが、日々の業務の中でこんな悩みを感じています。
        </p>
      </FadeUp>

      {/* 大カード */}
      <FadeUp delay={200}>
        <div className="prob-main" style={{ marginTop: 48 }}>
          <div className="prob-main-text">
            <FadeUp delay={400}>
              <span className="prob-icon"><Icon name="alert" size={22}/></span>
            </FadeUp>
            <FadeUp delay={550}>
              <h3 className="prob-main-title">
                施術前の確認、<br />本当にこれで大丈夫？
              </h3>
            </FadeUp>
            <FadeUp delay={750}>
              <p className="prob-main-desc">
                アレルギーや体調の情報を<br />毎回確認するのが不安...
              </p>
            </FadeUp>
          </div>
          <div className="prob-main-img">
            <image-slot id="prob-main" placeholder="iPadを見ながら不安そうな表情の美容師（自然光のサロン）" />
          </div>
        </div>
      </FadeUp>

      {/* 小カード2枚 */}
      <div className="prob-pair" style={{ marginTop: 24 }}>
        {PROBLEMS_SMALL.map((p, i) =>
          <FadeUp key={i} delay={950 + i * 250}>
            <div className="prob-sub">
              <div className="prob-sub-text">
                <FadeUp delay={1100 + i * 250}>
                  <span className="prob-icon"><Icon name={p.icon} size={18}/></span>
                </FadeUp>
                <FadeUp delay={1250 + i * 250}>
                  <h4 className="prob-sub-title">
                    {p.t.split("\n").map((l, j) => <div key={j}>{l}</div>)}
                  </h4>
                </FadeUp>
                <FadeUp delay={1400 + i * 250}>
                  <p className="prob-sub-desc">
                    {p.d.split("\n").map((l, j) => (
                      <React.Fragment key={j}>{j > 0 && <br/>}{l}</React.Fragment>
                    ))}
                  </p>
                </FadeUp>
              </div>
              <div className="prob-sub-img">
                <image-slot id={`prob-sub-${i}`} placeholder={p.ph} />
              </div>
            </div>
          </FadeUp>
        )}
      </div>

      {/* 次セクションへの導線 */}
      <FadeUp delay={2000}>
        <div className="prob-arrow">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12l7 7 7-7"/>
          </svg>
          <p className="prob-cta">
            その悩み、<span className="prob-cta-brand">SalonRink</span>がまるごと解決します。
          </p>
        </div>
      </FadeUp>
    </div>
  </section>;

window.ProblemSection = ProblemSection;

// ============ SOLUTION 4 PILLARS ============
const PILLARS = [
{ icon: "brain", t: ["AIが質問を整理し", "申告内容を自動構造化"] },
{ icon: "folder", t: ["カルテを自動生成・", "履歴を一元管理"] },
{ icon: "chart", t: ["再来店・売上に繋がる", "リピート分析"] },
{ icon: "lock", t: ["個人情報は安全に", "暗号化して保護"] }];

const SolutionSection = () =>
<section className="section section-cream" id="features">
    <div className="container">
      <FadeUp>
        <h2 className="h2" style={{ textAlign: "center" }}>
          そのすべて、SalonRinkが<span className="accent">解決</span>します。
        </h2>
      </FadeUp>
      <div className="grid-4" style={{ marginTop: 48 }}>
        {PILLARS.map((p, i) =>
      <FadeUp key={i} delay={i * 80}>
            <div className="pillar">
              <span className="pillar-icon"><img src={`assets/icon-${p.icon}.png`} alt="" style={{ width: 84, height: 84, objectFit: "contain" }} /></span>
              <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.7 }}>
                {p.t.map((l, j) => <div key={j}>{l}</div>)}
              </div>
            </div>
          </FadeUp>
      )}
      </div>
    </div>
  </section>;

window.SolutionSection = SolutionSection;

// ============ FEATURE SPLIT — AI Karte ============
const AiKarteSection = () =>
<section className="section section-soft">
    <div className="container">
      <div className="split">
        <FadeUp>
          <div className="split-img">
            <image-slot id="karte-img" placeholder="美容師がお客様にカウンセリングしている温かい写真" />
          </div>
        </FadeUp>
        <FadeUp delay={120}>
          <div>
            <div className="eyebrow">01 / AI Karte</div>
            <h2 className="h2" style={{ marginTop: 16 }}>
              AIがつくる、<br />
              <span className="underline-accent">あなただけのカルテ</span>。
            </h2>
            <p className="lede" style={{ marginTop: 18 }}>
              事前カウンセリングをAIが自動構造化。ご申告内容を整理して、より丁寧な接客をサポートします。
            </p>
            <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 10 }}>
              {["施術履歴・写真・好みを自動構造化", "ご申告アレルギー情報を施術前に自動表示", "次回来店時の参考メニューを提案"].map((t) =>
            <div key={t} style={{ display: "flex", gap: 10, fontSize: 14, color: "var(--c-fg-2)" }}>
                  <span className="checkrow-dot" style={{ marginTop: 2 }}><Icon name="check" size={12} stroke={2.4} /></span> {t}
                </div>
            )}
            </div>
          </div>
        </FadeUp>
      </div>
    </div>
  </section>;

window.AiKarteSection = AiKarteSection;

// ============ FEATURE SPLIT — LINE ============
const LineSection = () =>
<section className="section section-cream">
    <div className="container">
      <div className="split reverse">
        <FadeUp>
          <div className="split-img" style={{ background: "var(--c-bg-2)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <div className="phone-frame">
              <div className="phone-screen" style={{ minHeight: 460 }}>
                <FullChatMock />
              </div>
            </div>
          </div>
        </FadeUp>
        <FadeUp delay={120}>
          <div>
            <div className="eyebrow">02 / LINE LIFF</div>
            <h2 className="h2" style={{ marginTop: 16 }}>
              すべて<span className="underline-accent">LINEで完結</span>。<br />
              お客様もスタッフも、　　迷わない。
            </h2>
            <p className="lede" style={{ marginTop: 18 }}>
              事前カウンセリング・予約・リマインド・アフターケア。お客様は普段使うLINEから抜け出さずに完結します。
            </p>
            <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 10 }}>
              {["LIFF事前カウンセリング（来店前アンケート）", "予約・変更・リマインドの自動配信", "AIまとめをその場で表示・共有"].map((t) =>
            <div key={t} style={{ display: "flex", gap: 10, fontSize: 14, color: "var(--c-fg-2)" }}>
                  <span className="checkrow-dot" style={{ marginTop: 2 }}><Icon name="check" size={12} stroke={2.4} /></span> {t}
                </div>
            )}
            </div>
          </div>
        </FadeUp>
      </div>
    </div>
  </section>;


const FullChatMock = () => {
  const ref = React.useRef(null);
  const [step, setStep] = React.useState(0);
  const [started, setStarted] = React.useState(false);

  // 6 steps total: 0=nothing, 1=them1, 2=you1, 3=them2, 4=chips, 5=ai
  React.useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && !started) {
          setStarted(true);
          io.disconnect();
        }
      });
    }, { threshold: 0.4 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [started]);

  React.useEffect(() => {
    if (!started) return;
    const delays = [400, 700, 900, 700, 900]; // ms between each step
    let cancelled = false;
    let i = 0;
    const tick = () => {
      if (cancelled) return;
      i += 1;
      setStep(i);
      if (i < delays.length) {
        setTimeout(tick, delays[i]);
      }
    };
    setTimeout(tick, delays[0]);
    return () => { cancelled = true; };
  }, [started]);

  const Item = ({ visible, children, style }) => (
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(8px)",
      transition: "opacity .35s ease, transform .35s ease",
      ...style,
    }}>{children}</div>
  );

  return (
    <div ref={ref} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "0 4px 8px", borderBottom: "1px solid #d8dde0", fontSize: 13, fontWeight: 600 }}>
        <span>SalonRink</span><span>⋯</span>
      </div>
      <Item visible={step >= 1}>
        <div className="chat-row them"><div className="bubble">カラー施術前のカウンセリング、ご回答ください 😊</div></div>
      </Item>
      <Item visible={step >= 2}>
        <div className="chat-row you"><div className="bubble you">アンケートを始める</div></div>
      </Item>
      <Item visible={step >= 3}>
        <div className="chat-row them"><div className="bubble">Q. 過去にカラーで頭皮にかゆみや赤みは出ましたか？</div></div>
      </Item>
      <Item visible={step >= 4}>
        <div style={{ display: "flex", gap: 6, padding: "0 8px" }}>
          <button style={chipStyle}>はい</button>
          <button style={chipStyle}>いいえ</button>
        </div>
      </Item>
      <Item visible={step >= 5}>
        <div className="ai-card">
          <div className="ai-tag">∨ AIまとめ</div>
          <div className="ai-warn"><span className="ai-warn-icon">i</span>過去の申告内容を表示</div>
          <div style={{ fontSize: 11, color: "var(--c-fg-3)", marginTop: 6, lineHeight: 1.7 }}>
            お客様が過去にご申告された内容を整理しています。<br />施術前にスタイリストへご相談ください。
          </div>
          <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, fontWeight: 600, color: "var(--c-accent-2)" }}>
            詳細を確認する <Icon name="arrowRight" size={12} stroke={2} />
          </div>
        </div>
      </Item>
    </div>
  );
};

const chipStyle = { flex: 1, height: 36, borderRadius: 999, border: "1px solid #d8dde0", background: "#fff", fontSize: 13, fontWeight: 600, fontFamily: "inherit" };
window.LineSection = LineSection;

// ============ STAFF SPLIT — Dashboard ============
const DashboardSection = () =>
<section className="section section-soft">
    <div className="container">
      <div className="split">
        <FadeUp>
          <div className="split-img">
            <image-slot id="dash-img" placeholder="ノートPCを見ながら経営判断する美容師オーナーの写真" />
          </div>
        </FadeUp>
        <FadeUp delay={120}>
          <div>
            <div className="eyebrow">03 / Operations</div>
            <h2 className="h2" style={{ marginTop: 16 }}>
              数字で見る、<br />
              <span className="underline-accent">サロンの今</span>。
            </h2>
            <p className="lede" style={{ marginTop: 18 }}>
              売上・予約・指名・客単価をリアルタイムに可視化。経営判断のスピードが変わります。
            </p>
            <div style={{ marginTop: 28, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[
            { v: 75, s: "%", l: "業務時間削減 ※1" },
            { v: 2.3, s: "x", l: "リピート率 向上 ※1" },
            { v: 14, s: "日", l: "無料トライアル" },
            { v: 1980, s: "円〜", l: "月額（税込）" }].
            map((k, i) =>
            <div key={i}>
                  <div className="kpi-num" style={{ fontSize: 44 }}>
                    <AnimatedNum value={k.v} /><small>{k.s}</small>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--c-fg-3)", marginTop: 4 }}>{k.l}</div>
                </div>
            )}
            </div>
            <div style={{ fontSize: 11, color: "var(--c-fg-3)", marginTop: 24, lineHeight: 1.7 }}>
              ※1 ベータ参加サロンへの聞き取りに基づくモデル値です。<br />
              個別の導入結果はサロン規模・運用方法により異なります。
            </div>
          </div>
        </FadeUp>
      </div>
    </div>
  </section>;

window.DashboardSection = DashboardSection;

// ============ STEPS ============
const STEPS = [
{ n: "01", t: "LINEで友だち追加", d: "お客様にQRを案内するだけ。" },
{ n: "02", t: "お客様が質問に回答", d: "事前カウンセリングを送信。" },
{ n: "03", t: "AIがリスクを解析", d: "カルテを自動生成・警告。" },
{ n: "04", t: "施術・提案に活用", d: "売上・リピートUP。" }];

const StepsSection = ({ onCta }) =>
<section className="section section-cream" id="steps">
    <div className="container">
      <FadeUp>
        <h2 className="h2" style={{ textAlign: "center" }}>
          使い方はカンタン <span className="accent">4ステップ</span>
        </h2>
      </FadeUp>
      <div className="steps-grid" style={{ marginTop: 48 }}>
        {STEPS.map((s, i) =>
      <FadeUp key={s.n} delay={i * 80}>
            <div className="step-card">
              <span className="step-num-circle">{s.n}</span>
              <div className="step-card-title">{s.t}</div>
              <div className="step-card-desc">{s.d}</div>
            </div>
          </FadeUp>
      )}
      </div>
      <FadeUp delay={400}>
        <div style={{ marginTop: 40, textAlign: "center" }}>
          <button className="btn btn-primary btn-lg" onClick={onCta}>
            14日間無料で試す <Icon name="arrowRight" size={14} />
          </button>
        </div>
      </FadeUp>
    </div>
  </section>;

window.StepsSection = StepsSection;

// ============ REVIEWS ============
const REVIEWS = []; // 実顧客から書面許諾取得後に追加
const ReviewsSection = () => {
  if (REVIEWS.length === 0) return null;
  return (
    <section className="section section-soft">
    <div className="container">
      <FadeUp>
        <div className="eyebrow" style={{ textAlign: "center", display: "block" }}>VOICE</div>
      </FadeUp>
      <FadeUp delay={80}>
        <h2 className="h2" style={{ marginTop: 14, textAlign: "center" }}>
          導入サロンから、<br />嬉しい声が届いています。
        </h2>
      </FadeUp>
      <div className="grid-3" style={{ marginTop: 40 }}>
        {REVIEWS.map((r, i) =>
          <FadeUp key={i} delay={i * 80}>
            <div className="review">
              <div className="review-stars">{Array.from({ length: r.s }).map((_, j) => <Icon key={j} name="star" size={14} />)}</div>
              <h3 className="h3" style={{ fontSize: 17 }}>「{r.h}」</h3>
              <p style={{ color: "var(--c-fg-3)", fontSize: 13, lineHeight: 1.85, margin: 0 }}>{r.d}</p>
              <div className="review-meta">
                <div className="review-avatar">
                  <image-slot id={r.a} placeholder={r.ph} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{r.n}</div>
                  <div style={{ color: "var(--c-fg-3)", fontSize: 11 }}>{r.r}</div>
                </div>
              </div>
            </div>
          </FadeUp>
          )}
      </div>
    </div>
  </section>);

};
window.ReviewsSection = ReviewsSection;