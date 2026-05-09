'use client';

import Icon from '@/features/lp/v3/components/Icon';

type Props = {
  onCta?: () => void;
};

export default function Nav({ onCta }: Props) {
  return (
    <header className="nav">
      <div className="container nav-inner">
        <a href="#top" className="nav-logo">
          <span className="logo-mark" /> SalonRink<small>.com</small>
        </a>
        <nav className="nav-links">
          <a href="#features">機能</a>
          <a href="#steps">導入</a>
          <a href="#plans">プラン</a>
          <a href="#pricing">料金</a>
          <a href="#faq">FAQ</a>
        </nav>
        <button className="btn btn-line btn-sm" onClick={onCta}>
          <span className="btn-line-icon">L</span> LINEでデモを見る
        </button>
      </div>
    </header>
  );
}
