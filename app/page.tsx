import { Metadata } from 'next'
import Header from '@/components/lp/Header'
import Hero from '@/components/lp/Hero'
import IndustriesSection from '@/components/lp/IndustriesSection'
import FeaturesSection from '@/components/lp/FeaturesSection'
import PricingSection from '@/components/lp/PricingSection'
import CaseStudySection from '@/components/lp/CaseStudySection'
import FooterCTA from '@/components/lp/FooterCTA'
import Footer from '@/components/lp/Footer'

export const metadata: Metadata = {
  title: 'SalonRink | 美容師とお客様を、一生でつなぐ',
  description:
    'AIカルテで、美容師の頭脳を支える。LINE公式アカウントと、月¥1,980から。リピッテと同価格でAIカルテが標準装備。タレント美容師として選ばれ続けるあなたへ。',
  openGraph: {
    title: 'SalonRink | 美容師とお客様を、一生でつなぐ',
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
      <IndustriesSection />
      <FeaturesSection />
      <PricingSection />
      <CaseStudySection />
      <FooterCTA />
      <Footer />
    </main>
  )
}
