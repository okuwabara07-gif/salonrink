/* global React, ReactDOM,
   Nav, CounterStrip, Hero, KpiSection, ProblemSection, ValueSection,
   Gallery, StepsSection, ReviewsSection, CompareSection, TrustSection,
   PersonaSection, PricingSection, FaqSection, FinalCta, Footer,
   StickyCTA, FloatingLine, CtaModal,
   useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakColor, TweakSelect, TweakSlider, TweakToggle, TweakSelect */

const { useEffect, useState, useMemo } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "line",
  "font": "noto",
  "density": "comfortable",
  "dark": false,
  "heroIdx": 0,
  "sectionOrder": "default"
}/*EDITMODE-END*/;

const ACCENT_HEX = { line: "#06c755", pink: "#ff5470", mono: "#0a0a0a" };

const SECTION_ORDERS = {
  "default": ["counter", "kpi", "problem", "value", "gallery", "steps", "reviews", "compare", "trust", "persona", "pricing", "faq"],
  "salesy":  ["counter", "kpi", "compare", "value", "gallery", "reviews", "problem", "steps", "persona", "trust", "pricing", "faq"],
  "story":   ["counter", "problem", "value", "gallery", "steps", "kpi", "reviews", "persona", "compare", "trust", "pricing", "faq"],
};

const SECTION_RENDER = (key, props) => {
  switch (key) {
    case "counter": return <CounterStrip />;
    case "kpi":     return <KpiSection />;
    case "problem": return <ProblemSection />;
    case "value":   return <ValueSection />;
    case "gallery": return <Gallery />;
    case "steps":   return <StepsSection onCta={props.onCta} />;
    case "reviews": return <ReviewsSection />;
    case "compare": return <CompareSection />;
    case "trust":   return <TrustSection />;
    case "persona": return <PersonaSection />;
    case "pricing": return <PricingSection onCta={props.onCta} />;
    case "faq":     return <FaqSection />;
    default: return null;
  }
};

const App = () => {
  const [t, setT] = useTweaks(TWEAK_DEFAULTS);
  const [modal, setModal] = useState(false);
  const onCta = () => setModal(true);

  // Apply tokens to document root
  useEffect(() => {
    const r = document.documentElement;
    r.dataset.accent = t.accent;
    r.dataset.font = t.font;
    r.dataset.density = t.density;
    r.dataset.theme = t.dark ? "dark" : "light";
  }, [t]);

  const order = SECTION_ORDERS[t.sectionOrder] || SECTION_ORDERS.default;

  return (
    <>
      <Nav onCta={onCta} />
      <Hero heroIdx={Number(t.heroIdx) || 0} onCta={onCta} />
      {order.map(k => <React.Fragment key={k}>{SECTION_RENDER(k, { onCta })}</React.Fragment>)}
      <FinalCta onCta={onCta} />
      <Footer />

      <StickyCTA onCta={onCta} />
      <FloatingLine />

      <CtaModal open={modal} onClose={() => setModal(false)} />

      <TweaksPanel title="Tweaks">
        <TweakSection title="ブランド">
          <TweakColor label="アクセント色"
            value={ACCENT_HEX[t.accent]}
            onChange={v => {
              const k = Object.keys(ACCENT_HEX).find(k => ACCENT_HEX[k] === v) || "line";
              setT("accent", k);
            }}
            options={["#06c755", "#ff5470", "#0a0a0a"]} />
          <TweakRadio label="フォント"
            value={t.font}
            onChange={v => setT("font", v)}
            options={[
              { value: "noto", label: "Noto" },
              { value: "pretendard", label: "Zen" },
              { value: "helvetica", label: "Helv" },
            ]} />
          <TweakToggle label="ダークモード"
            value={t.dark}
            onChange={v => setT("dark", v)} />
        </TweakSection>

        <TweakSection title="レイアウト">
          <TweakRadio label="密度"
            value={t.density}
            onChange={v => setT("density", v)}
            options={[
              { value: "compact", label: "コンパクト" },
              { value: "comfortable", label: "標準" },
              { value: "spacious", label: "広め" },
            ]} />
          <TweakSelect label="セクション順"
            value={t.sectionOrder}
            onChange={v => setT("sectionOrder", v)}
            options={["default", "salesy", "story"]} />
        </TweakSection>

        <TweakSection title="Heroコピー">
          <TweakRadio label="見出し案"
            value={String(t.heroIdx)}
            onChange={v => setT("heroIdx", Number(v))}
            options={[
              { value: "0", label: "A" },
              { value: "1", label: "B" },
              { value: "2", label: "C" },
            ]} />
        </TweakSection>
      </TweaksPanel>
    </>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
