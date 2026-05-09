import React from 'react';
import Container from '../components/Container';
import Button from '../components/Button';

const navLinks = [
  { label: '機能', href: '#features' },
  { label: '導入', href: '#cases' },
  { label: 'プラン・料金', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
];

export default function Nav() {
  const lineUrl = process.env.NEXT_PUBLIC_LINE_URL || '#';

  return (
    <nav className="sticky top-0 z-50 bg-[color-mix(in_oklab,var(--c-bg)_86%,transparent)] backdrop-blur-[14px] border-b border-[var(--c-border-2)]">
      <Container>
        <div className="flex items-center justify-between h-16 md:h-[72px]">
          {/* Logo */}
          <div className="flex items-center gap-1">
            <span className="font-serif text-xl md:text-2xl font-medium text-[var(--c-fg)]">
              SalonRink
            </span>
            <span className="font-cormorant text-lg md:text-xl italic text-[var(--c-accent)]">
              .com
            </span>
          </div>

          {/* Center Links - Hidden on Mobile */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-[var(--c-fg)] hover:text-[var(--c-accent)] transition-colors duration-150"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right CTA Button */}
          <Button
            as="a"
            href={lineUrl}
            variant="line"
            size="sm"
            target="_blank"
            rel="noopener noreferrer"
          >
            LINEでデモを見る
          </Button>
        </div>
      </Container>
    </nav>
  );
}
