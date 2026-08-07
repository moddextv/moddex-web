/**
 * v1 "Index" - tailwind play-cdn config.
 *
 * BRAND LOCK. The palette below is the shipped one, copied value for value out
 * of tailwind.config.mjs. Nothing here is a new colour. What changed is the
 * *job* each colour does, which is a system decision, not a palette decision:
 *
 *   - mod green and vip pink are DATA colours. They mark a role and nothing
 *     else. No green buttons, no pink links, no coloured chrome.
 *   - the neutral ramp carries the entire interface.
 *   - twitch purple stays on the one control that signs in with twitch.
 *
 * The shipped site already followed that rule loosely. v1 makes it absolute,
 * which is what lets the two hues actually mean something when they appear.
 */
tailwind.config = {
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        // Lato is already self-hosted in src/app/fonts and loaded by
        // layout.tsx, but no element ever gets `font-lato`, so the shipped body
        // copy renders in the browser's default sans. v1 puts it on the body,
        // where it was always meant to go. No new font files.
        sans: ['Lato', 'Helvetica Neue', 'Helvetica', 'sans-serif'],
        cairo: ['Cairo', 'Helvetica Neue', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace']
      },

      // a real scale rather than tailwind's defaults. display sizes are fluid
      // so the headline never wraps to three lines on a laptop.
      fontSize: {
        micro: ['0.6875rem', { lineHeight: '1.4', letterSpacing: '0.08em' }],
        meta: ['0.8125rem', { lineHeight: '1.5' }],
        body: ['1.0625rem', { lineHeight: '1.7' }],
        lead: ['1.25rem', { lineHeight: '1.6' }],
        h3: ['1.25rem', { lineHeight: '1.25', letterSpacing: '-0.015em' }],
        h2: ['1.75rem', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        h1: ['clamp(2rem, 4vw, 2.75rem)', { lineHeight: '1.1', letterSpacing: '-0.025em' }],
        display: ['clamp(2.75rem, 6vw, 4.5rem)', { lineHeight: '1.02', letterSpacing: '-0.035em' }]
      },

      colors: {
        primary: {
          50: '#F5F5F7',
          100: '#E7E7EA',
          200: '#D2D2D8',
          300: '#B4B4BC',
          400: '#8A8A93',
          500: '#55555F',
          600: '#33333A',
          700: '#232326',
          800: '#111113',
          900: '#0B0B0C'
        },
        // one step below primary-900, used only for the page behind the
        // content so raised surfaces have somewhere to sit. still not #000.
        void: '#070708',
        mod: '#4ADE80',
        vip: '#F472B6',
        founder: '#FBBF24',
        artist: '#60A5FA',
        twitch: '#714ab8',
        discord: '#7289da'
      },

      maxWidth: {
        // ONE measure for the whole site. the shipped app has two (max-w-5xl
        // for the redesigned pages, max-w-3xl px-6 for /donate /settings /tos
        // /dashboard), which is why those four never line up with the wordmark.
        measure: '1180px',
        prose: '65ch'
      }
    }
  }
};
