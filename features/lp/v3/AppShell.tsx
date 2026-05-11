'use client';

import { useState } from 'react';
import Nav from './sections/Nav';
import Hero from './sections/Hero';
import ProblemSection from './sections/ProblemSection';
import SolutionSection from './sections/SolutionSection';
import FeatureGrid from './sections/FeatureGrid';
import AiKarteSection from './sections/AiKarteSection';
import BeforeAfter from './sections/BeforeAfter';
import LineSection from './sections/LineSection';
import DashboardSection from './sections/DashboardSection';
import VideoDemo from './sections/VideoDemo';
import StepsSection from './sections/StepsSection';
import CompareSection from './sections/CompareSection';
import Integrations from './sections/Integrations';
import SecuritySection from './sections/SecuritySection';
import PersonaSection from './sections/PersonaSection';
import RoiSim from './sections/RoiSim';
import PlansSection from './sections/PlansSection';
import LeadBanner from './sections/LeadBanner';
import FaqSection from './sections/FaqSection';
import FinalCta from './sections/FinalCta';
import Footer from './sections/Footer';
import StickyCta from './sections/StickyCta';
import FabLine from './sections/FabLine';
import CtaModal from './components/CtaModal';

export default function AppShell() {
  const [ctaOpen, setCtaOpen] = useState(false);
  const handleCta = () => setCtaOpen(true);

  return (
    <>
      <Nav onCta={handleCta} />
      <Hero onCta={handleCta} />
      <ProblemSection />
      <SolutionSection />
      <FeatureGrid />
      <AiKarteSection />
      <BeforeAfter />
      <LineSection />
      <DashboardSection />
      <VideoDemo onCta={handleCta} />
      <StepsSection onCta={handleCta} />
      <CompareSection />
      <Integrations />
      <SecuritySection />
      <PersonaSection />
      <RoiSim onCta={handleCta} />
      <PlansSection onCta={handleCta} />
      <LeadBanner onCta={handleCta} />
      <FaqSection />
      <FinalCta onCta={handleCta} />
      <Footer />
      <StickyCta onCta={handleCta} />
      <FabLine onCta={handleCta} />
      <CtaModal open={ctaOpen} onClose={() => setCtaOpen(false)} />
    </>
  );
}
