import { Metadata } from 'next'
import Header from '@/components/lp/Header'
import Hero from '@/components/lp/Hero'
import NumbersSection from '@/components/lp/NumbersSection'
import IndustriesSection from '@/components/lp/IndustriesSection'
import MeritComparison from '@/components/lp/MeritComparison'
import FeaturesSection from '@/components/lp/FeaturesSection'
import BookingFlowSection from '@/components/lp/BookingFlowSection'
import IntegrationLogos from '@/components/lp/IntegrationLogos'
import ComparisonTable from '@/components/lp/ComparisonTable'
import PricingSection from '@/components/lp/PricingSection'
import CaseStudySection from '@/components/lp/CaseStudySection'
import SetupFlow from '@/components/lp/SetupFlow'
import FAQSection from '@/components/lp/FAQSection'
import ResourceForm from '@/components/lp/ResourceForm'
import LineContact from '@/components/lp/LineContact'
import SupportSection from '@/components/lp/SupportSection'
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
      <NumbersSection />
      <IndustriesSection />
      <MeritComparison />
      <FeaturesSection />
      <BookingFlowSection />
      <IntegrationLogos />
      <ComparisonTable />
      <PricingSection />
      <CaseStudySection />
      <SetupFlow />
      <SupportSection />
      <FAQSection />
      <ResourceForm />
      <LineContact />
      <FooterCTA />
      <Footer />
    </main>
  )
}
