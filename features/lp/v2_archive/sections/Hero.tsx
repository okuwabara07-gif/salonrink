import React from 'react';
import Image from 'next/image';
import Container from '../components/Container';
import Eyebrow from '../components/Eyebrow';
import Button from '../components/Button';
import Checkrow from '../components/Checkrow';
import ChatMockMini from '../components/ChatMockMini';

export default function Hero() {
  const lineUrl = process.env.NEXT_PUBLIC_LINE_URL || '#';

  return (
    <section className="relative overflow-hidden py-20 lg:py-32">
      {/* Background Image */}
      <div className="absolute inset-0 h-full">
        <Image
          src="/lp/v2/hero-main.png"
          alt="Hero Background"
          fill
          className="object-cover"
          priority
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--c-bg)] via-[var(--c-bg)_50%] to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <Eyebrow>公式アカウント連携</Eyebrow>

              <h1 className="font-serif text-[clamp(34px,8vw,64px)] font-medium leading-tight text-[var(--c-fg)]">
                いつもの、
                <span className="relative inline-block ml-1">
                  その先へ。
                  <span className="absolute bottom-1 left-0 right-0 h-3 bg-[var(--c-accent)_30%]" />
                </span>
              </h1>

              <p className="font-cormorant text-[clamp(16px,3vw,20px)] font-medium text-[var(--c-accent-2)]">
                あなたのファンを、つくる場所
              </p>

              <p className="text-[clamp(14px,2.1vw,16px)] leading-[1.95] text-[var(--c-fg-3)] max-w-lg">
                LINE で完結する予約・カウンセリング・AIカルテ。月額¥1,980から、新アプリ不要。
              </p>

              {/* Checkrows */}
              <div className="space-y-3 pt-4">
                <Checkrow>LINE 完結、新アプリ不要</Checkrow>
                <Checkrow>AI カウンセリング自動化</Checkrow>
                <Checkrow>月額 ¥1,980 から</Checkrow>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6">
                <Button
                  as="a"
                  href={lineUrl}
                  variant="primary"
                  size="lg"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LINEでデモを見る
                </Button>
                <Button
                  as="a"
                  href="#features"
                  variant="ghost"
                  size="lg"
                >
                  機能を見る
                </Button>
              </div>
            </div>

            {/* Right: Chat Mock */}
            <div className="hidden lg:flex justify-center items-center">
              <ChatMockMini />
            </div>
          </div>

          {/* Mobile Chat Mock */}
          <div className="lg:hidden mt-12 flex justify-center">
            <ChatMockMini />
          </div>
        </Container>
      </div>
    </section>
  );
}
