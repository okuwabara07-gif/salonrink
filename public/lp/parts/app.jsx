/* global React, ReactDOM */
/* global Nav, Hero, CounterStrip, ProblemSection, SolutionSection, AiKarteSection, LineSection, DashboardSection, StepsSection, ReviewsSection, CompareSection, TrustSection, PersonaSection, PricingSection, FaqSection, FinalCta, Footer, StickyCta, FabLine, CtaModal */
/* global LogoStrip, FeatureGrid, BeforeAfter, RoiSim, PlansSection, Integrations, CasesSection, VideoDemo, LeadBanner */
/* global useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakColor, TweakSelect, TweakToggle */
const { useState, useEffect } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "gold",
  "font": "mincho",
  "density": "comfortable",
  "dark": false,
  "heroVariant": 0
}/*EDITMODE-END*/;

const App = () => {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [modal, setModal] = useState(false);
  const onCta = () => setModal(true);

  useEffect(() => {
    document.documentElement.dataset.accent = t.accent;
    document.documentElement.dataset.font = t.font;
    document.documentElement.dataset.density = t.density;
    document.documentElement.dataset.theme = t.dark ? "dark" : "light";
  }, [t]);

  return (
    <>
      <Nav onCta={onCta} />
      <Hero heroIdx={t.heroVariant} onCta={onCta} />
      <CounterStrip />
      <LogoStrip />
      <ProblemSection />
      <SolutionSection />
      <FeatureGrid />
      <AiKarteSection />
      <BeforeAfter />
      <LineSection />
      <DashboardSection />
      <VideoDemo onCta={onCta} />
      <StepsSection onCta={onCta} />
      <ReviewsSection />
      <CasesSection />
      <CompareSection />
      <Integrations />
      <TrustSection />
      <PersonaSection />
      <RoiSim onCta={onCta} />
      <PlansSection onCta={onCta} />
      <LeadBanner onCta={onCta} />
      <FaqSection />
      <FinalCta onCta={onCta} />
      <Footer />
      <StickyCta onCta={onCta} />
      <FabLine onCta={onCta} />
      <CtaModal open={modal} onClose={() => setModal(false)} />

      <TweaksPanel title="Tweaks">
        <TweakSection label="Theme">
          <TweakColor label="アクセントカラー"
            value={t.accent}
            onChange={v => setTweak("accent", v)}
            options={[
              { label: "Gold (default)", value: "gold", color: "#c8a366" },
              { label: "LINE Green", value: "line", color: "#06c755" },
              { label: "Mono", value: "mono", color: "#1f1a14" },
            ]}
          />
          <TweakRadio label="フォント"
            value={t.font}
            onChange={v => setTweak("font", v)}
            options={[
              { label: "Mincho", value: "mincho" },
              { label: "Sans", value: "sans" },
              { label: "Modern", value: "modern" },
            ]}
          />
          <TweakToggle label="ダークモード"
            value={t.dark} onChange={v => setTweak("dark", v)} />
        </TweakSection>
        <TweakSection label="Layout">
          <TweakRadio label="密度"
            value={t.density}
            onChange={v => setTweak("density", v)}
            options={[
              { label: "Compact", value: "compact" },
              { label: "Standard", value: "comfortable" },
              { label: "Spacious", value: "spacious" },
            ]}
          />
          <TweakSelect label="Hero見出し"
            value={String(t.heroVariant)}
            onChange={v => setTweak("heroVariant", Number(v))}
            options={[
              { label: "案A: もう、聞き漏れない。", value: "0" },
              { label: "案B: 美容師とお客様を、一生でつなぐ。", value: "1" },
              { label: "案C: いつもの、その先へ。", value: "2" },
            ]}
          />
        </TweakSection>
      </TweaksPanel>
    </>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
