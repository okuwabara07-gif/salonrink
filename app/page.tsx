import type { Metadata } from 'next';

import Nav from '@/features/lp/v2/sections/Nav';
import Hero from '@/features/lp/v2/sections/Hero';
import CounterStrip from '@/features/lp/v2/sections/CounterStrip';

import ChatMockMini from '@/features/lp/v2/components/ChatMockMini';
import Problem from '@/features/lp/v2/components/Problem';
import Solution from '@/features/lp/v2/components/Solution';
import VideoTour from '@/features/lp/v2/components/VideoTour';
import Operations from '@/features/lp/v2/components/Operations';
import Compare from '@/features/lp/v2/components/Compare';
import Cases from '@/features/lp/v2/components/Cases';
import Persona from '@/features/lp/v2/components/Persona';
import Pricing from '@/features/lp/v2/components/Pricing';
import RoiCalculator from '@/features/lp/v2/components/RoiCalculator';
import Trust from '@/features/lp/v2/components/Trust';
import Steps from '@/features/lp/v2/components/Steps';
import Faq from '@/features/lp/v2/components/Faq';
import FinalCta from '@/features/lp/v2/components/FinalCta';
import Footer from '@/features/lp/v2/components/Footer';

export const metadata: Metadata = {
  title: 'SalonRink — いつもの、その先へ。',
  description: 'LINE 完結のサロン管理 SaaS。AI カルテで、お客様の「いつも」をスタッフ全員で。月額 ¥1,980 から、14 日間無料で試せる。',
  openGraph: {
    title: 'SalonRink — いつもの、その先へ。',
    description: 'LINE 完結のサロン管理 SaaS。AI カルテで、お客様の「いつも」をスタッフ全員で。',
    url: 'https://salonrink.com',
    siteName: 'SalonRink',
    locale: 'ja_JP',
    type: 'website',
  },
};

export default function HomePage() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <CounterStrip />
        <ChatMockMini />
        <Problem />
        <Solution />
        <VideoTour />
        <Operations />
        <Compare />
        <Cases />
        <Persona />
        <Pricing />
        <RoiCalculator />
        <Trust />
        <Steps />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
