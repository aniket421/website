import type { Config } from 'tailwindcss';

/**
 * Single source of truth for the Elegance Bath Decor design system.
 * Components must consume these tokens — no raw hex, no arbitrary values.
 */
const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      screens: {
        // The nav collapses to a hamburger below this width, per §4.
        nav: '860px',
      },
      colors: {
        brass: {
          DEFAULT: '#C8A45D', // primary accent — CTAs, icons, eyebrows, active states
          soft: '#E4D3AE', // decorative marks, quote glyphs
          tint: '#FAF6EE', // hover fills on light surfaces
          /*
           * Small brass text on a light surface measures 2.35:1 against
           * surface and 2.16:1 against surface-alt — well under the AA floor
           * the quality bar requires. This darker brass carries eyebrows and
           * any other small brass text on light grounds (5.30:1 and 4.86:1).
           * #C8A45D is unchanged everywhere it passes: fills, icons, active
           * states, and eyebrows on the footer.
           */
          deep: '#8A6520',
        },
        ink: {
          DEFAULT: '#1A1A1A', // headings
          soft: '#2A2A2A', // dark buttons, footer-adjacent
        },
        body: '#6E6E6E', // body copy
        line: '#E8E6E2', // borders, dividers
        surface: {
          DEFAULT: '#FFFFFF', // default background
          alt: '#F6F5F3', // alternating section background
        },
        footer: '#1C1C1C', // footer — the only dark block on the page
      },
      fontFamily: {
        sans: ['var(--font-manrope)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // `copy` rather than `body` so it cannot collide with the `body` colour token.
        display: [
          'clamp(2.6rem, 1.55rem + 4.4vw, 5rem)',
          { lineHeight: '1.1', letterSpacing: '-0.035em', fontWeight: '800' },
        ],
        heading: [
          'clamp(1.75rem, 1.38rem + 1.55vw, 2.6rem)',
          { lineHeight: '1.16', letterSpacing: '-0.02em', fontWeight: '800' },
        ],
        card: ['1.125rem', { lineHeight: '1.4', fontWeight: '700' }],
        copy: ['1rem', { lineHeight: '1.65' }],
        lede: ['1.0625rem', { lineHeight: '1.7' }],
        eyebrow: [
          '0.8rem',
          { lineHeight: '1.2', letterSpacing: '0.14em', fontWeight: '700' },
        ],
      },
      maxWidth: {
        content: '1360px',
        lede: '60ch',
        measure: '76ch',
      },
      spacing: {
        section: '104px',
        'section-sm': '76px',
        gutter: '22px',
        'gutter-lg': '40px',
      },
      borderRadius: {
        sm: '10px',
        card: '16px',
        panel: '22px',
      },
      boxShadow: {
        panel: '0 24px 60px -32px rgba(26, 26, 26, 0.22)',
        brass: '0 18px 40px -22px rgba(200, 164, 93, 0.55)',
        header: '0 1px 0 0 #E8E6E2',
        support: '0 10px 30px -8px rgba(200, 164, 93, 0.6)',
      },
      aspectRatio: {
        card: '3 / 3.6',
        showroom: '16 / 8.4',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translate3d(0, 0, 0)' },
          '100%': { transform: 'translate3d(-50%, 0, 0)' },
        },
        'scroll-cue': {
          '0%': { transform: 'translateY(0)', opacity: '0' },
          '35%': { opacity: '1' },
          '100%': { transform: 'translateY(14px)', opacity: '0' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        /* The WhatsApp button's halo, and the "open now" dot. */
        'pulse-ring': {
          '0%': { transform: 'scale(0.85)', opacity: '0.55' },
          '70%': { transform: 'scale(1.6)', opacity: '0' },
          '100%': { transform: 'scale(1.6)', opacity: '0' },
        },
        'rise-in': {
          from: { opacity: '0', transform: 'translate3d(0, 14px, 0) scale(0.97)' },
          to: { opacity: '1', transform: 'translate3d(0, 0, 0) scale(1)' },
        },
        /* Slow drift on the hero photograph, a Ken Burns at walking pace. */
        'slow-zoom': {
          from: { transform: 'scale(1) translate3d(0, 0, 0)' },
          to: { transform: 'scale(1.08) translate3d(0, -1.5%, 0)' },
        },
      },
      animation: {
        marquee: 'marquee 46s linear infinite',
        'scroll-cue': 'scroll-cue 1.9s ease-in-out infinite',
        'fade-in': 'fade-in 320ms ease-out',
        'pulse-ring': 'pulse-ring 2.4s cubic-bezier(0.22, 0.61, 0.36, 1) infinite',
        'rise-in': 'rise-in 520ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'slow-zoom': 'slow-zoom 22s cubic-bezier(0.22, 0.61, 0.36, 1) infinite alternate',
      },
      transitionTimingFunction: {
        subtle: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
        // The house entrance curve: fast off the mark, a long quiet settle.
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        // A touch of overshoot, for controls answering a pointer.
        spring: 'cubic-bezier(0.34, 1.32, 0.64, 1)',
      },

      transitionDuration: {
        400: '400ms',
        600: '600ms',
        800: '800ms',
        900: '900ms',
      },
    },
  },
  plugins: [],
};

export default config;
