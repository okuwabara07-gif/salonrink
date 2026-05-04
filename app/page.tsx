import { Metadata } from 'next'
import Header from '@/components/lp/Header'
import Hero from '@/components/lp/Hero'
import NumbersSection from '@/components/lp/NumbersSection'
import IndustriesSection from '@/components/lp/IndustriesSection'
import FeaturesSection from '@/components/lp/FeaturesSection'
import BookingFlowSection from '@/components/lp/BookingFlowSection'
import SetupFlow from '@/components/lp/SetupFlow'
import PricingSection from '@/components/lp/PricingSection'
import MeritComparison from '@/components/lp/MeritComparison'
import CaseStudySection from '@/components/lp/CaseStudySection'
import FAQSection from '@/components/lp/FAQSection'
import FooterCTA from '@/components/lp/FooterCTA'
import Footer from '@/components/lp/Footer'

export const metadata: Metadata = {
  title: 'SalonRink | いつもの、その先へ｜美容室向けAIカルテSaaS',
  description:
    'AIカルテで、美容師の頭脳を支える。LINE公式アカウントと、月¥1,980から。同価格帯でAIカルテが標準装備。タレント美容師として選ばれ続けるあなたへ。',
  openGraph: {
    title: 'SalonRink | いつもの、その先へ｜美容室向けAIカルテSaaS',
    description:
      'あなたのファンを、つくる場所。月¥1,980から。',
    images: ['/images/lp/og-image.webp'],
  },
}

export default function Home() {
  return (
    <main style={{ background: 'var(--sr-bg)' }}>
      <Header />
      <Hero />
      <NumbersSection />
      <IndustriesSection />
      <FeaturesSection />
      <BookingFlowSection />
      <SetupFlow />
      <PricingSection />
      <MeritComparison />
      <CaseStudySection />
      <FAQSection />
      <FooterCTA />
      <Footer />
    </main>
  )
}
