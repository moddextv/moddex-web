import { heroui } from '@heroui/react';

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // all of src/, not just app/ and components/. misc/roles.ts holds the
    // per-role class names (`text-founder`, `corner-bl`) that the list headings
    // look up, and while that file was outside the globs tailwind emitted none
    // of them: the founders heading rendered with a colourless corner and
    // nothing about the markup said why.
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    // npm nests this at @heroui/react/node_modules/@heroui/theme rather than
    // hoisting it, and the classes live in .mjs chunks -- the previous glob
    // ('@heroui/theme/dist/**/*.{js,ts,jsx,tsx}') matched no files at all, so
    // tailwind emitted none of heroui's classes. that is why every heroui
    // component rendered structurally correct but unstyled: the avatar kept
    // its opacity-0 because data-[loaded=true]:opacity-100 was never generated,
    // and the switch had no width because w-14 was never generated.
    './node_modules/**/@heroui/theme/dist/**/*.{js,mjs,ts,mts}'
  ],
  theme: {
    extend: {
      fontFamily: {
        // `sans` is the whole body typeface fix. tailwind's preflight sets
        // `font-family: theme('fontFamily.sans')` on <html>, so overriding this
        // key is what finally gives the site a typeface — before this, lato was
        // downloaded, exposed as a variable and applied to nothing.
        sans: ['var(--font-manrope)', 'Helvetica Neue', 'Arial', 'sans-serif']
      },

      // 15px base, not 13. "clamped" was partly a type-size complaint: the
      // rejected v3-records set everything at 13px and the reader had to lean
      // in. `base` is deliberately overridden rather than added alongside, so
      // an unclassed paragraph lands on the scale.
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

      // the shipped dark palette, value for value. heroui already declares most
      // of this inside its plugin below, but only as `hsl(var(--mdx-…))` — which
      // means the ramp disappears the day the plugin does, and means `founder`
      // and `artist` had no utility class at all despite both being defined in
      // misc/roles.ts. declaring it here makes the palette the app's own.
      //
      // `twitch` stays #714ab8 rather than twitch's own #9146FF that the comps
      // draw: white on #9146FF is 3.5:1, and §11 of REDESIGN.md asks for 4.5:1
      // at this size. the demotion of purple is a rule about *where* it appears,
      // and that rule is kept — one filled control per page, sign in.
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
          900: '#0B0B0C',
          // heroui derives a bare `primary` from shade 500 and a foreground
          // from 100. declaring the ramp here replaces its version wholesale
          // rather than merging with it, so without these two the `bg-primary`
          // and `text-primary-foreground` utilities its own dist stylesheet
          // references stop being emitted at all. same values, kept alive.
          DEFAULT: '#55555F',
          foreground: '#E7E7EA'
        },
        mod: '#4ADE80',
        vip: '#F472B6',
        founder: '#FBBF24',
        artist: '#60A5FA',
        twitch: '#714ab8',
        discord: '#7289da'
      },

      // 8px. the mark having no curves does not have to dictate button radius,
      // which is what the old `border-radius: 0` rule in globals.css assumed.
      borderRadius: {
        DEFAULT: '8px',
        sm: '6px',
        md: '8px',
        lg: '12px',
        pill: '9999px'
      },

      maxWidth: {
        // wider than every previous attempt. v3-records was 1200 and read as
        // squeezed; the shipped 5xl container is 1024.
        page: '1440px',
        prose: '64ch'
      }
    }
  },
  darkMode: 'class',
  plugins: [
    heroui({
      prefix: 'mdx',
      themes: {
        dark: {
          layout: {},
          colors: {
            background: '#0B0B0C',
            foreground: '#E7E7EA',
            focus: '#8A8A93',
            // neutral ramp, 900 = canvas -> 50 = brightest text. the chrome is
            // deliberately colourless; colour is reserved for the data itself.
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
            // heroui's own semantic tokens. without these its components fall
            // back to stock greys that belong to no palette -- and `content1`
            // is the surface behind every dropdown, tooltip and popover, so
            // leaving it unset is what made those read as foreign.
            // the ramp is lifted from `primary` above so a heroui surface sits
            // one step above the canvas rather than on it.
            default: {
              50: '#F5F5F7',
              100: '#E7E7EA',
              200: '#D2D2D8',
              300: '#B4B4BC',
              400: '#8A8A93',
              500: '#55555F',
              600: '#33333A',
              700: '#232326',
              800: '#111113',
              900: '#0B0B0C',
              DEFAULT: '#232326',
              foreground: '#E7E7EA'
            },
            // elevation: canvas -> raised surface -> hover -> pressed
            content1: '#111113',
            content2: '#232326',
            content3: '#33333A',
            content4: '#55555F',
            divider: '#232326',
            overlay: '#000000',

            // semantic role colours: the twitch mod sword is green, the vip
            // gem is pink. these are the only two hues the ui spends.
            mod: '#4ADE80',
            vip: '#F472B6',
            twitch: '#714ab8',
            discord: '#7289da'
          }
        },
        light: {
          layout: {},
          colors: {
            background: '#FFFFFF',
            foreground: '#18181B',
            focus: '#8A8A93',
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
            // darkened so the same tokens stay legible on white
            mod: '#16A34A',
            vip: '#DB2777',
            twitch: '#714ab8',
            discord: '#7289da'
          }
        }
      }
    })
  ]
};
