/**
 * v2 "ALMANAC" - tailwind play-cdn config.
 *
 * ------------------------------------------------------------------ premise
 * moddex is a directory. Not a dashboard, not a SaaS product, not a dev tool:
 * a directory. Two and a half million entries, cross-referenced two ways, each
 * with a date attached.
 *
 * The best-designed dense-data objects ever made are printed directories.
 * Almanacs, ships' registers, Who's Who, Wisden, timetables, library
 * catalogues. Centuries of work went into making thousands of rows of names
 * and dates readable on paper, and almost none of it looks like a website.
 *
 * So this direction takes the typography of a printed reference volume
 * seriously: paper ground, a reading serif, italic labels, ruled tables set
 * the way a book sets them, notes in the margin, a colophon at the end.
 *
 * ------------------------------------------------------------------- colour
 * THE PALETTE IS NOT NEW. `tailwind.config.mjs` has always carried a full
 * `light` theme, with mod and vip deliberately darkened "so the same tokens
 * stay legible on white". Somebody wrote that and it has never once rendered,
 * because layout.tsx hardcodes `dark` on <html>.
 *
 * Every value below is copied out of that light theme. This direction is not a
 * new palette; it is the half of the existing one that never shipped.
 *
 * -------------------------------------------------------------------- type
 * The one genuinely new material. Cairo and Lato stay in v1.
 *
 *   Newsreader  display, headings, prose, labels. A variable serif with real
 *               optical sizing, drawn for reading long text on screen. Set at
 *               400 rather than bold at display size, which is how a book sets
 *               a title and the opposite of a heavy grotesk shouting.
 *   Archivo     names, dates, counts, controls. A grotesk with proper tabular
 *               figures for anything that has to line up in a column.
 *
 * Deliberately absent, because they are what made the last direction read as
 * generated: monospace anywhere, uppercase tracked-out micro-labels, and a
 * heavy display grotesk. Labels here are set in italic serif instead, which is
 * what a printed table does.
 */
tailwind.config = {
  theme: {
    extend: {
      fontFamily: {
        serif: ['Newsreader', 'Iowan Old Style', 'Georgia', 'serif'],
        sans: ['Archivo', 'Helvetica Neue', 'Arial', 'sans-serif']
      },

      fontSize: {
        note: ['0.8125rem', { lineHeight: '1.5' }],
        small: ['0.875rem', { lineHeight: '1.55' }],
        base: ['1rem', { lineHeight: '1.6' }],
        read: ['1.125rem', { lineHeight: '1.65' }],
        lead: ['1.375rem', { lineHeight: '1.5' }],
        h3: ['1.25rem', { lineHeight: '1.3' }],
        h2: ['1.75rem', { lineHeight: '1.25' }],
        h1: ['clamp(2rem, 3.6vw, 2.75rem)', { lineHeight: '1.15' }],
        // a book title is large and LIGHT. weight comes from the size.
        display: ['clamp(2.75rem, 6vw, 4.75rem)', { lineHeight: '1.08', letterSpacing: '-0.015em' }]
      },

      colors: {
        // the light theme from tailwind.config.mjs, verbatim. 50 is the
        // darkest here and 900 the lightest, which is how that file wrote it.
        primary: {
          50: '#0B0B0C',
          100: '#18181B',
          200: '#2A2A2E',
          300: '#45454C',
          400: '#6E6E78',
          500: '#9A9AA4',
          600: '#C4C4CC',
          700: '#E2E2E7',
          800: '#F2F2F5',
          900: '#FFFFFF'
        },

        // "darkened so the same tokens stay legible on white" - the comment in
        // tailwind.config.mjs, describing exactly these two values.
        mod: '#16A34A',
        vip: '#DB2777',
        // no light variant exists for these two, so they are darkened here on
        // the same principle rather than invented.
        founder: '#B45309',
        artist: '#1D4ED8',

        twitch: '#714ab8',
        discord: '#7289da'
      },

      maxWidth: {
        // the sheet. narrower than a web layout because a page of names is
        // read, not scanned, and 1040px is about as wide as ruled columns stay
        // trackable.
        sheet: '1040px',
        prose: '62ch'
      }
    }
  }
};
