import React from 'react';

const serviceLinks = [
  { label: '機能', href: '#solution' },
  { label: '料金', href: '#pricing' },
  { label: '活用イメージ', href: '#cases' },
  { label: 'よくあるご質問', href: '#faq' },
];

const companyLinks = [
  { label: 'AOKAE合同会社について', href: '/about' },
  { label: '特定商取引法に基づく表示', href: '/tokushoho' },
  { label: 'プライバシーポリシー', href: '/privacy' },
  { label: '利用規約', href: '/terms' },
];

export default function Footer() {
  return (
    <footer className="bg-[var(--c-fg)] text-[var(--c-bg)] py-16 md:py-20">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
        <div>
          <p className="font-serif text-2xl md:text-3xl">SalonRink</p>
          <p className="font-serif text-sm opacity-70 mt-2">いつもの、その先へ。</p>
        </div>
        <div>
          <p className="font-mono text-xs uppercase tracking-wider opacity-50 mb-4">Service</p>
          {serviceLinks.map((link) => (
            <a key={link.href} href={link.href} className="font-sans text-sm hover:opacity-100 opacity-80 transition-opacity duration-200 block py-1">
              {link.label}
            </a>
          ))}
        </div>
        <div>
          <p className="font-mono text-xs uppercase tracking-wider opacity-50 mb-4">Company</p>
          {companyLinks.map((link) => (
            <a key={link.href} href={link.href} className="font-sans text-sm hover:opacity-100 opacity-80 transition-opacity duration-200 block py-1">
              {link.label}
            </a>
          ))}
        </div>
        <div>
          <p className="font-mono text-xs uppercase tracking-wider opacity-50 mb-4">Contact</p>
          <p className="font-sans text-sm opacity-80 py-1">support@salonrink.com</p>
          <p className="font-sans text-sm opacity-80 py-1">返信目安: 平日 24 時間以内</p>
          <p className="font-sans text-xs opacity-60 py-1">※ 詳細は特商法ページ参照</p>
        </div>
      </div>
      <div className="border-t border-[var(--c-bg)]/20 mt-12 pt-8 text-center max-w-6xl mx-auto px-6">
        <p className="font-mono text-xs opacity-50">©2026 AOKAE合同会社. All rights reserved.</p>
      </div>
    </footer>
  );
}
