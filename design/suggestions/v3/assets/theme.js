/**
 * v3 - tailwind play-cdn config.
 *
 * ------------------------------------------------------- what this fixes
 * Built from four verdicts rather than from a concept:
 *
 *   v1                    liked. dark, modern sans, room to breathe.
 *   v2 telemetry          read as generated. a house style.
 *   v2 almanac            read as generated. a different house style.
 *   v2 native             "kind of, but not quite". structure right,
 *                         identity borrowed wholesale from Twitch.
 *   v3 records            "too old-fashioned, table-like, clamped".
 *
 * So: keep what v2 got structurally right, give it an identity of its own,
 * and open it up. Every value below is answering one of those five lines.
 *
 * ------------------------------------------------------------------ type
 * Manrope. Modern and geometric, so it cannot read as old-fashioned, but with
 * enough character in the letterforms that it is not Inter-by-default. Its
 * figures are clean and it has a real 800 weight for the few display moments.
 *
 * At 15px base, not 13. "Clamped" was partly a type-size complaint: v3 set
 * everything at 13px and the reader had to lean in.
 *
 * ---------------------------------------------------------------- colour
 * The shipped dark palette, value for value, with nothing added.
 *
 * v2 borrowed Twitch's purple and made it the primary action colour, which is
 * most of why it read as derivative. Here the identity is moddex's own: the
 * mark, and the mod/vip pair. Purple appears on exactly the two controls that
 * talk to Twitch, and nowhere else.
 */
tailwind.config = {
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'Helvetica Neue', 'Arial', 'sans-serif']
      },

      // bigger across the board than v3-records, and bigger than v2-native.
      // 15px base is the fix for "clamped".
      fontSize: {
        micro: ['0.75rem', { lineHeight: '1.45' }],
        meta: ['0.8125rem', { lineHeight: '1.5' }],
        ui: ['0.875rem', { lineHeight: '1.5' }],
        base: ['0.9375rem', { lineHeight: '1.6' }],
        read: ['1rem', { lineHeight: '1.65' }],
        lead: ['1.125rem', { lineHeight: '1.6' }],
        h3: ['1.125rem', { lineHeight: '1.35', letterSpacing: '-0.01em' }],
        h2: ['1.375rem', { lineHeight: '1.3', letterSpacing: '-0.015em' }],
        h1: ['1.75rem', { lineHeight: '1.25', letterSpacing: '-0.02em' }],
        display: ['clamp(2rem, 3.6vw, 2.75rem)', { lineHeight: '1.15', letterSpacing: '-0.03em' }]
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
        mod: '#4ADE80',
        vip: '#F472B6',
        founder: '#FBBF24',
        artist: '#60A5FA',
        // demoted. only on the two controls that actually talk to twitch.
        twitch: '#9146FF',
        discord: '#5865F2'
      },

      borderRadius: {
        DEFAULT: '8px',
        sm: '6px',
        md: '8px',
        lg: '12px',
        pill: '9999px'
      },

      maxWidth: {
        // wider than every previous attempt. v3-records was 1200 and felt
        // squeezed; v1 was 1180; v2 was 1280.
        page: '1440px',
        prose: '64ch'
      }
    }
  }
};
