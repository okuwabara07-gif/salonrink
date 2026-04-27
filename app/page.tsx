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
import FooterCTA from '@/components/lp/FooterCTA'
import Footer from '@/components/lp/Footer'

export const metadata: Metadata = {
  title: 'SalonRink | 月980円から始まる、本格サロン管理SaaS',
  description:
    'HPBはそのまま、自分らしいサロン運営へ。LINEミニアプリ予約、HPB自動同期、顧客カルテ、すべてひとつに。月¥980〜、14日間無料。',
  openGraph: {
    title: 'SalonRink | 月980円から始まる、本格サロン管理SaaS',
    description:
      'HPBはそのまま、LINE予約・顧客カルテ・売上管理が¥980〜',
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
      <FAQSection />
      <ResourceForm />
      <LineContact />
      <FooterCTA />
      <Footer />
    </main>
  )
}
