'use client';

type IconName = 'arrow' | 'arrowRight' | 'check' | 'x' | 'menu' | 'plus' | 'spark' | 'shield' | 'lock' | 'brain' | 'folder' | 'chart' | 'card' | 'chat' | 'calendar' | 'star' | 'line';

type Props = {
  name: IconName;
  size?: number;
  stroke?: number;
  style?: React.CSSProperties;
};

export default function Icon({ name, size = 18, stroke = 1.6, style }: Props) {
  const p = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: stroke,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    style,
  };

  switch (name) {
    case 'arrow':
      return <svg {...p}><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
    case 'arrowRight':
      return <svg {...p}><path d="M9 6l6 6-6 6" /></svg>;
    case 'check':
      return <svg {...p}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>;
    case 'x':
      return <svg {...p}><path d="M6 6l12 12M18 6L6 18" /></svg>;
    case 'menu':
      return <svg {...p}><path d="M4 8h16M4 16h16" /></svg>;
    case 'plus':
      return <svg {...p}><path d="M12 5v14M5 12h14" /></svg>;
    case 'spark':
      return <svg {...p}><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" /></svg>;
    case 'shield':
      return <svg {...p}><path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z" /><path d="M9 12l2 2 4-4" /></svg>;
    case 'lock':
      return <svg {...p}><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V8a4 4 0 018 0v3" /></svg>;
    case 'brain':
      return <svg {...p}><path d="M9 4a3 3 0 00-3 3v0a3 3 0 00-2 2.8c0 1.3.8 2.4 2 2.9v1.6c-1.2.5-2 1.6-2 2.9a3 3 0 003 3 3 3 0 003 3 3 3 0 003-3 3 3 0 003 3 3 3 0 003-3c0-1.3-.8-2.4-2-2.9v-1.6c1.2-.5 2-1.6 2-2.9a3 3 0 00-2-2.8v0a3 3 0 00-3-3 3 3 0 00-3-1 3 3 0 00-3 1z" /></svg>;
    case 'folder':
      return <svg {...p}><path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>;
    case 'chart':
      return <svg {...p}><path d="M4 20V8M10 20V4M16 20v-8M22 20H2" /><path d="M3 10l5-3 4 2 5-4 4 3" /></svg>;
    case 'card':
      return <svg {...p}><rect x="3" y="6" width="18" height="13" rx="2" /><path d="M3 10h18" /></svg>;
    case 'chat':
      return <svg {...p}><path d="M21 12a8 8 0 11-3.5-6.6L21 4l-1.4 3.5A8 8 0 0121 12z" /></svg>;
    case 'calendar':
      return <svg {...p}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>;
    case 'star':
      return <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" style={style}><path d="M12 2l3 6.5 7 .8-5.2 4.7 1.5 6.9L12 17.3 5.7 20.9l1.5-6.9L2 9.3l7-.8z" /></svg>;
    case 'line':
      return <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" style={style}><path d="M19.4 10.5c0-3.4-3.4-6.2-7.6-6.2S4.2 7.1 4.2 10.5c0 3 2.7 5.6 6.4 6.1.6.1.5.5.4 1l-.2.7c0 .2-.2.7.6.4.8-.3 4.4-2.6 6-4.4 1.1-1.2 1.8-2.5 1.8-3.8z" /></svg>;
    default:
      return null;
  }
}
