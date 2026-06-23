/* global React, Icon, FadeUp, AnimatedNum */

const Nav = ({ onCta }) =>
<header className="nav">
    <div className="container nav-inner">
      <a href="#top" className="nav-logo">
        <span className="logo-mark" /> SalonRink<small>.com</small>
      </a>
      <nav className="nav-links" style={{ fontSize: "19px" }}>
        <a href="#features">機能</a>
        <a href="#steps">導入</a>
        <a href="#plans">プラン</a>
        <a href="#pricing">料金</a>
        <a href="#faq">FAQ</a>
      </nav>
      <button className="btn btn-line btn-sm" onClick={onCta}>
        <span className="btn-line-icon">L</span> LINEでデモを見る
      </button>
    </div>
  </header>;

window.Nav = Nav;

const Hero = ({ heroIdx = 0, onCta }) => {
  const variants = [
  { eyebrow: "AI × CARTE × LINE", h: ["ちゃんと、", <span key="m1" className="hero-headline-mark">向き合える</span>, "。", <br key="b" />, "その", <span key="m2" className="hero-headline-mark">カウンセリング</span>, "、", <br key="c" />, <span key="a" className="accent">AI</span>, "がそっと支えます。"], sub: "LINEで完結するAIカルテで、サロンワークをもっと安心・スマートに。" },
  { eyebrow: "Beauty CRM for Salons", h: ["美容師とお客様を、", <br key="b" />, "一生でつなぐ。"], sub: "AIがカルテを育て、信頼をつなぎ、あなたのサロンの未来を支えます。" },
  { eyebrow: "Salon OS", h: ["いつもの、", <br key="b" />, "その先へ。"], sub: "AI × カルテ × LINEで、サロン運営をもっとスマートに。美容室のためのAIカルテ管理SaaS。" }];

  const v = variants[heroIdx] || variants[0];
  return (
    <section className="hero" id="top">
      <div className="hero-fullbleed">
        <img src="assets/hero-main.png" alt="" className="hero-bg-img" />
        <div className="container hero-content">
          <FadeUp className="hero-text">
            <div className="eyebrow" style={{ fontSize: "18px" }}>{v.eyebrow}</div>
            <h1 className="h1" style={{ marginTop: 18 }}>{v.h.map((p, i) => <span key={i} style={{ fontSize: "32px" }}>{p}</span>)}</h1>
            <p className="lede" style={{ marginTop: 22, maxWidth: 520 }}>{v.sub}</p>
            <div style={{ display: "flex", gap: 14, marginTop: 28, flexWrap: "wrap" }}>
              <span className="checkrow"><span className="checkrow-dot"><Icon name="check" size={12} stroke={2.4} /></span>初期費用 ¥3,000（SNS共有で無料）</span>
              <span className="checkrow"><span className="checkrow-dot"><Icon name="check" size={12} stroke={2.4} /></span>最短契約期間 なし</span>
              <span className="checkrow"><span className="checkrow-dot"><Icon name="check" size={12} stroke={2.4} /></span>LINEだけでスタート</span>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 28, flexWrap: "wrap" }}>
              <button className="btn btn-primary btn-lg" onClick={onCta}>
                <span className="btn-line-icon">L</span> LINEでデモを見る <Icon name="arrowRight" size={14} />
              </button>
              <button className="btn btn-ghost btn-lg">14日間無料で試す</button>
            </div>
            <div style={{ marginTop: 18, fontSize: 12, color: "var(--c-fg-3)" }}> 約 5分でセットアップ。導入サポート

            </div>
          </FadeUp>
        </div>
        <FadeUp delay={200} className="hero-chat-float">
          <div className="hero-chat-caption">
            <span className="hero-chat-caption-dot" />
            LINEだけで動く、AIカウンセリング
          </div>
          <div className="hero-phone-bezel">
            <div className="hero-phone-notch" />
            <ChatMockMini />
          </div>
        </FadeUp>
      </div>
    </section>);

};

const ChatMockMini = () => {
  const [step, setStep] = React.useState(0);

  React.useEffect(() => {
    const delays = [600, 700, 900, 700, 900]; // delays[i] before showing step i+1
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
  }, []);

  const Item = ({ visible, children }) => (
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(8px)",
      transition: "opacity .35s ease, transform .35s ease",
    }}>{children}</div>
  );

  return (
    <div className="chat-mock" style={{ fontSize: 11 }}>
      <div className="chat-head">
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <Icon name="arrowRight" size={12} stroke={2} style={{ transform: "rotate(180deg)" }} />
          SalonRink
        </span>
        <span style={{ color: "#6b6256" }}>⋯</span>
      </div>
      <Item visible={step >= 1}>
        <div className="chat-row them">
          <div className="bubble">カラー施術前のカウンセリングご回答ください 😊</div>
        </div>
      </Item>
      <Item visible={step >= 2}>
        <div className="chat-row you">
          <div className="bubble you">アンケートを始める</div>
        </div>
      </Item>
      <Item visible={step >= 3}>
        <div className="chat-row them">
          <div className="bubble">Q. 過去にカラーで頭皮にかゆみや赤みは出ましたか？</div>
        </div>
      </Item>
      <Item visible={step >= 4}>
        <div className="chat-row them">
          <div className="chip-pair" style={{ width: "100%" }}>
            <button>はい</button>
            <button>いいえ</button>
          </div>
        </div>
      </Item>
      <Item visible={step >= 5}>
        <div className="ai-card">
          <div className="ai-tag">∨ AIまとめ</div>
          <div className="ai-warn"><span className="ai-warn-icon">i</span>過去の申告内容を表示</div>
          <div style={{ fontSize: 10.5, color: "var(--c-fg-3)", marginTop: 6, lineHeight: 1.6 }}>
            お客様が過去にご申告された内容を整理しています。施術前にスタイリストへご相談ください。
          </div>
        </div>
      </Item>
    </div>
  );
};

window.Hero = Hero;

const CounterStrip = () =>
<div className="counter-strip">
    <span className="pulse-dot" style={{ fontSize: "18px" }} />
    <span style={{ opacity: 0.7, fontSize: "18px" }}>現在</span>
    <span className="num" style={{ color: "var(--c-accent)", fontSize: "17px" }}>
      ベータ版
    </span>
    <span style={{ opacity: 0.7, fontSize: "18px" }}>として運用中・先着サロン募集</span>
  </div>;

window.CounterStrip = CounterStrip;