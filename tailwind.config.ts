import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
    './features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ========================================
        // Design Token T (Sprint 2 Dashboard)
        // ========================================
        cream: '#faf8f3',         // page background (T.bg)
        'bg-alt': '#f3efe5',      // statistical chips, subsections (T.bgAlt)
        surface: '#ffffff',       // cards, modals (T.surface)
        'border-primary': '#e6e1d6',  // standard border (T.border)
        'border-soft': '#efeae0',     // row separators (T.borderSoft)

        ink: '#1a1814',           // body, headings (T.ink)
        muted: '#6f6a62',         // secondary text (T.muted)
        faint: '#9c968c',         // captions (T.faint)
        hairline: '#d9d3c6',      // very light (T.hairline)

        green: '#06C755',         // LINE green, CTA, active (T.green)
        'green-ink': '#04863a',   // green-based dark text (T.greenInk)
        'green-soft': '#e6f7ec',  // green light fill (T.greenSoft)

        alert: '#D85A30',         // warning, "approval pending" (T.alert)
        'alert-soft': '#fbeae0',  // warning fill (T.alertSoft)

        amber: '#C7902B',         // HPB badge, unmatched warning (T.amber)
        'amber-soft': '#f6ecd3',  // HPB fill (T.amberSoft)

        // ========================================
        // Legacy colors (keep for backward compatibility)
        // ========================================
        'bg-warm': '#faf8f3',    // page base (warm cream)
        'bg-warm-2': '#f2eee4',  // even sections, emphasized bg
        paper: '#FBF8F3',        // LIFF header, card backgrounds
        card: '#ffffff',         // white card

        // ========================================
        // Border colors
        // ========================================
        line: '#e6e1d6',         // standard border
        'line-soft': '#f0ebe0',  // soft border between cells

        // ========================================
        // Accent colors (LINE Green — beauty professional)
        // ========================================
        'accent-hover': '#05a648',
        'accent-soft': '#e6f7ec',
        'accent-ink': '#054d22',

        // ========================================
        // Secondary accent (Coral — customer-facing only)
        // ========================================
        coral: '#D85A30',
        'coral-soft': '#FBEAF0',
        'coral-ink': '#993556',

        // ========================================
        // Badge colors
        // ========================================
        'badge-am': '#FAEEDA',      // caution
        'badge-am-ink': '#854F0B',
        'badge-gr': '#EAF3DE',      // success
        'badge-gr-ink': '#3B6D11',
        'badge-bl': '#E6F1FB',      // info
        'badge-bl-ink': '#0C447C',

        // ========================================
        // Special colors
        // ========================================
        gold: '#a37a35',           // rarely used emphasis
      },

      fontFamily: {
        // Serif: headings, formal elements (T.serif)
        serif: ['var(--font-serif)', '"Noto Serif JP"', '"Yu Mincho"', 'serif'],
        // Sans: body, UI elements
        sans: ['"Noto Sans JP"', '"Hiragino Sans"', 'sans-serif'],
        // Mono: numbers, labels, codes (T.mono)
        mono: ['var(--font-mono)', '"JetBrains Mono"', '"SF Mono"', 'monospace'],
      },

      fontSize: {
        // Page title (LIFF header)
        'title-lg': ['16px', { lineHeight: '1.4', letterSpacing: '0.2px', fontWeight: '500' }],
        'title-md': ['15px', { lineHeight: '1.4', letterSpacing: '0.2px', fontWeight: '500' }],

        // Section headings
        'heading-sm': ['13px', { lineHeight: '1.3', fontWeight: '500' }],
        'heading-xs': ['12px', { lineHeight: '1.3', fontWeight: '500' }],

        // Body text
        'body-md': ['13px', { lineHeight: '1.5', fontWeight: '400' }],
        'body-sm': ['12px', { lineHeight: '1.5', fontWeight: '400' }],

        // Supplementary text
        'caption-md': ['11px', { lineHeight: '1.4', fontWeight: '400' }],
        'caption-sm': ['10px', { lineHeight: '1.4', fontWeight: '400' }],

        // Numbers (KPI, price, time)
        'number-lg': ['20px', { lineHeight: '1.2', fontWeight: '600' }],
        'number-md': ['16px', { lineHeight: '1.2', fontWeight: '600' }],
        'number-sm': ['12px', { lineHeight: '1.2', fontWeight: '500' }],

        // Labels (UPPERCASE)
        'label-sm': ['10px', { lineHeight: '1.2', fontWeight: '500', letterSpacing: '0.3px', textTransform: 'uppercase' }],
        'label-xs': ['9px', { lineHeight: '1.2', fontWeight: '500', letterSpacing: '0.3px', textTransform: 'uppercase' }],

        // Button text
        'btn-md': ['13px', { lineHeight: '1.2', fontWeight: '500' }],
        'btn-sm': ['12px', { lineHeight: '1.2', fontWeight: '500' }],
      },

      spacing: {
        // Fine-grained spacing scale
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '22px',
        xxl: '32px',
        xxxl: '40px',
      },

      borderRadius: {
        'sm': '8px',        // badges, small cards
        'md': '10px',       // standard cards, inputs
        'lg': '14px',       // large cards
        'xl': '18px',       // modals, large cards
        'full': '50%',      // avatars, FAB
        'phone': '28px',    // iPhone modal
      },

      boxShadow: {
        card: '0 1px 2px rgba(0, 0, 0, 0.04)',
        phone: '0 6px 24px rgba(26, 24, 20, 0.18)',
        fab: '0 3px 10px rgba(6, 199, 85, 0.35)',
        modal: '0 -4px 16px rgba(0, 0, 0, 0.08)',
      },

      letterSpacing: {
        tighter: '-0.5px',
        tight: '0px',
        normal: '0.2px',
        wide: '0.3px',
        wider: '0.4px',
      },
    },
  },
  plugins: [],
}

export default config
